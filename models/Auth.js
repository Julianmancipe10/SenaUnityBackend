import pool from '../config/db.js';
import bcrypt from 'bcrypt';

class Auth {
  static async findUserByEmail(email) {
    const [users] = await pool.promise().query(
      'SELECT * FROM usuario WHERE Correo = ?',
      [email]
    );
    return users[0];
  }

  static async findActiveUserByEmail(email) {
    const [users] = await pool.promise().query(
      'SELECT * FROM usuario WHERE Correo = ? AND EstadoCuenta = "activo"',
      [email]
    );
    return users[0];
  }

  static async createUser(userData) {
    const { nombre, apellido, correo, password, documento, rol = 'aprendiz' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Determinar si requiere validación y estado inicial
    const requiereValidacion = rol === 'instructor' || rol === 'funcionario';
    const estadoCuenta = requiereValidacion ? 'pendiente' : 'activo';
    
    const [result] = await pool.promise().query(
      'INSERT INTO usuario (Nombre, Apellido, Correo, Password, Documento, Rol, EstadoCuenta, RequiereValidacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hashedPassword, documento, rol, estadoCuenta, requiereValidacion]
    );
    
    const userId = result.insertId;

    // Si requiere validación, crear solicitud de validación
    if (requiereValidacion) {
      await this.createValidationRequest(userId, rol);
    } else {
      // Si es aprendiz, asignar rol automáticamente
      await this.assignRoleToUser(userId, rol);
    }
    
    return userId;
  }

  static async createValidationRequest(userId, rol) {
    await pool.promise().query(
      'INSERT INTO solicitudesvalidacion (Usuario_idUsuario, TipoRol) VALUES (?, ?)',
      [userId, rol]
    );
  }

  static async assignRoleToUser(userId, roleName) {
    // Obtener ID del rol
    const [roles] = await pool.promise().query(
      'SELECT idUsuarioRoll FROM roles WHERE Rol = ?',
      [roleName]
    );

    if (roles.length > 0) {
      const roleId = roles[0].idUsuarioRoll;
      
      // Mapear rol a tipo numérico
      const tipoMap = {
        'aprendiz': '1',
        'instructor': '2', 
        'administrador': '3',
        'funcionario': '4'
      };

      await pool.promise().query(
        'INSERT INTO tipousuario (Usuario_idUsuario, Roles_idUsuarioRoll, Tipo) VALUES (?, ?, ?)',
        [userId, roleId, tipoMap[roleName]]
      );
    }
  }

  static async assignRoleToUserWithConnection(connection, userId, roleName) {
    // Obtener ID del rol
    const [roles] = await connection.query(
      'SELECT idUsuarioRoll FROM roles WHERE Rol = ?',
      [roleName]
    );

    if (roles.length > 0) {
      const roleId = roles[0].idUsuarioRoll;
      
      // Mapear rol a tipo numérico
      const tipoMap = {
        'aprendiz': '1',
        'instructor': '2', 
        'administrador': '3',
        'funcionario': '4'
      };

      await connection.query(
        'INSERT INTO tipousuario (Usuario_idUsuario, Roles_idUsuarioRoll, Tipo) VALUES (?, ?, ?)',
        [userId, roleId, tipoMap[roleName]]
      );
    }
  }

  static async getUserRoles(userId) {
    const [roles] = await pool.promise().query(
      `SELECT r.Rol 
       FROM roles r 
       JOIN tipousuario tu ON r.idUsuarioRoll = tu.Roles_idUsuarioRoll 
       WHERE tu.Usuario_idUsuario = ?`,
      [userId]
    );
    return roles.map(r => r.Rol);
  }

  static async getUserPermissions(userId) {
    const [permisos] = await pool.promise().query(
      `SELECT p.Nombre 
       FROM permiso p 
       JOIN usuariopermisos up ON p.ID_Permiso = up.permiso_ID_Permiso 
       WHERE up.Usuario_idUsuario = ? AND up.FechaLimite > NOW()`,
      [userId]
    );
    return permisos.map(p => p.Nombre);
  }

  static async getPendingValidationRequests() {
    const [requests] = await pool.promise().query(
      `SELECT sv.*, u.Nombre, u.Apellido, u.Correo, u.Documento, u.FechaRegistro
       FROM solicitudesvalidacion sv
       JOIN usuario u ON sv.Usuario_idUsuario = u.idUsuario
       WHERE sv.Estado = 'pendiente'
       ORDER BY sv.FechaSolicitud ASC`
    );
    return requests;
  }

  static async approveValidationRequest(solicitudId, adminId, observaciones = null) {
    const connection = await pool.promise().getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener la solicitud
      const [solicitudes] = await connection.query(
        'SELECT * FROM solicitudesvalidacion WHERE idSolicitud = ? AND Estado = "pendiente"',
        [solicitudId]
      );

      if (solicitudes.length === 0) {
        throw new Error('Solicitud no encontrada o ya procesada');
      }

      const solicitud = solicitudes[0];

      // Verificar que el usuario aún existe y está pendiente
      const [usuarios] = await connection.query(
        'SELECT * FROM usuario WHERE idUsuario = ? AND EstadoCuenta = "pendiente"',
        [solicitud.Usuario_idUsuario]
      );

      if (usuarios.length === 0) {
        throw new Error('Usuario no encontrado o ya procesado');
      }

      // Actualizar solicitud como aprobada
      await connection.query(
        'UPDATE solicitudesvalidacion SET Estado = ?, AdministradorValidador = ?, FechaRespuesta = NOW(), Observaciones = ? WHERE idSolicitud = ?',
        ['aprobada', adminId, observaciones, solicitudId]
      );

      // Activar cuenta del usuario
      await connection.query(
        'UPDATE usuario SET EstadoCuenta = ?, ValidadoPor = ?, FechaValidacion = NOW() WHERE idUsuario = ?',
        ['activo', adminId, solicitud.Usuario_idUsuario]
      );

      // Asignar rol al usuario usando la conexión de la transacción
      await this.assignRoleToUserWithConnection(connection, solicitud.Usuario_idUsuario, solicitud.TipoRol);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error en approveValidationRequest:', error);
      throw new Error(`Error al aprobar solicitud: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async rejectValidationRequest(solicitudId, adminId, observaciones) {
    const connection = await pool.promise().getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar que la solicitud existe y está pendiente
      const [solicitudes] = await connection.query(
        'SELECT Usuario_idUsuario FROM solicitudesvalidacion WHERE idSolicitud = ? AND Estado = "pendiente"',
        [solicitudId]
      );

      if (solicitudes.length === 0) {
        throw new Error('Solicitud no encontrada o ya procesada');
      }

      const userId = solicitudes[0].Usuario_idUsuario;

      // Actualizar solicitud como rechazada
      await connection.query(
        'UPDATE solicitudesvalidacion SET Estado = ?, AdministradorValidador = ?, FechaRespuesta = NOW(), Observaciones = ? WHERE idSolicitud = ?',
        ['rechazada', adminId, observaciones, solicitudId]
      );

      // Cambiar estado de cuenta a rechazado
      await connection.query(
        'UPDATE usuario SET EstadoCuenta = ?, ValidadoPor = ?, FechaValidacion = NOW() WHERE idUsuario = ?',
        ['rechazado', adminId, userId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error en rejectValidationRequest:', error);
      throw new Error(`Error al rechazar solicitud: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
      console.error('Password o hash faltante:', { 
        passwordProvided: !!password, 
        hashProvided: !!hashedPassword 
      });
      return false;
    }
    
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error en bcrypt.compare:', error);
      return false;
    }
  }

  static validateEmail(email) {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }
}

export default Auth; 