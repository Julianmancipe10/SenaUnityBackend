import Auth from '../models/Auth.js';
import jwt from 'jsonwebtoken';
import { validateRequiredFields } from '../utils/validation.js';

class AuthController {
  static async register(req, res) {
    try {
      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo', 'password', 'documento']);
      const { nombre, apellido, correo, password, documento } = req.body;

      // Validar formato de correo
      if (!Auth.validateEmail(correo)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await Auth.findUserByEmail(correo);
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // Crear nuevo usuario
      await Auth.createUser({ nombre, apellido, correo, password, documento });
      
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error('Error en el registro:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async login(req, res) {
    try {
      validateRequiredFields(req.body, ['correo', 'password']);
      const { correo, password } = req.body;

      // Validar formato de correo
      if (!Auth.validateEmail(correo)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
      }

      // Buscar usuario activo
      const user = await Auth.findActiveUserByEmail(correo);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const validPassword = await Auth.verifyPassword(password, user.Passaword);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Obtener roles y permisos
      const roles = await Auth.getUserRoles(user.idUsuario);
      const permisos = await Auth.getUserPermissions(user.idUsuario);

      // Generar tokens
      const token = jwt.sign(
        { 
          id: user.idUsuario, 
          correo: user.Correo,
          roles,
          permisos
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.idUsuario },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        refreshToken,
        user: {
          id: user.idUsuario,
          nombre: user.Nombre,
          apellido: user.Apellido,
          correo: user.Correo,
          documento: user.Documento,
          roles,
          permisos
        }
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json(error);
      }
      console.error('Error en el inicio de sesión:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

export default AuthController; 