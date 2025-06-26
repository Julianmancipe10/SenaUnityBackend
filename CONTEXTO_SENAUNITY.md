# CONTEXTO COMPLETO - PROYECTO SENAUNITY 2024 ⚡

## 📁 ESTRUCTURA ACTUAL DEL PROYECTO

```
cursorProyect/backend/
├── SenaUnity/                 # Frontend React (Vite) - Ubicación dentro del backend
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── Login/         # Autenticación
│   │   │   ├── Register/      # Registro de usuarios
│   │   │   ├── CarrerasTecnologicas/ # Gestión de carreras
│   │   │   ├── CarrerasCortas/ # Carreras cortas
│   │   │   ├── PermissionWrapper/ # Control de permisos
│   │   │   ├── ProtectedRoute/ # Rutas protegidas
│   │   │   ├── UI/            # Componentes de interfaz
│   │   │   └── ...
│   │   ├── Pages/             # Páginas principales
│   │   │   ├── Home/          # Página de inicio
│   │   │   ├── Admin/         # Panel de administración
│   │   │   ├── EventosNoticias/ # Gestión de eventos y noticias
│   │   │   ├── Profile/       # Perfiles de usuario
│   │   │   ├── FAQ/           # Preguntas frecuentes con IA
│   │   │   ├── Horarios/      # Gestión de horarios
│   │   │   └── ...
│   │   ├── services/          # Servicios para APIs
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── Layouts/           # Layouts de la aplicación
│   │   ├── constants/         # Constantes y configuraciones
│   │   ├── assets/            # Recursos estáticos
│   │   └── styles/            # Estilos adicionales
│   ├── public/                # Archivos públicos
│   ├── dist/                  # Build de producción
│   ├── package.json           # Dependencias frontend
│   ├── vite.config.js         # Configuración de Vite
│   ├── tailwind.config.js     # Configuración de Tailwind
│   └── ...
├── controllers/               # Controladores de rutas API
├── models/                   # Modelos de base de datos
├── routes/                   # Definición de rutas API
├── middleware/               # Middlewares de seguridad
├── services/                 # Lógica de negocio y Azure OpenAI
├── config/                   # Configuraciones de DB
├── utils/                    # Utilidades y validaciones
├── uploads/                  # Archivos subidos
├── scripts/                  # Scripts de base de datos
├── server.js                 # Servidor Express principal
├── database_actualizado.sql  # Esquema actualizado de BD
├── web.config               # Configuración IIS para producción
└── package.json             # Dependencias backend
```

---

## 🔧 BACKEND - Node.js/Express/MySQL

### CONFIGURACIÓN PARA PRODUCCIÓN
- **Puerto**: 5000 (configurado en server.js)
- **Base de datos**: MySQL con esquema actualizado
- **Autenticación**: JWT + bcrypt
- **IA Integrada**: Azure OpenAI para FAQ
- **Archivos**: Multer para upload de imágenes
- **Despliegue**: Configurado para IIS con web.config

### TECNOLOGÍAS BACKEND
- **Runtime**: Node.js >=18.0.0
- **Framework**: Express.js 4.18+
- **Base de datos**: MySQL2 3.6+
- **Autenticación**: JWT + bcryptjs
- **IA**: Azure OpenAI 4.20+
- **Validación**: Password-validator
- **Logging**: Winston
- **Rate Limiting**: Express-rate-limit
- **CORS**: Configurado para desarrollo y producción

### NUEVAS FUNCIONALIDADES BACKEND
- ✅ **Sistema de Roles y Permisos**: Administrador, Instructor, Aprendiz, Funcionario
- ✅ **Panel de Administración**: Gestión completa de usuarios y permisos
- ✅ **API de Instructores**: CRUD completo con calificaciones
- ✅ **API de Publicaciones**: Eventos, noticias y carreras tecnológicas
- ✅ **FAQ con IA**: Integración con Azure OpenAI para respuestas inteligentes
- ✅ **Sistema de Validaciones**: Aprobación de usuarios y contenido
- ✅ **Upload de Archivos**: Gestión segura de imágenes y documentos

### ESTRUCTURA DE RUTAS API ACTUALIZADA
```
/api/auth/*            # Autenticación (login, registro, logout)
/api/users/*           # Gestión de usuarios y perfiles
/api/publicaciones/*   # Eventos, noticias y carreras
/api/instructores/*    # Gestión de instructores y calificaciones
/api/permissions/*     # Sistema de permisos granular
/api/faq/*            # Chat FAQ con IA Azure OpenAI
/uploads/*            # Archivos estáticos (imágenes, documentos)
```

---

## 🎨 FRONTEND - React 18/Vite/Tailwind CSS

### CONFIGURACIÓN PARA PRODUCCIÓN
- **Puerto desarrollo**: 5173 (Vite dev server)
- **Puerto producción**: Servido por Express en puerto 5000
- **Build**: Optimizado con Vite para producción
- **Proxy**: Configurado para API backend

### TECNOLOGÍAS FRONTEND ACTUALIZADAS
- **Framework**: React 18.2+ con hooks modernos
- **Bundler**: Vite 5.1+ (ultra rápido)
- **Enrutamiento**: React Router DOM v6.22+
- **Estilos**: Tailwind CSS 3.4+ con tema personalizado
- **HTTP**: Axios 1.9+ con interceptors
- **Animaciones**: Framer Motion 12.6+ y AOS 2.3+
- **UI**: Swiper 11.2+ para carruseles
- **Fuentes**: Google Fonts (Poppins)
- **Optimización**: Sharp para optimización de imágenes

### NUEVAS FUNCIONALIDADES FRONTEND
- ✅ **Sistema de Autenticación Visual**: Login/registro con validación
- ✅ **Panel de Administración Completo**: Gestión de usuarios, roles y permisos
- ✅ **Rutas Protegidas**: ProtectedRoute con verificación de permisos
- ✅ **Gestión de Carreras**: Tecnológicas y cortas con CRUD completo
- ✅ **Sistema de Calificaciones**: Modal interactivo con estrellas
- ✅ **Chat FAQ Inteligente**: Bot con IA para respuestas automáticas
- ✅ **Diseño Responsivo**: Optimizado para móvil, tablet y desktop
- ✅ **Tema SENA**: Colores oficiales y gradientes corporativos

### ESTRUCTURA DE RUTAS FRONTEND ACTUALIZADA
```
/                          # Página de inicio con hero y secciones
/LoginPage                # Inicio de sesión con validación
/register                 # Registro de usuarios
/profile                  # Perfil con edición de datos
/eventos-y-noticias       # Hub principal de contenido
/eventos                  # Lista de eventos con filtros
/noticias                 # Lista de noticias con filtros
/evento/:id              # Detalle completo de evento
/noticia/:id             # Detalle completo de noticia
/carreras-tecnologicas   # Carreras tecnológicas
/carreras-cortas         # Carreras cortas
/carrera/:id            # Detalle de carrera específica
/crear-evento           # Formulario creación evento
/crear-noticia          # Formulario creación noticia
/crear-carrera          # Formulario creación carrera
/faq                    # FAQ con chat inteligente
/horarios               # Gestión de horarios académicos
/admin                  # Panel administrativo (protegido)
/admin/validaciones     # Validación de contenido (admin only)
```

---

## 🔐 SISTEMA DE ROLES Y PERMISOS

### ROLES DEFINIDOS
```javascript
ROLES = {
  ADMINISTRADOR: 'Administrador',  // Acceso total al sistema
  INSTRUCTOR: 'Instructor',        // Gestión de formación
  APRENDIZ: 'Aprendiz',           // Acceso estudiante
  FUNCIONARIO: 'Funcionario'       // Personal administrativo
}
```

### PERMISOS GRANULARES
```javascript
PERMISOS = {
  // Publicaciones
  CREAR_EVENTO, CREAR_NOTICIA, CREAR_CARRERA,
  EDITAR_PUBLICACION, ELIMINAR_PUBLICACION, VER_PUBLICACION,
  
  // Usuarios
  CREAR_USUARIO, EDITAR_USUARIO, ELIMINAR_USUARIO, VER_USUARIO,
  
  // Administración
  ASIGNAR_ROLES, VER_ROLES,
  ASIGNAR_PERMISOS, VER_PERMISOS,
  APROBAR_USUARIOS, GESTIONAR_FORMACION, GESTIONAR_ENLACES
}
```

### COMPONENTES DE PROTECCIÓN
- **ProtectedRoute**: Verificación de autenticación y permisos
- **PermissionWrapper**: Control granular de acceso a componentes
- **AdminOnlyRoute**: Acceso exclusivo para administradores

---

## 🎯 PLANTILLAS DE PROMPTS ACTUALIZADAS

### 🔧 PARA BACKEND

#### APIs de Nuevas Funcionalidades
```
[BACKEND] Necesito crear/modificar el endpoint [DESCRIPCIÓN] en [RUTA_API]
- Controlador: /controllers/[NombreController].js
- Ruta: /routes/[nombre].js
- Modelo: /models/[Nombre].js
- Autenticación: JWT middleware
- Permisos: [PERMISO_REQUERIDO]
- Base de datos: [CONSULTA_SQL si aplica]
```

#### Integración con Azure OpenAI
```
[BACKEND] Necesito modificar/crear servicio de IA para [FUNCIÓN]
- Ubicación: /services/AzureOpenAIService.js
- Tipo: FAQ/Chat/Análisis
- Configuración: Azure credentials en .env
- Endpoint: [ENDPOINT_AZURE]
```

### 🎨 PARA FRONTEND

#### Componentes con Permisos
```
[FRONTEND] Necesito crear/modificar el componente [NOMBRE_COMPONENTE]
- Ubicación: /SenaUnity/src/components/[Categoria]/
- Props: [LISTA_PROPS]
- Permisos requeridos: [PERMISOS]
- Estado: React hooks
- Estilos: Tailwind CSS + tema SENA
- Responsivo: mobile-first design
```

#### Páginas del Panel de Administración
```
[FRONTEND] Necesito crear/modificar página admin [NOMBRE_PAGINA]
- Ruta protegida: /admin/[ruta]
- Ubicación: /SenaUnity/src/Pages/Admin/
- Permisos: [PERMISOS_ADMIN]
- Servicios: [API_ENDPOINTS]
- UI: Tablas, modales, formularios responsivos
```

---

## ⚡ CONFIGURACIÓN PARA PRODUCCIÓN

### Configuración Backend (server.js)
```javascript
// Puerto configurado para producción
const PORT = process.env.PORT || 5000;

// CORS configurado para desarrollo y producción
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://tu-dominio.com' 
        : 'http://localhost:5173',
    credentials: true
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'SenaUnity/dist')));
```

### Configuración Frontend (vite.config.js)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Backend API
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### Despliegue IIS (web.config)
```xml
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## 🎨 DISEÑO Y TEMA SENA

### Colores Corporativos
```css
:root {
  --sena-green: #4ADE80;        /* Verde principal SENA */
  --sena-green-dark: #22C55E;   /* Verde oscuro */
  --accent-green: #BFFF71;      /* Verde claro accent */
  --sena-orange: #FF7A00;       /* Naranja SENA */
  --accent-teal: #25dfc4;       /* Azul verdoso */
}
```

### Fuente Corporativa
- **Primaria**: Poppins (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900
- **Uso**: Toda la aplicación con font-family configurada

### Efectos Especiales
- **Gradientes SENA**: Degradados verdes corporativos
- **Glow Effects**: Efectos de brillo en botones
- **Backdrop Blur**: Filtros para modales
- **Animaciones**: Framer Motion para transiciones suaves

---

## 📱 RESPONSIVIDAD PROFESIONAL

### Breakpoints Configurados
```css
/* Tailwind CSS breakpoints */
sm: '640px',   /* Tablet pequeña */
md: '768px',   /* Tablet */
lg: '1024px',  /* Desktop */
xl: '1280px',  /* Desktop grande */
2xl: '1536px'  /* Desktop extra grande */

/* Breakpoint personalizado */
xs: '375px'    /* Móvil pequeño */
```

### Clases Responsivas Implementadas
- **Layout**: Grid y Flexbox responsivos
- **Tipografía**: Escalas de texto adaptativas
- **Espaciado**: Padding y margin responsivos
- **Componentes**: Cards, modales y formularios adaptativos

---

## 🔄 COMUNICACIÓN FRONTEND ↔ BACKEND

### Servicios Frontend Organizados
```javascript
// /SenaUnity/src/services/
auth.js              // Autenticación y tokens
userService.js       // Gestión de usuarios
publicaciones.js     // Eventos, noticias, carreras
instructorService.js // Gestión de instructores
calificacionService.js // Sistema de calificaciones
faqService.js        // Chat FAQ con IA
profile.js           // Perfiles de usuario
config.js            // Configuración base de APIs
```

### APIs Backend Implementadas
```javascript
// Autenticación
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/verify

// Usuarios y Perfiles
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/
POST   /api/users/
DELETE /api/users/:id

// Publicaciones
GET    /api/publicaciones/
POST   /api/publicaciones/
PUT    /api/publicaciones/:id
DELETE /api/publicaciones/:id

// Instructores
GET    /api/instructores/
POST   /api/instructores/
PUT    /api/instructores/:id
DELETE /api/instructores/:id

// FAQ con IA
POST   /api/faq/chat
GET    /api/faq/

// Permisos
GET    /api/permissions/
POST   /api/permissions/assign
```

---

## 🚀 COMANDOS DE DESARROLLO Y PRODUCCIÓN

### Desarrollo Backend
```bash
cd backend
npm install
npm run dev          # Desarrollo con nodemon
npm run start        # Producción
```

### Desarrollo Frontend
```bash
cd backend/SenaUnity
npm install
npm run dev          # Servidor de desarrollo Vite
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run optimize-images  # Optimizar imágenes
```

### Despliegue Completo
```bash
# 1. Build del frontend
cd backend/SenaUnity
npm run build

# 2. El dist/ se sirve automáticamente por Express
cd ../
npm run start
```

---

## 📋 CHECKLIST PARA PRODUCCIÓN

### ✅ Backend Preparado
- [x] Puerto configurado (5000)
- [x] CORS configurado para producción
- [x] Variables de entorno (.env) configuradas
- [x] Base de datos MySQL lista
- [x] Azure OpenAI configurado
- [x] Logs con Winston implementados
- [x] Rate limiting activado
- [x] Middleware de seguridad
- [x] web.config para IIS

### ✅ Frontend Optimizado
- [x] Build de Vite optimizado
- [x] Código minificado y chunked
- [x] Imágenes optimizadas
- [x] Fuentes cargadas eficientemente
- [x] PWA ready (si aplicable)
- [x] Responsive design validado
- [x] Cross-browser compatibility
- [x] Accesibilidad implementada

### ✅ Seguridad Implementada
- [x] Autenticación JWT segura
- [x] Validación en backend y frontend
- [x] Sanitización de inputs
- [x] Rate limiting configurado
- [x] CORS apropiado para producción
- [x] Headers de seguridad
- [x] Upload de archivos seguro

### ✅ Performance Optimizada
- [x] Lazy loading de componentes
- [x] Code splitting implementado
- [x] Imágenes optimizadas con Sharp
- [x] Cache strategies
- [x] Bundle size optimizado
- [x] Tree shaking activado

---

## 🚨 PUNTOS CRÍTICOS PARA PRODUCCIÓN

### ⚠️ Variables de Entorno (.env)
```bash
# Base de datos
DB_HOST=tu-servidor-mysql
DB_USER=tu-usuario
DB_PASSWORD=tu-password-seguro
DB_NAME=senaunity

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://tu-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=tu-api-key

# Producción
NODE_ENV=production
PORT=5000
```

### ⚠️ URLs de Producción
- Actualizar URLs en services/config.js
- Configurar CORS para dominio de producción
- Verificar certificados SSL/HTTPS

### ⚠️ Base de Datos
- Ejecutar database_actualizado.sql
- Configurar backups automáticos
- Verificar permisos de usuario DB

---

## 💡 MEJORES PRÁCTICAS IMPLEMENTADAS

### Arquitectura
- **Separación de responsabilidades**: Frontend/Backend bien separados
- **Modularidad**: Componentes y servicios reutilizables
- **Escalabilidad**: Estructura preparada para crecimiento

### Código
- **Clean Code**: Nomenclatura clara y consistente
- **Reusabilidad**: Componentes y hooks reutilizables
- **Performance**: Optimizaciones implementadas

### UX/UI
- **Mobile First**: Diseño responsivo prioritario
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Loading States**: Indicadores de carga apropiados
- **Error Handling**: Manejo elegante de errores

---

## 🎪 FLUJO DE TRABAJO PARA NUEVAS FEATURES

### 1. Backend First
1. Definir endpoint en `/routes/`
2. Crear controlador en `/controllers/`
3. Implementar modelo en `/models/` (si necesario)
4. Agregar middleware de validación
5. Probar con Postman/Thunder Client

### 2. Frontend Integration
1. Crear servicio en `/services/`
2. Implementar componente en `/components/` o página en `/Pages/`
3. Agregar rutas en `App.jsx`
4. Aplicar permisos con ProtectedRoute
5. Estilizar con Tailwind CSS + tema SENA

### 3. Testing & Deployment
1. Probar responsividad en diferentes dispositivos
2. Validar permisos y roles
3. Verificar performance
4. Build y deploy

---

## 📌 NOTAS IMPORTANTES ACTUALIZADAS

**ESTRUCTURA MONOREPO**: El frontend SenaUnity está ubicado dentro de `/backend/SenaUnity/`. Esta estructura permite un despliegue simplificado donde Express sirve tanto la API como el frontend construido.

**SISTEMA DE PERMISOS**: Implementado sistema granular de permisos que permite control fino sobre cada funcionalidad del sistema.

**IA INTEGRADA**: Azure OpenAI está completamente integrado para el sistema FAQ, proporcionando respuestas inteligentes y contextual.

**LISTO PARA PRODUCCIÓN**: El proyecto incluye todas las configuraciones necesarias para despliegue en IIS con web.config, variables de entorno, y optimizaciones de performance.

**💡 CONSEJO**: Siempre especifica `[FRONTEND]` o `[BACKEND]` al inicio de tus prompts para obtener ayuda específica y mantener la separación de responsabilidades. 