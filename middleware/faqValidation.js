import rateLimit from 'express-rate-limit';

// Middleware de validación de preguntas
export const validateQuestion = (req, res, next) => {
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

// Rate limiter específico para FAQ
export const faqLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
}); 