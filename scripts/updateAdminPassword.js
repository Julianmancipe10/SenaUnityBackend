import pool from '../config/db.js';

const updateAdminPassword = async () => {
  try {
    const [result] = await pool.query(
      'UPDATE Usuario SET Passaword = ? WHERE Correo = ?',
      ['$2b$10$Jq2ACmT312MfWc8Kkaq8POOF0qtZjWsP2eqTp9TDQFpi5Zm4kP.dW', 'admin@senaunity.com']
    );

    if (result.affectedRows > 0) {
      console.log('Contraseña del administrador actualizada correctamente');
    } else {
      console.log('No se encontró el usuario administrador');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

updateAdminPassword(); 