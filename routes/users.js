import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const router = express.Router();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

//////////////////////////////////////////////////////
// 🟢 RUTAS QUE NO DEBEN COLISIONAR CON /:id
//////////////////////////////////////////////////////

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.promise().query(
      'SELECT idUsuario, Nombre, Apellido, Correo, Documento FROM usuario WHERE idUsuario = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];
    res.json({
      id: user.idUsuario,
      nombre: user.Nombre,
      apellido: user.Apellido,
      correo: user.Correo,
      documento: user.Documento
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, async (req, res) => {
  const { nombre, apellido, correo } = req.body;

  // Validar que los campos requeridos no sean nulos o vacíos
  if (!nombre || !apellido || !correo) {
    return res.status(400).json({ 
      message: 'Todos los campos son requeridos',
      errors: {
        nombre: !nombre ? 'El nombre es requerido' : null,
        apellido: !apellido ? 'El apellido es requerido' : null,
        correo: !correo ? 'El correo es requerido' : null
      }
    });
  }

  try {
    // Validar si el correo ya está en uso por otro usuario
    const [existingUsers] = await pool.promise().query(
      'SELECT idUsuario FROM usuario WHERE Correo = ? AND idUsuario != ?',
      [correo, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    await pool.promise().query(
      'UPDATE usuario SET Nombre = ?, Apellido = ?, Correo = ? WHERE idUsuario = ?',
      [nombre, apellido, correo, req.user.id]
    );

    res.json({ 
      message: 'Perfil actualizado exitosamente',
      user: {
        id: req.user.id,
        nombre,
        apellido,
        correo
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

//////////////////////////////////////////////////////
// 🔵 RUTAS CRUD GENERALES
//////////////////////////////////////////////////////

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.promise().query(`
      SELECT u.*, t.Tipo, r.Rol 
      FROM usuario u 
      LEFT JOIN tipousuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll
    `);
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener un usuario específico por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const [users] = await pool.promise().query(`
      SELECT u.*, t.Tipo, r.Rol 
      FROM usuario u 
      LEFT JOIN tipousuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll 
      WHERE u.idUsuario = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar usuario por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const { nombre, apellido, correo, documento } = req.body;

  try {
    const [result] = await pool.promise().query(
      'UPDATE usuario SET Nombre = ?, Apellido = ?, Correo = ?, Documento = ? WHERE idUsuario = ?',
      [nombre, apellido, correo, documento, id]
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

// Eliminar usuario por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const [result] = await pool.promise().query(
      'DELETE FROM usuario WHERE idUsuario = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
