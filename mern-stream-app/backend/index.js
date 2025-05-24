// src/index.js  — COPY / PASTE THIS EXACT ORDER
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import videoRoutes from './routes/videoRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

const app = express();

/* 1️⃣  CORS always first */
app.use(
  cors({
    origin: 'http://localhost:5173',   //  exact string
    // no other options!
  })
);

/* 2️⃣  Core middleware */
app.use(express.json({ limit: '200mb' }));
app.use(morgan('dev'));

/* 3️⃣  API routes */
app.use('/api/videos', videoRoutes);
app.use('/api/webhooks', webhookRoutes);

/* 4️⃣  Boot */
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('DB FAIL', e);
    process.exit(1);
  });

  