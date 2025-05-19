import { Request, Response } from 'express';
import { moeLogin } from '../services/moe.service';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    console.error('Login attempt with missing credentials');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  console.log(`Login attempt for user: ${username}`);
  
  try {
    const { cookies, userData, imageReq, grades } = await moeLogin(username, password);
    
    if (!cookies || !userData) {
      console.error('Login failed: Invalid response from MOE service');
      return res.status(500).json({ error: 'Invalid response from authentication service' });
    }

    (req.session as any).moeCookies = cookies;
    (req.session as any).userData = userData;
    (req.session as any).imageReq = imageReq;
    (req.session as any).grades = grades;
    
    console.log(`Login successful for user: ${username}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(401).json({ error: errorMessage });
  }
}; 