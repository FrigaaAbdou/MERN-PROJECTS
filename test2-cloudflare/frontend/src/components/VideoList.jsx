import { useEffect, useState } from "react";
import { listVideos } from "../api";

export default function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();                       // first load
    const id = setInterval(fetchVideos, 5000); // poll every 5 s
    return () => clearInterval(id);
  }, []);

  async function fetchVideos() {
    try {
      setVideos(await listVideos());
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      {videos.map((v, idx) => (
        <div
          key={v._id ?? v.cfUid ?? idx}
          style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "1rem" }}
        >
          <h3>{v.title || "Untitled"}</h3>
          <p>Status: {v.status}</p>

          {v.status === "ready" && (
            <iframe
              src={`https://iframe.videodelivery.net/${v.cfUid}`}
              style={{ width: "100%", aspectRatio: "16/9", border: 0 }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={v.title}
            />
          )}
        </div>
      ))}
    </div>
  );
}