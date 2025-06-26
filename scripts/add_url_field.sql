-- Script para agregar campo URL_Enlace a la tabla Publicaciones
-- Este campo permitirá almacenar URLs directamente sin depender de la tabla enlace

USE senaunity;

-- Agregar campo URL_Enlace a la tabla Publicaciones
ALTER TABLE Publicaciones 
ADD COLUMN URL_Enlace VARCHAR(500) NULL 
AFTER Ubicacion;

-- Verificar que el campo se agregó correctamente
DESCRIBE Publicaciones; 