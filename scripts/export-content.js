import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB } from '../server/db.js';

// Read-only snapshot of every CMS collection, written as plain JSON before a
// redesign ships. Nothing here writes to the database; it only calls find().
//
//   npm run export
//
// Output lands in backups/<timestamp>/<collection>.json (gitignored).

await connectDB();
const db = mongoose.connection.db;

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = new URL(`../backups/${stamp}/`, import.meta.url);
await mkdir(dir, { recursive: true });

const collections = await db.listCollections().toArray();
const summary = {};

for (const { name } of collections) {
  const docs = await db.collection(name).find({}).toArray();
  await writeFile(new URL(`${name}.json`, dir), JSON.stringify(docs, null, 2));
  summary[name] = docs.length;
}

await writeFile(new URL('_summary.json', dir), JSON.stringify({ exportedAt: new Date(), counts: summary }, null, 2));

console.log(`Exported to backups/${stamp}/`);
console.table(summary);

await mongoose.disconnect();
