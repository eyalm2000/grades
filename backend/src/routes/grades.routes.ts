import { Router } from 'express';
import { getGrades } from '../controllers/grades.controller';

const router = Router();

router.get('/period1', (req, res) => getGrades(req, res, 1));
router.get('/period2', (req, res) => getGrades(req, res, 2));

export default router;