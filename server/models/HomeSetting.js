import mongoose from 'mongoose';

const HomeSettingSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, default: '' },
    videoPoster: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.HomeSetting || mongoose.model('HomeSetting', HomeSettingSchema);
