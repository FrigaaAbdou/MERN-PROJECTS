const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Mux = require('@mux/mux-node');
require('dotenv').config();

const app = express();

// Initialize Mux with error handling
console.log('🔄 Initializing Mux client...');
console.log('🔑 Mux credentials status:', {
  tokenId: process.env.MUX_TOKEN_ID ? '✓ Present' : '✗ Missing',
  tokenSecret: process.env.MUX_TOKEN_SECRET ? '✓ Present' : '✗ Missing'
});

const muxClient = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);
const Video = muxClient.Video;

// Test Mux client by trying to list uploads
Video.Uploads.list()
  .then(() => {
    console.log('✅ Mux client initialized and tested successfully');
  })
  .catch(error => {
    console.error('❌ Failed to test Mux client:', error);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Video Schema
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  muxAssetId: String,
  muxPlaybackId: String,
  muxUploadId: String,
  status: { 
    type: String, 
    enum: ['awaiting_upload', 'uploading', 'processing', 'ready', 'error'], 
    default: 'awaiting_upload' 
  },
  duration: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VideoModel = mongoose.model('Video', videoSchema);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Video Upload Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Create upload URL for direct upload to Mux
app.post('/create-upload', async (req, res) => {
  let video;
  try {
    const { title, description } = req.body;

    if (!Video?.Uploads?.create) {
      throw new Error('Mux Video.Uploads.create is not available');
    }

    console.log('📝 Creating upload for:', title);
    console.log('🔑 Using Mux credentials:', {
      tokenId: process.env.MUX_TOKEN_ID ? '✓ Present' : '✗ Missing',
      tokenSecret: process.env.MUX_TOKEN_SECRET ? '✓ Present' : '✗ Missing'
    });

    // Create video record in database
    video = new VideoModel({
      title: title || 'Untitled Video',
      description: description || '',
      status: 'awaiting_upload'
    });

    await video.save();
    console.log('💾 Video saved to database:', video._id);

    // Create direct upload URL from Mux
    console.log('🔄 Attempting to create Mux upload...');
    const upload = await Video.Uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        test: false
      },
      cors_origin: process.env.FRONTEND_URL || '*'
    });

    console.log('📦 Raw Mux upload response:', JSON.stringify(upload, null, 2));

    if (!upload || !upload.url) {
      throw new Error('Failed to get upload URL from Mux');
    }

    console.log('🔗 Mux upload created:', upload.id);

    // Store upload ID for webhook handling
    video.muxUploadId = upload.id;
    await video.save();

    res.json({
      success: true,
      message: 'Upload URL created successfully',
      data: {
        videoId: video._id,
        title: video.title,
        status: video.status,
        uploadUrl: upload.url,
        uploadId: upload.id
      }
    });

  } catch (error) {
    console.error('❌ Create upload error:', {
      error: error.message,
      stack: error.stack,
      muxState: {
        video: !!Video,
        uploads: !!Video?.Uploads,
        createMethod: !!Video?.Uploads?.create
      }
    });

    // Delete the video document if upload creation failed
    if (video && video._id) {
      try {
        await VideoModel.findByIdAndDelete(video._id);
        console.log('🗑️ Cleaned up video document due to upload creation failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup video document:', cleanupError);
      }
    }

    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create upload URL',
      details: {
        message: error.message,
        type: error.name,
        muxState: {
          video: !!Video,
          uploads: !!Video?.Uploads,
          createMethod: !!Video?.Uploads?.create
        }
      }
    });
  }
});

// Get all videos
app.get('/videos', async (req, res) => {
  try {
    const videos = await VideoModel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('❌ Get videos error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch videos' 
    });
  }
});

// Get single video
app.get('/videos/:id', async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ 
        success: false,
        error: 'Video not found' 
      });
    }

    // Get asset details from Mux if available
    if (video.muxAssetId) {
      try {
        const asset = await Video.Assets.get(video.muxAssetId);
        if (asset.duration !== video.duration || asset.status !== video.status) {
          video.duration = asset.duration;
          video.status = asset.status === 'ready' ? 'ready' : 'processing';
          await video.save();
        }
      } catch (muxError) {
        console.log('⚠️ Could not fetch Mux asset details:', muxError.message);
      }
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('❌ Get video error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch video' 
    });
  }
});

// Delete video
app.delete('/videos/:id', async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ 
        success: false,
        error: 'Video not found' 
      });
    }

    // Delete from Mux if asset exists
    if (video.muxAssetId) {
      try {
        // Delete the asset
        await Video.Assets.del(video.muxAssetId);
        console.log('🗑️ Deleted asset from Mux:', video.muxAssetId);
      } catch (muxError) {
        console.error('❌ Failed to delete asset from Mux:', muxError);
      }
    }

    // Delete the upload if it exists
    if (video.muxUploadId) {
      try {
        // Delete the upload
        await Video.Uploads.del(video.muxUploadId);
        console.log('🗑️ Deleted upload from Mux:', video.muxUploadId);
      } catch (muxError) {
        console.error('❌ Failed to delete upload from Mux:', muxError);
      }
    }

    // Delete from database
    await VideoModel.findByIdAndDelete(req.params.id);
    console.log('🗑️ Deleted from database:', req.params.id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete video error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete video',
      details: error.message
    });
  }
});

// Webhook to handle Mux events
app.post('/webhooks/mux', express.json(), async (req, res) => {
  try {
    const event = req.body;
    console.log('📡 Mux webhook received:', {
      type: event.type,
      environment: event.environment,
      assetId: event.data?.id,
      assetState: event.data?.status,
      uploadId: event.data?.upload_id
    });

    // Handle asset creation from upload
    if (event.type === 'video.asset.created') {
      const uploadId = event.data.upload_id;
      const assetId = event.data.id;
      
      console.log('🎥 Processing asset creation:', { uploadId, assetId });
      
      const video = await VideoModel.findOne({ muxUploadId: uploadId });
      if (!video) {
        console.error('❌ No video found for upload ID:', uploadId);
        return res.status(404).send('Video not found');
      }

      video.muxAssetId = assetId;
      video.status = 'processing';
      await video.save();
      console.log(`✅ Video ${video.title} asset created and processing`);
    }

    // Handle asset ready state
    if (event.type === 'video.asset.ready') {
      const assetId = event.data.id;
      const uploadId = event.data.upload_id;
      console.log('🎬 Processing asset ready:', { assetId, uploadId });
      
      // Try to find by asset ID first
      let video = await VideoModel.findOne({ muxAssetId: assetId });
      
      // If not found, try to find by upload ID
      if (!video && uploadId) {
        video = await VideoModel.findOne({ muxUploadId: uploadId });
      }
      
      if (!video) {
        console.error('❌ No video found for asset ID:', assetId, 'or upload ID:', uploadId);
        return res.status(404).send('Video not found');
      }
      
      video.status = 'ready';
      video.duration = event.data.duration;
      video.muxPlaybackId = event.data.playback_ids?.[0]?.id;
      await video.save();
      console.log(`🎉 Video ${video.title} is ready for streaming`);
    }

    // Handle asset errors
    if (event.type === 'video.asset.errored') {
      const assetId = event.data.id;
      const uploadId = event.data.upload_id;
      console.log('❌ Processing asset error:', { assetId, uploadId, error: event.data.errors });
      
      // Try to find by asset ID first
      let video = await VideoModel.findOne({ muxAssetId: assetId });
      
      // If not found, try to find by upload ID
      if (!video && uploadId) {
        video = await VideoModel.findOne({ muxUploadId: uploadId });
      }
      
      if (video) {
        video.status = 'error';
        await video.save();
        console.error(`❌ Video ${video.title} processing failed:`, event.data.errors);
      }
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    res.status(400).json({ 
      error: 'Webhook processing failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Global error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📹 Create upload: POST http://localhost:${PORT}/create-upload`);
  console.log(`📋 Get videos: GET http://localhost:${PORT}/videos`);
  console.log(`🎯 Webhook: POST http://localhost:${PORT}/webhooks/mux`);
});