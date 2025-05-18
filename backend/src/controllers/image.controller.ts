import { Request, Response } from 'express';
import axios from 'axios';
import https from 'https';

export const getUserImage = async (req: Request, res: Response) => {
  try {
    const userData = (req.session as any).userData;
    if (!userData) {
      throw new Error('User data not found');
    }
    const imageReq = (req.session as any).imageReq;
    const insecureAgent = new https.Agent({ rejectUnauthorized: false });
    const clientInsecure = axios.create({
      httpsAgent: insecureAgent,
      timeout: 30000,
      headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }, 
    });

    const imageResponse = await clientInsecure.get(imageReq, {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'image/jpeg');
    imageResponse.data.pipe(res);
    
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
}; 