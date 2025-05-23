import { Request, Response } from 'express';

export const getGrades = (req: Request, res: Response, period: number) => {
  try {
    if (!req.session.moeCookies) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (period !== 1 && period !== 2) {
      return res.status(400).json({ error: 'Invalid period' });
    }
    if (period === 1) {
      if (!req.session.gradesPeriod1) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.json(req.session.gradesPeriod1);
    }
    if (period === 2) {
      if (!req.session.gradesPeriod2) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.json(req.session.gradesPeriod2);
    }
    return res.status(400).json({ error: 'Invalid period' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get grades' });
  }
}; 