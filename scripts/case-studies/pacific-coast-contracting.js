// PM-framed rewrite (v4.0, lead management system only). Facts come from the v2.1 case study, the design
// study in scripts/design-studies/, and Abhishek's notes on the lead funnel
// and ad results, confirmed by him on 2026-10-10. A production deploy
// publishes this file to the CMS (old copy backed up first).
export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v4.1',
  tagline: 'One lead system for four brands, so no enquiry gets lost again.',
  summary:
    'Pacific Coast Contracting has four brands and four websites. Leads were spread across all of them, some quietly disappeared, and nobody knew what a lead cost. I owned the fix: one system that catches every enquiry, tells the owner straight away, and shows what each lead costs.',
  role: 'Design lead, acting product owner',
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
  body: `## The ask

Pacific Coast Contracting is a contractor in Greater Vancouver. They run four brands, each with its own website: **PCC**, **PCC Roofing**, **PCC Decking** and **PCC Renovations**.

They came to us asking for more leads. Fair enough. Every contractor wants more leads.

But before buying any, I wanted to know a simpler thing: what happens to the leads they already get?

## What was actually broken

The honest answer was: nobody knew.

- **Four websites, four separate inboxes,** and no single place to see who had asked for what.
- **Some leads were vanishing.** One form showed every visitor a cheerful "Thanks, we'll be in touch!" and then threw the message away. It did this 26 times out of 26 in a month.
- **Nobody got told** when a new enquiry came in. In contracting, the first company to call back usually gets the job. The second one gets "sorry, we've already hired someone."
- **Nobody knew what a lead cost,** so there was no way to tell whether ad money was working.

So the real problem wasn't "we need more leads". It was "we're losing the ones we have, and we can't see it." Buying more traffic would just mean losing more leads, faster.

## What success looked like

I kept it to four things we could check:

1. Every lead from every brand lands in **one place**.
2. **No lead gets lost** between the form and that place.
3. The owner hears about a new lead **straight away** and can reply the same day.
4. We know **what each lead costs** before spending more on ads.

## What I did, in order

The order mattered more than any single step. Each one only works if the one before it does.

### 1. Count before spending

You can't fix what you can't measure. I set up tracking on all four sites (Google Tag Manager and GA4), so every form fill and every phone tap is counted once, and only once.

### 2. One inbox for four brands

Every form on all four websites now sends leads into one CRM (HubSpot). Each lead arrives labelled with the brand and the page it came from, so the owner can finally see which part of the business is bringing in work.

This took longer than giving each site its own inbox, because all four sites had to follow the same rules. It was worth it: one view of every lead is the whole point.

### 3. Find the leaks before buying traffic

I sent deliberately fake enquiries through every form, then checked whether they actually arrived in the CRM, not just whether the website said "thank you."

That found four silent failures, including the form that had been binning every message. All four are fixed.

The cost: ads started later than the client wanted. But paying for clicks into a leaky funnel is just a slower way of losing money.

### 4. Reply first, stay remembered

- **Instant alerts:** the owner is told the moment a lead arrives on any of the four sites.
- **WhatsApp follow-up:** they can message a new lead right away, which is where homeowners actually reply.
- **Monthly newsletter:** past enquiries and customers hear from PCC every month, so when the next job comes up, they remember who to call.

All three are live and used by the client every day.

### 5. Only then, ads

With every lead caught and answered, paid search finally had something reliable to measure against.

- **Two landing pages for two kinds of people:** one for people who like filling in forms, one with a big call and WhatsApp button for people who would rather just talk.
- **Pay for leads, not clicks:** once the tracking could be trusted, I switched the campaign to optimise for conversions instead of clicks.

![Two layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Option A for form people, Option B for phone people. Phone number blurred.")

## What happened

- **24-28 leads from two ad campaigns,** which the client turned into paying work.
- **Cost per lead dropped from CA$105 to CA$43.** A colleague also tweaked the campaign in that window, so I'll share the credit.
- **Four websites, one CRM.** Every enquiry from every brand now becomes a labelled contact and an instant alert.
- **Zero known leaks.** All four silent failures fixed.

Pacific Coast went from four websites quietly dropping enquiries to one system where every lead is caught, seen within minutes, followed up and measured. Same business, same websites. Just no more leads falling through the floorboards.

## What I'd do differently

- **Write down the starting numbers on day one.** I can tell you where we ended up. I'd love to tell you more precisely where we started.
- **Watch the system from the first day, not after a problem.** A simple weekly check of form fills against CRM contacts would have caught the silent failures in days instead of weeks.`
};
