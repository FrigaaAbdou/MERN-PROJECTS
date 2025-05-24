import React, { useState, useEffect } from 'react';
import { Video, CheckCircle, Clock, AlertCircle, Play, X, Trash2 } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import VideoUploader from './components/VideoUploader';

export default function VideoUploadApp() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE = 'http://localhost:5001';

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE}/videos`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'awaiting_upload':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready to play';
      case 'processing':
        return 'Processing...';
      case 'awaiting_upload':
        return 'Awaiting upload';
      default:
        return 'Error';
    }
  };

  // Add this function to get video thumbnail URL
  const getVideoThumbnail = (playbackId) => {
    if (!playbackId) return null;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove video from state
        setVideos(videos.filter(v => v._id !== videoId));
        // Close player if deleted video was selected
        if (selectedVideo?._id === videoId) {
          setSelectedVideo(null);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Upload Manager
          </h1>
          <p className="text-gray-600">
            Upload and manage your video content with Mux streaming
          </p>
        </div>

        {/* Upload Section */}
        <VideoUploader onUploadComplete={fetchVideos} />

        {/* Selected Video Player */}
        {selectedVideo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Play className="w-5 h-5 mr-2" />
                {selectedVideo.title}
              </h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <VideoPlayer
              playbackId={selectedVideo.muxPlaybackId}
              title={selectedVideo.title}
            />
            {selectedVideo.description && (
              <p className="mt-4 text-gray-600">{selectedVideo.description}</p>
            )}
          </div>
        )}

        {/* Videos List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Uploaded Videos ({videos.length})
          </h2>

          {videos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No videos uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {videos.map((video) => (
                <div 
                  key={video._id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Video Thumbnail */}
                    <div className="w-48 aspect-video bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {video.muxPlaybackId ? (
                        <img
                          src={getVideoThumbnail(video.muxPlaybackId)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(video.status)}
                          <h3 className="font-medium text-gray-900 ml-2">
                            {video.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDelete(video._id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {video.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {video.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{getStatusText(video.status)}</span>
                        {video.duration && (
                          <span>{Math.round(video.duration)}s</span>
                        )}
                        <span>
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Play Button */}
                      {video.status === 'ready' && video.muxPlaybackId && (
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-1.5" />
                          Play Video
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}