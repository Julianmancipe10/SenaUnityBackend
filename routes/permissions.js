import express from 'express';
import PermissionController from '../controllers/PermissionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los permisos
router.get('/', authenticateToken, PermissionController.getAllPermissions);

// Asignar permisos a un usuario
router.post('/assign', authenticateToken, PermissionController.assignPermissions);

// Obtener permisos de un usuario
router.get('/user/:userId', authenticateToken, PermissionController.getUserPermissions);

// Verificar si un usuario tiene un permiso específico
router.get('/check/:userId/:permisoId', authenticateToken, PermissionController.checkUserPermission);

// Eliminar permisos de un usuario
router.delete('/user/:userId', authenticateToken, PermissionController.removeUserPermissions);

export default router; 