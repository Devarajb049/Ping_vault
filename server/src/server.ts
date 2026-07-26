import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import apiRouter from './routes';
import { errorHandler, apiLimiter } from './middleware/rateLimiters';
import { initSocket } from './socket/socketHandler';

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init WebSockets
initSocket(server);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', apiRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'Ping Vault Enterprise API', timestamp: new Date() });
});


// Error Handler
app.use(errorHandler);

const PORT = parseInt(ENV.PORT, 10) || 5000;
server.listen(PORT, () => {
  console.log(`[Ping Vault Server] Running on http://localhost:${PORT}`);
  console.log(`[API Endpoint] http://localhost:${PORT}/api/v1`);
});
