import express from 'express';
import session from 'express-session';
import './types/express-session';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import gradesRoutes from './routes/grades.routes';
import imageRoutes from './routes/image.routes';

dotenv.config();

const app = express();

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/grades', gradesRoutes);
app.use('/image', imageRoutes);

export default app; 