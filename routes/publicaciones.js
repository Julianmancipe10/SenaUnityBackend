import express from 'express';
import PublicacionController from '../controllers/PublicacionController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Rutas para crear (requieren autenticación y permisos específicos)
router.post('/eventos', 
  authenticateToken, 
  checkPermission('crear_evento'),
  PublicacionController.upload.single('imagen'),
  PublicacionController.createEvento
);

router.post('/noticias', 
  authenticateToken, 
  checkPermission('crear_noticia'),
  PublicacionController.upload.single('imagen'),
  PublicacionController.createNoticia
);

router.post('/carreras', 
  authenticateToken, 
  checkPermission('crear_carrera'),
  PublicacionController.createCarrera
);

// Rutas para obtener (públicas)
router.get('/eventos', PublicacionController.getEventos);
router.get('/noticias', PublicacionController.getNoticias);
router.get('/carreras', PublicacionController.getCarreras);

// Obtener publicación específica por ID
router.get('/:id', PublicacionController.getPublicacionById);

// Actualizar publicación
router.put('/:id', 
  authenticateToken, 
  checkPermission('editar_publicacion'),
  PublicacionController.upload.single('imagen'),
  PublicacionController.updatePublicacion
);

// Rutas administrativas (requieren permisos)
router.delete('/:id', 
  authenticateToken, 
  checkPermission('eliminar_publicacion'),
  PublicacionController.deletePublicacion
);

router.get('/admin/stats', 
  authenticateToken, 
  checkPermission('ver_publicacion'),
  PublicacionController.getStats
);

export default router; 