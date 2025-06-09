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
    const { nombre, apellido, correo, password, documento } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.promise().query(
      'INSERT INTO usuario (Nombre, Apellido, Correo, Password, Documento) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hashedPassword, documento]
    );
    
    return result.insertId;
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