import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Url || mongoose.model('Url', UrlSchema);
