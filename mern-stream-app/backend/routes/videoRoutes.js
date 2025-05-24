import { Router } from 'express';
import { createUpload, listVideos, getPlaybackToken } from '../controllers/videoController.js';

const router = Router();
router.post('/create-upload', createUpload);
router.get('/', listVideos);
router.post('/:uid/token', getPlaybackToken); // optional
export default router;