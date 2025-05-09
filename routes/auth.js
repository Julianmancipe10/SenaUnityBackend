const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware para logging
router.use((req, res, next) => {
    console.log('=== Nueva petición ===');
    console.log(`${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        
        if (!correo || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        }
        
        const [users] = await db.query('SELECT * FROM Usuario WHERE Correo = ?', [correo]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.Passaword);

        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Obtener el tipo de usuario
        const [tipoUsuario] = await db.query(
            'SELECT t.Tipo, r.Rol FROM TipoUsuario t JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll WHERE t.Usuario_idUsuario = ?',
            [user.idUsuario]
        );

        const token = jwt.sign(
            { 
                id: user.idUsuario, 
                nombre: user.Nombre,
                apellido: user.Apellido,
                correo: user.Correo,
                tipo: tipoUsuario[0]?.Tipo,
                rol: tipoUsuario[0]?.Rol
            },
            'tu_secreto_jwt',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.idUsuario,
                nombre: user.Nombre,
                apellido: user.Apellido,
                correo: user.Correo,
                tipo: tipoUsuario[0]?.Tipo,
                rol: tipoUsuario[0]?.Rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Registro
router.post('/register', async (req, res) => {
    console.log('=== Iniciando registro ===');
    let connection;
    
    try {
        const { nombre, apellido, correo, documento, password } = req.body;
        console.log('Datos recibidos:', { nombre, apellido, correo, documento });
        
        // Validar campos requeridos
        if (!nombre || !apellido || !correo || !documento || !password) {
            console.log('Error: Faltan campos requeridos');
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            console.log('Error: Email inválido');
            return res.status(400).json({ message: 'Formato de email inválido' });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            console.log('Error: Contraseña muy corta');
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        console.log('Verificando usuario existente...');
        // Verificar si el usuario ya existe
        const [existingUsers] = await db.query(
            'SELECT * FROM Usuario WHERE Correo = ? OR Documento = ?', 
            [correo, documento]
        );
        
        if (existingUsers.length > 0) {
            console.log('Error: Usuario ya existe');
            return res.status(400).json({ message: 'El correo o documento ya está registrado' });
        }

        console.log('Generando hash de contraseña...');
        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Obteniendo conexión...');
        // Obtener una conexión del pool
        connection = await db.getConnection();
        
        console.log('Iniciando transacción...');
        // Iniciar transacción
        await connection.beginTransaction();

        try {
            console.log('Verificando rol de aprendiz...');
            // Verificar que el rol de aprendiz existe
            const [roles] = await connection.query('SELECT idUsuarioRoll FROM Roles WHERE Rol = ?', ['Aprendiz']);
            console.log('Roles encontrados:', roles);
            
            if (roles.length === 0) {
                throw new Error('El rol de aprendiz no existe en la base de datos');
            }

            console.log('Insertando nuevo usuario...');
            // Insertar nuevo usuario
            const [result] = await connection.query(
                'INSERT INTO Usuario (Nombre, Apellido, Correo, Documento, Passaword) VALUES (?, ?, ?, ?, ?)',
                [nombre, apellido, correo, documento, hashedPassword]
            );
            console.log('Usuario insertado:', result);

            console.log('Asignando rol de aprendiz...');
            // Por defecto, asignar rol de aprendiz
            const [tipoUsuarioResult] = await connection.query(
                'INSERT INTO TipoUsuario (Tipo, Usuario_idUsuario, Roles_idUsuarioRoll) VALUES (?, ?, ?)',
                ['1', result.insertId, roles[0].idUsuarioRoll]
            );
            console.log('TipoUsuario insertado:', tipoUsuarioResult);

            console.log('Confirmando transacción...');
            // Confirmar transacción
            await connection.commit();

            console.log('Generando token...');
            const token = jwt.sign(
                { 
                    id: result.insertId, 
                    nombre,
                    apellido,
                    correo,
                    tipo: '1',
                    rol: 'Aprendiz'
                },
                'tu_secreto_jwt',
                { expiresIn: '1h' }
            );

            console.log('Registro completado exitosamente');
            res.status(201).json({
                token,
                user: {
                    id: result.insertId,
                    nombre,
                    apellido,
                    correo,
                    tipo: '1',
                    rol: 'Aprendiz'
                }
            });
        } catch (error) {
            console.error('Error en la transacción:', error);
            if (connection) {
                await connection.rollback();
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    } catch (error) {
        console.error('Error en registro:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: 'Error en el servidor',
            error: error.message,
            details: error.stack
        });
    }
});

module.exports = router; 