// Upserts the /design case studies from scripts/design-studies/ into the
// `design_studies` collection. Never touches `projects` or anything else.
//
//   node scripts/seed-design.js           write studies whose version changed
//   node scripts/seed-design.js --force   rewrite every study
//
// - Idempotent by slug: running it twice changes nothing the second time.
// - Before overwriting a study, the old document is copied to `design_study_backups`.
// - With MONGODB_URI unset it opens the local on-disk database in .localdb/, the
//   same one server/dev.js uses. Stop `npm run dev` first: only one process can
//   hold that folder.
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import DesignStudy from '../server/models/DesignStudy.js';
import stratalite from './design-studies/stratalite.js';
import pcc from './design-studies/pacific-coast-contracting.js';
import skooltag from './design-studies/skooltag.js';
import roohconnect from './design-studies/roohconnect.js';
import aiDesignWorkflow from './design-studies/ai-design-workflow.js';

const studies = [stratalite, pcc, skooltag, roohconnect, aiDesignWorkflow];
const force = process.argv.includes('--force');

let localServer = null;
if (!process.env.MONGODB_URI) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  localServer = await MongoMemoryServer.create({
    instance: { dbPath: path.join(root, '.localdb'), storageEngine: 'wiredTiger', dbName: 'portfolio' }
  });
  process.env.MONGODB_URI = localServer.getUri('portfolio');
  console.log('[seed-design] using the local database in .localdb/');
}

let failed = false;
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const backups = mongoose.connection.collection('design_study_backups');

  for (const study of studies) {
    const existing = await DesignStudy.findOne({ slug: study.slug }).lean();
    if (existing && existing.version === study.version && !force) {
      console.log(`[seed-design] kept     ${study.slug} (${study.version})`);
      continue;
    }
    if (existing) {
      const { _id, ...rest } = existing;
      await backups.insertOne({ ...rest, originalId: _id, backedUpAt: new Date() });
    }
    await DesignStudy.updateOne({ slug: study.slug }, { $set: study }, { upsert: true, runValidators: true });
    console.log(
      `[seed-design] ${existing ? 'updated ' : 'inserted'} ${study.slug} ${existing?.version || '-'} -> ${study.version}` +
        (study.published ? '' : ' (draft, not published)')
    );
  }
} catch (err) {
  failed = true;
  console.error('[seed-design] failed:', err.message);
} finally {
  await mongoose.disconnect();
  if (localServer) await localServer.stop();
}
process.exit(failed ? 1 : 0);
