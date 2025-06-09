# CONTEXTO COMPLETO - PROYECTO SENAUNITY

## 📁 ESTRUCTURA DEL PROYECTO

```
cursorProyect/
├── backend/                    # Servidor Node.js/Express
│   ├── SenaUnity/             # Frontend React (ubicado dentro del backend)
│   ├── controllers/           # Controladores de rutas
│   ├── models/               # Modelos de base de datos
│   ├── routes/               # Definición de rutas API
│   ├── middleware/           # Middlewares de autenticación/validación
│   ├── services/             # Lógica de negocio
│   ├── config/               # Configuraciones de DB y servidor
│   ├── utils/                # Utilidades y helpers
│   ├── uploads/              # Archivos subidos
│   ├── scripts/              # Scripts de base de datos
│   ├── server.js             # Punto de entrada del servidor
│   ├── database.sql          # Esquema de base de datos
│   └── package.json          # Dependencias del backend
└── README.md
```

---

## 🔧 BACKEND - Node.js/Express

### UBICACIÓN Y CONFIGURACIÓN
- **Directorio raíz**: `/backend/`
- **Punto de entrada**: `server.js`
- **Puerto**: 3000 (configurado en server.js)

### TECNOLOGÍAS
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de datos**: SQL (MySQL/PostgreSQL)
- **Autenticación**: JWT + bcrypt
- **Validación**: Express-validator
- **CORS**: Configurado para frontend
- **Logging**: Winston (combined.log, error.log)

### RESPONSABILIDADES DEL BACKEND
- ✅ APIs REST para CRUD de usuarios, eventos, horarios
- ✅ Autenticación y autorización de usuarios
- ✅ Gestión de roles y permisos
- ✅ Subida y gestión de archivos
- ✅ Validación de datos del servidor
- ✅ Conexión y consultas a base de datos
- ✅ Middleware de seguridad y CORS
- ✅ Logging y manejo de errores

### ESTRUCTURA DE RUTAS API
```
/api/auth/*          # Autenticación (login, registro, logout)
/api/usuarios/*      # Gestión de usuarios
/api/eventos/*       # Gestión de eventos y noticias
/api/horarios/*      # Gestión de horarios
/api/admin/*         # Panel de administración
/api/upload/*        # Subida de archivos
```

### ARCHIVOS CLAVE DEL BACKEND
- `server.js` - Configuración principal del servidor
- `database.sql` - Esquema de base de datos
- `package.json` - Dependencias del backend
- `config/` - Configuraciones de conexión DB
- `middleware/` - Autenticación y validaciones
- `controllers/` - Lógica de controladores
- `routes/` - Definición de endpoints

---

## 🎨 FRONTEND - React/Vite

### UBICACIÓN Y CONFIGURACIÓN
- **Directorio**: `/backend/SenaUnity/`
- **Puerto desarrollo**: 5173 (Vite dev server)
- **Puerto producción**: Servido por Express en puerto 3000

### TECNOLOGÍAS
- **Framework**: React 18
- **Bundler**: Vite
- **Enrutamiento**: React Router DOM v6
- **Estilos**: Tailwind CSS + PostCSS
- **HTTP**: Axios
- **Animaciones**: Framer Motion, AOS
- **Componentes**: Swiper, React PageFlip
- **Linting**: ESLint

### RESPONSABILIDADES DEL FRONTEND
- ✅ Interfaz de usuario responsive
- ✅ Enrutamiento del lado del cliente
- ✅ Gestión de estado local de componentes
- ✅ Consumo de APIs del backend
- ✅ Autenticación visual y protección de rutas
- ✅ Formularios y validación del cliente
- ✅ Experiencia de usuario (UX/UI)
- ✅ Optimización de imágenes y recursos

### ESTRUCTURA DE RUTAS FRONTEND
```
/                    # Página de inicio
/LoginPage          # Inicio de sesión
/register           # Registro
/profile            # Perfil de usuario
/eventos            # Lista de eventos/noticias
/evento/:id         # Detalle de evento
/noticia/:id        # Detalle de noticia
/faq                # Preguntas frecuentes
/horarios           # Gestión de horarios
/carreras-tecnologicas  # Información de carreras
/admin              # Panel de administración (protegido)
```

### ARCHIVOS CLAVE DEL FRONTEND
- `src/App.jsx` - Componente principal y rutas
- `src/main.jsx` - Punto de entrada React
- `package.json` - Dependencias del frontend
- `vite.config.js` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind
- `src/Pages/` - Componentes de páginas
- `src/components/` - Componentes reutilizables
- `src/services/` - Servicios para APIs

---

## 🎯 PLANTILLAS DE PROMPTS

### 🔧 PARA BACKEND

#### APIs y Endpoints
```
[BACKEND] Necesito crear/modificar el endpoint [DESCRIPCIÓN] en [RUTA_API]
- Ubicación: /controllers/ o /routes/
- Debe incluir: validación, autenticación, manejo de errores
- Base de datos: [CONSULTA_SQL si aplica]
```

#### Base de Datos
```
[BACKEND] Necesito modificar/crear la tabla [NOMBRE_TABLA] en la base de datos
- Archivo: database.sql
- Campos: [LISTA_CAMPOS]
- Relaciones: [FOREIGN_KEYS si aplica]
```

#### Autenticación/Middleware
```
[BACKEND] Necesito implementar middleware para [FUNCIÓN]
- Ubicación: /middleware/
- Tipo: autenticación/validación/CORS/logging
- Aplica a rutas: [RUTAS_ESPECIFICAS]
```

#### Servicios/Lógica de Negocio
```
[BACKEND] Necesito crear/modificar servicio para [FUNCIONALIDAD]
- Ubicación: /services/
- Interacción con: base de datos/APIs externas
- Retorna: [FORMATO_RESPUESTA]
```

### 🎨 PARA FRONTEND

#### Componentes React
```
[FRONTEND] Necesito crear/modificar el componente [NOMBRE_COMPONENTE]
- Ubicación: /SenaUnity/src/components/ o /Pages/
- Props necesarias: [LISTA_PROPS]
- Estado: [VARIABLES_ESTADO]
- Estilos: Tailwind CSS
```

#### Páginas/Rutas
```
[FRONTEND] Necesito crear/modificar la página [NOMBRE_PAGINA]
- Ruta: /[RUTA_URL]
- Ubicación: /SenaUnity/src/Pages/
- Protegida: sí/no
- Consume API: [ENDPOINT_BACKEND]
```

#### Estilos/UI
```
[FRONTEND] Necesito modificar el diseño/estilos de [COMPONENTE/PAGINA]
- Usar: Tailwind CSS
- Responsive: móvil/tablet/desktop
- Animaciones: Framer Motion/AOS si necesario
```

#### Servicios/API Calls
```
[FRONTEND] Necesito crear/modificar servicio para consumir [API_ENDPOINT]
- Ubicación: /SenaUnity/src/services/
- Método HTTP: GET/POST/PUT/DELETE
- Autenticación: JWT token si aplica
```

---

## ⚡ EJEMPLOS PRÁCTICOS

### ✅ PROMPT CORRECTO PARA BACKEND
```
[BACKEND] Necesito crear un endpoint para obtener la lista de eventos con paginación
- Ruta: GET /api/eventos
- Ubicación: /controllers/eventosController.js
- Parámetros: page, limit, categoria (opcional)
- Respuesta: {eventos: [], total: number, page: number}
- Incluir autenticación JWT
```

### ✅ PROMPT CORRECTO PARA FRONTEND
```
[FRONTEND] Necesito crear una página para mostrar la lista de eventos
- Ruta: /eventos
- Ubicación: /SenaUnity/src/Pages/EventosNoticias/
- Componente: EventosList.jsx
- Consume: GET /api/eventos
- UI: Cards responsivas con Tailwind, paginación, filtros
```

### ❌ PROMPT INCORRECTO (Mezcla responsabilidades)
```
Necesito crear una página de eventos que también maneje la base de datos
❌ No especifica si es frontend o backend
❌ Mezcla UI con lógica de base de datos
❌ No especifica ubicaciones de archivos
```

---

## 🔄 COMUNICACIÓN FRONTEND ↔ BACKEND

### APIs CONSUMIDAS POR EL FRONTEND
```javascript
// Ejemplo de servicios en frontend
const API_BASE = 'http://localhost:3000/api';

// Autenticación
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout

// Usuarios
GET /api/usuarios/profile
PUT /api/usuarios/profile

// Eventos
GET /api/eventos
GET /api/eventos/:id
POST /api/eventos (admin)

// Horarios
GET /api/horarios
POST /api/horarios
```

---

## 🚫 REGLAS DE NO INTERFERENCIA

### NO mezclar responsabilidades:
- ❌ Lógica de negocio en componentes React
- ❌ Validación de datos solo en frontend
- ❌ Estilos CSS en archivos del backend
- ❌ Configuraciones de servidor en archivos de Vite

### SÍ mantener separación:
- ✅ Backend: APIs, autenticación, base de datos
- ✅ Frontend: UI, UX, enrutamiento del cliente
- ✅ Comunicación via HTTP/REST únicamente
- ✅ Validación en ambos lados (cliente y servidor)

---

## 📋 CHECKLIST DE PROMPTS

### Antes de hacer un prompt, verificar:

**Para Backend:**
- [ ] ¿Es una API/endpoint?
- [ ] ¿Involucra base de datos?
- [ ] ¿Es autenticación/middleware?
- [ ] ¿Es lógica de negocio?
- [ ] Especificar archivo de destino

**Para Frontend:**
- [ ] ¿Es un componente React?
- [ ] ¿Es una página/ruta?
- [ ] ¿Es estilo/diseño?
- [ ] ¿Consume una API?
- [ ] Especificar directorio de destino

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ NO HACER:
```
"Crear una función de login"
→ Muy vago, no especifica frontend o backend

"Modificar estilos en el servidor"
→ Los estilos van en frontend, no backend

"Agregar validación solo en React"
→ La validación debe estar en ambos lados

"Crear componente que haga consultas SQL"
→ Los componentes React no deben hacer SQL directamente
```

### ✅ SÍ HACER:
```
"[BACKEND] Crear endpoint POST /api/auth/login en /controllers/authController.js"

"[FRONTEND] Crear componente LoginForm.jsx en /SenaUnity/src/components/Login/"

"[BACKEND] Agregar validación de email en middleware de registro"

"[FRONTEND] Crear servicio authService.js para consumir APIs de autenticación"
```

---

## 📝 COMANDOS DE DESARROLLO

### Para trabajar en Backend
```bash
# Ubicarse en directorio correcto
cd backend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Revisar logs
tail -f combined.log
```

### Para trabajar en Frontend
```bash
# Ubicarse en directorio correcto
cd backend/SenaUnity

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

---

## 🎪 FLUJO DE TRABAJO RECOMENDADO

### 1. Para nuevas funcionalidades:
1. **Primero Backend**: Crear API/endpoint
2. **Luego Frontend**: Crear interfaz que consume la API
3. **Testing**: Probar integración completa

### 2. Para modificaciones:
1. **Identificar**: ¿Es problema de frontend o backend?
2. **Ubicar**: ¿Qué archivo específico modificar?
3. **Prompt**: Usar plantilla correspondiente
4. **Verificar**: Que no afecte el otro lado

---

## 🎭 ROLES Y PERMISOS

### Sistema de autenticación implementado:
- **Estudiante**: Acceso básico a eventos, horarios, perfil
- **Instructor**: Gestión de horarios y eventos
- **Administrador**: Acceso completo al panel de administración

### Rutas protegidas:
- Frontend: Componente `ProtectedRoute`
- Backend: Middleware de autenticación JWT

---

## 📌 NOTAS IMPORTANTES

**ESTRUCTURA ESPECIAL**: Este proyecto tiene el frontend ubicado DENTRO del directorio del backend (`/backend/SenaUnity/`). Es una estructura monorepo donde ambos proyectos coexisten pero mantienen sus responsabilidades separadas.

**💡 CONSEJO**: Siempre especifica `[FRONTEND]` o `[BACKEND]` al inicio de tus prompts para evitar confusiones y obtener ayuda más precisa. 