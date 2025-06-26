import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import faqRoute from './routes/faq.js';
import permissionsRoutes from './routes/permissions.js';
import publicacionesRoutes from './routes/publicaciones.js';
import instructoresRoutes from './routes/instructores.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear directorios uploads si no existen
const uploadsDir = join(__dirname, 'uploads');
const publicacionesDir = join(__dirname, 'uploads/publicaciones');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(publicacionesDir)) {
    fs.mkdirSync(publicacionesDir, { recursive: true });
}

console.log("Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);
const app = express();
// Usar puerto por defecto si no está definido en .env
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman, healthchecks, etc.)
        if (!origin) return callback(null, true);
        
        // En desarrollo, permitir localhost
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // En producción, permitir dominios específicos
        const allowedOrigins = [
            'http://localhost:5173',
            'https://localhost:5173',
            process.env.FRONTEND_URL, // Tu dominio de frontend en producción
        ].filter(Boolean); // Filtrar valores undefined
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Permitir todos por ahora para solucionar el healthcheck
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Health check endpoint específico para Railway y otros servicios
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faq', faqRoute);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/instructores', instructoresRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Health check disponible en http://0.0.0.0:${PORT}/health`);
}); 