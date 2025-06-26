import User from '../models/User.js';
import { validateId, validateRequiredFields } from '../utils/validation.js';
import bcrypt from 'bcrypt';

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
        documento: user.Documento,
        foto: user.Foto
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async updateProfile(req, res) {
    try {
      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo']);
      const { nombre, apellido, correo, documento, password } = req.body;

      // Obtener datos actuales del usuario para preservar el documento si no se envía
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const existingUser = await User.findByEmail(correo);
      if (existingUser && existingUser.idUsuario !== req.user.id) {
        return res.status(400).json({ message: 'El correo ya está en uso' });
      }

      // Usar documento actual si no se proporciona uno nuevo
      const finalDocumento = documento || currentUser.Documento;

      // Preparar datos para actualizar
      const updateData = { 
        nombre, 
        apellido, 
        correo, 
        documento: finalDocumento 
      };

      // Si hay un archivo de imagen, agregarlo
      if (req.file) {
        updateData.foto = `/uploads/profiles/${req.file.filename}`;
      }

      // TODO: Manejar actualización de contraseña si se proporciona
      if (password) {
        // Aquí deberías hashear la nueva contraseña
        console.log('⚠️ Actualización de contraseña pendiente de implementar');
      }

      const updated = await User.update(req.user.id, updateData);
      
      if (!updated) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Obtener el usuario actualizado para devolver los datos completos
      const updatedUser = await User.findById(req.user.id);

      res.json({ 
        message: 'Perfil actualizado exitosamente',
        user: {
          id: updatedUser.idUsuario,
          nombre: updatedUser.Nombre,
          apellido: updatedUser.Apellido,
          correo: updatedUser.Correo,
          documento: updatedUser.Documento,
          foto: updatedUser.Foto
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

  static async createUser(req, res) {
    try {
      // Verificar que el usuario sea administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden crear usuarios.' });
      }

      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo', 'password', 'documento', 'rol']);
      const { nombre, apellido, correo, password, documento, rol } = req.body;

      // Validar rol permitido para administradores (solo instructor y funcionario)
      const rolesPermitidos = ['instructor', 'funcionario'];
      if (!rolesPermitidos.includes(rol.toLowerCase())) {
        return res.status(400).json({ message: 'Los administradores solo pueden crear usuarios con rol instructor o funcionario' });
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
      }

      // Validar formato de documento (solo números)
      const documentoRegex = /^\d+$/;
      if (!documentoRegex.test(documento)) {
        return res.status(400).json({ message: 'El documento debe contener solo números' });
      }

      // Verificar si el usuario ya existe
      const existingUserByEmail = await User.findByEmail(correo);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
      }

      const existingUserByDocument = await User.findByDocument(documento);
      if (existingUserByDocument) {
        return res.status(400).json({ message: 'Ya existe un usuario con este documento' });
      }

      // Crear nuevo usuario directamente como activo (sin validación)
      const userId = await User.createUserByAdmin({ 
        nombre, 
        apellido, 
        correo, 
        password, 
        documento, 
        rol: rol.toLowerCase() 
      });
      
      res.status(201).json({ 
        message: 'Usuario creado exitosamente',
        userId
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

export default UserController; 