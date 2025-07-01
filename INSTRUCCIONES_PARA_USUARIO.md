# 🚀 INSTRUCCIONES PARA USAR SENAUNITY CORRECTAMENTE

## ❌ **PROBLEMA IDENTIFICADO**

Estás usando el **build de producción** (`dist/`) que aún contiene las URLs antiguas. 

**Error que ves**: `localhost:5000/api/publicaciones/eventos:1 Failed to load resource: net::ERR_CONNECTION_REFUSED`

---

## ✅ **SOLUCIÓN: USA EL SERVIDOR DE DESARROLLO**

### **Paso 1: Abrir Terminal en SenaUnity**
```bash
cd SenaUnity
```

### **Paso 2: Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

### **Paso 3: Abrir el Frontend**
- **URL**: http://localhost:5173
- **NO uses**: localhost:5000 (que es el backend)
- **NO uses**: archivos del build en dist/

---

## 🔧 **EXPLICACIÓN TÉCNICA**

### **En Desarrollo (Correcto)**
- **Frontend**: `localhost:5173` (Vite dev server)
- **Backend**: `localhost:5000` (Express API)
- **Proxy**: Vite redirige `/api` → `https://senaunitybackend-production.up.railway.app`

### **Lo que sucede con el Proxy:**
```
Usuario hace: fetch('/api/publicaciones/eventos')
Vite proxy: /api → https://senaunitybackend-production.up.railway.app/api
Request real: https://senaunitybackend-production.up.railway.app/api/publicaciones/eventos
```

### **En Producción (Build)**
```bash
npm run build  # Solo cuando despliegues
```

---

## 📋 **PASOS COMPLETOS PARA USAR EL SISTEMA**

### **1. Terminal 1: Backend (Ya está funcionando)**
```bash
# El backend ya está en la nube
# URL: https://senaunitybackend-production.up.railway.app
# Estado: ✅ OPERATIVO
```

### **2. Terminal 2: Frontend**
```bash
cd backend/SenaUnity
npm run dev
```

### **3. Abrir Navegador**
- **URL**: http://localhost:5173
- **Login**: Crear cuenta o usar existente
- **Crear Evento**: ¡Ahora funcionará!

---

## 🎯 **VERIFICACIÓN QUE FUNCIONA**

### **En la Consola del Navegador verás:**
```
🔧 API Config: {
  baseUrl: "/api",
  isDev: true,
  isAuthenticated: true
}

🚀 Creando evento... { eventoData: {...}, hasImage: true }
📤 Enviando evento al backend... /api/publicaciones
✅ Evento creado exitosamente: { ... }
```

### **NO deberías ver:**
- ❌ `localhost:5000` en las URLs
- ❌ `ERR_CONNECTION_REFUSED`
- ❌ `Failed to fetch`

---

## 🔐 **VERIFICAR AUTENTICACIÓN**

### **Antes de crear eventos, asegúrate de:**

1. **Estar logueado**:
   ```javascript
   // En consola del navegador:
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
   ```

2. **Tener permisos**:
   - Usuario debe tener rol que permita crear eventos
   - Verificar en Panel Admin si es necesario

3. **Si no tienes permisos**:
   - Login como admin
   - Ir a `/admin/permissions`
   - Asignar permisos de `crear_evento` al usuario

---

## 🚀 **COMANDOS ÚTILES**

### **Desarrollo Normal**
```bash
# Terminal 1: Backend (ya ejecutándose en nube)
# No necesitas ejecutar nada

# Terminal 2: Frontend
cd backend/SenaUnity
npm run dev
# Abre: http://localhost:5173
```

### **Si necesitas Build para Producción**
```bash
npm run build
# Solo usar cuando quieras hacer deploy completo
```

### **Verificar que Backend funciona**
```bash
curl https://senaunitybackend-production.up.railway.app/health
# Debe responder: {"status":"healthy",...}
```

---

## 📞 **SOPORTE RÁPIDO**

### **Si sigue sin funcionar:**

1. **Limpiar cache del navegador**: Ctrl+Shift+R
2. **Limpiar localStorage**: 
   ```javascript
   localStorage.clear();
   ```
3. **Reiniciar servidor dev**:
   ```bash
   Ctrl+C  # Detener
   npm run dev  # Reiniciar
   ```

4. **Verificar proxy en consola**:
   - Busca mensajes que empiecen con `🔧 API Config:`
   - `baseUrl` debe ser `/api` cuando `isDev: true`

---

## ✅ **RESULTADO ESPERADO**

Una vez que uses `npm run dev` y accedas a `localhost:5173`:

- ✅ Login funcionará
- ✅ Crear eventos funcionará  
- ✅ Todas las funcionalidades operativas
- ✅ No más errores de conexión
- ✅ Proxy funcionando automáticamente

**🎉 ¡El sistema está configurado correctamente, solo necesitas usar el servidor de desarrollo!** 