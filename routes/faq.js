import express from "express";
import { AzureOpenAI } from "openai";
import rateLimit from 'express-rate-limit';
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});

// Configuración de Azure OpenAI
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = "2024-04-01-preview";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const modelName = process.env.AZURE_OPENAI_MODEL_NAME;

console.log("endpoint:", endpoint, "apiKey:", apiKey, "deployment:", deployment, "modelName:", modelName);

if (!endpoint || !apiKey || !deployment || !modelName) {
  throw new Error("Faltan variables de entorno ");
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
    return res.status(400).json({ error: "La pregunta excede el límite de caracteres" });
  }
  next();
};

router.post("/", limiter, validateQuestion, async (req, res) => {
  const { question } = req.body;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente de preguntas frecuentes del sistema SenaUnity. Proporciona respuestas claras y concisas." 
        },
        { role: "user", content: question }
      ],
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 1,
      model: modelName
    });

    if (response?.error !== undefined && response.status !== "200") {
      throw response.error;
    }

    res.json({ 
      answer: response.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error en Azure OpenAI:", err);
    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        error: "Error en el servicio de Azure OpenAI",
        details: err.message
      });
    } else {
      res.status(500).json({ 
        error: "Error interno del servidor",
        message: err.message 
      });
    }
  }
});

export default router;
