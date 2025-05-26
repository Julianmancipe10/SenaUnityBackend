import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'senaunity',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Verificar la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
    
    // Verificar que las tablas necesarias existan
    connection.query(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = 'senaunity' 
        AND table_name IN ('Usuario', 'Roles', 'TipoUsuario')
    `, [process.env.DB_NAME || 'senaunity'], (err, results) => {
        if (err) {
            console.error('Error al verificar tablas:', err);
            return;
        }
        
        if (results.length < 3) {
            console.error('Faltan tablas necesarias en la base de datos');
            console.log('Tablas encontradas:', results.map(r => r.TABLE_NAME));
        } else {
            console.log('Todas las tablas necesarias existen');
        }
        
        connection.release();
    });
});

// Manejar errores de conexión
pool.on('error', (err) => {
    console.error('Error inesperado en la conexión a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('La conexión a la base de datos se perdió');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Demasiadas conexiones a la base de datos');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Conexión rechazada a la base de datos');
    }
});

export default pool; 