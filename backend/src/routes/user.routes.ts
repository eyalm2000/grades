import { Router } from 'express';
import { getUserInfo } from '../controllers/user.controller';
import { getUserImage } from '../controllers/image.controller';

const router = Router();

router.get('/info', getUserInfo);
router.get('/image', getUserImage);

export default router; 