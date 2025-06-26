import pool from '../config/db.js';

async function addUrlField() {
  try {
    console.log('🔧 Agregando campo URL_Enlace a la tabla Publicaciones...');
    
    // Verificar si el campo ya existe
    const [columns] = await pool.promise().query(
      `SHOW COLUMNS FROM Publicaciones WHERE Field = 'URL_Enlace'`
    );
    
    if (columns.length > 0) {
      console.log('✅ El campo URL_Enlace ya existe en la tabla Publicaciones');
      return;
    }
    
    // Agregar el campo URL_Enlace
    await pool.promise().query(
      `ALTER TABLE Publicaciones 
       ADD COLUMN URL_Enlace VARCHAR(500) NULL 
       AFTER Ubicacion`
    );
    
    console.log('✅ Campo URL_Enlace agregado exitosamente a la tabla Publicaciones');
    
    // Verificar la estructura actualizada
    const [newColumns] = await pool.promise().query(
      `DESCRIBE Publicaciones`
    );
    
    console.log('\n📋 Estructura actualizada de la tabla Publicaciones:');
    newColumns.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al agregar campo URL_Enlace:', error.message);
    throw error;
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addUrlField()
    .then(() => {
      console.log('\n🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en el script:', error);
      process.exit(1);
    });
}

export default addUrlField; 