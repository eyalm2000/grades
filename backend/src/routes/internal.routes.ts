import { Router } from "express";
import { corsService } from "../services/cors.service";

const router = Router();

router.get('/cors-origins', async (req, res) => {
  try {
    const allowedOrigins = await corsService();
    res.json(allowedOrigins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CORS origins' });
  }
});

export default router;