import pool from '../config/db.js';

class Instructor {
  // Obtener todos los instructores y funcionarios con sus perfiles
  static async getInstructoresYFuncionarios() {
    try {
      const [rows] = await pool.promise().query(`
        SELECT 
          u.idUsuario,
          u.Nombre,
          u.Apellido,
          u.Correo,
          u.Documento,
          u.Rol,
          u.Foto,
          u.FechaRegistro,
          p.Especialidad,
          p.Experiencia,
          p.Cursos,
          p.Biografia,
          COALESCE(AVG(c.Calificacion), 0) as CalificacionPromedio,
          COUNT(c.idCalificacion) as TotalCalificaciones
        FROM Usuario u
        LEFT JOIN PerfilInstructor p ON u.idUsuario = p.Usuario_idUsuario
        LEFT JOIN CalificacionInstructor c ON u.idUsuario = c.Instructor_idUsuario 
          AND c.EstadoCalificacion = 'activa'
        WHERE u.Rol IN ('instructor', 'funcionario') 
          AND u.EstadoCuenta = 'activo'
        GROUP BY u.idUsuario, u.Nombre, u.Apellido, u.Correo, u.Documento, u.Rol, u.Foto, u.FechaRegistro, p.Especialidad, p.Experiencia, p.Cursos, p.Biografia
        ORDER BY u.Nombre, u.Apellido
      `);
      
      return rows.map(row => ({
        id: row.idUsuario,
        nombre: row.Nombre,
        apellido: row.Apellido,
        correo: row.Correo,
        documento: row.Documento,
        rol: row.Rol,
        foto: row.Foto,
        fechaRegistro: row.FechaRegistro,
        especialidad: row.Especialidad,
        experiencia: row.Experiencia,
        cursos: this.parseCursos(row.Cursos),
        biografia: row.Biografia,
        calificacionPromedio: parseFloat(row.CalificacionPromedio).toFixed(1),
        totalCalificaciones: row.TotalCalificaciones
      }));
    } catch (error) {
      console.error('Error al obtener instructores y funcionarios:', error);
      throw error;
    }
  }

  // Obtener un instructor específico por ID
  static async getById(id) {
    try {
      const [rows] = await pool.promise().query(`
        SELECT 
          u.idUsuario,
          u.Nombre,
          u.Apellido,
          u.Correo,
          u.Documento,
          u.Rol,
          u.Foto,
          u.FechaRegistro,
          p.Especialidad,
          p.Experiencia,
          p.Cursos,
          p.Biografia,
          COALESCE(AVG(c.Calificacion), 0) as CalificacionPromedio,
          COUNT(c.idCalificacion) as TotalCalificaciones
        FROM Usuario u
        LEFT JOIN PerfilInstructor p ON u.idUsuario = p.Usuario_idUsuario
        LEFT JOIN CalificacionInstructor c ON u.idUsuario = c.Instructor_idUsuario 
          AND c.EstadoCalificacion = 'activa'
        WHERE u.idUsuario = ? 
          AND u.Rol IN ('instructor', 'funcionario') 
          AND u.EstadoCuenta = 'activo'
        GROUP BY u.idUsuario, u.Nombre, u.Apellido, u.Correo, u.Documento, u.Rol, u.Foto, u.FechaRegistro, p.Especialidad, p.Experiencia, p.Cursos, p.Biografia
      `, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.idUsuario,
        nombre: row.Nombre,
        apellido: row.Apellido,
        correo: row.Correo,
        documento: row.Documento,
        rol: row.Rol,
        foto: row.Foto,
        fechaRegistro: row.FechaRegistro,
        especialidad: row.Especialidad,
        experiencia: row.Experiencia,
        cursos: this.parseCursos(row.Cursos),
        biografia: row.Biografia,
        calificacionPromedio: parseFloat(row.CalificacionPromedio).toFixed(1),
        totalCalificaciones: row.TotalCalificaciones
      };
    } catch (error) {
      console.error('Error al obtener instructor por ID:', error);
      throw error;
    }
  }

  // Actualizar perfil de instructor/funcionario
  static async updatePerfil(userId, perfilData) {
    try {
      const { especialidad, experiencia, cursos, biografia } = perfilData;
      
      // Verificar si ya existe un perfil
      const [existingProfile] = await pool.promise().query(
        'SELECT idPerfil FROM PerfilInstructor WHERE Usuario_idUsuario = ?',
        [userId]
      );

      const cursosJson = JSON.stringify(cursos || []);

      if (existingProfile.length > 0) {
        // Actualizar perfil existente
        await pool.promise().query(`
          UPDATE PerfilInstructor 
          SET Especialidad = ?, Experiencia = ?, Cursos = ?, Biografia = ?
          WHERE Usuario_idUsuario = ?
        `, [especialidad, experiencia, cursosJson, biografia, userId]);
      } else {
        // Crear nuevo perfil
        await pool.promise().query(`
          INSERT INTO PerfilInstructor (Usuario_idUsuario, Especialidad, Experiencia, Cursos, Biografia)
          VALUES (?, ?, ?, ?, ?)
        `, [userId, especialidad, experiencia, cursosJson, biografia]);
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar perfil de instructor:', error);
      throw error;
    }
  }

  // Obtener calificaciones de un instructor
  static async getCalificaciones(instructorId) {
    try {
      const [rows] = await pool.promise().query(`
        SELECT 
          c.idCalificacion,
          c.Calificacion,
          c.Comentario,
          c.FechaCalificacion,
          u.Nombre as EstudianteNombre,
          u.Apellido as EstudianteApellido
        FROM CalificacionInstructor c
        JOIN Usuario u ON c.Estudiante_idUsuario = u.idUsuario
        WHERE c.Instructor_idUsuario = ? 
          AND c.EstadoCalificacion = 'activa'
        ORDER BY c.FechaCalificacion DESC
      `, [instructorId]);
      
      return rows;
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      throw error;
    }
  }

  // Método helper para parsear cursos de manera segura
  static parseCursos(cursosData) {
    if (!cursosData) {
      return [];
    }

    // Si ya es un array, retornarlo directamente
    if (Array.isArray(cursosData)) {
      return cursosData;
    }

    // Si es un string, intentar parsearlo como JSON
    if (typeof cursosData === 'string') {
      try {
        const parsed = JSON.parse(cursosData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        // Si no es JSON válido, tratarlo como string separado por comas
        console.warn('⚠️ Cursos no están en formato JSON, parseando como string:', cursosData);
        return cursosData
          .split(',')
          .map(curso => curso.trim())
          .filter(curso => curso.length > 0);
      }
    }

    return [];
  }
}

export default Instructor; 