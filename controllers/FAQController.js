import FAQ from '../models/FAQ.js';
import AzureOpenAIService from '../services/AzureOpenAIService.js';

class FAQController {
  constructor() {
    this.faqModel = new FAQ();
    this.openAIService = null; // Inicialización lazy
  }

  getOpenAIService() {
    if (!this.openAIService) {
      try {
        this.openAIService = new AzureOpenAIService();
      } catch (error) {
        console.warn('Azure OpenAI Service no pudo inicializarse:', error.message);
        this.openAIService = { isConfigured: false };
      }
    }
    return this.openAIService;
  }

  async askQuestion(req, res) {
    try {
      const { question, context = "" } = req.body;

      // Validar la pregunta
      const sanitizedQuestion = this.faqModel.validateQuestion(question);

      // Verificar caché
      const cachedResponse = this.faqModel.getCachedResponse(sanitizedQuestion, context);
      if (cachedResponse) {
        return res.json({ 
          answer: cachedResponse,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Obtener el servicio de OpenAI (inicialización lazy)
      const openAIService = this.getOpenAIService();

      // Verificar si Azure OpenAI está configurado
      if (!openAIService.isConfigured) {
        return res.status(503).json({
          error: "Servicio de FAQ con IA no disponible",
          message: "El servicio de inteligencia artificial para preguntas frecuentes no está configurado actualmente. Por favor, contacta al administrador del sistema.",
          details: "Azure OpenAI no configurado"
        });
      }

      // Preparar mensajes para OpenAI
      const messages = this.faqModel.prepareMessages(sanitizedQuestion, context);

      // Generar respuesta usando Azure OpenAI
      const answer = await openAIService.generateResponse(messages, sanitizedQuestion, context);

      // Guardar en caché
      this.faqModel.setCachedResponse(sanitizedQuestion, answer, context);

      res.json({ 
        answer,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      if (error.message === "La pregunta no puede estar vacía" || 
          error.message === "La pregunta excede el límite de 500 caracteres") {
        return res.status(400).json({ error: error.message });
      }

      // Error específico de Azure OpenAI no configurado
      if (error.message.includes("no está configurado")) {
        return res.status(503).json({
          error: "Servicio de FAQ con IA no disponible",
          message: "El servicio de inteligencia artificial para preguntas frecuentes no está configurado actualmente.",
          details: error.message
        });
      }

      if (error.statusCode) {
        res.status(error.statusCode).json({ 
          error: "Error en el servicio de Azure OpenAI",
          details: error.message
        });
      } else {
        res.status(500).json({ 
          error: "Error interno del servidor",
          message: "Hubo un problema al procesar tu pregunta. Por favor, intenta de nuevo."
        });
      }
    }
  }
}

export default FAQController; 