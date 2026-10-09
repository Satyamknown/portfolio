// PM-framed rewrite (v3.1, one lead-generation narrative). Facts come from the v2.1 case study, the design
// study in scripts/design-studies/, and Abhishek's notes on the lead funnel
// and ad results, confirmed by him on 2026-10-10. A production deploy
// publishes this file to the CMS (old copy backed up first).
export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v3.2',
  tagline: 'Turned a rebrand brief into a lead engine for a four-brand contractor.',
  summary:
    'A Vancouver contractor asked for a rebrand. The real problem was lead flow: nobody could find them, and the leads that did arrive were lost without anyone noticing. I reframed the brief and built the lead engine end to end: four search-led brands, a funnel that catches every lead, instant follow-up, and paid search once the funnel could be trusted.',
  role: 'Design lead, acting product owner',
  client: 'Pacific Coast Contracting · Vancouver',
  year: '2025-26',
  tags: ['Lead generation', 'Problem framing', 'Funnel design', 'Prioritization', 'Analytics'],
  metrics: [
    { value: '24-28', label: 'leads from two ad campaigns' },
    { value: '~12', label: 'leads a month from local search' },
    { value: 'CA$43', label: 'per conversion, down from CA$105' },
    { value: '31.6k', label: 'Google impressions in 90 days (PCC Roofing)' }
  ],
  coverImage: '/case-studies/pacific-coast-contracting/cover.webp',
  order: 0,
  published: true,
  body: `## TL;DR

- **Problem:** the client asked for a new look. The business problem was lead flow: one generic brand ranked for nothing, and the leads that did arrive were lost without anyone noticing.
- **My role:** design lead at Rsquare Web Studio, acting as product owner for the client's lead engine. I framed the problem, set the order of work, and owned the funnel from first search to follow-up.
- **The plan:** get found, catch every lead in one CRM across all four brand sites, answer fast, then pay for traffic.
- **Results:** 24-28 leads from two ad campaigns that the client turned into work, about 12 leads a month from local search, and cost per conversion down from CA$105 to CA$43.

## The problem

Pacific Coast Contracting sells renovation, roofing and decking around Greater Vancouver. The brief was a rebrand to "win better clients".

Better clients start with more of the right leads, and two things were in the way:

1. **Nobody could find them.** In local search, trade-specific brands win because the name, the searcher's intent and the keyword match. A general contractor name competed in three trades and ranked in none.
2. **The leads they did get were leaking.** Forms showed a success message while submissions went nowhere, and nobody was told when a new enquiry arrived.

> A new logo would not fix either. The job was to build a lead engine: be found, catch every lead, and answer it fast.

## My role

- **Owned:** problem framing, the brand structure, the order of work, and the lead funnel end to end: tracking, CRM routing, alerts, follow-up and the newsletter.
- **Worked with:** a dev team who built the sites and wired the forms, and a colleague who ran Google Ads changes alongside me.
- **Did not own:** the ad budget, or the client's sales calls once a lead reached them.

## Goals

| Goal | How we'd know |
|---|---|
| Get found for each trade | Impressions, clicks and leads from local search |
| Never lose a lead | Every submission becomes a CRM contact, an alert and a recorded conversion |
| Answer fast, stay remembered | The client is alerted instantly and can follow up the same day |
| Make paid search pay | Leads per campaign and cost per conversion |

## Step 1: Get found by splitting one brand into four

I researched competitors across the Lower Mainland: naming, page structures, keyword volumes and local listings. Five findings became planning rules.

- **Options:** refresh the single brand, or split it into an umbrella brand plus three trade brands.
- **Chose:** the split: PCC, PCC Roofing, PCC Renovations and PCC Decking, each with its own site and search terms.
- **Trade-off:** four sites to build and keep up instead of one.
- **Why:** to rank locally, the name, the intent and the keyword have to match. The client accepted it within three months.

![The recommendation slide: split into PCC (umbrella), PCC Renovations, PCC Roofing and PCC Decking, each with its own search targets and area](/case-studies/pacific-coast-contracting/brand-split.webp "The four-brand structure: one brand per trade, each with its own search terms.")

One rule shaped every site: **no page without search demand behind it.** For PCC Roofing that grew the plan from 33 pages to 64, each built around one keyword and one kind of customer.

## Step 2: Catch every lead, across all four sites, in one CRM

Buying clicks into a funnel that loses leads burns the budget. So the order was: make every lead visible first, then buy traffic.

- **Measurement:** Google Tag Manager and GA4 on the sites, one clear signal per conversion, and Google Ads tracking for both form fills and phone taps.
- **One CRM for the whole business:** every form on all four sites (PCC, Roofing, Decking and Renovations) routes into one HubSpot account. Each lead becomes a contact tagged with the brand and page it came from, so the owner sees every enquiry across the business in one place.
- **Closing the leaks:** testing with fake enquiries, then checking the real contact record rather than the success message, uncovered four silent failures. One old form had rejected 26 of 26 submissions in 30 days while telling visitors it had worked. All four are fixed.

- **Trade-off:** ads started later than the client wanted.
- **Why:** an ad is only worth paying for if the lead it brings in is seen and answered.

## Step 3: Answer fast, and stay remembered

A contractor wins the job by calling back first.

- **Instant alerts:** the client is notified the moment a lead arrives on any of the four sites.
- **WhatsApp follow-up:** they can nudge a new lead on WhatsApp straight away, where homeowners actually reply.
- **Monthly newsletter:** past enquiries and customers hear from PCC every month, so the next job comes back to them.

All three are live and in use by the client.

## Step 4: Pay for traffic once the funnel works

With every lead tracked and answered, paid search could finally be judged on real results.

- **Two landing layouts for two kinds of visitor:** one puts the form beside the hero; the other adds a sticky call and WhatsApp bar for people who would rather phone.
- **Bidding for conversions, not clicks:** on the kitchen-renovation campaign I switched from Maximize Clicks to Maximize Conversions once conversion tracking could be trusted.

![Two layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Option A for people who fill in forms, Option B for people who call. Phone number blurred.")

## Results

| Outcome | Result |
|---|---|
| Paid leads | **24-28 leads from two ad campaigns**, converted into work by the client |
| Cost per conversion | **CA$43**, down from CA$105 (a colleague also adjusted the campaign in that window) |
| Organic leads | **About 12 a month** from local search (owner-reported, Oct 2026) |
| Search visibility | **31,625 impressions and 102 clicks** for pccroofing.ca in 90 days |
| One lead system | **4 sites, 1 CRM**: every enquiry from every brand becomes a contact and an alert |
| Lead loss | **4 of 4** silent failures fixed |

A brief that started as "make us look better" ended as a business that gets found, catches every enquiry from all four brands in one place, answers it the same day, and knows what each lead costs.

## What I'd do differently

- **Set baselines in week one.** Leads per month and cost per lead from day one would make the before and after sharper.
- **Monitor the funnel from launch.** A weekly check comparing submissions, contacts and conversions would have caught the silent failures within days instead of weeks.`
};
