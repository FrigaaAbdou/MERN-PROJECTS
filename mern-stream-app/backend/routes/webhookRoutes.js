import { Router } from 'express';
import { handleWebhook } from '../controllers/videoController.js';

const router = Router();
router.post('/cloudflare', handleWebhook); // set this URL in CF dashboard
export default router;