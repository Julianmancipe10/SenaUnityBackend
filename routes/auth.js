import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, correo, password, documento } = req.body;
        
        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.promise().query(
            'SELECT * FROM usuario WHERE Correo = ?',
            [correo]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario
        const [result] = await pool.promise().query(
            'INSERT INTO usuario (Nombre, Apellido, Correo, Passaword, Documento) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, correo, hashedPassword, documento]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar el usuario
        const [users] = await pool.promise().query(
            'SELECT * FROM usuario WHERE Correo = ?',
            [correo]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(password, user.Passaword);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.idUsuario, correo: user.Correo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.idUsuario,
                nombre: user.Nombre,
                apellido: user.Apellido,
                correo: user.Correo,
                documento: user.Documento
            }
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

export default router; 