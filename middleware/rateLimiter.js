import rateLimit from 'express-rate-limit';

// Limitar intentos de inicio de sesión
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitar registros
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // límite de 3 registros por hora
  message: { message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
}); 