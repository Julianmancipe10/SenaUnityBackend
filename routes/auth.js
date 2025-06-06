import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', registerLimiter, AuthController.register);

// Ruta para el inicio de sesión
router.post('/login', loginLimiter, AuthController.login);

export default router; 