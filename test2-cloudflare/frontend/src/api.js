import axios from "axios";

const API_BASE = "http://localhost:5001";   // change if your backend lives elsewhere

const api = axios.create({ baseURL: API_BASE });

export const createUpload = (title) =>
  api.post("/upload", { title }).then(r => r.data);

export const listVideos = () =>
  api.get("/videos").then(r => r.data);