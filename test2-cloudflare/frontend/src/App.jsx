import React, { useState, useEffect } from "react";

const API = "http://localhost:5001";

export default function App() {
  const [videos, setVideos]     = useState([]);
  const [file, setFile]         = useState(null);
  const [title, setTitle]       = useState("");
  const [uploading, setUploading]= useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState("");

  // Fetch list on mount & after uploads
  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      const r = await fetch(`${API}/videos`);
      if (!r.ok) throw new Error("Failed to fetch videos");
      setVideos(await r.json());
    } catch (e) {
      console.error(e);
    }
  }

  function onFileSelect(e) {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ""));
    setError("");
  }

  async function startUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // 1) ask our backend for a PUT URL
      const r1 = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || file.name })
      });
      if (!r1.ok) {
        const txt = await r1.text();
        throw new Error(`Upload init failed: ${txt}`);
      }
      const { uploadUrl, videoId } = await r1.json();

      // 2) PUT the file directly to Mux’s URL
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Mux upload failed: ${xhr.statusText}`));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      // 3) refresh list
      await fetchVideos();
      setFile(null);
      setTitle("");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Mux Video Uploader</h1>

      <div style={{ margin: "1em 0", border: "1px solid #ccc", padding: 10 }}>
        <h2>New Upload</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          disabled={uploading}
          onChange={e => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="file"
          accept="video/*"
          disabled={uploading}
          onChange={onFileSelect}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          disabled={!file || uploading}
          onClick={startUpload}
          style={{ marginTop: 8 }}
        >
          {uploading ? `Uploading (${progress}%)` : "Start Upload"}
        </button>
      </div>

      <h2>Videos ({videos.length})</h2>
      {videos.map(v => (
        <div
          key={v._id}
          style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}
        >
          <strong>{v.title}</strong>
          <p>Status: {v.status}</p>
          {v.status === "ready" && v.playbackId && (
            <video
              src={`https://stream.mux.com/${v.playbackId}.m3u8`}
              controls
              width="400"
            />
          )}
        </div>
      ))}
    </div>
  );
}