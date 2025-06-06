import NodeCache from 'node-cache';

class FAQ {
  constructor() {
    // Configuración de caché - 1 hora de TTL
    this.cache = new NodeCache({ stdTTL: 3600 });
  }

  generateCacheKey(question, context = "") {
    return `${question.toLowerCase()}_${context.slice(-100)}`;
  }

  getCachedResponse(question, context = "") {
    const cacheKey = this.generateCacheKey(question, context);
    return this.cache.get(cacheKey);
  }

  setCachedResponse(question, answer, context = "") {
    const cacheKey = this.generateCacheKey(question, context);
    this.cache.set(cacheKey, answer);
  }

  validateQuestion(question) {
    if (!question || question.trim().length === 0) {
      throw new Error("La pregunta no puede estar vacía");
    }
    
    if (question.length > 500) {
      throw new Error("La pregunta excede el límite de 500 caracteres");
    }

    return question.trim();
  }

  prepareMessages(question, context = "") {
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

    return messages;
  }
}

export default FAQ; 