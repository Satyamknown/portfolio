import mongoose from 'mongoose';

// One row per share-link open, so the dashboard can show which page a company reached and
// keep link-preview crawlers and mail scanners apart from people. No IP, no full user agent:
// only the coarse fields below. Rows expire after 180 days; AccessLink.opens keeps the total.
const RETENTION_SECONDS = 60 * 60 * 24 * 180;

const AccessLinkEventSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'AccessLink', required: true },
    at: { type: Date, default: Date.now, expires: RETENTION_SECONDS },
    // The landing path: '/' or a validated /work/<slug>.
    to: { type: String, default: '/' },
    device: { type: String, enum: ['desktop', 'mobile', 'bot'], required: true },
    bot: { type: Boolean, default: false },
    // Opened from a browser the owner marked as theirs: logged, never counted.
    owner: { type: Boolean, default: false },
    // Two-letter code from Vercel's x-vercel-ip-country header, when present.
    country: String
  },
  { versionKey: false }
);

AccessLinkEventSchema.index({ link: 1, at: -1 });

export default mongoose.models.AccessLinkEvent ||
  mongoose.model('AccessLinkEvent', AccessLinkEventSchema, 'access_link_events');
