# SenaUnity Backend

Este es el backend para la aplicación SenaUnity, desarrollado con Node.js, Express y MySQL.

## Requisitos

- Node.js (v14 o superior)
- MySQL Server
- MySQL Workbench

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear la base de datos:
   - Abrir MySQL Workbench
   - Ejecutar el script `database.sql`
4. Configurar las variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto
   - Agregar las siguientes variables:
     ```
     PORT=5000
     JWT_SECRET=tu_secreto_jwt
     ```

## Estructura del Proyecto

```
backend/
├── config/
│   └── db.js
├── routes/
│   ├── auth.js
│   └── users.js
├── database.sql
├── server.js
└── package.json
```

## Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario

### Usuarios

- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil del usuario

## Ejecutar el Proyecto

Para desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm start
``` 