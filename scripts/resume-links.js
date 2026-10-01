// One share link per company the resume went to, so the dashboard shows who opened it.
// Tokens live in resume-links.json and are generated once: they are printed on PDFs that
// have already been sent, so never regenerate or rename one. Add new companies at the end.
import { readFileSync } from 'node:fs';
import AccessLink from '../server/models/AccessLink.js';
import AccessLinkEvent from '../server/models/AccessLinkEvent.js';

const TOKEN_PATTERN = /^[a-z0-9-]{1,64}$/;
const links = JSON.parse(readFileSync(new URL('./resume-links.json', import.meta.url), 'utf8'));

// Create what is missing. Existing links keep opens, lastOpenedAt, a pause set from /admin
// and the label; only the application details (role, job posting, applied date), which
// and the track (PM or design resume), which live in the JSON and nowhere else, are refreshed on every deploy.
export async function ensureResumeLinks(log = console.log) {
  let created = 0;
  for (const { label, token, role, jobUrl, appliedAt, track } of links) {
    if (!TOKEN_PATTERN.test(token)) throw new Error(`Bad token in resume-links.json: ${token}`);
    const details = { role, jobUrl, track: track || 'pm', appliedAt: appliedAt ? new Date(`${appliedAt}T00:00:00+05:30`) : undefined };
    for (const key of Object.keys(details)) if (details[key] === undefined) delete details[key];
    const result = await AccessLink.updateOne(
      { token },
      { $setOnInsert: { label }, ...(Object.keys(details).length ? { $set: details } : {}) },
      { upsert: true }
    );
    if (result.upsertedCount) {
      created += 1;
      log(`[resume-links] created ${token} (${label})`);
    }
  }
  // The open-event collection's TTL and lookup indexes, built here so the first open does not wait on them.
  await AccessLinkEvent.createIndexes();
  log(`[resume-links] ${created} created, ${links.length - created} already there`);
}
