import express from 'express';
import UserController from '../controllers/UserController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

//////////////////////////////////////////////////////
// 🟢 RUTAS QUE NO DEBEN COLISIONAR CON /:id
//////////////////////////////////////////////////////

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, UserController.getProfile);

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, UserController.updateProfile);

//////////////////////////////////////////////////////
// 🔵 RUTAS CRUD GENERALES
//////////////////////////////////////////////////////

// Obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// Obtener un usuario específico por ID
router.get('/:id', UserController.getUserById);

// Actualizar usuario por ID
router.put('/:id', UserController.updateUser);

// Eliminar usuario por ID
router.delete('/:id', UserController.deleteUser);

export default router;
