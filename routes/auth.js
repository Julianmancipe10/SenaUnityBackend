import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Configuración de multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB límite
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Middleware para logging
router.use((req, res, next) => {
    console.log('=== Nueva petición ===');
    console.log(`${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// Login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    const [users] = await pool.query(`
      SELECT u.*, r.Rol 
      FROM Usuario u 
      LEFT JOIN TipoUsuario t ON u.idUsuario = t.Usuario_idUsuario 
      LEFT JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll 
      WHERE u.Correo = ?
    `, [correo]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.Passaword);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Obtener permisos del usuario
    const [permisosRows] = await pool.query(`
      SELECT p.Nombre FROM UsuarioPermisos up
      JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso
      WHERE up.Usuario_idUsuario = ? AND up.FechaLimite > NOW()
    `, [user.idUsuario]);
    const permisos = permisosRows.map(p => p.Nombre);

    const token = jwt.sign(
      { 
        id: user.idUsuario,
        correo: user.Correo,
        nombre: user.Nombre,
        apellido: user.Apellido,
        rol: user.Rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.idUsuario,
        nombre: user.Nombre,
        apellido: user.Apellido,
        correo: user.Correo,
        rol: user.Rol,
        permisos
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Registro
router.post('/register', upload.single('imagen'), async (req, res) => {
  const { nombre, apellido, correo, documento, password } = req.body;
  const imagen = req.file ? req.file.path : null;

  let connection;
  try {
    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.query(
      'SELECT * FROM Usuario WHERE Correo = ? OR Documento = ?',
      [correo, documento]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Iniciar transacción usando una conexión del pool
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Verificar que el rol de aprendiz existe
      const [roles] = await connection.query('SELECT idUsuarioRoll FROM Roles WHERE Rol = ?', ['Aprendiz']);
      
      if (roles.length === 0) {
        throw new Error('El rol de aprendiz no existe en la base de datos');
      }

      // Insertar nuevo usuario
      const [result] = await connection.query(
        'INSERT INTO Usuario (Nombre, Apellido, Correo, Documento, Passaword, Foto) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, apellido, correo, documento, hashedPassword, imagen]
      );

      // Asignar rol de aprendiz
      await connection.query(
        'INSERT INTO TipoUsuario (Tipo, Usuario_idUsuario, Roles_idUsuarioRoll) VALUES (?, ?, ?)',
        ['1', result.insertId, roles[0].idUsuarioRoll]
      );

      // Confirmar transacción
      await connection.commit();

      const token = jwt.sign(
        { 
          id: result.insertId, 
          nombre,
          apellido,
          correo,
          tipo: '1',
          rol: 'Aprendiz'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: result.insertId,
          nombre,
          apellido,
          correo,
          tipo: '1',
          rol: 'Aprendiz',
          imagen
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar perfil
router.put('/profile', verifyToken, upload.single('imagen'), async (req, res) => {
  const userId = req.user.id;

  const { nombre, apellido, correo, documento, password } = req.body;
  const imagen = req.file ? req.file.path : null;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el correo o documento ya existen para otro usuario
    const [existingUsers] = await connection.query(
      'SELECT * FROM Usuario WHERE (Correo = ? OR Documento = ?) AND idUsuario != ?',
      [correo, documento, userId]
    );

    if (existingUsers.length > 0) {
      throw new Error('El correo o documento ya está en uso por otro usuario');
    }

    // Construir la consulta de actualización
    let updateQuery = 'UPDATE Usuario SET Nombre = ?, Apellido = ?, Correo = ?, Documento = ?';
    let queryParams = [nombre, apellido, correo, documento];

    // Si hay una nueva contraseña, actualizarla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', Passaword = ?';
      queryParams.push(hashedPassword);
    }

    // Si hay una nueva imagen, actualizarla
    if (imagen) {
      updateQuery += ', Foto = ?';
      queryParams.push(imagen);
    }

    updateQuery += ' WHERE idUsuario = ?';
    queryParams.push(userId);

    // Ejecutar la actualización
    await connection.query(updateQuery, queryParams);

    // Obtener el usuario actualizado
    const [updatedUser] = await connection.query(
      'SELECT u.*, r.Rol FROM Usuario u LEFT JOIN TipoUsuario t ON u.idUsuario = t.Usuario_idUsuario LEFT JOIN Roles r ON t.Roles_idUsuarioRoll = r.idUsuarioRoll WHERE u.idUsuario = ?',
      [userId]
    );

    await connection.commit();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser[0].idUsuario,
        nombre: updatedUser[0].Nombre,
        apellido: updatedUser[0].Apellido,
        correo: updatedUser[0].Correo,
        documento: updatedUser[0].Documento,
        rol: updatedUser[0].Rol,
        foto: updatedUser[0].Foto
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
});

export default router; 