import { Schema, model } from 'mongoose';

const videoSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    title: String,
    status: { type: String, enum: ['uploading', 'ready'], default: 'uploading' },
    duration: Number, // seconds – filled when video.ready fires
  },
  { timestamps: true }
);

export default model('Video', videoSchema);