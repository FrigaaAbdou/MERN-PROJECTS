// src/controllers/videoController.js
import axios from 'axios';
import Video from '../models/Video.js';

/* -------------------------------------------------------------- */
/* Helper – returns full Cloudflare API URL for the current account */
/* -------------------------------------------------------------- */
const cfUrl = (path) =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}${path}`;

/* 1. Reserve a slot + get direct-upload URL */
export const createUpload = async (req, res) => {
  try {
    const { title = 'Untitled' } = req.body;

    console.log('ACCOUNT', process.env.CF_ACCOUNT_ID);           // sanity
    console.log('TOKEN  ', process.env.CF_API_TOKEN?.slice(0, 10) + '…');

    const { data } = await axios.post(
      cfUrl('/stream/direct_upload'),
      { requireSignedURLs: true, maxDurationSeconds: 7200 },
      { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } }
    );

    const { uid, uploadURL } = data.result;
    await Video.create({ uid, title, status: 'uploading' });
    res.json({ uid, uploadURL });
  } catch (err) {
    console.error('createUpload error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Cloudflare direct_upload failed' });
  }
};

/* 2. List library */
export const listVideos = async (_, res) => {
  const videos = await Video.find().sort('-createdAt');
  res.json(videos);
};

/* 3. Get signed playback token */
export const getPlaybackToken = async (req, res) => {
  try {
    const { uid } = req.params;
    const { data } = await axios.post(
      cfUrl(`/stream/${uid}/token`),
      {},
      { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` } }
    );
    res.json({ token: data.result.token });
  } catch (err) {
    console.error('token error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Token generation failed' });
  }
};

/* 4. Webhook handler */
export const handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    if (event?.type === 'video.ready') {
      await Video.updateOne(
        { uid: data.uid },
        { status: 'ready', duration: data.duration }
      );
      console.log(`Video ${data.uid} is ready`);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('webhook error:', err.message);
    res.sendStatus(500);
  }
};