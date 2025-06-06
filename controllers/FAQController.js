import FAQ from '../models/FAQ.js';
import AzureOpenAIService from '../services/AzureOpenAIService.js';

class FAQController {
  constructor() {
    this.faqModel = new FAQ();
    this.openAIService = new AzureOpenAIService();
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

      // Preparar mensajes para OpenAI
      const messages = this.faqModel.prepareMessages(sanitizedQuestion, context);

      // Generar respuesta usando Azure OpenAI
      const answer = await this.openAIService.generateResponse(messages, sanitizedQuestion, context);

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