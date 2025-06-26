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
  URL_Enlace VARCHAR(500) NULL,
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
-- Table senaunity.PerfilInstructor
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.PerfilInstructor (
  idPerfil INT NOT NULL AUTO_INCREMENT,
  Usuario_idUsuario INT NOT NULL,
  Especialidad VARCHAR(255) NULL,
  Experiencia TEXT NULL,
  Cursos JSON NULL COMMENT 'Array JSON de cursos que enseña',
  Biografia TEXT NULL,
  FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idPerfil),
  UNIQUE INDEX Usuario_idUsuario_UNIQUE (Usuario_idUsuario ASC) VISIBLE,
  CONSTRAINT fk_perfil_instructor_usuario
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.CalificacionInstructor
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.CalificacionInstructor (
  idCalificacion INT NOT NULL AUTO_INCREMENT,
  Instructor_idUsuario INT NOT NULL,
  Estudiante_idUsuario INT NOT NULL,
  Calificacion DECIMAL(2,1) NOT NULL CHECK (Calificacion >= 1 AND Calificacion <= 5),
  Comentario TEXT NULL,
  FechaCalificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  EstadoCalificacion ENUM('activa', 'reportada', 'eliminada') DEFAULT 'activa',
  PRIMARY KEY (idCalificacion),
  INDEX fk_calificacion_instructor_idx (Instructor_idUsuario ASC) VISIBLE,
  INDEX fk_calificacion_estudiante_idx (Estudiante_idUsuario ASC) VISIBLE,
  INDEX idx_fecha_calificacion (FechaCalificacion),
  UNIQUE INDEX unique_calificacion_per_student (Instructor_idUsuario, Estudiante_idUsuario) VISIBLE,
  CONSTRAINT fk_calificacion_instructor
    FOREIGN KEY (Instructor_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_calificacion_estudiante
    FOREIGN KEY (Estudiante_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE CASCADE
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

-- 📝 INSERTAR PERFILES DE INSTRUCTORES Y FUNCIONARIOS
-- Perfil para Daniel Lozano (funcionario)
INSERT INTO senaunity.PerfilInstructor (
    Usuario_idUsuario,
    Especialidad,
    Experiencia,
    Cursos,
    Biografia
) VALUES (
    @instructor_id,
    'Gestión de Proyectos y Metodologías Ágiles',
    '8 años de experiencia en gestión de proyectos tecnológicos y 4 años como funcionario en el SENA',
    JSON_ARRAY('Gestión de Proyectos', 'Metodologías Ágiles', 'Scrum Master', 'Liderazgo de Equipos'),
    'Funcionario especializado en la gestión de proyectos tecnológicos con amplia experiencia en metodologías ágiles. Comprometido con la formación integral de los aprendices.'
);

-- Perfil para María García (instructor)
INSERT INTO senaunity.PerfilInstructor (
    Usuario_idUsuario,
    Especialidad,
    Experiencia,
    Cursos,
    Biografia
) VALUES (
    @funcionario_id,
    'Desarrollo de Software y Programación',
    '10 años en desarrollo de software y 6 años como instructora',
    JSON_ARRAY('Node.js', 'Python', 'Bases de Datos', 'Desarrollo Web', 'JavaScript'),
    'Instructora especializada en desarrollo de software con enfoque en tecnologías web modernas. Apasionada por enseñar programación a las nuevas generaciones.'
);

-- Insertar más instructores de prueba para tener variedad
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES 
('Carlos', 'Rodríguez', 'carlos.rodriguez@senaunity.com', '1111222233', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'instructor', 'activo', FALSE),
('Ana María', 'López', 'ana.lopez@senaunity.com', '2222333344', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'instructor', 'activo', FALSE),
('Juan Pablo', 'Martínez', 'juan.martinez@senaunity.com', '3333444455', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'funcionario', 'activo', FALSE),
('Laura', 'Gómez', 'laura.gomez@senaunity.com', '4444555566', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'instructor', 'activo', FALSE);

-- Obtener IDs de los nuevos usuarios
SET @carlos_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'carlos.rodriguez@senaunity.com');
SET @ana_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'ana.lopez@senaunity.com');
SET @juan_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'juan.martinez@senaunity.com');
SET @laura_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'laura.gomez@senaunity.com');

-- Asignar roles a los nuevos usuarios
INSERT INTO senaunity.TipoUsuario (Usuario_idUsuario, Roles_idUsuarioRoll, Tipo) VALUES 
(@carlos_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'instructor'), '2'),
(@ana_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'instructor'), '2'),
(@juan_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'funcionario'), '4'),
(@laura_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'instructor'), '2');

-- Crear perfiles para los nuevos instructores
INSERT INTO senaunity.PerfilInstructor (Usuario_idUsuario, Especialidad, Experiencia, Cursos, Biografia) VALUES 
(@carlos_id, 'Desarrollo Web Frontend', '8 años de experiencia en desarrollo web y 5 años como instructor', JSON_ARRAY('React JS', 'JavaScript Avanzado', 'HTML5 y CSS3', 'Vue.js'), 'Instructor especializado en tecnologías frontend modernas con amplia experiencia en frameworks JavaScript.'),
(@ana_id, 'Desarrollo Backend', '10 años en desarrollo de software y 6 años como instructora', JSON_ARRAY('Node.js', 'Python', 'Bases de Datos', 'APIs REST'), 'Instructora experta en desarrollo backend con enfoque en arquitecturas escalables y buenas prácticas.'),
(@juan_id, 'Diseño UX/UI', '7 años en diseño de interfaces y 4 años como funcionario', JSON_ARRAY('Diseño de Interfaces', 'Figma Avanzado', 'Principios de UX', 'Prototipado'), 'Funcionario especializado en experiencia de usuario y diseño de interfaces modernas.'),
(@laura_id, 'Ciencia de Datos', '9 años en análisis de datos y 4 años como instructora', JSON_ARRAY('Machine Learning', 'Python para Data Science', 'Big Data', 'Análisis Estadístico'), 'Instructora especializada en ciencia de datos y análisis predictivo con enfoque práctico.');

-- 🎓 INSERTAR USUARIOS APRENDICES DE PRUEBA
-- Insertar aprendices para probar el sistema de calificaciones
INSERT INTO senaunity.Usuario (
    Nombre, 
    Apellido, 
    Correo, 
    Documento, 
    Password, 
    Rol,
    EstadoCuenta,
    RequiereValidacion
) VALUES 
('Santiago', 'Rodríguez', 'santiago.rodriguez@ejemplo.com', '1000123456', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'aprendiz', 'activo', FALSE),
('Valentina', 'García', 'valentina.garcia@ejemplo.com', '1000234567', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'aprendiz', 'activo', FALSE),
('Andrés', 'López', 'andres.lopez@ejemplo.com', '1000345678', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'aprendiz', 'activo', FALSE),
('Camila', 'Martínez', 'camila.martinez@ejemplo.com', '1000456789', '$2b$10$aVNrhWC9O5ka9HMdosjCcOGpfV9LQZmHpSm8nfdC7Tgt1Zc3qGZke', 'aprendiz', 'activo', FALSE);

-- Obtener IDs de los aprendices
SET @santiago_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'santiago.rodriguez@ejemplo.com');
SET @valentina_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'valentina.garcia@ejemplo.com');
SET @andres_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'andres.lopez@ejemplo.com');
SET @camila_id = (SELECT idUsuario FROM senaunity.Usuario WHERE Correo = 'camila.martinez@ejemplo.com');

-- Asignar roles de aprendiz
INSERT INTO senaunity.TipoUsuario (Usuario_idUsuario, Roles_idUsuarioRoll, Tipo) VALUES 
(@santiago_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'aprendiz'), '1'),
(@valentina_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'aprendiz'), '1'),
(@andres_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'aprendiz'), '1'),
(@camila_id, (SELECT idUsuarioRoll FROM senaunity.Roles WHERE Rol = 'aprendiz'), '1');

-- Insertar calificaciones de prueba (ahora con aprendices reales)
INSERT INTO senaunity.CalificacionInstructor (Instructor_idUsuario, Estudiante_idUsuario, Calificacion, Comentario) VALUES 
(@carlos_id, @santiago_id, 4.5, 'Excelente instructor, muy claro en sus explicaciones de React y JavaScript'),
(@carlos_id, @valentina_id, 5.0, 'El mejor instructor de frontend que he tenido, muy paciente'),
(@ana_id, @andres_id, 5.0, 'Increíble instructora de backend, domina Python y Node.js perfectamente'),
(@ana_id, @camila_id, 4.8, 'Muy buena enseñando bases de datos, sus ejemplos son muy claros'),
(@juan_id, @santiago_id, 4.0, 'Buen funcionario para UX/UI, me ayudó mucho con Figma'),
(@laura_id, @valentina_id, 4.5, 'Excelente instructora de ciencia de datos, muy didáctica'),
(@laura_id, @andres_id, 4.7, 'Sus clases de Machine Learning son muy completas'),
-- Calificar también a Daniel y María (los usuarios iniciales)
(@instructor_id, @santiago_id, 4.3, 'Buen funcionario para gestión de proyectos'),
(@funcionario_id, @camila_id, 4.6, 'Muy buena instructora de programación');

-- 📅 INSERTAR EVENTOS Y PUBLICACIONES DE PRUEBA
-- Insertar algunos eventos de prueba
INSERT INTO senaunity.Publicaciones (
    Nombre, 
    Descripción, 
    Fecha, 
    Ubicacion, 
    URL_Enlace, 
    TipoPublicacion, 
    Usuario_idUsuario, 
    Responsable,
    Estado
) VALUES 
('Feria de Proyectos SENA 2025', 'Exposición de los mejores proyectos desarrollados por nuestros aprendices durante el año 2024. Una oportunidad única para conocer las innovaciones tecnológicas.', '2025-03-15 09:00:00', 'Centro de Comercio y Turismo - Quindío', 'https://docs.google.com/forms/feria-proyectos-2025', '1', @admin_id, @admin_id, 'Activo'),
('Taller de Inteligencia Artificial', 'Taller práctico sobre las últimas tendencias en IA y Machine Learning. Dirigido a instructores y aprendices avanzados.', '2025-02-20 14:00:00', 'Laboratorio de Sistemas', 'https://meet.google.com/workshop-ia-sena', '1', @carlos_id, @carlos_id, 'Activo'),
('Conferencia de Ciberseguridad', 'Charla magistral sobre las amenazas actuales en ciberseguridad y cómo proteger nuestros sistemas.', '2025-02-28 10:00:00', 'Auditorio Principal', NULL, '1', @ana_id, @ana_id, 'Activo');

-- Insertar algunas noticias de prueba
INSERT INTO senaunity.Publicaciones (
    Nombre, 
    Descripción, 
    Fecha, 
    Ubicacion, 
    URL_Enlace, 
    TipoPublicacion, 
    Usuario_idUsuario, 
    Responsable,
    Estado
) VALUES 
('SENA Quindío obtiene reconocimiento nacional', 'Nuestro centro ha sido reconocido por el Ministerio de Educación por su excelencia en formación tecnológica y sus altos índices de empleabilidad.', '2025-01-15 08:00:00', 'Centro de Comercio y Turismo', 'https://www.sena.edu.co/noticias/reconocimiento-2025', '2', @admin_id, @admin_id, 'Activo'),
('Nuevos laboratorios de realidad virtual', 'Inauguramos modernas instalaciones equipadas con tecnología de punta para la formación en realidad virtual y aumentada.', '2025-01-20 09:00:00', 'Edificio de Innovación', NULL, '2', @admin_soporte_id, @admin_soporte_id, 'Activo'),
('Alianza estratégica con empresas del sector TI', 'Firmamos convenios con 15 empresas tecnológicas para garantizar prácticas profesionales y empleabilidad a nuestros egresados.', '2025-01-25 11:00:00', 'Sala de Juntas', 'https://alianzas.sena.edu.co/convenios-ti', '2', @admin_id, @admin_id, 'Activo');

-- Insertar algunas carreras técnicas y tecnológicas
INSERT INTO senaunity.Publicaciones (
    Nombre, 
    Descripción, 
    Fecha, 
    Ubicacion, 
    URL_Enlace, 
    TipoPublicacion, 
    Usuario_idUsuario, 
    Responsable,
    Estado
) VALUES 
('Técnico en Programación de Software', 'Formación integral en desarrollo de aplicaciones web y móviles. Duración: 1980 horas. Título: Técnico en Programación de Software.', '2025-12-31 23:59:59', 'Centro de Comercio y Turismo - Quindío', 'https://oferta.senasofiaplus.edu.co/programacion-software', '3', @carlos_id, @carlos_id, 'Activo'),
('Tecnólogo en Análisis y Desarrollo de Sistemas de Información', 'Programa tecnológico enfocado en el diseño y desarrollo de sistemas empresariales. Duración: 2640 horas. Título: Tecnólogo en ADSI.', '2025-12-31 23:59:59', 'Centro de Comercio y Turismo - Quindío', 'https://oferta.senasofiaplus.edu.co/adsi', '4', @ana_id, @ana_id, 'Activo'),
('Técnico en Sistemas', 'Formación en mantenimiento, configuración y soporte de sistemas informáticos. Duración: 1760 horas. Título: Técnico en Sistemas.', '2025-12-31 23:59:59', 'Centro de Comercio y Turismo - Quindío', 'https://oferta.senasofiaplus.edu.co/sistemas', '3', @laura_id, @laura_id, 'Activo');

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
SELECT '📋 Usuarios de prueba creados para testing:' as testing_info;
SELECT '🎓 Aprendices: santiago.rodriguez@ejemplo.com, valentina.garcia@ejemplo.com, andres.lopez@ejemplo.com, camila.martinez@ejemplo.com (Password: Admin2024*)' as aprendices_info;
SELECT '👨‍🏫 Instructores: maria.garcia@senaunity.com, carlos.rodriguez@senaunity.com, ana.lopez@senaunity.com, laura.gomez@senaunity.com (Password: Admin2024*)' as instructores_info;
SELECT '👔 Funcionarios: julia@gmail.com, juan.martinez@senaunity.com (Password: Admin2024*)' as funcionarios_info;

-- Reactivar verificaciones
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS; 