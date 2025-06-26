import multer from 'multer';
import Upload from '../models/Upload.js';

// Configuración de storage dinámico
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Para perfiles, usar directamente 'profiles'
    if (file.fieldname === 'profileImage') {
      const uploadPath = Upload.getUploadPath('profiles');
      cb(null, uploadPath);
    } else {
      const category = req.body.category || req.params.category || '';
      const uploadPath = Upload.getUploadPath(category);
      cb(null, uploadPath);
    }
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || null;
    const filename = Upload.generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Para perfiles, usar tipos de perfiles
  if (file.fieldname === 'profileImage') {
    const allowedTypes = Upload.ALLOWED_TYPES['profiles'] || [];
    const isValidType = Upload.validateFileType(file.originalname, allowedTypes);
    
    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido para perfil. Tipos permitidos: ${allowedTypes.join(', ')}`), false);
    }
  } else {
    const category = req.body.category || req.params.category || '';
    const allowedTypes = Upload.ALLOWED_TYPES[category] || [];
    
    const isValidType = Upload.validateFileType(file.originalname, allowedTypes);
    
    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido para la categoría ${category}. Tipos permitidos: ${allowedTypes.join(', ')}`), false);
    }
  }
};

// Configuración base de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // máximo 5 archivos por request
  }
});

// Middleware para diferentes tipos de upload
export const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

export const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Middleware específico para perfiles
export const uploadProfile = upload.single('profileImage');

// Middleware específico para documentos
export const uploadDocument = upload.single('document');

// Middleware para manejar errores de multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Archivo demasiado grande',
        message: 'El archivo no puede exceder 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Demasiados archivos',
        message: 'No puedes subir más de 5 archivos a la vez'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Campo de archivo inesperado',
        message: 'Nombre de campo no esperado'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ 
      error: 'Tipo de archivo no permitido',
      message: error.message
    });
  }
  
  next(error);
}; 