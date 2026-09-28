import mongoose from 'mongoose';

const AccessLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    token: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    opens: { type: Number, default: 0 },
    lastOpenedAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.AccessLink || mongoose.model('AccessLink', AccessLinkSchema);
