import { Request, Response } from 'express';
import { moeLogin } from '../services/moe.service';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const { cookies, userData, imageReq } = await moeLogin(username, password);
    (req.session as any).moeCookies = cookies;
    (req.session as any).userData = userData;
    (req.session as any).imageReq = imageReq;
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}; 