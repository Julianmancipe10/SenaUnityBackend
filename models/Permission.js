import pool from '../config/db.js';

class Permission {
  static async findAll() {
    const [permisos] = await pool.promise().query('SELECT * FROM permiso');
    return permisos;
  }

  static async findByUserId(userId) {
    const [permisos] = await pool.promise().query(`
      SELECT p.*, up.FechaLimite 
      FROM UsuarioPermisos up 
      JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso 
      WHERE up.Usuario_idUsuario = ?
    `, [userId]);
    return permisos;
  }

  static async checkUserPermission(userId, permisoId) {
    const [permisos] = await pool.promise().query(`
      SELECT * FROM UsuarioPermisos 
      WHERE Usuario_idUsuario = ? 
      AND permiso_ID_Permiso = ? 
      AND FechaLimite > NOW()
    `, [userId, permisoId]);
    return permisos.length > 0;
  }

  static async assignPermissionsToUser(userId, permisos, fechaLimite) {
    const connection = await pool.promise().getConnection();

    try {
      await connection.beginTransaction();

      // Eliminar permisos existentes
      await connection.query(
        'DELETE FROM UsuarioPermisos WHERE Usuario_idUsuario = ?',
        [userId]
      );

      // Insertar nuevos permisos
      for (const permisoId of permisos) {
        await connection.query(
          'INSERT INTO UsuarioPermisos (FechaLimite, permiso_ID_Permiso, Usuario_idUsuario) VALUES (?, ?, ?)',
          [fechaLimite, permisoId, userId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async removeUserPermissions(userId) {
    const [result] = await pool.promise().query(
      'DELETE FROM UsuarioPermisos WHERE Usuario_idUsuario = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

export default Permission; 