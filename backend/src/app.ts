import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { corsService } from './services/cors.service';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import gradesRoutes from './routes/grades.routes';
import imageRoutes from './routes/image.routes';
import internalRoutes from './routes/internal.routes';

dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

let allowedOrigins: string[] = [];
export async function loadOrigins() {
  try {
    allowedOrigins = await corsService();
    console.log('CORS origins loaded:', allowedOrigins);
  } catch (err) {
    allowedOrigins = [];
    console.error('Failed to load CORS origins:', err);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    try {
      const { hostname } = new URL(origin);
      if (allowedOrigins.includes(hostname)) {
        return callback(null, true);
      }
    } catch (e) {
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not set in environment variables');
}
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true, 
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.set('trust proxy', 1);
app.get('/debug/session', (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionID: req.sessionID,
    isAuthenticated: !!(req.session as any).userData,
    cookiesHeader: req.headers.cookie
  });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/grades', gradesRoutes);
app.use('/image', imageRoutes);
app.use('/internal', internalRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app;