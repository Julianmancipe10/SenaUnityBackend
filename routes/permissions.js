import express from 'express';
import PermissionController from '../controllers/PermissionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los permisos
router.get('/', authenticateToken, PermissionController.getAllPermissions);

// Obtener permiso por nombre
router.get('/by-name/:nombre', authenticateToken, PermissionController.getPermissionByName);

// Asignar permisos a un usuario
router.post('/assign', authenticateToken, PermissionController.assignPermissions);

// Obtener permisos de un usuario
router.get('/user/:userId', authenticateToken, PermissionController.getUserPermissions);

// Verificar si un usuario tiene un permiso específico (por ID o nombre)
router.get('/check/:userId/:permisoId', authenticateToken, PermissionController.checkUserPermission);

// Eliminar permisos de un usuario
router.delete('/user/:userId', authenticateToken, PermissionController.removeUserPermissions);

export default router; 