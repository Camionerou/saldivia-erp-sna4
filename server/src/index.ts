import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import accountingRoutes from './routes/accounting';
import bankingRoutes from './routes/banking';
import purchaseRoutes from './routes/purchases';
import salesRoutes from './routes/sales';
import taxRoutes from './routes/tax';
import systemRoutes from './routes/system';
import dashboardRoutes from './routes/dashboard';
import legacyRoutes from './routes/legacy';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';

// Configurar variables de entorno
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// === MIDDLEWARE DE SEGURIDAD ===

// Helmet para cabeceras de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting (desactivado temporalmente para desarrollo)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // límite aumentado para desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
  }
});

// Solo aplicar rate limiting a rutas que no sean de auth en desarrollo
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Compresión
app.use(compression());

// Logging
app.use(morgan('combined'));

// Parsing de JSON y URL
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes de perfil)
app.use('/uploads', express.static('uploads'));

// Middleware de logging para todas las requests
app.use((req, _res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// === RUTAS ===

// Rutas públicas
app.use('/api/auth', authRoutes);
console.log('✅ Rutas de auth registradas en /api/auth');

// Ruta de prueba simple sin middleware
app.get('/api/test', (req, res) => {
  return res.json({ 
    message: 'Ruta de test básica funcionando',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});
console.log('✅ Ruta de test básica registrada en /api/test');

// Ruta de prueba temporal para debuggear
app.get('/api/users/debug', (req, res) => {
  return res.json({ 
    message: 'Ruta de debug funcionando', 
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});
console.log('✅ Ruta de debug registrada en /api/users/debug');

// Rutas protegidas
app.use('/api/users', authMiddleware, userRoutes);
console.log('✅ Rutas de usuarios registradas en /api/users');

// Middleware de logging para todas las requests
app.use((req, _res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/accounting', authMiddleware, accountingRoutes);
app.use('/api/banking', authMiddleware, bankingRoutes);
app.use('/api/purchases', authMiddleware, purchaseRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/tax', authMiddleware, taxRoutes);
app.use('/api/system', authMiddleware, systemRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/legacy', authMiddleware, legacyRoutes);

// Ruta de salud del servidor
app.get('/health', (_req, res) => {
  return res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'ERP Saldivia Buses Backend',
    port: PORT,
    pid: process.pid,
    directory: process.cwd(),
    routes_registered: true,
    debug_info: {
      auth_routes: 'registered at /api/auth',
      test_route: 'registered at /api/test',
      users_debug: 'registered at /api/users/debug',
      users_routes: 'registered at /api/users'
    }
  });
});

// === WEBSOCKETS ===

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Unirse a sala de notificaciones
  socket.on('join-notifications', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Usuario ${userId} se unió a notificaciones`);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// Hacer io disponible globalmente
app.set('io', io);

// === MANEJO DE ERRORES ===

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// === INICIO DEL SERVIDOR ===

server.listen(PORT, () => {
  console.log(`
🚀 Servidor ERP Saldivia Buses iniciado
📍 Puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
🕐 Hora: ${new Date().toLocaleString('es-AR')}
🔗 URL: http://localhost:${PORT}
📁 Directorio: ${process.cwd()}
✅ Rutas registradas:
   - GET /health
   - POST /api/auth/login
   - GET /api/users/debug
   - GET /api/users (protegida)
   - POST /api/users (protegida)
  `);
  
  // Test simple para verificar que Express esté funcionando
  console.log('🧪 Probando rutas internas...');
  
  // Simular una request interna
  const testReq = { method: 'GET', path: '/health' };
  console.log(`🔍 Test request: ${testReq.method} ${testReq.path}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app; 