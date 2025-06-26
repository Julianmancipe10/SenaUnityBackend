import rateLimit from 'express-rate-limit';

// Configuración diferente para desarrollo vs producción
const isDevelopment = process.env.NODE_ENV === 'development';

// Limitar intentos de inicio de sesión - Configuración optimizada para nube
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 10, // 10 intentos en producción, ilimitado en desarrollo
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment, // Saltar solo en desarrollo
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Limitar registros
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDevelopment ? 1000 : 5, // 5 registros por hora en producción
  message: { message: 'Demasiados intentos de registro. Intenta nuevamente en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Rate limiter general para APIs
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 10000 : 1000, // 1000 requests por IP cada 15 min en producción
  message: { message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment // Saltar en desarrollo
}); 