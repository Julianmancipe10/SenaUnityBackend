import User from '../models/User.js';
import { validateId, validateRequiredFields } from '../utils/validation.js';

class UserController {
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({
        id: user.idUsuario,
        nombre: user.Nombre,
        apellido: user.Apellido,
        correo: user.Correo,
        documento: user.Documento
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async updateProfile(req, res) {
    try {
      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo']);
      const { nombre, apellido, correo } = req.body;

      const existingUser = await User.findByEmail(correo);
      if (existingUser && existingUser.idUsuario !== req.user.id) {
        return res.status(400).json({ message: 'El correo ya está en uso' });
      }

      const updated = await User.update(req.user.id, { nombre, apellido, correo });
      if (!updated) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ 
        message: 'Perfil actualizado exitosamente',
        user: {
          id: req.user.id,
          nombre,
          apellido,
          correo
        }
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async getUserById(req, res) {
    try {
      const id = validateId(req.params.id);
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async updateUser(req, res) {
    try {
      const id = validateId(req.params.id);
      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo', 'documento']);
      
      const updated = await User.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
      if (error.message === 'ID inválido' || error.status === 400) {
        return res.status(400).json(error.errors || { message: error.message });
      }
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const id = validateId(req.params.id);
      const deleted = await User.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

export default UserController; 