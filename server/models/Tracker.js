import mongoose from 'mongoose';

const TrackerSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'pm-tracker-36wk-v1' },
    state: { type: mongoose.Schema.Types.Mixed, default: () => ({ days: {}, resources: [], notes: {}, time: {} }) }
  },
  { timestamps: true }
);

export default mongoose.models.Tracker || mongoose.model('Tracker', TrackerSchema);
