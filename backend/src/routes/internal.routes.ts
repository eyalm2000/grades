import { Router } from "express";
import { corsService } from "../services/cors.service";
import router from "./auth.routes";

router.use('/refresh-cors', corsService);

export default router;