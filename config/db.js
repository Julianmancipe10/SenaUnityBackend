import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = mysql.createPool({
    host: 'bdsena.mysql.database.azure.com',
    port: 3306,
    user: 'Juli',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'senaunity',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: {
        ca: fs.readFileSync(path.join(process.cwd(), 'DigiCertGlobalRootCA.crt.pem')),
        rejectUnauthorized: true
    }
});

// Función para verificar la conexión con reintentos
const checkConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.promise().getConnection();
            console.log('Conexión exitosa a la base de datos');
            
            // Verificar que las tablas necesarias existan
            const [results] = await connection.query(`
                SELECT TABLE_NAME 
                FROM information_schema.tables 
                WHERE table_schema = ? 
                AND table_name IN ('Usuario', 'Roles', 'permiso', 'TipoUsuario', 'UsuarioPermisos')
            `, [process.env.DB_NAME || 'senaunity']);
            
            console.log('Tablas encontradas:', results.map(r => r.TABLE_NAME));
            
            if (results.length < 3) {
                console.log('Algunas tablas pueden estar faltando, pero el servidor continuará funcionando');
            } else {
                console.log('Todas las tablas principales existen');
            }
            
            connection.release();
            return true;
        } catch (err) {
            console.error(`Intento ${i + 1} de ${retries} fallido:`, err.message);
            if (i === retries - 1) {
                console.error('Error al conectar con la base de datos después de varios intentos:', err);
                console.error('Configuración actual:', {
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.DB_USER,
                    database: process.env.DB_NAME
                });
                return false;
            }
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return false;
};

// Intentar la conexión inicial
checkConnection().catch(err => {
    console.error('Error en la conexión inicial:', err);
});

// Manejar errores de conexión
pool.on('error', (err) => {
    console.error('Error inesperado en la conexión a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('La conexión a la base de datos se perdió');
        checkConnection().catch(console.error);
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Demasiadas conexiones a la base de datos');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Conexión rechazada a la base de datos');
        checkConnection().catch(console.error);
    } else if (err.code === 'ETIMEDOUT') {
        console.error('Timeout en la conexión a la base de datos');
        checkConnection().catch(console.error);
    }
});

export { pool }; 