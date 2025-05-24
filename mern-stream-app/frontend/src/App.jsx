import { useState, useRef } from "react";
import * as tus from "tus-js-client";

// Express API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uid, setUid] = useState("");
  const [step, setStep] = useState("idle"); // idle | reserving | uploading | processing | ready | error
  const [progress, setProgress] = useState(0);
  const pollingRef = useRef(null);

  /* Poll backend until CF marks video ready */
  const pollStatus = (videoUid) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/videos`);
        const videos = await res.json();
        const v = videos.find((it) => it.uid === videoUid);
        if (v?.status === "ready") {
          clearInterval(pollingRef.current);
          setStep("ready");
        }
      } catch (_) {}
    }, 4000);
  };

  /* tus-js-client uploader (uses the one-time uploadURL) */
  const uploadViaTus = (uploadURL, f) =>
    new Promise((resolve, reject) => {
      const uploader = new tus.Upload(f, {
        uploadUrl: uploadURL,             // <— SINGLE-USE URL from CF
        retryDelays: [0, 1000, 3000, 5000],
        metadata: { filename: f.name },
        onProgress: (sent, total) => setProgress(Math.floor((sent / total) * 100)),
        onSuccess: resolve,
        onError: reject,
      });
      uploader.start();
    });

  /* Main flow */
  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");
    try {
      setStep("reserving");
      const res = await fetch(`${API_URL}/api/videos/create-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const { uploadURL, uid: newUid } = await res.json();
      setUid(newUid);

      setStep("uploading");
      await uploadViaTus(uploadURL, file);

      setStep("processing");
      pollStatus(newUid);
    } catch (err) {
      console.error(err);
      setStep("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 p-8 bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-semibold">Cloudflare Stream Uploader (tus)</h1>

      {step !== "ready" && (
        <div className="w-full max-w-md space-y-4">
          <input
            type="text"
            placeholder="Video title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md p-2"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 disabled:opacity-50"
            disabled={step === "reserving" || step === "uploading"}
          >
            {step === "reserving"
              ? "Reserving…"
              : step === "uploading"
              ? `Uploading… ${progress}%`
              : step === "processing"
              ? "Processing… (polling)"
              : "Upload"}
          </button>
          {step === "error" && (
            <p className="text-red-600 text-sm">Upload failed – check console</p>
          )}
        </div>
      )}

      {step === "ready" && (
        <div className="w-full max-w-3xl">
          <h2 className="mb-4 text-lg font-medium text-center">Video ready – playback below</h2>
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={`https://watch.cloudflarestream.com/${uid}`}
              title="Cloudflare Stream Player"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}