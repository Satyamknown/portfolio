import mongoose from 'mongoose';

const AccessLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    token: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    opens: { type: Number, default: 0 },
    lastOpenedAt: Date,
    // Resume links only, synced from scripts/resume-links.json on deploy.
    role: String,
    jobUrl: String,
    appliedAt: Date,
    // Which resume the link was printed on: the PM resume or the design resume.
    track: { type: String, enum: ['pm', 'design'], default: 'pm' }
  },
  { timestamps: true }
);

export default mongoose.models.AccessLink || mongoose.model('AccessLink', AccessLinkSchema);
