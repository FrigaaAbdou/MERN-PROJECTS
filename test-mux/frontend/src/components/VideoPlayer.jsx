import React from 'react';
import MuxPlayer from '@mux/mux-player-react';

export default function VideoPlayer({ playbackId, title }) {
  if (!playbackId) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <MuxPlayer
        streamType="on-demand"
        playbackId={playbackId}
        metadata={{
          video_title: title,
          player_name: "Mux Video Player",
        }}
        autoPlay={false}
        muted={false}
        primaryColor="#0066FF"
        title={title}
        accentColor="#0066FF"
        controls
        style={{
          height: '100%',
          maxWidth: '100%',
        }}
      />
    </div>
  );
} 