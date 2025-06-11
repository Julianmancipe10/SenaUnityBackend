import Auth from '../models/Auth.js';
import jwt from 'jsonwebtoken';
import { validateRequiredFields } from '../utils/validation.js';

// Fallback para JWT_SECRET si no está definido en .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_2024_senaunity';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_2024_senaunity';

class AuthController {
  static async register(req, res) {
    try {
      validateRequiredFields(req.body, ['nombre', 'apellido', 'correo', 'password', 'documento', 'rol']);
      const { nombre, apellido, correo, password, documento, rol } = req.body;

      // Validar rol permitido
      const rolesPermitidos = ['aprendiz', 'instructor', 'funcionario'];
      if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({ message: 'Rol no válido' });
      }

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
      await Auth.createUser({ nombre, apellido, correo, password, documento, rol });
      
      // Respuesta diferente según el rol
      if (rol === 'instructor' || rol === 'funcionario') {
        res.status(201).json({ 
          message: 'Solicitud de registro enviada. Tu cuenta será revisada por un administrador.',
          requiresValidation: true 
        });
      } else {
        res.status(201).json({ 
          message: 'Usuario registrado exitosamente',
          requiresValidation: false 
        });
      }
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

      // Buscar usuario por correo (sin filtrar por estado)
      const user = await Auth.findUserByEmail(correo);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar estado de la cuenta
      if (user.EstadoCuenta === 'pendiente') {
        return res.status(403).json({ 
          message: 'Tu cuenta está pendiente de validación por un administrador.',
          accountStatus: 'pendiente'
        });
      }

      if (user.EstadoCuenta === 'rechazado') {
        return res.status(403).json({ 
          message: 'Tu solicitud de cuenta ha sido rechazada. Contacta al administrador.',
          accountStatus: 'rechazado'
        });
      }

      if (user.EstadoCuenta !== 'activo') {
        return res.status(403).json({ 
          message: 'Tu cuenta no está activa.',
          accountStatus: user.EstadoCuenta
        });
      }

      console.log('Usuario encontrado:', {
        id: user.idUsuario,
        correo: user.Correo,
        rol: user.Rol,
        estado: user.EstadoCuenta,
        hasPassword: !!user.Password
      });

      // Verificar contraseña
      const validPassword = await Auth.verifyPassword(password, user.Password);
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
          rol: user.Rol,
          roles,
          permisos
        },
        JWT_SECRET,
        { expiresIn: '8h' } // Extendido a 8 horas para desarrollo
      );

      const refreshToken = jwt.sign(
        { id: user.idUsuario },
        JWT_REFRESH_SECRET,
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
          rol: user.Rol,
          foto: user.Foto,
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

  static async getPermissions(req, res) {
    try {
      const userId = req.user.id;
      
      // Obtener roles y permisos actuales
      const roles = await Auth.getUserRoles(userId);
      const permisos = await Auth.getUserPermissions(userId);

      res.json({
        roles,
        permisos
      });
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  // Nuevos endpoints para gestión administrativa
  static async getPendingValidations(req, res) {
    try {
      // Verificar que el usuario sea administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      const pendingRequests = await Auth.getPendingValidationRequests();
      res.json(pendingRequests);
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  static async approveValidation(req, res) {
    try {
      // Verificar que el usuario sea administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      const { solicitudId } = req.params;
      const { observaciones } = req.body;
      const adminId = req.user.id;

      // Validar que solicitudId sea un número válido
      if (!solicitudId || isNaN(solicitudId)) {
        return res.status(400).json({ message: 'ID de solicitud inválido' });
      }

      await Auth.approveValidationRequest(solicitudId, adminId, observaciones);
      
      res.json({ message: 'Solicitud aprobada exitosamente' });
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('ya procesada')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'Error en el servidor' });
    }
  }

  static async rejectValidation(req, res) {
    try {
      // Verificar que el usuario sea administrador
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      validateRequiredFields(req.body, ['observaciones']);
      const { solicitudId } = req.params;
      const { observaciones } = req.body;
      const adminId = req.user.id;

      // Validar que solicitudId sea un número válido
      if (!solicitudId || isNaN(solicitudId)) {
        return res.status(400).json({ message: 'ID de solicitud inválido' });
      }

      // Validar que las observaciones no estén vacías
      if (!observaciones || observaciones.trim() === '') {
        return res.status(400).json({ message: 'Las observaciones son requeridas para rechazar una solicitud' });
      }

      await Auth.rejectValidationRequest(solicitudId, adminId, observaciones);
      
      res.json({ message: 'Solicitud rechazada exitosamente' });
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('ya procesada')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'Error en el servidor' });
    }
  }
}

export default AuthController; 