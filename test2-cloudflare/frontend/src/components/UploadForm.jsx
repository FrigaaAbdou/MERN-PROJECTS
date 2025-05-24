import { useState, useRef } from "react";
import { createUpload }   from "../api";
import * as tus           from "tus-js-client";

export default function UploadForm({ onUploadStart }) {
  const [busy,      setBusy]      = useState(false);
  const [progress,  setProgress]  = useState(0);
  const fileInputRef              = useRef(null);

  async function handleSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    setBusy(true);
    setProgress(0);

    try {
      // 1️⃣ ask backend for a direct-upload URL
      const { uploadURL, cfUid } = await createUpload(file.name);

      // 2️⃣ push the file via tus
      const upload = new tus.Upload(file, {
        endpoint:   uploadURL,
        chunkSize:  10 * 1024 * 1024,       // 10 MB
        retryDelays:[0, 1000, 3000],
        onProgress: (sent, total) => setProgress(Math.round(sent / total * 100)),
        onSuccess: () => {
          setBusy(false);
          setProgress(100);
          onUploadStart?.(cfUid);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: err => {
          console.error(err);
          alert("Upload failed");
          setBusy(false);
        }
      });

      upload.start();
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor="videoFile">Select a video file: </label>
      <input
        id="videoFile"
        type="file"
        accept="video/*"
        disabled={busy}
        onChange={handleSelect}
        ref={fileInputRef}
      />
      {busy && <div>Uploading… {progress}%</div>}
    </div>
  );
}