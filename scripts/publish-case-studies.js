// Runs after `vite build` on Vercel production builds, where MONGODB_URI exists. Pushes the case
// studies in scripts/case-studies/ into the CMS without touching anything else.
//
// - Only writes a project when the stored `version` differs from the file's, so
//   edits made later in /admin survive redeploys until the file's version bumps.
// - Before overwriting, copies the old document into `project_backups`.
// - Never fails the build: a DB problem is logged and the deploy continues.
import 'dotenv/config';
import mongoose from 'mongoose';
import Project from '../server/models/Project.js';
import pcc from './case-studies/pacific-coast-contracting.js';
import stratalite from './case-studies/stratalite.js';
import skooltag from './case-studies/skooltag.js';

const caseStudies = [pcc, stratalite, skooltag];

// Placeholder projects with invented clients and metrics. Hidden, not deleted,
// so they can be restored from /admin if ever needed.
const hideSlugs = ['evergreen-onboarding', 'lumen-stats', 'citrus-platform'];

if (!process.env.MONGODB_URI) {
  console.log('[publish-case-studies] MONGODB_URI not set, skipping.');
  process.exit(0);
}
// Preview builds share the production database, so only production builds
// publish. Otherwise a PR preview would put new copy live before its images ship.
if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
  console.log(`[publish-case-studies] ${process.env.VERCEL_ENV} build, skipping.`);
  process.exit(0);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const backups = mongoose.connection.collection('project_backups');

  for (const cs of caseStudies) {
    const existing = await Project.findOne({ slug: cs.slug }).lean();
    if (existing && existing.version === cs.version) {
      console.log(`[publish-case-studies] kept    ${cs.slug} (${cs.version} already live)`);
      continue;
    }
    if (existing) {
      const { _id, ...rest } = existing;
      await backups.insertOne({ ...rest, originalId: _id, backedUpAt: new Date() });
    }
    await Project.updateOne({ slug: cs.slug }, { $set: cs }, { upsert: true });
    console.log(
      `[publish-case-studies] ${existing ? 'updated' : 'inserted'} ${cs.slug} ${existing?.version || '-'} -> ${cs.version}`
    );
  }

  for (const slug of hideSlugs) {
    const doc = await Project.findOne({ slug }).lean();
    if (!doc || doc.published === false) continue;
    const { _id, ...rest } = doc;
    await backups.insertOne({ ...rest, originalId: _id, backedUpAt: new Date() });
    await Project.updateOne({ slug }, { $set: { published: false } });
    console.log(`[publish-case-studies] hidden  ${slug}`);
  }
} catch (err) {
  console.error('[publish-case-studies] skipped, database error:', err.message);
} finally {
  await mongoose.disconnect().catch(() => {});
}
