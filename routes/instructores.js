import express from 'express';
import InstructorController from '../controllers/InstructorController.js';
import CalificacionController from '../controllers/CalificacionController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 🎓 RUTAS DE INSTRUCTORES Y FUNCIONARIOS
// ==========================================

// Obtener todos los instructores y funcionarios (público)
router.get('/', InstructorController.getInstructoresYFuncionarios);

// Obtener un instructor específico por ID (público)
router.get('/:id', InstructorController.getInstructorById);

// Obtener calificaciones de un instructor específico (público)
router.get('/:id/calificaciones', InstructorController.getCalificaciones);

// ==========================================
// 🔐 RUTAS PROTEGIDAS PARA INSTRUCTORES/FUNCIONARIOS
// ==========================================

// Obtener mi perfil (requiere autenticación como instructor/funcionario)
router.get('/mi/perfil', authenticateToken, InstructorController.getMiPerfil);

// Actualizar mi perfil (requiere autenticación como instructor/funcionario)
router.put('/mi/perfil', authenticateToken, InstructorController.updatePerfil);

// Obtener mis calificaciones (requiere autenticación como instructor/funcionario)
router.get('/mi/calificaciones', authenticateToken, InstructorController.getMisCalificaciones);

// ==========================================
// ⭐ RUTAS DE CALIFICACIONES
// ==========================================

// Crear calificación (autenticación opcional - permite calificar con documento)
router.post('/calificaciones', optionalAuth, CalificacionController.crearCalificacion);

// Verificar estudiante por documento (público)
router.post('/calificaciones/verificar-estudiante', CalificacionController.verificarEstudiante);

// Obtener calificaciones de un instructor específico (público)
router.get('/calificaciones/instructor/:instructorId', CalificacionController.getCalificacionesPorInstructor);

// Obtener estadísticas de calificaciones de un instructor (público)
router.get('/calificaciones/instructor/:instructorId/estadisticas', CalificacionController.getEstadisticas);

// Verificar si un usuario puede calificar a un instructor (requiere autenticación)
router.get('/calificaciones/puede-calificar/:instructorId', authenticateToken, CalificacionController.verificarPuedeCalificar);

// Reportar una calificación (requiere autenticación)
router.put('/calificaciones/:calificacionId/reportar', authenticateToken, CalificacionController.reportarCalificacion);

export default router; 