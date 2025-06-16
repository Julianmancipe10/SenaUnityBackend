const mysql = require('mysql2/promise');

// Configuración de la base de datos - ajustar según tu configuración
const config = {
  host: 'localhost',
  user: 'root',
  password: '', // Cambia si tienes contraseña
  database: 'senaunity'
};

async function addNewPermissions() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida');
    
    // Nuevos permisos específicos que necesitamos
    const newPermissions = [
      'crear_evento',
      'crear_noticia', 
      'crear_carrera'
    ];
    
    console.log('\n🔄 Agregando nuevos permisos específicos...');
    
    for (const permission of newPermissions) {
      try {
        const [result] = await connection.execute(
          'INSERT IGNORE INTO permiso (Nombre) VALUES (?)',
          [permission]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ Permiso agregado: ${permission}`);
        } else {
          console.log(`ℹ️ Permiso ya existe: ${permission}`);
        }
      } catch (error) {
        console.error(`❌ Error agregando permiso ${permission}:`, error.message);
      }
    }
    
    // Verificar todos los permisos existentes
    console.log('\n📋 Verificando permisos en la base de datos...');
    const [existingPermissions] = await connection.execute(
      'SELECT * FROM permiso ORDER BY ID_Permiso'
    );
    
    console.log(`\n📊 Total de permisos: ${existingPermissions.length}`);
    existingPermissions.forEach((permission, index) => {
      console.log(`  ${index + 1}. ${permission.Nombre} (ID: ${permission.ID_Permiso})`);
    });
    
    console.log('\n🎉 Proceso completado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Verifica que:');
    console.error('   - MySQL esté ejecutándose');
    console.error('   - La base de datos "senaunity" exista');
    console.error('   - Las credenciales sean correctas');
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar función
addNewPermissions(); 