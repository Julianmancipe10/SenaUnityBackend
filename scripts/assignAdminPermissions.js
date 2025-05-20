import pool from '../config/db.js';

const assignAdminPermissions = async () => {
  try {
    // Obtener ID del administrador
    const [users] = await pool.query(
      'SELECT idUsuario FROM Usuario WHERE Correo = ?',
      ['admin@senaunity.com']
    );

    if (users.length === 0) {
      console.log('No se encontró el usuario administrador');
      return;
    }

    const adminId = users[0].idUsuario;

    // Obtener todos los permisos
    const [permisos] = await pool.query('SELECT ID_Permiso FROM permiso');

    // Obtener el último ID de UsuarioPermisos
    const [lastId] = await pool.query('SELECT MAX(idUsuarioPermisos) as maxId FROM UsuarioPermisos');
    let nextId = (lastId[0].maxId || 0) + 1;

    // Asignar cada permiso al administrador
    for (const permiso of permisos) {
      await pool.query(
        'INSERT INTO UsuarioPermisos (idUsuarioPermisos, FechaLimite, permiso_ID_Permiso, Usuario_idUsuario) VALUES (?, ?, ?, ?)',
        [nextId++, '2099-12-31', permiso.ID_Permiso, adminId]
      );
    }

    console.log('Permisos asignados correctamente al administrador');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

assignAdminPermissions(); 