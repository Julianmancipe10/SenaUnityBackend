import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Upload {
  static getUploadPath(category = '') {
    const basePath = path.join(__dirname, '..', 'uploads');
    
    if (category) {
      const categoryPath = path.join(basePath, category);
      // Crear directorio si no existe
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
      }
      return categoryPath;
    }
    
    return basePath;
  }

  static generateFileName(originalName, userId = null) {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    if (userId) {
      return `${userId}_${timestamp}_${baseName}${extension}`;
    }
    
    return `${timestamp}_${baseName}${extension}`;
  }

  static getFileUrl(filename, category = '') {
    if (category) {
      return `/uploads/${category}/${filename}`;
    }
    return `/uploads/${filename}`;
  }

  static validateFileType(filename, allowedTypes = []) {
    const extension = path.extname(filename).toLowerCase();
    return allowedTypes.length === 0 || allowedTypes.includes(extension);
  }

  static validateFileSize(size, maxSize = 5 * 1024 * 1024) { // 5MB por defecto
    return size <= maxSize;
  }

  static deleteFile(filename, category = '') {
    try {
      const filePath = path.join(this.getUploadPath(category), filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      return false;
    }
  }

  // Categorías predefinidas
  static CATEGORIES = {
    PROFILES: 'profiles',
    DOCUMENTS: 'documents', 
    IMAGES: 'images',
    TEMP: 'temp'
  };

  // Tipos de archivo permitidos por categoría
  static ALLOWED_TYPES = {
    [this.CATEGORIES.PROFILES]: ['.jpg', '.jpeg', '.png', '.gif'],
    [this.CATEGORIES.IMAGES]: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    [this.CATEGORIES.DOCUMENTS]: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
    [this.CATEGORIES.TEMP]: [] // Permite todos los tipos
  };
}

export default Upload; 