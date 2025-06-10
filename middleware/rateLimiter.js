import rateLimit from 'express-rate-limit';

// Configuración diferente para desarrollo vs producción
const isDevelopment = process.env.NODE_ENV === 'development';

// Limitar intentos de inicio de sesión
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 5, // 1000 intentos en desarrollo, 5 en producción
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDevelopment ? () => false : undefined, // En desarrollo, aplicar el límite pero con valor alto
});

// Limitar registros
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDevelopment ? 1000 : 100, // límite más alto en desarrollo
  message: { message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
}); 