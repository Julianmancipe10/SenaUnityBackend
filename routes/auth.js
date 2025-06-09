import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', registerLimiter, AuthController.register);

// Ruta para el inicio de sesión
router.post('/login', loginLimiter, AuthController.login);

// Ruta para obtener permisos del usuario
router.get('/permissions', authenticateToken, AuthController.getPermissions);

export default router; 