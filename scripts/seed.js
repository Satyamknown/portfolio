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
    version: 'v2.1',
    summary:
      'A solo-built Figma plugin that turns repetitive asset export into a controlled production pipeline — with WebP/SVG output, smart compression, auto-detected formats, and a clean folder structure.',
    role: 'Product manager, designer & engineer',
    client: 'Self-initiated · Figma Community',
    year: '2026',
    tags: ['0→1', 'Solo build', 'Developer tools', 'Figma API'],
    metrics: [
      { value: '50', label: 'Community users' },
      { value: 'v2.1', label: 'shipped' },
      { value: '3', label: 'UI states shown' },
      { value: 'May 15', label: 'latest update' }
    ],
    coverImage: '/mocks/mock-exportkit.png',
    order: 2,
    published: true,
    body: `A Figma plugin, conceived, shipped, and iterated solo. [View ExportKit on Figma Community](https://www.figma.com/community/plugin/1633059296781307442/exportkit).

## Executive summary

Exporting assets is a small task that becomes a large tax when it repeats across a design file: choose a format, pick a quality, name the output, organise the folder, compress the files, then do it again. Figma's default export path is useful for one-off work, but it leaves a gap for people shipping batches of production assets.

I built ExportKit around that gap. The product decision was to make export a repeatable pipeline rather than another one-shot dialog. The plugin exports frames as WebP or SVG, uses smart compression, auto-detects pure-vector frames for SVG output, supports AVIF, and packages the result in a predictable folder structure with a manifest containing per-asset quality and file-size information.

The Figma Community listing records 50 users, a May 4 launch, and a May 15 update. Those are adoption signals, not proof of retention or performance, so I use them as directional evidence rather than claiming a compression percentage or a business outcome that has not been measured.

## The problem

The trigger was my own workflow: a batch of frames should have been a single export job, but the default path made the user repeatedly manage decisions that were already knowable from the file. The cost was not only clicks. It was inconsistent format choices, oversized assets, unclear output structure, and uncertainty about what had actually shipped.

The product question became:

> How might we make a batch export predictable enough that a designer can trust the output without opening every file?

## Product strategy: AARRR

### Acquisition

The distribution decision was to meet users inside the Figma Community, where the problem is already legible. The listing leads with the outcome — WebP/SVG export, smart compression, and automatic folder structure — instead of implementation detail. That makes the value proposition understandable before installation.

The current signal is 50 Community users. I would instrument listing views, installs, first export, and referral source next; the public page currently gives us users and release dates, but not a complete funnel.

### Activation

Activation is the first successful export, not installation. The interface therefore makes the export mode visible, supports auto-detect, and changes the primary action to an Exporting state while work is in progress. The user should understand what will happen before clicking and know that the action is still running after clicking.

The activation hypothesis is: if a user can select frames, accept a sensible format recommendation, and receive a usable ZIP with no follow-up organisation, they have experienced the product's core value.

### Retention

Retention depends on the plugin becoming part of the release routine. Consistent folder structure, a manifest, and format/quality controls are retention features because they reduce the cost of repeating the job. v2.1's SVGO integration is a good example of roadmap work that reinforces repeat usage rather than merely adding novelty.

The current evidence is a maintained v2.1 release and a May 15 update after the May 4 launch. I would not call that retention yet; the next measurement is repeat exporters per week and exports per active user.

### Referral

ExportKit has a natural referral loop: a teammate receiving a cleaner, smaller, well-organised asset package can ask how it was made. The manifest makes the output more explainable, while a Community listing makes the discovery path short.

The product does not need a social feature to benefit from referral. It needs output quality that is visible to the next person in the handoff. I would measure shared files or copied Community links before adding an in-product referral mechanic.

### Revenue

Revenue was intentionally not the first decision. This is a utility plugin with a narrow job and an early adoption signal, so the first objective was to prove repeatable value and learn which export problems matter most. A future paid tier could charge for higher-volume batch jobs, advanced optimisation, or team governance, but putting a paywall in front of the first successful export would work against activation.

## What I compared

| Option | Strength | Cost / risk | Decision |
| --- | --- | --- | --- |
| Figma's default export | Zero setup and familiar | Repetitive for batches; limited optimisation and output organisation | Keep as the baseline, not the product |
| A desktop image utility | Mature codecs and broad file support | Breaks the Figma context; adds an export-and-import handoff | Not chosen for the core flow |
| A manual Figma workflow | Maximum control | Slow, inconsistent, and hard to audit across many frames | Replaced by automation |
| ExportKit | Figma-native batch flow with compression, format detection, ZIP output, and manifest | More implementation complexity and fewer general-purpose features | Chosen for the focused use case |

The key trade-off was control versus speed. Exposing every codec setting would make the tool powerful but would recreate the decision burden it was meant to remove. I kept useful control — format and quality — while automating folder structure, vector detection, and packaging.

## Technical product decisions

- **WebP first:** a pragmatic default for smaller raster assets and broad modern support.
- **SVG for pure vectors:** preserve the strengths of vector assets rather than rasterising everything.
- **AVIF support:** offer a higher-compression path for teams that can accept a newer format.
- **Squoosh WASM encoder:** keep compression local to the plugin flow and avoid a server dependency for asset processing.
- **SVGO in v2.1:** optimise SVG output without asking users to leave Figma.
- **Manifest plus ZIP:** make the result portable and auditable instead of returning a loose pile of files.

Each choice creates a trade-off: more formats mean more testing, local WASM improves privacy and portability but adds runtime weight, and auto-detection can surprise users if it is not explained. The interface makes the selected mode visible and keeps the export state explicit to preserve trust.

## Final decision

Build and keep ExportKit narrow: optimise the repeated batch-export job inside Figma, make the default path fast, and add controls only when they improve output confidence. Do not turn it into a general asset-management platform yet.

That decision is supported by the product's current shape and the available evidence: the plugin has shipped through v2.1, the Community page shows 50 users, and the feature set maps directly to a recurring workflow problem. The next decision should be evidence-led: instrument first export, repeat exports, format choice, compression outcomes, and failure states before expanding the roadmap.

## What I learned as a product manager

Proof that I can go from noticing a problem to a shipped, maintained product without a client, a brief, or a deadline. The important PM work was not writing a long feature list; it was choosing the smallest reliable loop, making trade-offs explicit, and treating the export result as the product.

The v2 roadmap was prioritised by user value and repeat usage, not by what was most interesting to build. That is how SVGO integration earned its place ahead of features I personally wanted more.

## What I would measure next

- Activation rate: installs that reach a first successful export
- Retention: users who export again within 7 and 30 days
- Job quality: average asset size, compression time, and export failure rate
- Format fit: WebP, SVG, AVIF, and auto-detect selection by use case
- Referral: shared outputs or Community visits attributable to a handoff

The next version should be driven by those signals, not by adding more formats for their own sake.`
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
