# SenaUnity Backend

Este es el backend para la aplicación SenaUnity, desarrollado con Node.js, Express y MySQL.

## 🚀 Estado del Sistema

✅ **SISTEMA FUNCIONANDO AL 100% EN PRODUCCIÓN**
- URL de Producción: https://senaunitybackend-production.up.railway.app
- Environment: Production
- Base de datos: MySQL en la nube
- IA: Azure OpenAI integrado

## 📋 Funcionalidades Verificadas

- ✅ Autenticación JWT
- ✅ Sistema de Roles y Permisos
- ✅ CRUD de Publicaciones (Eventos, Noticias, Carreras)
- ✅ Gestión de Instructores con Calificaciones
- ✅ FAQ con IA (Azure OpenAI)
- ✅ Upload de Archivos
- ✅ Panel de Administración

## 🛠️ Configuración

### Requisitos
- Node.js (v18 o superior)
- MySQL Server
- Azure OpenAI Service

### Variables de Entorno (.env)
```bash
# Base de datos
DB_HOST=tu-servidor-mysql
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=senaunity

# JWT
JWT_SECRET=tu-jwt-secret
JWT_REFRESH_SECRET=tu-refresh-secret

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=tu-endpoint
AZURE_OPENAI_KEY=tu-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=tu-deployment

# Producción
NODE_ENV=production
PORT=5000
FRONTEND_URL=tu-frontend-url
```

## 🔧 Instalación

1. Clonar el repositorio
```bash
git clone <repo-url>
cd backend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. Configurar base de datos
```bash
# Ejecutar database_actualizado.sql en MySQL
mysql -u root -p senaunity < database_actualizado.sql
```

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 🧪 Pruebas

### Ejecutar pruebas automáticas
```bash
node test-endpoints.js
```

### Endpoints de prueba
- Health Check: `/health`
- API Status: `/`
- Eventos: `/api/publicaciones/eventos`
- Noticias: `/api/publicaciones/noticias`
- Carreras: `/api/publicaciones/carreras`
- Instructores: `/api/instructores`

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── db.js                  # Configuración MySQL
├── controllers/               # Lógica de negocio
├── middleware/               # Middlewares (auth, cors, rate limiting)
├── models/                   # Modelos de datos
├── routes/                   # Definición de rutas
├── services/                 # Servicios (Azure OpenAI)
├── uploads/                  # Archivos subidos
├── scripts/                  # Scripts de BD
├── SenaUnity/               # Frontend React
├── server.js                # Servidor principal
├── test-endpoints.js        # Pruebas automáticas
└── web.config              # Configuración IIS
```

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Rate Limiting
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Upload seguro de archivos
- ✅ Headers de seguridad

## 📊 Monitoreo

### Health Check
```bash
curl https://senaunitybackend-production.up.railway.app/health
```

### Logs
- Logs de error: `error.log`
- Logs combinados: `combined.log`

## 🆘 Troubleshooting

### Error de conexión BD
```bash
# Verificar variables de entorno
echo $DB_HOST $DB_USER $DB_NAME

# Verificar conectividad
node scripts/verificar_permisos.js
```

### Error CORS
- Verificar FRONTEND_URL en .env
- Revisar configuración en server.js

### Error Azure OpenAI
```bash
# Verificar configuración
echo $AZURE_OPENAI_ENDPOINT $AZURE_OPENAI_KEY
```

## 📞 Soporte

Para reportar problemas o solicitar características:
1. Ejecutar `node test-endpoints.js`
2. Revisar logs en `combined.log`
3. Verificar variables de entorno
4. Contactar al equipo de desarrollo

---

**Estado del sistema**: ✅ OPERATIVO
**Última actualización**: Enero 2025
**Versión**: 1.0.0 