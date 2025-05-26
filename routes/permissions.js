import express from 'express';
import { pool } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los permisos
router.get('/', verifyToken, async (req, res) => {
  try {
    const [permisos] = await pool.promise().query('SELECT * FROM permiso');
    res.json(permisos);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
});

// Asignar permisos a un usuario
router.post('/assign', verifyToken, async (req, res) => {
  const { userId, permisos, fechaLimite } = req.body;
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    // Eliminar permisos existentes
    await connection.query(
      'DELETE FROM UsuarioPermisos WHERE Usuario_idUsuario = ?',
      [userId]
    );

    // Insertar nuevos permisos
    for (const permisoId of permisos) {
      await connection.query(
        'INSERT INTO UsuarioPermisos (FechaLimite, permiso_ID_Permiso, Usuario_idUsuario) VALUES (?, ?, ?)',
        [fechaLimite, permisoId, userId]
      );
    }

    await connection.commit();
    res.json({ message: 'Permisos asignados exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al asignar permisos:', error);
    res.status(500).json({ message: 'Error al asignar permisos' });
  } finally {
    connection.release();
  }
});

// Obtener permisos de un usuario
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const [permisos] = await pool.promise().query(`
      SELECT p.*, up.FechaLimite 
      FROM UsuarioPermisos up 
      JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso 
      WHERE up.Usuario_idUsuario = ?
    `, [req.params.userId]);
    
    res.json(permisos);
  } catch (error) {
    console.error('Error al obtener permisos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener permisos del usuario' });
  }
});

// Verificar si un usuario tiene un permiso específico
router.get('/check/:userId/:permisoId', verifyToken, async (req, res) => {
  try {
    const [permisos] = await pool.promise().query(`
      SELECT * FROM UsuarioPermisos 
      WHERE Usuario_idUsuario = ? 
      AND permiso_ID_Permiso = ? 
      AND FechaLimite > NOW()
    `, [req.params.userId, req.params.permisoId]);
    
    res.json({ hasPermission: permisos.length > 0 });
  } catch (error) {
    console.error('Error al verificar permiso:', error);
    res.status(500).json({ message: 'Error al verificar permiso' });
  }
});

export default router; 