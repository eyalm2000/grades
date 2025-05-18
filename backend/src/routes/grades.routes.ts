import { Router } from 'express';
import { getGrades } from '../controllers/grades.controller';

const router = Router();

router.get('/', getGrades);

export default router; 