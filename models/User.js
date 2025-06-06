import pool from '../config/db.js';

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

  static async update(id, userData) {
    const { nombre, apellido, correo, documento } = userData;
    const [result] = await pool.promise().query(
      'UPDATE usuario SET Nombre = ?, Apellido = ?, Correo = ?, Documento = ? WHERE idUsuario = ?',
      [nombre, apellido, correo, documento, id]
    );
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