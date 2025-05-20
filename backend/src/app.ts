import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import gradesRoutes from './routes/grades.routes';
import imageRoutes from './routes/image.routes';

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://kzmh4amtyumexoymkvaw.lite.vusercontent.net',
      'https://kzmo3u9fbndryo6wvjn4.lite.vusercontent.net',
      'http://localhost:3000', 
      'http://localhost:5173'
    ];
    
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from origin:', origin);
      // For debugging, allow all origins temporarily
      callback(null, true);
      // callback(null, false);
    }
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

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app;