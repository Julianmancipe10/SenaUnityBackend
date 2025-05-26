import express from "express";
import { AzureOpenAI } from "openai";
import rateLimit from 'express-rate-limit';
import dotenv from "dotenv";
import NodeCache from 'node-cache';
import winston from 'winston';

dotenv.config();

const router = express.Router();

// Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Configuración de caché
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hora de TTL

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
});

// Configuración de Azure OpenAI
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

logger.info("Configuración de OpenAI cargada", {
  endpoint: endpoint ? 'Configurado' : 'No configurado',
  deployment: deployment ? 'Configurado' : 'No configurado',
  apiVersion: apiVersion ? 'Configurado' : 'No configurado'
});

if (!endpoint || !apiKey || !deployment) {
  const missingVars = [];
  if (!endpoint) missingVars.push('AZURE_OPENAI_ENDPOINT');
  if (!apiKey) missingVars.push('AZURE_OPENAI_KEY');
  if (!deployment) missingVars.push('AZURE_OPENAI_DEPLOYMENT_NAME');
  
  logger.error("Faltan variables de entorno críticas", { missingVars });
  throw new Error(`Faltan variables de entorno críticas para Azure OpenAI: ${missingVars.join(', ')}`);
}

const options = { endpoint, apiKey, deployment, apiVersion };
const client = new AzureOpenAI(options);

// Middleware de validación
const validateQuestion = (req, res, next) => {
  const { question } = req.body;
  
  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "La pregunta no puede estar vacía" });
  }
  
  if (question.length > 500) {
    return res.status(400).json({ error: "La pregunta excede el límite de 500 caracteres" });
  }

  // Sanitización básica
  req.body.question = question.trim();
  next();
};

// Función para generar la clave de caché
const getCacheKey = (question, context = "") => {
  return `${question.toLowerCase()}_${context.slice(-100)}`;
};

router.post("/", limiter, validateQuestion, async (req, res) => {
  const { question, context = "" } = req.body;
  const cacheKey = getCacheKey(question, context);

  try {
    // Verificar caché
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      logger.info("Respuesta recuperada de caché", { question });
      return res.json({ 
        answer: cachedResponse,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Preparar el sistema de mensajes con contexto
    const messages = [
      { 
        role: "system", 
        content: `Eres un asistente de preguntas frecuentes del sistema SenaUnity. 
                 Proporciona respuestas claras, concisas y útiles.
                 Mantén un tono profesional pero amigable.` 
      }
    ];

    // Agregar contexto si existe
    if (context) {
      messages.push({ role: "system", content: `Contexto previo:\n${context}` });
    }

    // Agregar la pregunta actual
    messages.push({ role: "user", content: question });

    const response = await client.chat.completions.create({
      messages,
      max_tokens: 8192,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null
    });

    if (!response.choices || !response.choices[0]) {
      throw new Error("Respuesta inválida de Azure OpenAI");
    }

    const answer = response.choices[0].message.content;

    // Guardar en caché
    cache.set(cacheKey, answer);

    logger.info("Respuesta generada exitosamente", { 
      question,
      hasContext: !!context,
      tokens: response.usage?.total_tokens
    });

    res.json({ 
      answer,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error("Error en Azure OpenAI", { 
      error: err.message,
      question,
      stack: err.stack
    });

    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        error: "Error en el servicio de Azure OpenAI",
        details: err.message
      });
    } else {
      res.status(500).json({ 
        error: "Error interno del servidor",
        message: "Hubo un problema al procesar tu pregunta. Por favor, intenta de nuevo."
      });
    }
  }
});

export default router;
