import Calificacion from '../models/Calificacion.js';
import { validateRequiredFields, validateId } from '../utils/validation.js';

class CalificacionController {
  // Crear una nueva calificación
  static async crearCalificacion(req, res) {
    try {
      validateRequiredFields(req.body, ['instructorId', 'calificacion']);
      const { instructorId, calificacion, comentario } = req.body;

      // Validar rango de calificación
      if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          success: false,
          message: 'La calificación debe estar entre 1 y 5'
        });
      }

      // Si el usuario está autenticado, usar su ID
      let estudianteId;
      if (req.user) {
        // Verificar que el usuario autenticado sea aprendiz
        if (req.user.rol !== 'aprendiz') {
          return res.status(403).json({
            success: false,
            message: 'Solo los aprendices pueden calificar instructores'
          });
        }
        estudianteId = req.user.id;
      } else {
        // Si no está autenticado, debe proporcionar documento
        const { documento } = req.body;
        if (!documento) {
          return res.status(400).json({
            success: false,
            message: 'Debe proporcionar un número de documento válido'
          });
        }

        // Verificar que el documento corresponda a un aprendiz
        const estudiante = await Calificacion.verificarEstudiantePorDocumento(documento);
        if (!estudiante) {
          return res.status(400).json({
            success: false,
            message: 'No se encontró un aprendiz activo con ese número de documento'
          });
        }
        estudianteId = estudiante.id;
      }

      // Verificar que el estudiante puede calificar al instructor
      const puedeCalificar = await Calificacion.puedeCalificar(estudianteId, instructorId);
      if (!puedeCalificar.puedeCalificar) {
        return res.status(400).json({
          success: false,
          message: puedeCalificar.razon
        });
      }

      const calificacionData = {
        instructorId: parseInt(instructorId),
        estudianteId,
        calificacion: parseFloat(calificacion),
        comentario: comentario ? comentario.trim() : null
      };

      const calificacionId = await Calificacion.crear(calificacionData);

      res.status(201).json({
        success: true,
        message: 'Calificación registrada exitosamente',
        data: {
          id: calificacionId,
          ...calificacionData
        }
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          errors: error.errors
        });
      }
      console.error('Error al crear calificación:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear calificación'
      });
    }
  }

  // Verificar estudiante por documento
  static async verificarEstudiante(req, res) {
    try {
      validateRequiredFields(req.body, ['documento']);
      const { documento } = req.body;

      // Validar formato de documento
      if (!/^\d+$/.test(documento)) {
        return res.status(400).json({
          success: false,
          message: 'El documento debe contener solo números'
        });
      }

      const estudiante = await Calificacion.verificarEstudiantePorDocumento(documento);
      
      if (!estudiante) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un aprendiz activo con ese número de documento'
        });
      }

      res.json({
        success: true,
        message: 'Estudiante encontrado',
        data: estudiante
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          errors: error.errors
        });
      }
      console.error('Error al verificar estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar estudiante'
      });
    }
  }

  // Obtener calificaciones de un instructor
  static async getCalificacionesPorInstructor(req, res) {
    try {
      const id = validateId(req.params.instructorId);
      const calificaciones = await Calificacion.obtenerPorInstructor(id);
      
      res.json({
        success: true,
        data: calificaciones,
        count: calificaciones.length
      });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      console.error('Error al obtener calificaciones por instructor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener calificaciones'
      });
    }
  }

  // Obtener estadísticas de calificaciones de un instructor
  static async getEstadisticas(req, res) {
    try {
      const id = validateId(req.params.instructorId);
      const estadisticas = await Calificacion.obtenerEstadisticas(id);
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas'
      });
    }
  }

  // Reportar una calificación
  static async reportarCalificacion(req, res) {
    try {
      const id = validateId(req.params.calificacionId);
      const { motivo } = req.body;

      await Calificacion.reportar(id, motivo);
      
      res.json({
        success: true,
        message: 'Calificación reportada exitosamente'
      });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
             console.error('Error al reportar calificación:', error);
       res.status(500).json({
         success: false,
         message: 'Error al reportar calificación'
       });
     }
   }

   // Verificar si un usuario puede calificar a un instructor
  static async verificarPuedeCalificar(req, res) {
    try {
      const instructorId = validateId(req.params.instructorId);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Debe estar autenticado para verificar permisos'
        });
      }

      const resultado = await Calificacion.puedeCalificar(req.user.id, instructorId);
      
      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      console.error('Error al verificar permisos de calificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  }
}

export default CalificacionController; 