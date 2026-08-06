import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 5000 is taken by macOS AirPlay Receiver, so default to 5001.
const port = process.env.PORT || 5001;

// No Atlas URI locally? Boot a local mongod on disk so `npm run dev` just works.
// Data lives in .localdb/ and survives restarts. Production always uses MONGODB_URI.
if (!process.env.MONGODB_URI) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create({
    instance: { dbPath: path.join(root, '.localdb'), storageEngine: 'wiredTiger', dbName: 'portfolio' }
  });
  process.env.MONGODB_URI = mongod.getUri('portfolio');
  console.log('Local MongoDB started (data in .localdb/)');

  const stop = () => mongod.stop().finally(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

const { default: app } = await import('../api/index.js');
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
