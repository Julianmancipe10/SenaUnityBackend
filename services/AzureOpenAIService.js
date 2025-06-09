import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import winston from 'winston';

dotenv.config();

class AzureOpenAIService {
  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_KEY;
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    this.isConfigured = false;

    // Configuración del logger
    this.logger = winston.createLogger({
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
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }

    this.validateConfiguration();
    if (this.isConfigured) {
      this.initializeClient();
    }
  }

  validateConfiguration() {
    this.logger.info("Configuración de OpenAI cargada", {
      endpoint: this.endpoint ? 'Configurado' : 'No configurado',
      deployment: this.deployment ? 'Configurado' : 'No configurado',
      apiVersion: this.apiVersion ? 'Configurado' : 'No configurado'
    });

    if (!this.endpoint || !this.apiKey || !this.deployment) {
      const missingVars = [];
      if (!this.endpoint) missingVars.push('AZURE_OPENAI_ENDPOINT');
      if (!this.apiKey) missingVars.push('AZURE_OPENAI_KEY');
      if (!this.deployment) missingVars.push('AZURE_OPENAI_DEPLOYMENT_NAME');
      
      this.logger.warn("Variables de entorno de Azure OpenAI no configuradas - FAQ con IA no estará disponible", { missingVars });
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
  }

  initializeClient() {
    const options = {
      endpoint: this.endpoint,
      apiKey: this.apiKey,
      deployment: this.deployment,
      apiVersion: this.apiVersion
    };
    
    this.client = new AzureOpenAI(options);
  }

  async generateResponse(messages, question, context = "") {
    if (!this.isConfigured) {
      throw new Error("El servicio de Azure OpenAI no está configurado. Por favor, configura las variables de entorno AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY y AZURE_OPENAI_DEPLOYMENT_NAME para usar esta funcionalidad.");
    }

    try {
      const response = await this.client.chat.completions.create({
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

      this.logger.info("Respuesta generada exitosamente", { 
        question,
        hasContext: !!context,
        tokens: response.usage?.total_tokens
      });

      return answer;
    } catch (error) {
      this.logger.error("Error en Azure OpenAI", { 
        error: error.message,
        question,
        stack: error.stack
      });

      throw error;
    }
  }
}

export default AzureOpenAIService; 