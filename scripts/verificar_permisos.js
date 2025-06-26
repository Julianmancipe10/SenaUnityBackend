const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '', // Ajustar según tu configuración
  database: 'senaunity'
};

async function verificarYAgregarPermisos() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos senaunity...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida');
    
    // Verificar permisos actuales
    console.log('\n📋 Verificando permisos actuales en la base de datos...');
    const [existingPermissions] = await connection.execute(
      'SELECT ID_Permiso, Nombre FROM permiso ORDER BY ID_Permiso'
    );
    
    console.log(`\n📊 Permisos actuales (${existingPermissions.length} encontrados):`);
    existingPermissions.forEach((permission, index) => {
      console.log(`  ${index + 1}. ${permission.Nombre} (ID: ${permission.ID_Permiso})`);
    });
    
    // Permisos específicos que necesitamos para el sistema
    const permisosEspecificos = [
      'crear_evento',
      'crear_noticia', 
      'crear_carrera'
    ];
    
    console.log('\n🔄 Verificando permisos específicos necesarios...');
    
    for (const permiso of permisosEspecificos) {
      const existe = existingPermissions.some(p => p.Nombre === permiso);
      
      if (!existe) {
        try {
          const [result] = await connection.execute(
            'INSERT INTO permiso (Nombre) VALUES (?)',
            [permiso]
          );
          console.log(`✅ Permiso agregado: ${permiso} (ID: ${result.insertId})`);
        } catch (error) {
          console.error(`❌ Error agregando permiso ${permiso}:`, error.message);
        }
      } else {
        console.log(`ℹ️ Permiso ya existe: ${permiso}`);
      }
    }
    
    // Verificar estructura de UsuarioPermisos
    console.log('\n🔍 Verificando estructura de UsuarioPermisos...');
    const [columns] = await connection.execute(
      'DESCRIBE UsuarioPermisos'
    );
    
    console.log('📋 Columnas de UsuarioPermisos:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Verificar usuarios elegibles (instructores y funcionarios)
    console.log('\n👥 Verificando usuarios elegibles...');
    const [users] = await connection.execute(
      `SELECT idUsuario, Nombre, Apellido, Correo, Rol, EstadoCuenta 
       FROM Usuario 
       WHERE Rol IN ('instructor', 'funcionario') 
       ORDER BY Rol, Nombre`
    );
    
    console.log(`\n📊 Usuarios elegibles encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.Nombre} ${user.Apellido} (${user.Rol}) - ${user.EstadoCuenta}`);
    });
    
    // Verificar permisos asignados
    console.log('\n🔑 Verificando permisos ya asignados...');
    const [assignedPermissions] = await connection.execute(
      `SELECT u.Nombre as usuario, u.Apellido, p.Nombre as permiso, up.FechaLimite
       FROM UsuarioPermisos up
       JOIN Usuario u ON up.Usuario_idUsuario = u.idUsuario
       JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso
       WHERE u.Rol IN ('instructor', 'funcionario')
       ORDER BY u.Nombre, p.Nombre`
    );
    
    if (assignedPermissions.length > 0) {
      console.log(`📊 Permisos asignados: ${assignedPermissions.length}`);
      assignedPermissions.forEach(ap => {
        console.log(`  - ${ap.usuario} ${ap.Apellido}: ${ap.permiso} (hasta ${ap.FechaLimite})`);
      });
    } else {
      console.log('ℹ️ No hay permisos específicos asignados a instructores/funcionarios');
    }
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 MySQL no está ejecutándose o la configuración de conexión es incorrecta');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 La base de datos "senaunity" no existe');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

verificarYAgregarPermisos(); 