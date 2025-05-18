import { Request, Response } from 'express';

export const getUserInfo = (req: Request, res: Response) => {
  try {
    const userData = (req.session as any).userData;
    if (!userData) {
      throw new Error('User data not found');
    }
    res.json(userData);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  } 
}; 