import Permission from '../models/Permission.js';
import { validateId, validateRequiredFields } from '../utils/validation.js';

class PermissionController {
  static async getAllPermissions(req, res) {
    try {
      const permissions = await Permission.findAll();
      res.json(permissions);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      res.status(500).json({ message: 'Error al obtener permisos' });
    }
  }

  static async assignPermissions(req, res) {
    try {
      validateRequiredFields(req.body, ['userId', 'permisos', 'fechaLimite']);
      const { userId, permisos, fechaLimite } = req.body;

      // Validar que userId sea válido
      validateId(userId);

      // Validar que permisos sea un array
      if (!Array.isArray(permisos)) {
        return res.status(400).json({ message: 'Los permisos deben ser un array' });
      }

      // Permitir array vacío para remover todos los permisos
      if (permisos.length === 0) {
        await Permission.removeUserPermissions(userId);
        return res.json({ message: 'Todos los permisos han sido removidos exitosamente' });
      }

      // Validar fecha límite
      const fecha = new Date(fechaLimite);
      if (isNaN(fecha.getTime())) {
        return res.status(400).json({ message: 'Fecha límite inválida' });
      }

      // Verificar que la fecha no sea en el pasado
      if (fecha < new Date()) {
        return res.status(400).json({ message: 'La fecha límite no puede ser en el pasado' });
      }

      await Permission.assignPermissionsToUser(userId, permisos, fechaLimite);
      res.json({ message: 'Permisos asignados exitosamente' });
    } catch (error) {
      if (error.status === 400 || error.message === 'ID inválido') {
        return res.status(400).json(error.errors || { message: error.message });
      }
      console.error('Error al asignar permisos:', error);
      res.status(500).json({ message: 'Error al asignar permisos' });
    }
  }

  static async getUserPermissions(req, res) {
    try {
      const userId = validateId(req.params.userId);
      
      // Usar el nuevo método que incluye nombres de permisos
      const permissions = await Permission.getUserPermissionsWithNames(userId);
      
      res.json(permissions);
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error al obtener permisos del usuario:', error);
      res.status(500).json({ message: 'Error al obtener permisos del usuario' });
    }
  }

  static async checkUserPermission(req, res) {
    try {
      const userId = validateId(req.params.userId);
      const { permisoId } = req.params;
      
      const hasPermission = await Permission.checkUserPermission(userId, permisoId);
      res.json({ hasPermission });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error al verificar permiso:', error);
      res.status(500).json({ message: 'Error al verificar permiso' });
    }
  }

  static async removeUserPermissions(req, res) {
    try {
      const userId = validateId(req.params.userId);
      const removed = await Permission.removeUserPermissions(userId);
      
      if (!removed) {
        return res.status(404).json({ message: 'No se encontraron permisos para eliminar' });
      }
      
      res.json({ message: 'Permisos eliminados exitosamente' });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error al eliminar permisos:', error);
      res.status(500).json({ message: 'Error al eliminar permisos' });
    }
  }

  // Nuevo método para obtener permisos por nombre
  static async getPermissionByName(req, res) {
    try {
      const { nombre } = req.params;
      
      if (!nombre) {
        return res.status(400).json({ message: 'Nombre del permiso es requerido' });
      }

      const permission = await Permission.getPermissionByName(nombre);
      
      if (!permission) {
        return res.status(404).json({ message: 'Permiso no encontrado' });
      }
      
      res.json(permission);
    } catch (error) {
      console.error('Error al obtener permiso por nombre:', error);
      res.status(500).json({ message: 'Error al obtener permiso por nombre' });
    }
  }
}

export default PermissionController; 