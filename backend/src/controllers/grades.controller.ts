import { Request, Response } from 'express';

export const getGrades = (req: Request, res: Response) => {
  try {
    if (!req.session.moeCookies) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.session.grades) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const grades = (req.session as any).grades;
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get grades' });
  }
}; 