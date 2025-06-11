import rateLimit from 'express-rate-limit';

// Configuración diferente para desarrollo vs producción
const isDevelopment = process.env.NODE_ENV === 'development';

// Limitar intentos de inicio de sesión - DESACTIVADO
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 9999999, // Límite muy alto para efectivamente desactivar la limitación
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Saltar el límite para todas las solicitudes
});

// Limitar registros
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDevelopment ? 1000 : 100, // límite más alto en desarrollo
  message: { message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
}); 