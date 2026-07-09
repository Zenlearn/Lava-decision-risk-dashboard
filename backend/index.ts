import express from 'express';
import { config } from 'dotenv';
import path from 'path';

// Load .env BEFORE any other imports that need env vars
config({ path: path.resolve(__dirname, '.env'), override: true });

import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import logger from './src/configs/logger.config';
import { responseMiddleware } from './src/middlewares/response.middleware';
import { errorHandler } from './src/middlewares/errorHandler.middleware';
import { AuthMiddleware } from './src/middlewares/auth.middleware';

import healthRouter from './src/routes/health.routes';
import importRouter from './src/routes/import.routes';
import dashboardRouter from './src/routes/dashboard.routes';
import auditRouter from './src/routes/audit.routes';

// ─────────────────────────────────────────────────────────────────────────────
// Boot validation — fail fast if required env vars are missing
// ─────────────────────────────────────────────────────────────────────────────
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
	logger.error('CRITICAL: Missing required environment variables', {
		missing: missingEnvVars,
	});
	process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Express app setup
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const port = parseInt(process.env.PORT ?? '3010', 10);
const isDev = process.env.NODE_ENV !== 'production';

// Security headers
app.use(helmet());

// Global rate limiter — 200 req/15min/IP in production, relaxed in dev
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isDev ? 1000 : 200,
	message: { message: 'Too many requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
	skip: () => isDev,
});
app.use(globalLimiter);

// CORS — allowed origins from env (comma-separated) or localhost in dev
const rawOrigins = process.env.ALLOWED_ORIGINS ?? 'http://localhost:3011,http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				logger.warn('Blocked by CORS', { origin });
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	})
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// HTTP request logging (actor-id token extracts user from req.user for protected routes)
morgan.token('actor-id', (req) => (req as any).user?.id || '-');
app.use(morgan('actor=:actor-id :method :url :status :res[content-length] - :response-time ms'));

// Response envelope helpers (res.success / res.error)
app.use(responseMiddleware);

// Trust proxy (needed for rate-limit IP detection behind nginx/load balancer)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// Public routes (no auth required)
app.use('/api/v1/health', healthRouter);

// Protected routes — all require a valid JWT
const protectedRouter = express.Router();
protectedRouter.use(AuthMiddleware.authMiddleware);
protectedRouter.use('/imports', importRouter);
protectedRouter.use('/dashboard', dashboardRouter);
protectedRouter.use('/audit', auditRouter);

app.use('/api/v1', protectedRouter);

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ message: 'Not found' });
});

// Global error handler — must be LAST
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Server startup
// ─────────────────────────────────────────────────────────────────────────────
const server = app.listen(port, () => {
	logger.info('Lava Decision Risk API started', {
		port,
		env: process.env.NODE_ENV ?? 'development',
		phase: 0,
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────────────────────────────────────────
function gracefulShutdown(signal: string) {
	logger.info(`${signal} received — shutting down gracefully`);
	server.close(() => {
		logger.info('HTTP server closed');
		process.exit(0);
	});

	// Force exit after 10s if connections hang
	setTimeout(() => {
		logger.warn('Forcing shutdown after timeout');
		process.exit(1);
	}, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
