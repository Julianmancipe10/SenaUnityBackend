-- Script para agregar permisos específicos para el sistema de gestión
-- Basado en la estructura real de database.sql
-- Ejecutar en MySQL Workbench o línea de comandos

USE senaunity;

-- Verificar permisos actuales
SELECT 'Permisos actuales antes de la inserción:' as status;
SELECT ID_Permiso, Nombre FROM permiso ORDER BY ID_Permiso;

-- Insertar los nuevos permisos específicos (IGNORE para evitar duplicados)
INSERT IGNORE INTO permiso (Nombre) VALUES 
('crear_evento'),
('crear_noticia'),
('crear_carrera');

-- Verificar que los permisos se agregaron correctamente
SELECT 'Permisos después de la inserción:' as status;
SELECT ID_Permiso, Nombre FROM permiso ORDER BY ID_Permiso;

-- Verificar la estructura de UsuarioPermisos para asegurar compatibilidad
SELECT 'Estructura de la tabla UsuarioPermisos:' as status;
DESCRIBE UsuarioPermisos;

-- Verificar usuarios elegibles (instructores y funcionarios)
SELECT 'Usuarios elegibles para recibir permisos:' as status;
SELECT idUsuario, Nombre, Apellido, Correo, Rol, EstadoCuenta 
FROM Usuario 
WHERE Rol IN ('instructor', 'funcionario') 
ORDER BY Rol, Nombre;

-- Verificar permisos ya asignados
SELECT 'Permisos actualmente asignados a instructores/funcionarios:' as status;
SELECT u.Nombre as usuario, u.Apellido, p.Nombre as permiso, up.FechaLimite
FROM UsuarioPermisos up
JOIN Usuario u ON up.Usuario_idUsuario = u.idUsuario
JOIN permiso p ON up.permiso_ID_Permiso = p.ID_Permiso
WHERE u.Rol IN ('instructor', 'funcionario')
AND up.FechaLimite > CURDATE()
ORDER BY u.Nombre, p.Nombre;

-- Mensaje final
SELECT 'Script completado exitosamente' as status; 