import { Request, Response } from 'express';
import { moeLogin } from '../services/moe.service';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.error('Login attempt with missing credentials');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  console.log(`Login attempt for user: ${username}`);
  
  try {
    const { cookies, userData, imageReq, gradesPeriod1, gradesPeriod2 } = await moeLogin(username, password);
    
    if (!cookies || !userData) {
      console.error('Login failed: Invalid response from MOE service');
      return res.status(500).json({ error: 'Invalid response from authentication service' });
    }

    if (userData.isTeacher == 1) {
      console.error('Teacher account detected');
      return res.status(401).json({ error: 'Teacher account detected' });
    }

    if (userData.schoolName != "חטב ליאו בק") {
      console.error('Unsupported school');
      return res.status(401).json({ error: 'Unsupported school' });
    }

    (req.session as any).moeCookies = cookies;
    (req.session as any).userData = userData;
    (req.session as any).imageReq = imageReq;
    (req.session as any).gradesPeriod1 = gradesPeriod1;
    (req.session as any).gradesPeriod2 = gradesPeriod2;

    console.log(`Login successful for user: ${username}`);
    res.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage === 'Invalid username or password') {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', err);
      res.status(401).json({ error: errorMessage });
    } else {
      res.status(500).json('Internal server error');
    }
  }
}; 

export const logout = (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Failed to log out' });
  }
};

