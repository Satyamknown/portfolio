export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v2.0',
  summary:
    'Ran delivery for one contractor split into four brands and four websites: a 258-item tracker with clear owners, a row-by-row reconciliation that showed 83% of the client\'s "pending" list was already done, and scope for each site based on keyword data.',
  role: 'Design lead · delivery & tracking',
  client: 'Pacific Coast Contracting · Vancouver',
  year: '2025-26',
  tags: ['Delivery management', 'Stakeholder management', 'Scoping', 'QA & incidents', 'Analytics'],
  metrics: [
    { value: '258', label: 'tracked items' },
    { value: '83%', label: 'of "pending" already done' },
    { value: '88', label: 'pages shipped' },
    { value: '4', label: 'brands, 4 sites' }
  ],
  coverImage: '/case-studies/pacific-coast-contracting/tracker.webp',
  order: 0,
  published: true,
  body: `## At a glance

- **Engagement:** a Greater Vancouver contractor, through Rsquare Web Studio, September 2025 to now. One client, four brands (PCC, PCC Renovations, PCC Roofing, PCC Decking), four websites.
- **My part:** I recommended the four-brand structure, then ran day-to-day delivery: the tracker, client feedback, review and sign-off, scope and QA.
- **Numbers:** 258 items tracked by owner; 163 "pending" items reconciled down to 27 really open; 191 tasks done, including 88 web pages.

## The situation

Pacific Coast Contracting came to us with a branding brief: reposition the brand and win better clients. At the time they offered renovation, roofing and decking under one name.

Within three months the job had become much bigger: four brands, each with its own website, marketing and backlog. Feedback came in through several channels: a client review sheet, the client's own task sheet, per-site update sheets and a separate list of blockers. When I consolidated them later, there were **eight source sheets**.

With that much spread, both sides lost track of what was actually finished. The client kept a list of 163 items they believed were still pending. Some had been waiting since the first week of the project.

## What I owned

- **The structural recommendation** to split one brand into four, and its presentation to the client.
- **The delivery tracker:** consolidating every request, sorting it by owner and priority, and reviewing developer work before it went back to the client.
- **The client feedback loop:** a compiled pending list from our side, plus written replies on each item.
- **Scope:** sitemaps based on keyword data, and audits that compared each plan with the live site.
- **QA:** issue catalogs for each brand, and a redesign QA list.
- **Paid search:** changing the bid strategy on the kitchen-renovation campaign (see Measurement).

Shared work: the dev team built and deployed the sites and wired the forms. A colleague co-owned the roofing sitemap pages; another made Google Ads changes during the same campaign.

## Setting up the delivery system

I merged the eight sheets into one master tracker (the chart at the top of this page). It holds **258 items**, dated September 2025 to August 2026. Every item sits in exactly one of three queues:

| Queue | Items | Rule |
|---|---|---|
| With me for review | 56 | Developers marked it resolved, or its status was "Under review" or "Verifying" |
| With developers | 107 | Open, to do, in progress or on hold, and not yet delivered |
| Completed and verified | 95 | Verified (websites) or completed (tasks) |

Each row records its source, section, device, priority, status, the date it was raised, its age in days, notes, and a remark added after delivery. Sorting the developer queue by priority and age gave us the working order: 44 High, 54 Medium and 5 Low items.

The sorting rules are written into the tracker so anyone can check them. Building it also exposed a gap: most website rows had no date entered, so their age reads "Not recorded".

## The reconciliation

The client's list said 163 things were pending. Rather than argue about it, I checked every item against the tracker and matched each one to an exact row. I didn't count "close enough" matches. Links came only from our own comment columns, and our source file stayed unchanged.

![Icicle chart: 163 items flagged pending; 136 already done (80 logged by the client as undelivered, 56 awaiting their sign-off); 27 genuinely open](/case-studies/pacific-coast-contracting/reconciliation.webp "Of 163 items the client flagged as pending, 136 (83%) were already done. Only 27 were still ours.")

> The client's list said 163. The tracker said 27.

The result:

- **136 of 163 (83%) were already done.**
  - **56** had been delivered and were waiting for the client's sign-off.
  - **80** were done, but the client had logged them as not delivered.
- **27 were really still open** on our side.

The 80 disputed items split again, and this is the part that kept the exercise honest. **27** had proof on file: a link or a review comment ready to send back. **53** were done but had nothing to point to, so I flagged them in red.

I also broke the results down by source. Renovations had the most items (67), and 48 of those were disputed. That told us where the communication gap was worst.

This changed the conversation. Instead of 163 grievances, there were 27 open tasks to schedule, 56 items waiting on the client's review, and a clear list of what still needed proof.

## Scoping with data

**The brand split.** Before any design work, I researched competitors across the Lower Mainland. Trade-specific brands ranked best, because name, intent and keyword matched. A general contractor name was competing in three trades and winning none.

![The recommendation slide: split into PCC (umbrella), PCC Renovations, PCC Roofing and PCC Decking, each with its own search targets and area](/case-studies/pacific-coast-contracting/brand-split.webp "The four-brand structure. The client accepted it within the first three months, and it set the scope for every workstream after it.")

The client accepted the split, with separate websites and separate marketing for each division. That one decision set the scope for the brand, web, SEO and ads work that followed.

**Research before any build.** The competitor audit covered naming, page structures, keyword volumes, local citations and Google Business Profile consistency, and produced five findings that shaped the sitemaps. A citation audit covered 30 citations across 25 live directories.

![Five key findings from the competitor and market analysis](/case-studies/pacific-coast-contracting/competitor-findings.webp "Five research findings, each one used as a planning rule for the sitemaps.")

**Sitemaps where every page needs a keyword.** No page went into a plan without search demand behind it. Each page targets one search intent.

![Full site structure for the umbrella site: core, about, projects, services, emergency services, blog, legal, landing and location pages](/case-studies/pacific-coast-contracting/sitemap-ia.webp "The umbrella site's structure: four page types, ten city pages, and separate domains for the three division brands.")

For PCC Roofing, the plan went from 33 current pages to **64 proposed pages**. Each page had a primary keyword, a one-line note on how it would beat the four named competitors, and an owner. I scoped that plan together with a colleague.

**Checking the plan against the live site.** After the roofing site was rebuilt, I checked all 64 planned pages against a fresh crawl: 27 were live as their own page, 17 only as a section of a hub page, and 20 were missing.

![Waffle chart of 64 planned roofing pages: 27 live, 17 live only as a section, 20 missing](/case-studies/pacific-coast-contracting/roofing-audit.webp "Plan vs live, Aug 2026: 27 pages live, 17 folded into a hub page, 20 not built. That leaves 37 to design and build.")

That turned a vague sense that roofing was "mostly done" into a concrete remaining scope of **37 pages**. A similar review of PCC Renovations scoped 24 new pages across five service categories.

## Quality and incidents

**Issue catalogs.** I kept a separate issue catalog for each brand, with 27 issues in total. Each issue has an area, a type (bug, improvement or content), a description, the action required and a priority.

| Brand | Issues | Example |
|---|---|---|
| PCC Decking | 11 (8 bugs, 6 High) | Uploaded projects not displaying in the CMS |
| PCC Renovations | 7 (3 High) | Project filters not working |
| PCC Roofing | 5 | Contact-form notifications not received |
| PCC main | 4 | Contact-form notifications not received |

A redesign QA list added 9 more (4 High).

**Lead-loss incidents.** The most serious problems were the ones nobody could see. The team guide records four incidents. All four are now fixed:

1. Roofing leads were being filed as spam because the site's domain wasn't registered in the CRM. At least one real enquiry was recovered with days to spare.
2. The roofing form created 0 contacts from 19 submissions, because automatic contact creation was switched off.
3. An old form path silently rejected **26 of 26 submissions in 30 days**, while showing every visitor a success screen. This led to the decision to route every form through HubSpot.
4. The paid landing page recorded no form conversions at all. The campaign was being optimised on phone calls alone.

> In all four cases, the website looked completely healthy.

We turned each incident into a team rule. There are nine rules now. For example: every site domain must be registered in the CRM; each conversion gets exactly one tracking signal; test with obviously fake data, then check the actual contact record, not just the success message. We also ranked the remaining issues by cost. First on the list is a weekly check that compares form submissions, contacts created and conversions recorded. It would have caught three of the four incidents within days.

## Measurement

**Tracking setup (shared with the dev team):**

- GTM and GA4 on the PCC main, Renovations and Roofing sites.
- Google Ads conversion tracking for forms and phone-number taps.
- HubSpot form tracking, with leads from all three live sites going into one shared HubSpot account.
- Microsoft Clarity for session recordings, loaded only after cookie consent.

**The Google Ads result.** The kitchen-renovation search campaign ran from **March 20 to April 17, 2026**. On April 6, I switched its bidding from Maximize Clicks to Maximize Conversions. Over the following 12 days, cost per conversion was **CA$43.22**, against **CA$105** for the campaign overall. A colleague also changed settings in that window, so the improvement can't be credited to the bidding switch alone.

![Two layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Two versions of a paid-ad landing page: one puts the form next to the hero, the other adds a sticky call bar and a call-back modal. Phone number blurred.")

**Honest reporting.** We count genuine leads, not raw form submissions: a de-duplicated summary for 20 June to 10 September 2026 counts 12, 11 of them for Roofing. Small, and reported plainly.

## Outcome and what's next

**Where things stand:**

- The client accepted the four-brand structure, and it shapes every workstream.
- 191 tasks are logged as done, each with a link: 88 web pages (36 of them city pages and 30 project pages), 13 print items and 12 cross-brand items.
- The backlog has one source of truth, with an owner for every item. The client's 163 "pending" items came down to 27 real ones.
- All three live brand sites now send leads into HubSpot, and the known double-counts are fixed.

**What's next:**

- Build the 37 remaining roofing pages and the 24 new Renovations pages.
- Set up the weekly reconciliation check.
- Fix a possible double-count on the kitchen landing page.
- Get the owner's decisions on restarting the paid campaign and handing lead notifications over to PCC.

**What I'd do differently:**

- **Attach proof when work is delivered.** 53 finished items had nothing to point to when they were questioned.
- **Date every request when it comes in.** Undated rows make it impossible to measure how long anything took.
- **Agree on one feedback channel early.** Eight sheets should have been one from the first month.
- **Monitor before launch, not after an incident.** Three of the four lead-loss incidents were found by investigating, not by an alert.`
};
