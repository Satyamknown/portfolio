// PM-framed rewrite (v3.0). Facts come from the v2.1 case study, the design
// study in scripts/design-studies/, and Abhishek's notes on the lead funnel
// and ad results. Anything marked CONFIRM must be checked before merging to
// main, because a production deploy publishes this file to the CMS.
export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v3.0',
  tagline: 'Turned a rebrand brief into a lead engine for a four-brand contractor.',
  summary:
    'A Vancouver contractor asked for a rebrand. The real problem was that leads were slipping away and nobody could see it. I reframed the brief, split the business into four search-led brands, owned the lead funnel end to end, and replaced a 163-item complaint list with 27 real tasks.',
  role: 'Design lead, acting product owner',
  client: 'Pacific Coast Contracting · Vancouver',
  year: '2025-26',
  tags: ['Lead generation', 'Problem framing', 'Prioritization', 'Stakeholder management', 'Analytics'],
  metrics: [
    // CONFIRM: period and how many of these became paid jobs.
    { value: '24-28', label: 'leads from two ad campaigns' },
    { value: '~12', label: 'leads a month from local search' },
    { value: 'CA$43', label: 'per conversion, down from CA$105' },
    { value: '27', label: 'of 163 "pending" items were really open' }
  ],
  coverImage: '/case-studies/pacific-coast-contracting/cover.webp',
  order: 0,
  published: true,
  body: `## TL;DR

- **Problem:** the client asked for a new look. The business problem was lead flow: one generic brand ranked for nothing, and the leads that did arrive were being lost without anyone noticing.
- **My role:** design lead at Rsquare Web Studio, acting as product owner. I framed the problem, set priorities, owned the funnel and the backlog, and worked with a dev team and a paid-ads colleague.
- **Key decisions:** split one brand into four; fix tracking and follow-up before buying traffic; rank work by what a failure costs; settle the backlog with evidence, not argument.
- **Results:** 24-28 leads from two ad campaigns, about 12 leads a month from local search, cost per conversion down from CA$105 to CA$43, and a 163-item "pending" list reduced to 27 real tasks.

## The problem

Pacific Coast Contracting sells renovation, roofing and decking around Greater Vancouver. The brief was a rebrand to "win better clients".

Three things were actually in the way:

1. **Nobody could find them.** In local search, trade-specific brands win because the name, the searcher's intent and the keyword match. A general contractor name competed in three trades and ranked in none.
2. **Leads leaked silently.** One form rejected **26 of 26 submissions in 30 days** while showing every visitor a success screen. Roofing leads were filed as spam. The paid landing page recorded no form conversions at all.
3. **Trust was eroding.** Feedback arrived through eight separate sheets. The client believed 163 items were still pending, and every call started there.

> A new logo would not fix any of these. The job was to make the business findable, make every lead visible, and agree on what was actually left to do.

## My role

- **Owned:** problem framing, the brand-structure recommendation, prioritization, the lead funnel (tracking, CRM routing, alerts and follow-up), the delivery backlog, and the weekly picture of what was done.
- **Worked with:** a dev team who built the four sites and wired the forms, and a colleague who ran Google Ads changes alongside me.
- **Did not own:** the ad budget, or the client's sales process once a lead reached them.

## Goals, set before the work

| Goal | How we'd know |
|---|---|
| Get found for each trade | Organic impressions and clicks per site, leads from local search |
| Never lose a lead | Every submission becomes a CRM contact, an alert and a recorded conversion |
| Make paid search pay | Cost per conversion, leads per campaign |
| Rebuild trust | One shared backlog with an owner per item, agreed by the client |

## Decision 1: Reframe the rebrand as a lead problem, and split one brand into four

I researched competitors across the Lower Mainland: naming, page structures, keyword volumes and local listings. Five findings became planning rules.

- **Options:** refresh the single brand, or split it into an umbrella brand plus three trade brands.
- **Chose:** the split: PCC, PCC Roofing, PCC Renovations and PCC Decking, each with its own site and search targets.
- **Trade-off:** four sites to build and maintain instead of one, and a bigger first quarter.
- **Why:** name, intent and keyword have to match to rank locally. The client accepted it within three months, and it set the scope for every workstream after it.

![The recommendation slide: split into PCC (umbrella), PCC Renovations, PCC Roofing and PCC Decking, each with its own search targets and area](/case-studies/pacific-coast-contracting/brand-split.webp "The four-brand structure. It set the scope for brand, web, search and ads.")

The rule that followed: **no page without search demand behind it.** For PCC Roofing that grew the plan from 33 pages to 64, each tied to one keyword.

## Decision 2: Build the funnel before buying traffic

Paying for clicks into a funnel that loses leads would have burned the budget. So the order was tracking first, traffic second.

- **Measurement:** Google Tag Manager and GA4 on the live sites, one conversion signal per action, and Google Ads conversion tracking for forms and phone taps.
- **Routing:** every form on every brand goes into one HubSpot account, so each lead becomes a contact with a source.
- **Speed to lead:** the client gets an alert the moment a lead arrives, and can follow up straight away on WhatsApp.
- **Staying top of mind:** a monthly newsletter keeps past enquiries and customers warm between jobs.
- **Landing pages:** two layouts for two kinds of visitor. One puts the form beside the hero; the other adds a sticky call and WhatsApp bar for people who would rather phone.

![Two layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Option A for people who fill in forms, Option B for people who call. Phone number blurred.")

- **Trade-off:** ads started later than the client wanted.
- **Why:** an ad dollar is only worth spending if the lead it buys is seen and answered.

## Decision 3: Prioritize by what a failure costs

The biggest problems were invisible: the sites looked healthy while leads disappeared. I ranked issues by cost, not by how loudly they were raised.

Four lead-loss incidents went to the top, and all four are fixed:

1. Roofing leads were filed as spam because the domain wasn't registered in the CRM.
2. The roofing form created 0 contacts from 19 submissions, because automatic contact creation was off.
3. An old form path silently rejected 26 of 26 submissions in 30 days. This is why every form now routes through HubSpot.
4. The paid landing page recorded no form conversions, so the campaign was optimising on phone calls alone.

Each incident became a team rule, nine in total. For example: test with obviously fake data, then check the real contact record, not the success message.

## Decision 4: Settle the backlog with evidence, not argument

I merged eight feedback sheets into one tracker of **258 items**, each with one owner and a priority. Then I checked the client's 163 "pending" items row by row against it, counting only exact matches.

![Icicle chart: 163 items flagged pending; 136 already done (80 logged by the client as undelivered, 56 awaiting their sign-off); 27 genuinely open](/case-studies/pacific-coast-contracting/reconciliation.webp "Of 163 items the client flagged as pending, 136 (83%) were already done. Only 27 were still ours.")

- **136 of 163 (83%) were already done.** 56 were waiting for the client's sign-off; 80 were done but logged as undelivered.
- **27 were really open.** Those went into the developer queue by priority.
- **53 done items had no proof on file.** I flagged them in red instead of claiming them.

The conversation changed from 163 grievances to 27 tasks and a sign-off list.

## Decision 5: Let conversions, not clicks, steer the ads

On the kitchen-renovation search campaign I switched bidding from Maximize Clicks to Maximize Conversions, once conversion tracking could be trusted.

- **Result:** over the next 12 days, cost per conversion was **CA$43.22**, against **CA$105** for the campaign overall.
- **Caveat:** a colleague also changed settings in that window, so the improvement is not mine alone.

## Results

| Outcome | Result |
|---|---|
| Paid leads | **24-28 leads from two ad campaigns** |
| Organic leads | **About 12 a month** from local search (owner-reported, Oct 2026) |
| Search visibility | **31,625 impressions and 102 clicks** for pccroofing.ca in 90 days (one site) |
| Cost per conversion | **CA$43**, down from CA$105 |
| Lead loss | **4 of 4** silent failures found and fixed; every form now creates a contact and an alert |
| Backlog | **163 → 27** real open items, one tracker, one owner per item |
| Shipped | **88 pages** across four sites with the dev team |

## What I'd do differently

- **Agree success metrics in week one.** We set goals once the scope grew; baselines from day one would make the before and after cleaner.
- **Monitor before launch, not after an incident.** A weekly check comparing submissions, contacts and conversions would have caught three of the four incidents within days. It's now first on the list.
- **Attach proof when work ships.** 53 finished items had nothing to point to when questioned.
- **One feedback channel from month one.** Eight sheets should have been one.

## What's next

- Build the 37 remaining roofing pages and 24 new renovation pages already scoped.
- Restart paid search and test the two landing layouts against each other.
- Hand lead alerts fully over to the client's team.`
};
