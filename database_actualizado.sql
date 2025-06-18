-- MySQL Workbench Forward Engineering
-- SENAUNITY - Base de Datos Actualizada con Sistema de Permisos Completo
-- Incluye: permisos específicos para crear_evento, crear_noticia, crear_carrera

-- Desactivar verificaciones para permitir la creación de tablas
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema senaunity
-- -----------------------------------------------------

-- Eliminar schema si existe
DROP SCHEMA IF EXISTS senaunity;

-- Crear schema
CREATE SCHEMA IF NOT EXISTS senaunity DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE senaunity;

-- -----------------------------------------------------
-- Table senaunity.Usuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Usuario (
  idUsuario INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(45) NOT NULL,
  Apellido VARCHAR(45) NOT NULL,
  Correo VARCHAR(45) NOT NULL,
  Documento VARCHAR(20) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Rol ENUM('aprendiz', 'instructor', 'administrador', 'funcionario') NOT NULL DEFAULT 'aprendiz',
  Foto VARCHAR(255) NULL,
  FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
  EstadoCuenta ENUM('pendiente', 'activo', 'rechazado') DEFAULT 'activo',
  RequiereValidacion BOOLEAN DEFAULT FALSE COMMENT 'TRUE para instructor/funcionario, FALSE para aprendiz',
  ValidadoPor INT NULL COMMENT 'ID del administrador que validó la cuenta',
  FechaValidacion DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (idUsuario),
  UNIQUE INDEX Correo_UNIQUE (Correo ASC) VISIBLE,
  UNIQUE INDEX Documento_UNIQUE (Documento ASC) VISIBLE,
  INDEX idx_estado_cuenta (EstadoCuenta),
  INDEX idx_fecha_registro (FechaRegistro),
  INDEX idx_rol (Rol),
  INDEX idx_requiere_validacion (RequiereValidacion),
  CONSTRAINT fk_validado_por
    FOREIGN KEY (ValidadoPor)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Roles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Roles (
  idUsuarioRoll INT NOT NULL AUTO_INCREMENT,
  Rol VARCHAR(45) NOT NULL,
  PRIMARY KEY (idUsuarioRoll),
  UNIQUE INDEX Rol_UNIQUE (Rol ASC) VISIBLE
) ENGINE = InnoDB;

-- Insertar roles predefinidos
INSERT INTO senaunity.Roles (Rol) VALUES 
('aprendiz'),
('instructor'), 
('administrador'),
('funcionario');

-- -----------------------------------------------------
-- Table senaunity.TipoUsuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.TipoUsuario (
  idTipoUsuario INT NOT NULL AUTO_INCREMENT,
  Tipo ENUM('1','2','3','4') NOT NULL COMMENT '1=Aprendiz, 2=Instructor, 3=Administrador, 4=Funcionario',
  Usuario_idUsuario INT NOT NULL,
  Roles_idUsuarioRoll INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idTipoUsuario),
  INDEX fk_TipoUsuario_Usuario1_idx (Usuario_idUsuario ASC) VISIBLE,
  INDEX fk_TipoUsuario_Roles1_idx (Roles_idUsuarioRoll ASC) VISIBLE,
  CONSTRAINT fk_TipoUsuario_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_TipoUsuario_Roles1
    FOREIGN KEY (Roles_idUsuarioRoll)
    REFERENCES senaunity.Roles (idUsuarioRoll)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Preguntas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Preguntas (
  idPreguntas INT NOT NULL AUTO_INCREMENT,
  Pregunta VARCHAR(200) NOT NULL,
  PRIMARY KEY (idPreguntas)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Respuestas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Respuestas (
  idRespuestas INT NOT NULL AUTO_INCREMENT,
  Valor VARCHAR(45) NOT NULL,
  Respuestas VARCHAR(45) NOT NULL,
  Fecha DATE NOT NULL,
  Preguntas_idPreguntas INT NOT NULL,
  Usuario_idUsuario INT NOT NULL,
  PRIMARY KEY (idRespuestas),
  INDEX fk_Respuestas_Preguntas_idx (Preguntas_idPreguntas ASC) VISIBLE,
  INDEX fk_Respuestas_Usuario1_idx (Usuario_idUsuario ASC) VISIBLE,
  CONSTRAINT fk_Respuestas_Preguntas
    FOREIGN KEY (Preguntas_idPreguntas)
    REFERENCES senaunity.Preguntas (idPreguntas)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_Respuestas_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.permiso
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.permiso (
  ID_Permiso INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (ID_Permiso)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.UsuarioPermisos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.UsuarioPermisos (
  idUsuarioPermisos INT NOT NULL AUTO_INCREMENT,
  FechaLimite DATE NOT NULL,
  permiso_ID_Permiso INT NOT NULL,
  Usuario_idUsuario INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idUsuarioPermisos),
  INDEX fk_UsuarioPermisos_permiso1_idx (permiso_ID_Permiso ASC) VISIBLE,
  INDEX fk_UsuarioPermisos_Usuario1_idx (Usuario_idUsuario ASC) VISIBLE,
  CONSTRAINT fk_UsuarioPermisos_permiso1
    FOREIGN KEY (permiso_ID_Permiso)
    REFERENCES senaunity.permiso (ID_Permiso)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_UsuarioPermisos_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.enlace
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.enlace (
  ID_Enlace INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(255) NOT NULL,
  URL VARCHAR(255) NOT NULL,
  horario_ID_Horario INT NOT NULL,
  FechaVencimiento DATE NOT NULL,
  Estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  PRIMARY KEY (ID_Enlace)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Publicaciones
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Publicaciones (
  ID_Evento INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(255) NOT NULL,
  Descripción TEXT NOT NULL,
  Fecha DATETIME NOT NULL,
  Estado ENUM('Activo', 'Inactivo') NULL DEFAULT 'Activo',
  Responsable INT NOT NULL,
  Usuario_idUsuario INT NOT NULL,
  Ubicacion VARCHAR(255) NOT NULL,
  enlace_ID_Enlace INT NULL,
  TipoPublicacion ENUM("1", "2", "3", "4") NOT NULL COMMENT '1=Evento, 2=Noticia, 3=Curso, 4=Tecnólogo',
  FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Evento),
  INDEX fk_evento_Usuario1_idx (Usuario_idUsuario ASC) VISIBLE,
  INDEX fk_evento_enlace1_idx (enlace_ID_Enlace ASC) VISIBLE,
  CONSTRAINT fk_evento_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_evento_enlace1
    FOREIGN KEY (enlace_ID_Enlace)
    REFERENCES senaunity.enlace (ID_Enlace)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.formacion
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.formacion (
  ID_Formacion INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(255) NOT NULL,
  Descripción TEXT NOT NULL,
  FechaVencimiento DATE NOT NULL,
  Horario VARCHAR(45) NOT NULL,
  Estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  enlace_ID_Enlace INT NOT NULL,
  FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Formacion),
  INDEX fk_formacion_enlace1_idx (enlace_ID_Enlace ASC) VISIBLE,
  CONSTRAINT fk_formacion_enlace1
    FOREIGN KEY (enlace_ID_Enlace)
    REFERENCES senaunity.enlace (ID_Enlace)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.slider
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.slider (
  ID_Slider INT NOT NULL AUTO_INCREMENT,
  Imagen VARCHAR(255) NOT NULL,
  Descripción TEXT NULL DEFAULT NULL,
  evento_ID_Evento INT NOT NULL,
  Estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Slider),
  INDEX fk_slider_evento1_idx (evento_ID_Evento ASC) VISIBLE,
  CONSTRAINT fk_slider_evento1
    FOREIGN KEY (evento_ID_Evento)
    REFERENCES senaunity.Publicaciones (ID_Evento)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Sesiones
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Sesiones (
  id INT NOT NULL AUTO_INCREMENT,
  Usuario_idUsuario INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX fk_sesiones_usuario_idx (Usuario_idUsuario ASC) VISIBLE,
  CONSTRAINT fk_sesiones_usuario
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.LoginAttempts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.LoginAttempts (
  id INT NOT NULL AUTO_INCREMENT,
  ip_address VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id),
  INDEX idx_ip_email (ip_address, email)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.SolicitudesValidacion
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.SolicitudesValidacion (
  idSolicitud INT NOT NULL AUTO_INCREMENT,
  Usuario_idUsuario INT NOT NULL,
  TipoRol ENUM('instructor', 'funcionario') NOT NULL,
  FechaSolicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  Estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  Observaciones TEXT NULL,
  AdministradorValidador INT NULL,
  FechaRespuesta DATETIME NULL,
  PRIMARY KEY (idSolicitud),
  INDEX fk_solicitud_usuario_idx (Usuario_idUsuario ASC) VISIBLE,
  INDEX fk_solicitud_admin_idx (AdministradorValidador ASC) VISIBLE,
  INDEX idx_estado_solicitud (Estado),
  INDEX idx_fecha_solicitud (FechaSolicitud),
  CONSTRAINT fk_solicitud_usuario
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_solicitud_admin
    FOREIGN KEY (AdministradorValidador)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Insertar datos iniciales
-- -----------------------------------------------------

-- ✨ SISTEMA DE PERMISOS COMPLETO - ACTUALIZADO
-- Insertar permisos básicos y específicos
INSERT INTO senaunity.permiso (Nombre) VALUES 
-- Permisos básicos de publicaciones
('crear_publicacion'),
('editar_publicacion'),
('eliminar_publicacion'),
('ver_publicacion'),

-- 🎯 PERMISOS ESPECÍFICOS PARA EL SISTEMA DE GESTIÓN
('crear_evento'),      -- ✅ Crear Eventos
('crear_noticia'),     -- ✅ Crear Noticias  
('crear_carrera'),     -- ✅ Crear Carreras Tecnológicas

-- Permisos de usuarios
('crear_usuario'),
('editar_usuario'),
('eliminar_usuario'),
('ver_usuario'),

-- Permisos de roles y permisos
('asignar_roles'),
('ver_roles'),
('asignar_permisos'),
('ver_permisos'),

-- Permisos administrativos
('aprobar_usuarios'),
('gestionar_formacion'),
('gestionar_enlaces');

-- Insertar Administrador Principal
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES (
    'Administrador', 
    'Principal', 
    'admin@senaunity.com', 
    '1234567890', 
    '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', -- Contraseña: Admin2024*
    'administrador',
    'activo',
    FALSE
);

-- Obtener el ID del administrador recién insertado
SET @admin_id = LAST_INSERT_ID();

-- Obtener el ID del rol de Administrador
SELECT @admin_role_id := idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'administrador';

-- Asignar rol de Administrador
INSERT INTO senaunity.TipoUsuario (
    Usuario_idUsuario,
    Roles_idUsuarioRoll,
    Tipo
) VALUES (
    @admin_id,
    @admin_role_id,
    '3'
);

-- Asignar todos los permisos al administrador
INSERT INTO senaunity.UsuarioPermisos (
    Usuario_idUsuario,
    permiso_ID_Permiso,
    FechaLimite
)
SELECT 
    @admin_id,
    ID_Permiso,
    '2099-12-31' -- Fecha límite lejana
FROM senaunity.permiso;

-- Insertar Administrador Secundario
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES (
    'Admin', 
    'Soporte', 
    'soporte@senaunity.com', 
    '0987654321', 
    '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', -- Contraseña: Admin2024*
    'administrador',
    'activo',
    FALSE
);

-- Obtener el ID del administrador secundario
SET @admin_soporte_id = LAST_INSERT_ID();

-- Asignar rol de Administrador al soporte
INSERT INTO senaunity.TipoUsuario (
    Usuario_idUsuario,
    Roles_idUsuarioRoll,
    Tipo
) VALUES (
    @admin_soporte_id,
    @admin_role_id,
    '3'
);

-- Asignar todos los permisos al administrador de soporte
INSERT INTO senaunity.UsuarioPermisos (
    Usuario_idUsuario,
    permiso_ID_Permiso,
    FechaLimite
)
SELECT 
    @admin_soporte_id,
    ID_Permiso,
    '2099-12-31' -- Fecha límite lejana
FROM senaunity.permiso;

-- 🧪 DATOS DE PRUEBA PARA EL SISTEMA DE PERMISOS
-- Insertar un instructor de prueba
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES (
    'Daniel', 
    'lozano', 
    'julia@gmail.com', 
    '1122334455', 
    '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', -- Contraseña: Admin2024*
    'funcionario',
    'activo',
    FALSE
);

-- Obtener el ID del instructor
SET @instructor_id = LAST_INSERT_ID();

-- Obtener el ID del rol de Instructor
SELECT @instructor_role_id := idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'funcionario';

-- Asignar rol de Instructor
INSERT INTO senaunity.TipoUsuario (
    Usuario_idUsuario,
    Roles_idUsuarioRoll,
    Tipo
) VALUES (
    @instructor_id,
    @instructor_role_id,
    '4'
);

-- Insertar un funcionario de prueba
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES (
    'María', 
    'García', 
    'maria.garcia@senaunity.com', 
    '5566778899', 
    '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', -- Contraseña: Admin2024*
    'instructor',
    'activo',
    FALSE
);

-- Obtener el ID del funcionario
SET @funcionario_id = LAST_INSERT_ID();

-- Obtener el ID del rol de Funcionario
SELECT @funcionario_role_id := idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'instructor';

-- Asignar rol de Funcionario
INSERT INTO senaunity.TipoUsuario (
    Usuario_idUsuario,
    Roles_idUsuarioRoll,
    Tipo
) VALUES (
    @funcionario_id,
    @funcionario_role_id,
    '2'
);

-- 📊 VERIFICACIÓN DEL SISTEMA
-- Mostrar resumen de la configuración
SELECT '🎉 SENAUNITY - Base de Datos Creada Exitosamente' as status;

SELECT 'Usuarios creados:' as info;
SELECT idUsuario, Nombre, Apellido, Correo, Rol, EstadoCuenta 
FROM senaunity.Usuario 
ORDER BY idUsuario;

SELECT 'Permisos disponibles:' as info;
SELECT ID_Permiso, Nombre 
FROM senaunity.permiso 
ORDER BY ID_Permiso;

SELECT 'Permisos del administrador:' as info;
SELECT u.Nombre, u.Apellido, p.Nombre as Permiso, up.FechaLimite
FROM senaunity.UsuarioPermisos up
JOIN senaunity.Usuario u ON up.Usuario_idUsuario = u.idUsuario
JOIN senaunity.permiso p ON up.permiso_ID_Permiso = p.ID_Permiso
WHERE u.Rol = 'administrador'
ORDER BY u.Nombre, p.Nombre;

SELECT '✅ Sistema de Permisos Listo para Usar' as status;
SELECT '👤 Login Admin: admin@senaunity.com / Admin2024*' as credentials;
SELECT '📋 Usuarios de prueba creados para testing' as testing_info;

-- Reactivar verificaciones
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS; 