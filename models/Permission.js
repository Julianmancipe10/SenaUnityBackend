import pool from '../config/db.js';

class Permission {
  static async findAll() {
    const [permisos] = await pool.promise().query('SELECT * FROM permiso ORDER BY Nombre');
    return permisos;
  }

  static async findByUserId(userId) {
    const [permisos] = await pool.promise().query(`
      SELECT p.*, up.FechaLimite 
      FROM UsuarioPermisos up 
      JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso 
      WHERE up.Usuario_idUsuario = ? 
      AND up.FechaLimite > NOW()
      ORDER BY p.Nombre
    `, [userId]);
    return permisos;
  }

  static async checkUserPermission(userId, permisoIdentifier) {
    let query;
    let params;

    // Verificar si el identificador es un número (ID) o texto (nombre)
    if (typeof permisoIdentifier === 'number' || !isNaN(permisoIdentifier)) {
      query = `
        SELECT * FROM UsuarioPermisos up
        WHERE up.Usuario_idUsuario = ? 
        AND up.permiso_ID_Permiso = ? 
        AND up.FechaLimite > NOW()
      `;
      params = [userId, permisoIdentifier];
    } else {
      query = `
        SELECT up.* FROM UsuarioPermisos up
        JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso
        WHERE up.Usuario_idUsuario = ? 
        AND p.Nombre = ? 
        AND up.FechaLimite > NOW()
      `;
      params = [userId, permisoIdentifier];
    }

    const [permisos] = await pool.promise().query(query, params);
    return permisos.length > 0;
  }

  static async getPermissionByName(nombre) {
    const [permisos] = await pool.promise().query('SELECT * FROM permiso WHERE Nombre = ?', [nombre]);
    return permisos[0] || null;
  }

  static async assignPermissionsToUser(userId, permisos, fechaLimite) {
    const connection = await pool.promise().getConnection();

    try {
      await connection.beginTransaction();

      // Eliminar permisos existentes del usuario
      await connection.query(
        'DELETE FROM UsuarioPermisos WHERE Usuario_idUsuario = ?',
        [userId]
      );

      // Procesar cada permiso
      for (const permisoIdentifier of permisos) {
        let permisoId;

        // Si es un número, usar como ID directo
        if (typeof permisoIdentifier === 'number' || !isNaN(permisoIdentifier)) {
          permisoId = permisoIdentifier;
        } else {
          // Si es texto, buscar el ID por nombre
          const [permisoData] = await connection.query(
            'SELECT ID_Permiso FROM permiso WHERE Nombre = ?',
            [permisoIdentifier]
          );
          
          if (permisoData.length === 0) {
            console.warn(`Permiso no encontrado: ${permisoIdentifier}`);
            continue; // Saltar este permiso si no existe
          }
          
          permisoId = permisoData[0].ID_Permiso;
        }

        // Insertar el permiso
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

  // Método para obtener permisos activos de un usuario con nombres
  static async getUserPermissionsWithNames(userId) {
    const [permisos] = await pool.promise().query(`
      SELECT p.Nombre, p.ID_Permiso, up.FechaLimite 
      FROM UsuarioPermisos up 
      JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso 
      WHERE up.Usuario_idUsuario = ? 
      AND up.FechaLimite > NOW()
      ORDER BY p.Nombre
    `, [userId]);
    return permisos;
  }
}

export default Permission; 