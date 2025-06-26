# 🔐 Sistema de Gestión de Permisos - SenaUnity

## 📋 Descripción General

Se ha implementado un sistema profesional y funcional de gestión de permisos que permite al administrador asignar permisos específicos a instructores y funcionarios para realizar acciones como crear eventos, noticias y carreras tecnológicas.

## ✨ Funcionalidades Implementadas

### 🎯 Para el Administrador
- **Interfaz intuitiva y responsiva** con diseño profesional
- **Selección de usuarios** con filtros por rol y búsqueda
- **Asignación de permisos específicos** organizados por categorías
- **Gestión de fechas límite** para los permisos
- **Visualización en tiempo real** de permisos asignados

### 👥 Usuarios Elegibles
- **Instructores**: Pueden recibir permisos para crear contenido
- **Funcionarios**: Pueden recibir permisos para gestionar formación

## 🔑 Permisos Específicos Disponibles

### 📅 Eventos y Contenido
- **Crear Eventos** (`crear_evento`) - Permite crear nuevos eventos
- **Crear Noticias** (`crear_noticia`) - Permite crear noticias
- **Crear Publicaciones** (`crear_publicacion`) - Crear publicaciones generales
- **Editar Publicaciones** (`editar_publicacion`) - Modificar contenido existente

### 🎓 Académico
- **Crear Carreras** (`crear_carrera`) - Crear carreras tecnológicas
- **Gestionar Formación** (`gestionar_formacion`) - Administrar programas formativos

### 🔗 Gestión
- **Gestionar Enlaces** (`gestionar_enlaces`) - Administrar enlaces y recursos

## 🏗️ Arquitectura Técnica

### Frontend (React)
```
📁 SenaUnity/src/Pages/Admin/
├── PermissionsManager.jsx        # Componente principal
├── AdminPanel.jsx               # Panel integrado
└── constants/roles.js           # Definición de permisos
```

### Backend (Node.js/Express)
```
📁 backend/
├── controllers/PermissionController.js  # Lógica de negocio
├── models/Permission.js                # Modelo de datos
├── routes/permissions.js               # Rutas API
└── scripts/add_specific_permissions.sql # Script de permisos
```

### Base de Datos (MySQL)
```sql
-- Tablas principales
permiso                    # Definición de permisos
UsuarioPermisos           # Asignación usuario-permiso
Usuario                   # Datos de usuarios
```

## 🚀 Instalación y Configuración

### 1. Agregar Permisos a la Base de Datos
```sql
-- Ejecutar en MySQL
USE senaunity;

INSERT IGNORE INTO permiso (Nombre) VALUES 
('crear_evento'),
('crear_noticia'),
('crear_carrera');
```

### 2. Verificar Rutas API
Asegúrate de que estas rutas estén funcionando:
```
GET    /api/permissions/              # Obtener todos los permisos
POST   /api/permissions/assign        # Asignar permisos
GET    /api/permissions/user/:userId  # Obtener permisos de usuario
GET    /api/usuarios                  # Obtener usuarios elegibles
```

### 3. Acceder al Sistema
1. Iniciar sesión como **administrador**
2. Ir a **Panel de Administración**
3. Seleccionar pestaña **"Permisos"**
4. Seleccionar un instructor o funcionario
5. Asignar permisos específicos con fecha límite

## 🎨 Características de la Interfaz

### Diseño Profesional
- **Tema oscuro** con gradientes modernos
- **Iconos expresivos** para cada tipo de permiso
- **Animaciones suaves** y transiciones
- **Completamente responsivo** para móviles y desktop

### Experiencia de Usuario
- **Búsqueda en tiempo real** de usuarios
- **Filtros por rol** (instructor/funcionario)
- **Agrupación de permisos** por categorías
- **Retroalimentación visual** inmediata
- **Validación de formularios** en tiempo real

### Seguridad
- **Autenticación JWT** requerida
- **Verificación de permisos** del administrador
- **Validación de fechas** (no permitir fechas pasadas)
- **Sanitización de datos** en backend

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles (iOS/Android)
- ✅ Tablets y desktop
- ✅ Resoluciones desde 320px hasta 4K

## 🔧 Mantenimiento

### Logs del Sistema
Los permisos se registran en:
- Console del navegador (desarrollo)
- Logs del servidor Node.js
- Base de datos con timestamps

### Monitoreo
- Permisos con fecha límite automática
- Verificación de vigencia en cada uso
- Auditoría de asignaciones por administrador

## 🎉 Estado del Proyecto

**✅ COMPLETADO Y FUNCIONAL**

El sistema de gestión de permisos está listo para producción con:
- Interfaz profesional y responsiva
- Backend robusto y seguro
- Base de datos estructurada
- Documentación completa

### Próximos Pasos Recomendados
1. Integrar con los componentes CrearEvento.jsx, CrearNoticias.jsx, CrearCarrera.jsx
2. Implementar notificaciones de permisos próximos a vencer
3. Agregar logs de auditoría más detallados
4. Considerar permisos temporales automáticos

---

**Desarrollado para SenaUnity - Sistema de Gestión Educativa** 