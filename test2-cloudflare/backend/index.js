// server.js
require("dotenv").config();
const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const Mux       = require("@mux/mux-node");

//  ── Configuration ─────────────────────────────
const {
  MUX_TOKEN_ID,
  MUX_TOKEN_SECRET,
  MONGODB_URI,
  PORT = 5001
} = process.env;

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET in .env");
  process.exit(1);
}
// ── Mux client ────────────────────────────────
const mux = new Mux();
const videoClient = mux.Video;

// ── MongoDB setup ─────────────────────────────
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✓ MongoDB connected"))
.catch(err => {
  console.error("MongoDB error:", err);
  process.exit(1);
});

const videoSchema = new mongoose.Schema({
  assetId:    String,
  playbackId: String,
  uploadUrl:  String,
  status:     { type: String, default: "waiting" },
  title:      String,
  createdAt:  { type: Date, default: Date.now }
});
const Video = mongoose.model("Video", videoSchema);

// ── Express setup ─────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────

/**
 * POST /upload
 * Request body: { title?: string }
 * Response: { uploadUrl: string, videoId: string }
 */
app.post("/upload", async (req, res) => {
  try {
    const { title = "Untitled" } = req.body;
    // 1) Create a Mux upload
    const { data: upload } = await videoClient.Uploads.create({
      new_asset_settings: { playback_policy: "public" },
      cors_origin: ["*"]
    });

    // 2) Persist a record
    const vid = await Video.create({
      assetId:   upload.asset_id,
      uploadUrl: upload.url,
      status:    "waiting",
      title
    });

    // 3) Return the S3-style PUT URL + our Mongo ID
    return res.json({
      uploadUrl: upload.url,
      videoId:   vid._id
    });
  } catch (err) {
    console.error("❌ /upload error:", err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /videos
 * Lists all videos with their current status & playbackId (if ready)
 */
app.get("/videos", async (_req, res, next) => {
  try {
    const vids = await Video.find().sort({ createdAt: -1 });
    // For any that have no playbackId yet, fetch from Mux
    await Promise.all(vids.map(async v => {
      if (!v.playbackId) {
        const { data: asset } = await videoClient.Assets.get(v.assetId);
        v.status = asset.status;                         // "processing" or "ready"
        if (asset.playback_ids.length) {
          v.playbackId = asset.playback_ids[0].id;
        }
        await v.save();
      }
    }));
    res.json(await Video.find().sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message });
});

// ── Start server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`→ API listening on http://localhost:${PORT}`);
});