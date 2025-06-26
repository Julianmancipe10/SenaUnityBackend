import pool from '../config/db.js';
import bcrypt from 'bcrypt';

class User {
  static async findById(id) {
    const [users] = await pool.promise().query(`
      SELECT u.*, t.Tipo, r.Rol 
      FROM usuario u 
      LEFT JOIN tipousuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll 
      WHERE u.idUsuario = ?
    `, [id]);
    return users[0];
  }

  static async findAll() {
    const [users] = await pool.promise().query(`
      SELECT u.*, t.Tipo, r.Rol 
      FROM usuario u 
      LEFT JOIN tipousuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll
    `);
    return users;
  }

  static async findByEmail(email) {
    const [users] = await pool.promise().query(
      'SELECT * FROM usuario WHERE Correo = ?',
      [email]
    );
    return users[0];
  }

  static async findByDocument(documento) {
    const [users] = await pool.promise().query(
      'SELECT * FROM usuario WHERE Documento = ?',
      [documento]
    );
    return users[0];
  }

  static async createUserByAdmin(userData) {
    const { nombre, apellido, correo, password, documento, rol } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Los usuarios creados por admin están activos inmediatamente y no requieren validación
    const [result] = await pool.promise().query(
      'INSERT INTO usuario (Nombre, Apellido, Correo, Password, Documento, Rol, EstadoCuenta, RequiereValidacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, correo, hashedPassword, documento, rol, 'activo', false]
    );
    
    const userId = result.insertId;

    // Asignar rol automáticamente
    await this.assignRoleToUser(userId, rol);
    
    return userId;
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

  static async update(id, userData) {
    const { nombre, apellido, correo, documento, foto } = userData;
    
    // Construir la consulta dinámicamente dependiendo de si hay foto
    let query = 'UPDATE usuario SET Nombre = ?, Apellido = ?, Correo = ?, Documento = ?';
    let params = [nombre, apellido, correo, documento];
    
    if (foto !== undefined) {
      query += ', Foto = ?';
      params.push(foto);
    }
    
    query += ' WHERE idUsuario = ?';
    params.push(id);

    const [result] = await pool.promise().query(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.promise().query(
      'DELETE FROM usuario WHERE idUsuario = ?', 
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default User; 