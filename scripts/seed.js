import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../server/db.js';
import Project from '../server/models/Project.js';

// Fields left out on purpose are the ones only Abhishek can fill — install
// counts, years, and metrics for the two older projects. Blank beats invented.
const projects = [
  {
    slug: 'pacific-coast-contracting',
    title: 'Pacific Coast Contracting',
    version: 'v1.4',
    summary:
      'Owned the full paid funnel for a kitchen renovation campaign — landing page, conversion tracking, and ad account structure — then extended the same tracking discipline across all four PCC divisions.',
    role: 'Design & growth lead',
    client: 'Pacific Coast Contracting',
    year: '2026',
    tags: ['Google Ads', 'GTM', 'GA4', 'Landing pages', 'Local SEO'],
    metrics: [
      { value: '52', label: 'calls' },
      { value: '18', label: 'strong leads' },
      { value: '$80', label: 'CPA' },
      { value: '49', label: 'days' }
    ],
    order: 0,
    published: true,
    body: `Growth engine for a Greater Vancouver renovation contractor, built in a 49-day window.

## The story

The brief was a landing page. The first thing I did was not design it.

A tracking audit across GTM, GA4, Google Ads, and HubSpot showed conversions firing on page load rather than on form submit — so the client's entire sense of which campaigns worked was noise. Every optimization decision from the prior quarter had been made on numbers that weren't measuring anything.

Fixing the measurement came before touching the page, which was an unpopular two weeks.

> The 52 calls at $80 CPA are the number *after* the numbers became real.

## What shipped

- A rebuilt conversion tracking layer across three GTM containers
- The kitchen renovation landing page, designed and built
- Restructured ad account matched to the corrected event model
- The same tracking discipline extended across all four PCC divisions`
  },
  {
    slug: 'roohconnect',
    title: 'RoohConnect',
    version: 'v1.3',
    summary:
      'Built the full design language system and a 43-field, five-phase onboarding flow for a matrimony platform serving divorced, widowed, and single-parent Muslims in London — from positioning through shipped UI.',
    role: 'Product design lead',
    client: 'RoohConnect (London)',
    year: '2026',
    tags: ['Design systems', '0→1', 'Onboarding', 'Product strategy'],
    metrics: [
      { value: '43', label: 'fields' },
      { value: '5', label: 'phases' },
      { value: '500-member', label: 'founding cohort target' }
    ],
    order: 1,
    published: true,
    body: `Design system and onboarding for a founding-cohort platform.

## The story

The hard problem wasn't visual.

This audience has been failed by generic matrimony products. Asking 43 questions of someone re-entering the market after a divorce or bereavement is an act of trust, not a form.

Sequencing those five phases — what you ask first, what you defer, what you never ask — was the actual product work.

## Why the system came first

The design language system shipped before the onboarding flow, and the onboarding flow before the marketing site. Not because it was more interesting, but because 43 fields across five phases couldn't be designed twice.`
  },
  {
    slug: 'exportkit',
    title: 'ExportKit',
    version: 'v1.2',
    summary:
      'A compression and export-optimization plugin for Figma. Found the problem in my own workflow, built it, shipped it to the Figma Community, and have since published v2.1 with SVGO integration.',
    role: 'Everything',
    client: 'Self-initiated',
    year: '2026',
    tags: ['0→1', 'Solo build', 'Developer tools', 'Figma API'],
    metrics: [{ value: 'v2.1', label: 'shipped' }],
    order: 2,
    published: true,
    body: `A Figma plugin, conceived and shipped solo.

## The story

Proof that I can go from noticing a problem to a shipped, maintained product without a client, a brief, or a deadline.

The v2 roadmap was prioritized the way you'd prioritize any product: by what users complained about most, not by what was most interesting to build. That's how SVGO integration ended up ahead of features I personally wanted more.`
  },
  {
    slug: 'stratalite',
    title: 'Stratalite',
    version: 'v1.1',
    summary:
      'Designed a live B2B SaaS property management platform end to end — the case study that carried a Round 1 interview at a product design studio.',
    role: 'Product designer',
    client: 'Vancouver-based',
    tags: ['B2B SaaS', 'End-to-end', 'Complex workflows'],
    metrics: [],
    order: 3,
    published: true,
    body: `B2B SaaS property management, end to end.

Designed a live B2B SaaS property management platform from end to end — the case study that carried a Round 1 interview at a product design studio.`
  },
  {
    slug: 'skooltag',
    title: 'Skooltag',
    version: 'v1.0',
    summary:
      'End-to-end e-commerce design for a D2C school uniform brand. The project that set the bar for how I approach a new brief — and still the reference point I measure new work against.',
    role: 'Product designer',
    tags: ['D2C', 'E-commerce', '0→1'],
    metrics: [],
    order: 4,
    published: true,
    body: `D2C school uniform commerce, Delhi NCR.

End-to-end e-commerce design for a D2C school uniform brand. The project that set the bar for how I approach a new brief — and still the reference point I measure new work against.`
  }
];

await connectDB();

for (const p of projects) {
  await Project.findOneAndUpdate({ slug: p.slug }, p, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true
  });
  console.log(`upserted  ${p.version.padEnd(5)} ${p.title}`);
}

// Clear the placeholder record used while verifying the build.
const removed = await Project.deleteOne({ slug: 'rebuilding-checkout-to-cut-drop-off' });
if (removed.deletedCount) console.log('removed   sample case study');

await mongoose.disconnect();
console.log('\nDone.');
