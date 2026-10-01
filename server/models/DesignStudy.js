import mongoose from 'mongoose';

// Design-only case studies for /design. Lives in its own collection so the
// /work case studies (Project, `projects`) are never read or written by it.

const ImageSchema = new mongoose.Schema(
  {
    src: String,
    alt: String,
    caption: String,
    // No exported frame yet: the page shows a labelled placeholder instead of a broken image.
    placeholder: { type: Boolean, default: false }
  },
  { _id: false }
);

const ImpactSchema = new mongoose.Schema({ value: String, label: String, note: String }, { _id: false });

const SectionSchema = new mongoose.Schema(
  {
    // text | decision | matrix | gallery
    type: { type: String, default: 'text' },
    label: String,
    heading: String,
    body: String,
    // full | grid-2 | grid-3 | strip
    layout: { type: String, default: 'full' },
    images: [ImageSchema],
    // Structured content for non-prose sections, e.g. the access matrix.
    data: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const DesignStudySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    tagline: String,
    client: String,
    role: String,
    team: String,
    timeline: String,
    summary: String,
    heroImage: String,
    heroAlt: String,
    impact: [ImpactSchema],
    sections: [SectionSchema],
    tools: [String],
    version: String,
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true, collection: 'design_studies' }
);

export default mongoose.models.DesignStudy || mongoose.model('DesignStudy', DesignStudySchema);
