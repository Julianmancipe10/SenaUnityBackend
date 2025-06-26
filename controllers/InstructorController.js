import Instructor from '../models/Instructor.js';
import { validateRequiredFields, validateId } from '../utils/validation.js';

class InstructorController {
  // Obtener todos los instructores y funcionarios
  static async getInstructoresYFuncionarios(req, res) {
    try {
      const instructores = await Instructor.getInstructoresYFuncionarios();
      
      res.json({
        success: true,
        data: instructores,
        count: instructores.length
      });
    } catch (error) {
      console.error('Error al obtener instructores y funcionarios:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener instructores y funcionarios' 
      });
    }
  }

  // Obtener un instructor específico por ID
  static async getInstructorById(req, res) {
    try {
      const id = validateId(req.params.id);
      const instructor = await Instructor.getById(id);
      
      if (!instructor) {
        return res.status(404).json({ 
          success: false,
          message: 'Instructor no encontrado' 
        });
      }

      res.json({
        success: true,
        data: instructor
      });
    } catch (error) {
      if (error.message === 'ID inválido') {
        return res.status(400).json({ 
          success: false,
          message: error.message 
        });
      }
      console.error('Error al obtener instructor por ID:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener instructor' 
      });
    }
  }

  // Actualizar perfil del instructor/funcionario autenticado
  static async updatePerfil(req, res) {
    try {
      // Verificar que el usuario sea instructor o funcionario
      if (!['instructor', 'funcionario'].includes(req.user.rol)) {
        return res.status(403).json({ 
          success: false,
          message: 'Solo instructores y funcionarios pueden actualizar su perfil' 
        });
      }

      validateRequiredFields(req.body, ['especialidad', 'experiencia']);
      const { especialidad, experiencia, cursos, biografia } = req.body;

      // Validar cursos como array si se proporciona
      let cursosArray = [];
      if (cursos) {
        if (Array.isArray(cursos)) {
          cursosArray = cursos;
        } else if (typeof cursos === 'string') {
          try {
            cursosArray = JSON.parse(cursos);
          } catch (e) {
            cursosArray = [cursos]; // Si no es JSON válido, tratarlo como un curso único
          }
        }
      }

      const perfilData = {
        especialidad: especialidad.trim(),
        experiencia: experiencia.trim(),
        cursos: cursosArray,
        biografia: biografia ? biografia.trim() : null
      };

      await Instructor.updatePerfil(req.user.id, perfilData);

      // Obtener el perfil actualizado
      const instructorActualizado = await Instructor.getById(req.user.id);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: instructorActualizado
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          errors: error.errors
        });
      }
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al actualizar perfil' 
      });
    }
  }

  // Obtener perfil del instructor/funcionario autenticado
  static async getMiPerfil(req, res) {
    try {
      // Verificar que el usuario sea instructor o funcionario
      if (!['instructor', 'funcionario'].includes(req.user.rol)) {
        return res.status(403).json({ 
          success: false,
          message: 'Solo instructores y funcionarios pueden acceder a esta función' 
        });
      }

      const instructor = await Instructor.getById(req.user.id);
      
      if (!instructor) {
        return res.status(404).json({ 
          success: false,
          message: 'Perfil no encontrado' 
        });
      }

      res.json({
        success: true,
        data: instructor
      });
    } catch (error) {
      console.error('Error al obtener mi perfil:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener perfil' 
      });
    }
  }

  // Obtener calificaciones de un instructor
  static async getCalificaciones(req, res) {
    try {
      const id = validateId(req.params.id);
      const calificaciones = await Instructor.getCalificaciones(id);
      
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
      console.error('Error al obtener calificaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener calificaciones' 
      });
    }
  }

  // Obtener mis calificaciones (para instructor/funcionario autenticado)
  static async getMisCalificaciones(req, res) {
    try {
      // Verificar que el usuario sea instructor o funcionario
      if (!['instructor', 'funcionario'].includes(req.user.rol)) {
        return res.status(403).json({ 
          success: false,
          message: 'Solo instructores y funcionarios pueden ver sus calificaciones' 
        });
      }

      const calificaciones = await Instructor.getCalificaciones(req.user.id);
      
      res.json({
        success: true,
        data: calificaciones,
        count: calificaciones.length
      });
    } catch (error) {
      console.error('Error al obtener mis calificaciones:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener calificaciones' 
      });
    }
  }
}

export default InstructorController; 