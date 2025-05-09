const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.*, t.Tipo, r.Rol 
            FROM Usuario u 
            LEFT JOIN TipoUsuario t ON u.idUsuario = t.Usuario_idUsuario 
            LEFT JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll
        `);
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener un usuario específico
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.*, t.Tipo, r.Rol 
            FROM Usuario u 
            LEFT JOIN TipoUsuario t ON u.idUsuario = t.Usuario_idUsuario 
            LEFT JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll 
            WHERE u.idUsuario = ?
        `, [req.params.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { nombre, apellido, correo, documento } = req.body;
        
        const [result] = await db.query(
            'UPDATE Usuario SET Nombre = ?, Apellido = ?, Correo = ?, Documento = ? WHERE idUsuario = ?',
            [nombre, apellido, correo, documento, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Usuario WHERE idUsuario = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;