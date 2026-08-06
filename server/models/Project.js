import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema({ value: String, label: String }, { _id: false });

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: String,
    role: String,
    client: String,
    year: String,
    version: String,
    tags: [String],
    metrics: [MetricSchema],
    coverImage: String,
    body: String,
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
