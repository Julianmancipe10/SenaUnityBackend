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
app.use(cors({
    origin: 'http://localhost:5173', // Permitir requests desde Vite dev server
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faq', faqRoute);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 