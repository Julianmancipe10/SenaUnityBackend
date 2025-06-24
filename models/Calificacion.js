import pool from '../config/db.js';

class Calificacion {
  // Crear una nueva calificación
  static async crear(calificacionData) {
    try {
      const { instructorId, estudianteId, calificacion, comentario } = calificacionData;
      
      // Verificar que el instructor existe y es instructor/funcionario
      const [instructor] = await pool.promise().query(
        'SELECT idUsuario, Rol FROM Usuario WHERE idUsuario = ? AND Rol IN (?, ?) AND EstadoCuenta = ?',
        [instructorId, 'instructor', 'funcionario', 'activo']
      );
      
      if (instructor.length === 0) {
        throw new Error('Instructor no encontrado o no válido');
      }

      // Verificar que el estudiante existe y es aprendiz
      const [estudiante] = await pool.promise().query(
        'SELECT idUsuario FROM Usuario WHERE idUsuario = ? AND Rol = ? AND EstadoCuenta = ?',
        [estudianteId, 'aprendiz', 'activo']
      );
      
      if (estudiante.length === 0) {
        throw new Error('Estudiante no encontrado o no es aprendiz activo');
      }

      // Verificar si ya existe una calificación de este estudiante para este instructor
      const [existingCalificacion] = await pool.promise().query(
        'SELECT idCalificacion FROM CalificacionInstructor WHERE Instructor_idUsuario = ? AND Estudiante_idUsuario = ?',
        [instructorId, estudianteId]
      );

      if (existingCalificacion.length > 0) {
        // Actualizar calificación existente
        await pool.promise().query(`
          UPDATE CalificacionInstructor 
          SET Calificacion = ?, Comentario = ?, FechaCalificacion = CURRENT_TIMESTAMP, EstadoCalificacion = 'activa'
          WHERE Instructor_idUsuario = ? AND Estudiante_idUsuario = ?
        `, [calificacion, comentario, instructorId, estudianteId]);
        
        return existingCalificacion[0].idCalificacion;
      } else {
        // Crear nueva calificación
        const [result] = await pool.promise().query(`
          INSERT INTO CalificacionInstructor (Instructor_idUsuario, Estudiante_idUsuario, Calificacion, Comentario)
          VALUES (?, ?, ?, ?)
        `, [instructorId, estudianteId, calificacion, comentario]);
        
        return result.insertId;
      }
    } catch (error) {
      console.error('Error al crear calificación:', error);
      throw error;
    }
  }

  // Obtener calificaciones de un instructor específico
  static async obtenerPorInstructor(instructorId) {
    try {
      const [rows] = await pool.promise().query(`
        SELECT 
          c.idCalificacion,
          c.Calificacion,
          c.Comentario,
          c.FechaCalificacion,
          c.EstadoCalificacion,
          u.Nombre as EstudianteNombre,
          u.Apellido as EstudianteApellido,
          u.Documento as EstudianteDocumento
        FROM CalificacionInstructor c
        JOIN Usuario u ON c.Estudiante_idUsuario = u.idUsuario
        WHERE c.Instructor_idUsuario = ? 
          AND c.EstadoCalificacion = 'activa'
        ORDER BY c.FechaCalificacion DESC
      `, [instructorId]);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener calificaciones por instructor:', error);
      throw error;
    }
  }

  // Verificar si un estudiante puede calificar a un instructor
  static async puedeCalificar(estudianteId, instructorId) {
    try {
      // Verificar que el estudiante sea aprendiz activo
      const [estudiante] = await pool.promise().query(
        'SELECT idUsuario FROM Usuario WHERE idUsuario = ? AND Rol = ? AND EstadoCuenta = ?',
        [estudianteId, 'aprendiz', 'activo']
      );
      
      if (estudiante.length === 0) {
        return { puedeCalificar: false, razon: 'El usuario no es un aprendiz activo' };
      }

      // Verificar que el instructor sea válido
      const [instructor] = await pool.promise().query(
        'SELECT idUsuario FROM Usuario WHERE idUsuario = ? AND Rol IN (?, ?) AND EstadoCuenta = ?',
        [instructorId, 'instructor', 'funcionario', 'activo']
      );
      
      if (instructor.length === 0) {
        return { puedeCalificar: false, razon: 'Instructor no válido' };
      }

      return { puedeCalificar: true };
    } catch (error) {
      console.error('Error al verificar si puede calificar:', error);
      throw error;
    }
  }

  // Verificar estudiante por documento
  static async verificarEstudiantePorDocumento(documento) {
    try {
      const [rows] = await pool.promise().query(
        'SELECT idUsuario, Nombre, Apellido, Correo FROM Usuario WHERE Documento = ? AND Rol = ? AND EstadoCuenta = ?',
        [documento, 'aprendiz', 'activo']
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return {
        id: rows[0].idUsuario,
        nombre: rows[0].Nombre,
        apellido: rows[0].Apellido,
        correo: rows[0].Correo,
        documento: documento
      };
    } catch (error) {
      console.error('Error al verificar estudiante por documento:', error);
      throw error;
    }
  }

  // Obtener estadísticas de calificaciones
  static async obtenerEstadisticas(instructorId) {
    try {
      const [rows] = await pool.promise().query(`
        SELECT 
          COUNT(*) as totalCalificaciones,
          AVG(Calificacion) as promedio,
          MIN(Calificacion) as minima,
          MAX(Calificacion) as maxima,
          SUM(CASE WHEN Calificacion = 5 THEN 1 ELSE 0 END) as calificaciones5,
          SUM(CASE WHEN Calificacion = 4 THEN 1 ELSE 0 END) as calificaciones4,
          SUM(CASE WHEN Calificacion = 3 THEN 1 ELSE 0 END) as calificaciones3,
          SUM(CASE WHEN Calificacion = 2 THEN 1 ELSE 0 END) as calificaciones2,
          SUM(CASE WHEN Calificacion = 1 THEN 1 ELSE 0 END) as calificaciones1
        FROM CalificacionInstructor
        WHERE Instructor_idUsuario = ? AND EstadoCalificacion = 'activa'
      `, [instructorId]);
      
      if (rows.length === 0) {
        return {
          totalCalificaciones: 0,
          promedio: 0,
          distribuccion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const stats = rows[0];
      return {
        totalCalificaciones: stats.totalCalificaciones,
        promedio: parseFloat(stats.promedio || 0).toFixed(1),
        minima: stats.minima,
        maxima: stats.maxima,
        distribuccion: {
          5: stats.calificaciones5,
          4: stats.calificaciones4,
          3: stats.calificaciones3,
          2: stats.calificaciones2,
          1: stats.calificaciones1
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Eliminar/reportar calificación
  static async reportar(calificacionId, motivo) {
    try {
      await pool.promise().query(
        'UPDATE CalificacionInstructor SET EstadoCalificacion = ? WHERE idCalificacion = ?',
        ['reportada', calificacionId]
      );
      
      // Aquí podrías agregar lógica para guardar el motivo del reporte
      return true;
    } catch (error) {
      console.error('Error al reportar calificación:', error);
      throw error;
    }
  }
}

export default Calificacion; 