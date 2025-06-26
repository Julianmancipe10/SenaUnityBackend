import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔍 Auth middleware - Header recibido:', authHeader);
  console.log('🔍 Auth middleware - Token extraído:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    console.log('❌ Auth middleware - Token no proporcionado');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Auth middleware - Error verificando token:', err.message);
      return res.status(403).json({ message: 'Token inválido' });
    }
    console.log('✅ Auth middleware - Token válido para usuario:', user.id);
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No hay token, continuar sin autenticar
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token inválido, continuar sin autenticar
      req.user = null;
    } else {
      // Token válido, agregar usuario a req
      req.user = user;
    }
    next();
  });
};

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Verificar si el usuario tiene el permiso requerido
      const [permisos] = await pool.promise().query(
        `SELECT p.Nombre 
         FROM permiso p 
         JOIN UsuarioPermisos up ON p.ID_Permiso = up.permiso_ID_Permiso 
         WHERE up.Usuario_idUsuario = ? 
         AND up.FechaLimite > NOW()
         AND p.Nombre = ?`,
        [userId, requiredPermission]
      );

      if (permisos.length === 0) {
        return res.status(403).json({ 
          message: 'No tienes permiso para realizar esta acción' 
        });
      }

      next();
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      res.status(500).json({ message: 'Error al verificar permisos' });
    }
  };
};

export const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Verificar si el usuario tiene alguno de los roles requeridos
      const [roles] = await pool.promise().query(
        `SELECT r.Rol 
         FROM Roles r 
         JOIN TipoUsuario tu ON r.idUsuarioRoll = tu.Roles_idUsuarioRoll 
         WHERE tu.Usuario_idUsuario = ? 
         AND r.Rol IN (?)`,
        [userId, requiredRoles]
      );

      if (roles.length === 0) {
        return res.status(403).json({ 
          message: 'No tienes el rol necesario para realizar esta acción' 
        });
      }

      next();
    } catch (error) {
      console.error('Error al verificar roles:', error);
      res.status(500).json({ message: 'Error al verificar roles' });
    }
  };
}; 