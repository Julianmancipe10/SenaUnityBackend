import Publicacion from '../models/Publicacion.js';
import { validateRequiredFields } from '../utils/validation.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/publicaciones/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

class PublicacionController {
  // Middleware para subida de archivos
  static upload = upload;

  // Crear evento
  static async createEvento(req, res) {
    try {
      validateRequiredFields(req.body, ['titulo', 'fecha', 'descripcion']);
      
      const { titulo, fecha, descripcion, ubicacion, enlace } = req.body;
      const userId = req.user.id;

      // Verificar que hay imagen
      if (!req.file) {
        return res.status(400).json({ message: 'La imagen es requerida' });
      }

      // Crear publicación tipo evento (1)
      const publicacionData = {
        nombre: titulo,
        descripcion: descripcion,
        fecha: fecha,
        ubicacion: ubicacion || 'Virtual',
        enlace: enlace || null,
        tipoPublicacion: '1', // 1 = Evento
        usuarioId: userId,
        responsable: userId
      };

      const eventoId = await Publicacion.create(publicacionData);

      // Agregar imagen al slider
      const imagenPath = `/uploads/publicaciones/${req.file.filename}`;
      await Publicacion.addSliderImage(eventoId, imagenPath, titulo);

      res.status(201).json({
        message: 'Evento creado exitosamente',
        evento: {
          id: eventoId,
          titulo,
          fecha,
          descripcion,
          imagen: imagenPath
        }
      });
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({ message: 'Error al crear evento' });
    }
  }

  // Crear noticia
  static async createNoticia(req, res) {
    try {
      validateRequiredFields(req.body, ['titulo', 'fecha', 'descripcion']);
      
      const { titulo, fecha, descripcion, ubicacion, enlace } = req.body;
      const userId = req.user.id;

      // Verificar que hay imagen
      if (!req.file) {
        return res.status(400).json({ message: 'La imagen es requerida' });
      }

      // Crear publicación tipo noticia (2)
      const publicacionData = {
        nombre: titulo,
        descripcion: descripcion,
        fecha: fecha,
        ubicacion: ubicacion || 'Virtual',
        enlace: enlace || null,
        tipoPublicacion: '2', // 2 = Noticia
        usuarioId: userId,
        responsable: userId
      };

      const noticiaId = await Publicacion.create(publicacionData);

      // Agregar imagen al slider
      const imagenPath = `/uploads/publicaciones/${req.file.filename}`;
      await Publicacion.addSliderImage(noticiaId, imagenPath, titulo);

      res.status(201).json({
        message: 'Noticia creada exitosamente',
        noticia: {
          id: noticiaId,
          titulo,
          fecha,
          descripcion,
          imagen: imagenPath
        }
      });
    } catch (error) {
      console.error('Error al crear noticia:', error);
      res.status(500).json({ message: 'Error al crear noticia' });
    }
  }

  // Crear carrera
  static async createCarrera(req, res) {
    try {
      validateRequiredFields(req.body, ['titulo', 'tipo', 'horas', 'descripcion', 'tituloObtener']);
      
      const { titulo, tipo, horas, descripcion, tituloObtener, ubicacion, visibleHasta } = req.body;
      const userId = req.user.id;

      // Determinar el tipo de publicación basado en el tipo de carrera
      const tipoPublicacion = tipo === 'Técnico' ? '3' : '4'; // 3 = Curso, 4 = Tecnólogo

      // Crear descripción extendida
      const descripcionCompleta = `${descripcion}\n\nDuración: ${horas} horas\nTítulo a obtener: ${tituloObtener}`;

      const publicacionData = {
        nombre: titulo,
        descripcion: descripcionCompleta,
        fecha: visibleHasta || '2025-12-31', // Fecha por defecto si no se especifica
        ubicacion: ubicacion || 'Centro de Comercio y Turismo - Quindío',
        enlace: null,
        tipoPublicacion: tipoPublicacion,
        usuarioId: userId,
        responsable: userId
      };

      const carreraId = await Publicacion.create(publicacionData);

      res.status(201).json({
        message: 'Carrera creada exitosamente',
        carrera: {
          id: carreraId,
          titulo,
          tipo,
          horas,
          descripcion,
          tituloObtener
        }
      });
    } catch (error) {
      console.error('Error al crear carrera:', error);
      res.status(500).json({ message: 'Error al crear carrera' });
    }
  }

  // Obtener eventos
  static async getEventos(req, res) {
    try {
      const eventos = await Publicacion.findByType('1');
      res.json(eventos);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      res.status(500).json({ message: 'Error al obtener eventos' });
    }
  }

  // Obtener noticias
  static async getNoticias(req, res) {
    try {
      const noticias = await Publicacion.findByType('2');
      res.json(noticias);
    } catch (error) {
      console.error('Error al obtener noticias:', error);
      res.status(500).json({ message: 'Error al obtener noticias' });
    }
  }

  // Obtener carreras (cursos y tecnólogos)
  static async getCarreras(req, res) {
    try {
      const cursos = await Publicacion.findByType('3');
      const tecnologos = await Publicacion.findByType('4');
      
      res.json({
        cursos,
        tecnologos,
        total: [...cursos, ...tecnologos]
      });
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      res.status(500).json({ message: 'Error al obtener carreras' });
    }
  }

  // Obtener publicación por ID
  static async getPublicacionById(req, res) {
    try {
      const { id } = req.params;
      const publicacion = await Publicacion.findById(id);
      
      if (!publicacion) {
        return res.status(404).json({ message: 'Publicación no encontrada' });
      }

      res.json(publicacion);
    } catch (error) {
      console.error('Error al obtener publicación:', error);
      res.status(500).json({ message: 'Error al obtener publicación' });
    }
  }

  // Eliminar publicación
  static async deletePublicacion(req, res) {
    try {
      const { id } = req.params;
      const success = await Publicacion.delete(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Publicación no encontrada' });
      }

      res.json({ message: 'Publicación eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      res.status(500).json({ message: 'Error al eliminar publicación' });
    }
  }

  // Actualizar publicación
  static async updatePublicacion(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('Datos recibidos para actualizar publicación:', updateData);

      // Si hay nueva imagen, actualizarla en el slider (no agregar nueva)
      if (req.file) {
        const imagenPath = `/uploads/publicaciones/${req.file.filename}`;
        await Publicacion.updateSliderImage(id, imagenPath, updateData.Nombre || 'Imagen actualizada');
      }

      const success = await Publicacion.update(id, updateData);
      
      if (!success) {
        return res.status(404).json({ message: 'Publicación no encontrada' });
      }

      res.json({ 
        message: 'Publicación actualizada exitosamente',
        newImage: req.file ? `/uploads/publicaciones/${req.file.filename}` : null
      });
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      res.status(500).json({ message: 'Error al actualizar publicación' });
    }
  }

  // Obtener estadísticas
  static async getStats(req, res) {
    try {
      const stats = await Publicacion.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
}

export default PublicacionController; 