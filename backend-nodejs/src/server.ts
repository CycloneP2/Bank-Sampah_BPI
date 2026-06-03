import 'express-async-errors';
import express from 'express';
import { env } from './config/env.js';
import { corsOptions } from './middleware/cors.js';
import { setupErrorHandling } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { ApiSuccess } from './lib/response.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import nasabahRoutes from './routes/nasabahRoutes.js';
import transaksiRoutes from './routes/transaksiRoutes.js';
import sampahRoutes from './routes/sampahRoutes.js';
import beritaRoutes from './routes/beritaRoutes.js';
import notifikasiRoutes from './routes/notifikasiRoutes.js';
import penjemputanRoutes from './routes/penjemputanRoutes.js';

const app = express();

// ============================================================
// Middleware
// ============================================================
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rewrite legacy .php routes to Node.js clean routes
app.use((req, _res, next) => {
  const phpToNodeRoutes: Record<string, string> = {
    '/login.php': '/api/auth/login',
    '/register.php': '/api/auth/register',
    '/nasabah.php': '/api/nasabah',
    '/transaksi.php': '/api/transaksi',
    '/sampah.php': '/api/sampah',
    '/berita.php': '/api/berita',
    '/notifikasi.php': '/api/notifikasi',
    '/penjemputan.php': '/api/penjemputan',
    '/stats.php': '/api/transaksi/stats',
    
    '/api/login.php': '/api/auth/login',
    '/api/register.php': '/api/auth/register',
    '/api/nasabah.php': '/api/nasabah',
    '/api/transaksi.php': '/api/transaksi',
    '/api/sampah.php': '/api/sampah',
    '/api/berita.php': '/api/berita',
    '/api/notifikasi.php': '/api/notifikasi',
    '/api/penjemputan.php': '/api/penjemputan',
    '/api/stats.php': '/api/transaksi/stats'
  };

  const path = req.path;
  if (phpToNodeRoutes[path]) {
    logger.debug(`Rewriting legacy PHP route: ${path} -> ${phpToNodeRoutes[path]}`);
    req.url = phpToNodeRoutes[path] + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  }
  next();
});


// Request logging middleware
app.use((_req, _res, next) => {
  logger.debug(`${_req.method} ${_req.path}`, {
    query: _req.query,
    body: _req.body,
  });
  next();
});

// ============================================================
// Health Check Route
// ============================================================
app.get('/health', (_req, res) => {
  ApiSuccess.send(res, { status: 'OK' }, 'Server is running', 200);
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/nasabah', nasabahRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/sampah', sampahRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/penjemputan', penjemputanRoutes);

// ============================================================
// Error Handling (Must be last)
// ============================================================
setupErrorHandling(app);

// ============================================================
// Start Server (Only for local development)
// ============================================================
if (process.env.NODE_ENV !== 'production') {
  const port = env.PORT;
  app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.debug('CORS Origins:', { origins: env.CORS_ORIGIN });
  });
}

export default app;
