import pool from '../config/db.js';

class Publicacion {
  // Crear una nueva publicación (evento, noticia, carrera)
  static async create(publicacionData) {
    const {
      nombre,
      descripcion,
      fecha,
      ubicacion,
      enlace,
      tipoPublicacion,
      usuarioId,
      responsable
    } = publicacionData;

    const [result] = await pool.promise().query(
      `INSERT INTO Publicaciones (
        Nombre, 
        Descripción, 
        Fecha, 
        Ubicacion, 
        URL_Enlace, 
        TipoPublicacion, 
        Usuario_idUsuario, 
        Responsable, 
        Estado, 
        FechaCreacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Activo', NOW())`,
      [nombre, descripcion, fecha, ubicacion, enlace, tipoPublicacion, usuarioId, responsable]
    );

    return result.insertId;
  }

  // Obtener todas las publicaciones por tipo
  static async findByType(tipoPublicacion) {
    const [publicaciones] = await pool.promise().query(
      `SELECT 
        p.ID_Evento,
        p.Nombre,
        p.Descripción,
        p.Fecha,
        p.Ubicacion,
        p.URL_Enlace,
        p.Estado,
        p.FechaCreacion,
        p.TipoPublicacion,
        u.Nombre as CreadorNombre,
        u.Apellido as CreadorApellido,
        s.Imagen as ImagenSlider
      FROM Publicaciones p
      LEFT JOIN Usuario u ON p.Usuario_idUsuario = u.idUsuario
      LEFT JOIN slider s ON p.ID_Evento = s.evento_ID_Evento
      WHERE p.TipoPublicacion = ? AND p.Estado = 'Activo'
      ORDER BY p.FechaCreacion DESC`,
      [tipoPublicacion]
    );

    return publicaciones;
  }

  // Obtener publicación por ID
  static async findById(id) {
    const [publicaciones] = await pool.promise().query(
      `SELECT 
        p.*,
        u.Nombre as CreadorNombre,
        u.Apellido as CreadorApellido,
        s.Imagen as ImagenSlider
      FROM Publicaciones p
      LEFT JOIN Usuario u ON p.Usuario_idUsuario = u.idUsuario
      LEFT JOIN slider s ON p.ID_Evento = s.evento_ID_Evento
      WHERE p.ID_Evento = ?`,
      [id]
    );

    return publicaciones[0];
  }

  // Agregar imagen al slider
  static async addSliderImage(eventoId, imagenPath, descripcion = null) {
    const [result] = await pool.promise().query(
      `INSERT INTO slider (Imagen, Descripción, evento_ID_Evento, Estado, FechaCreacion) 
       VALUES (?, ?, ?, 'activo', NOW())`,
      [imagenPath, descripcion, eventoId]
    );

    return result.insertId;
  }

  // Actualizar imagen existente en el slider
  static async updateSliderImage(eventoId, imagenPath, descripcion = null) {
    // Primero verificar si ya existe una imagen para este evento
    const [existing] = await pool.promise().query(
      `SELECT ID_Slider FROM slider WHERE evento_ID_Evento = ? LIMIT 1`,
      [eventoId]
    );

    if (existing.length > 0) {
      // Actualizar imagen existente
      const [result] = await pool.promise().query(
        `UPDATE slider SET Imagen = ?, Descripción = ? WHERE evento_ID_Evento = ?`,
        [imagenPath, descripcion, eventoId]
      );
      return result.affectedRows > 0;
    } else {
      // Si no existe, crear nueva entrada
      return await this.addSliderImage(eventoId, imagenPath, descripcion);
    }
  }

  // Actualizar publicación
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    // Mapear campos del frontend a nombres de la base de datos
    const fieldMap = {
      'Nombre': 'Nombre',
      'Descripción': 'Descripción',
      'Descripcion': 'Descripción',
      'URL_Enlace': 'URL_Enlace',
      'Ubicacion': 'Ubicacion',
      'Fecha': 'Fecha'
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);

    const [result] = await pool.promise().query(
      `UPDATE Publicaciones SET ${fields.join(', ')} WHERE ID_Evento = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Eliminar publicación (soft delete)
  static async delete(id) {
    const [result] = await pool.promise().query(
      `UPDATE Publicaciones SET Estado = 'Inactivo' WHERE ID_Evento = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  // Obtener estadísticas
  static async getStats() {
    const [stats] = await pool.promise().query(
      `SELECT 
        TipoPublicacion,
        COUNT(*) as total
      FROM Publicaciones 
      WHERE Estado = 'Activo'
      GROUP BY TipoPublicacion`
    );

    return stats;
  }
}

export default Publicacion; 