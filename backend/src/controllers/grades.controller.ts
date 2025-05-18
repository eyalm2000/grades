import { Request, Response } from 'express';

export const getGrades = (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
}; 