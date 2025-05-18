import { Router } from 'express';
import { getUserImage } from '../controllers/image.controller';

const router = Router();

router.get('/', getUserImage);

export default router; 