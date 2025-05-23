import { Router } from "express";
import { corsService } from "../services/cors.service";
import { loadOrigins } from "../app";

const router = Router();

router.get('/cors-origins', async (req, res) => {
  try {
    const allowedOrigins = await corsService();
    res.json(allowedOrigins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CORS origins' });
  }
});

router.get('/refresh-cors', async (req, res) => {
  try {
    await loadOrigins();
    res.json({ 
      success: true, 
      message: 'CORS origins refreshed successfully',
      allowedOrigins: await corsService(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to refresh CORS origins' 
    });
  }
});

export default router;