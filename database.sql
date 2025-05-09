-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema senaunity
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS senaunity ;

-- -----------------------------------------------------
-- Schema senaunity
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS senaunity DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE senaunity ;

-- -----------------------------------------------------
-- Table senaunity.Usuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Usuario (
  idUsuario INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(45) NOT NULL,
  Apellido VARCHAR(45) NOT NULL,
  Correo VARCHAR(45) NOT NULL,
  Documento VARCHAR(20) NOT NULL,
  Passaword VARCHAR(255) NOT NULL,
  Foto VARCHAR(45) NULL,
  PRIMARY KEY (idUsuario),
  UNIQUE INDEX Correo_UNIQUE (Correo ASC) VISIBLE,
  UNIQUE INDEX Documento_UNIQUE (Documento ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Roles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Roles (
  idUsuarioRoll INT NOT NULL AUTO_INCREMENT,
  Rol VARCHAR(45) NOT NULL,
  PRIMARY KEY (idUsuarioRoll),
  UNIQUE INDEX Rol_UNIQUE (Rol ASC) VISIBLE)
ENGINE = InnoDB;

-- Insertar roles básicos si no existen
INSERT IGNORE INTO senaunity.Roles (Rol) VALUES 
('Aprendiz'),
('Instructor'),
('Administrador'),
('Funcionario');

-- -----------------------------------------------------
-- Table senaunity.TipoUsuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.TipoUsuario (
  idTipoUsuario INT NOT NULL AUTO_INCREMENT,
  Tipo ENUM('1','2','3','4') NOT NULL COMMENT '1=Aprendiz, 2=Instructor, 3=Administrador, 4=Funcionario',
  Usuario_idUsuario INT NOT NULL,
  Roles_idUsuarioRoll INT NOT NULL,
  PRIMARY KEY (idTipoUsuario),
  CONSTRAINT fk_TipoUsuario_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_TipoUsuario_Roles1
    FOREIGN KEY (Roles_idUsuarioRoll)
    REFERENCES senaunity.Roles (idUsuarioRoll)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_TipoUsuario_Usuario1_idx ON senaunity.TipoUsuario (Usuario_idUsuario ASC) VISIBLE;
CREATE INDEX fk_TipoUsuario_Roles1_idx ON senaunity.TipoUsuario (Roles_idUsuarioRoll ASC) VISIBLE;

-- -----------------------------------------------------
-- Table senaunity.Preguntas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Preguntas (
  idPreguntas INT NOT NULL,
  Pregunta VARCHAR(200) NOT NULL,
  PRIMARY KEY (idPreguntas))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.Respuestas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.Respuestas (
  idRespuestas INT NOT NULL,
  Valor VARCHAR(45) NOT NULL,
  Respuestas VARCHAR(45) NOT NULL,
  Fecha DATE NOT NULL,
  Preguntas_idPreguntas INT NOT NULL,
  Usuario_idUsuario INT NOT NULL,
  PRIMARY KEY (idRespuestas),
  CONSTRAINT fk_Respuestas_Preguntas
    FOREIGN KEY (Preguntas_idPreguntas)
    REFERENCES senaunity.Preguntas (idPreguntas)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Respuestas_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_Respuestas_Preguntas_idx ON senaunity.Respuestas (Preguntas_idPreguntas ASC) VISIBLE;
CREATE INDEX fk_Respuestas_Usuario1_idx ON senaunity.Respuestas (Usuario_idUsuario ASC) VISIBLE;

-- -----------------------------------------------------
-- Table senaunity.permiso
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.permiso (
  ID_Permiso INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (ID_Permiso))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.UsuarioPermisos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.UsuarioPermisos (
  idUsuarioPermisos INT NOT NULL,
  FechaLimite VARCHAR(45) NOT NULL,
  permiso_ID_Permiso INT NOT NULL,
  Usuario_idUsuario INT NOT NULL,
  PRIMARY KEY (idUsuarioPermisos),
  CONSTRAINT fk_UsuarioPermisos_permiso1
    FOREIGN KEY (permiso_ID_Permiso)
    REFERENCES senaunity.permiso (ID_Permiso)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_UsuarioPermisos_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_UsuarioPermisos_permiso1_idx ON senaunity.UsuarioPermisos (permiso_ID_Permiso ASC) VISIBLE;
CREATE INDEX fk_UsuarioPermisos_Usuario1_idx ON senaunity.UsuarioPermisos (Usuario_idUsuario ASC) VISIBLE;

-- -----------------------------------------------------
-- Table senaunity.contacto
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.contacto (
  ID_Contacto INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Correo VARCHAR(100) NOT NULL,
  Teléfono VARCHAR(20) NULL DEFAULT NULL,
  Mensaje TEXT NOT NULL,
  Estado ENUM('Pendiente', 'Atendido') NULL DEFAULT 'Pendiente',
  Fecha_Envio TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_Contacto))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table senaunity.enlace
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.enlace (
  ID_Enlace INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(255) NOT NULL,
  URL VARCHAR(255) NOT NULL,
  horario_ID_Horario INT NOT NULL,
  FechaVencimiento VARCHAR(45) NOT NULL,
  PRIMARY KEY (ID_Enlace))
ENGINE = InnoDB;

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
  Ubicacion VARCHAR(45) NOT NULL,
  enlace_ID_Enlace INT NOT NULL,
  TipoPublicacion ENUM("1", "2") NOT NULL,
  PRIMARY KEY (ID_Evento),
  CONSTRAINT fk_evento_Usuario1
    FOREIGN KEY (Usuario_idUsuario)
    REFERENCES senaunity.Usuario (idUsuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_evento_enlace1
    FOREIGN KEY (enlace_ID_Enlace)
    REFERENCES senaunity.enlace (ID_Enlace)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_evento_Usuario1_idx ON senaunity.Publicaciones (Usuario_idUsuario ASC) VISIBLE;
CREATE INDEX fk_evento_enlace1_idx ON senaunity.Publicaciones (enlace_ID_Enlace ASC) VISIBLE;

-- -----------------------------------------------------
-- Table senaunity.formacion
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.formacion (
  ID_Formacion INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(255) NOT NULL,
  Descripción TEXT NOT NULL,
  FechaVencimiento VARCHAR(45) NOT NULL DEFAULT 'Activo',
  Horario VARCHAR(45) NOT NULL,
  enlace_ID_Enlace INT NOT NULL,
  PRIMARY KEY (ID_Formacion),
  CONSTRAINT fk_formacion_enlace1
    FOREIGN KEY (enlace_ID_Enlace)
    REFERENCES senaunity.enlace (ID_Enlace)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_formacion_enlace1_idx ON senaunity.formacion (enlace_ID_Enlace ASC) VISIBLE;

-- -----------------------------------------------------
-- Table senaunity.slider
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS senaunity.slider (
  ID_Slider INT NOT NULL AUTO_INCREMENT,
  Imagen VARCHAR(255) NOT NULL,
  Descripción TEXT NULL DEFAULT NULL,
  evento_ID_Evento INT NOT NULL,
  PRIMARY KEY (ID_Slider),
  CONSTRAINT fk_slider_evento1
    FOREIGN KEY (evento_ID_Evento)
    REFERENCES senaunity.Publicaciones (ID_Evento)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX fk_slider_evento1_idx ON senaunity.slider (evento_ID_Evento ASC) VISIBLE;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS; 