import pool from '../config/db.js';

const checkAdmin = async () => {
  try {
    // Verificar usuario
    const [users] = await pool.query(`
      SELECT u.*, r.Rol 
      FROM Usuario u 
      LEFT JOIN TipoUsuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll 
      WHERE u.Correo = ?
    `, ['admin@senaunity.com']);

    console.log('Usuario:', users[0]);

    if (users.length > 0) {
      // Verificar permisos
      const [permisos] = await pool.query(`
        SELECT p.*, up.FechaLimite 
        FROM UsuarioPermisos up 
        JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso 
        WHERE up.Usuario_idUsuario = ?
      `, [users[0].idUsuario]);

      console.log('Permisos:', permisos);
    } else {
      console.log('Usuario administrador no encontrado');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

checkAdmin(); 