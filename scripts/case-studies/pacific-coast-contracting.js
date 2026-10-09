// PM-framed rewrite (v4.0, lead management system only). Facts come from the v2.1 case study, the design
// study in scripts/design-studies/, and Abhishek's notes on the lead funnel
// and ad results, confirmed by him on 2026-10-10. A production deploy
// publishes this file to the CMS (old copy backed up first).
export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v4.0',
  tagline: "Deployed one lead management system across a contractor's four brands.",
  summary:
    'Pacific Coast Contracting runs four brands: PCC, PCC Roofing, PCC Decking and PCC Renovations. Leads were scattered across four sites, some were lost without anyone noticing, and nobody knew what a lead cost. I owned the lead management system end to end: tracking, one central CRM, instant alerts, WhatsApp follow-up, a monthly newsletter, and paid search on top.',
  role: 'Design lead, product owner for the lead system',
  client: 'Pacific Coast Contracting · Vancouver',
  year: '2025-26',
  tags: ['Lead management', 'CRM', 'Funnel design', 'Analytics', 'Paid search'],
  metrics: [
    { value: '24-28', label: 'leads from two ad campaigns' },
    { value: '4', label: 'brand sites on one CRM' },
    { value: 'CA$43', label: 'per conversion, down from CA$105' },
    { value: '4/4', label: 'silent lead leaks found and fixed' }
  ],
  coverImage: '/case-studies/pacific-coast-contracting/cover.webp',
  order: 0,
  published: true,
  body: `## TL;DR

- **Goal:** deploy one lead management system for Pacific Coast Contracting and all three of its division brands.
- **My role:** design lead at Rsquare Web Studio, acting as product owner for the lead system. I set the requirements and the order of work, and owned it from the first click to the follow-up.
- **What we shipped:** tracking on all four sites, one central CRM, instant lead alerts, WhatsApp follow-up, a monthly newsletter, and paid search feeding it.
- **Results:** 24-28 leads from two ad campaigns that the client turned into work, cost per conversion down from CA$105 to CA$43, and every enquiry from every brand now lands in one place.

## The problem

Pacific Coast Contracting is a Greater Vancouver contractor with four brands, each with its own website: **PCC**, **PCC Roofing**, **PCC Decking** and **PCC Renovations**.

Each site collected enquiries on its own, and nobody had the full picture:

1. **Leads were scattered.** Four sites, separate forms, no single view of who had asked for what.
2. **Leads were being lost.** Forms showed a success message while submissions went nowhere. Nobody noticed, because nothing was checking.
3. **Nobody was told.** A new enquiry could sit unseen, and in contracting the first company to call back usually wins the job.
4. **Nobody knew what a lead cost.** Without conversion tracking, ad spend couldn't be judged.

> The client didn't need more traffic yet. They needed every lead from every brand caught, seen and answered.

## My role

- **Owned:** the requirements for the lead system, the order of work, the tracking plan, CRM routing, alerts and follow-up flows, the newsletter, and the paid-search set-up.
- **Worked with:** a dev team who wired the forms on each site, and a colleague who ran Google Ads changes alongside me.
- **Did not own:** the ad budget, or the client's sales calls once a lead reached them.

## Goals

| Goal | How we'd know |
|---|---|
| One view of every lead | All four sites feed one CRM, each lead tagged by brand and page |
| Never lose a lead | Every submission becomes a contact, an alert and a recorded conversion |
| Answer fast, stay remembered | The client is alerted instantly and can follow up the same day |
| Make paid search pay | Leads per campaign and cost per conversion |

## Step 1: Measure every lead on every site

You can't manage leads you can't see, so tracking came first.

- **Google Tag Manager and GA4** on all four sites, with one clear signal per conversion so nothing is counted twice.
- **Google Ads conversion tracking** for both form fills and phone taps, because many homeowners would rather call.

## Step 2: Route every brand into one CRM

- **One HubSpot account for the whole business:** every form on PCC, PCC Roofing, PCC Decking and PCC Renovations routes into it.
- **Tagged at the source:** each lead arrives as a contact marked with the brand and page it came from, so the owner can see which division and which page is bringing in work.
- **Trade-off:** one shared system means every site has to follow the same form and tagging rules, which took longer to set up than four separate inboxes.
- **Why:** one view of every lead is the only way to know what's working across the business.

## Step 3: Close the leaks before buying traffic

Paying for clicks into a funnel that loses leads burns the budget, so the system was tested before any ads ran.

- **How:** send obviously fake enquiries through every form, then check the real CRM record, not the success message on screen.
- **What it found:** four silent failures. One old form had rejected **26 of 26 submissions in 30 days** while telling every visitor it had worked; another created 0 contacts from 19 submissions. All four are fixed, and every form now routes through HubSpot.
- **Trade-off:** ads started later than the client wanted.
- **Why:** an ad is only worth paying for if the lead it brings in is caught.

## Step 4: Answer fast, and stay remembered

- **Instant alerts:** the client is notified the moment a lead arrives on any of the four sites.
- **WhatsApp follow-up:** they can nudge a new lead on WhatsApp straight away, where homeowners actually reply.
- **Monthly newsletter:** past enquiries and customers hear from PCC every month, so the next job comes back to them.

All three are live and in use by the client.

## Step 5: Feed the system with paid search

With every lead caught and answered, paid search could be judged on real results.

- **Two landing layouts for two kinds of visitor:** one puts the form beside the hero; the other adds a sticky call and WhatsApp bar for people who would rather phone.
- **Bidding for conversions, not clicks:** on the kitchen-renovation campaign I switched from Maximize Clicks to Maximize Conversions once conversion tracking could be trusted.

![Two layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Option A for people who fill in forms, Option B for people who call. Phone number blurred.")

## Results

| Outcome | Result |
|---|---|
| Paid leads | **24-28 leads from two ad campaigns**, converted into work by the client |
| Cost per conversion | **CA$43**, down from CA$105 (a colleague also adjusted the campaign in that window) |
| One lead system | **4 brand sites, 1 CRM**: every enquiry becomes a tagged contact and an instant alert |
| Lead loss | **4 of 4** silent failures found and fixed |
| Follow-up | Instant alerts, WhatsApp follow-up and a monthly newsletter, all in use by the client |

Pacific Coast Contracting went from four sites quietly losing enquiries to one system where every lead from every brand is caught, seen within minutes, followed up, and measured.

## What I'd do differently

- **Set baselines in week one.** Leads per month and cost per lead from day one would make the before and after sharper.
- **Monitor the system from launch.** A weekly check comparing submissions, contacts and conversions would have caught the silent failures within days instead of weeks.`
};
