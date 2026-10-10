// PM-framed rewrite (v5.1, answers the recruiter audit). Facts come from the v2.1 case study, the design
// study in scripts/design-studies/, and Abhishek's notes on the lead funnel
// and ad results, confirmed by him on 2026-10-10. A production deploy
// publishes this file to the CMS (old copy backed up first).
export default {
  slug: 'pacific-coast-contracting',
  title: 'Pacific Coast Contracting',
  version: 'v5.1',
  tagline: 'One lead system for four brands, so no enquiry gets lost again.',
  summary:
    'Pacific Coast Contracting has four brands and four websites. Leads were spread across all of them, some quietly vanished, and replies took hours. I led a four-person team to build one lead system: every enquiry in one CRM, answered in about 30 minutes instead of 4 to 8 hours, and paid ads only once the system worked.',
  role: 'Lead designer, acting product owner',
  client: 'Pacific Coast Contracting · Vancouver',
  year: '2025-26',
  tags: ['Lead management', 'Prioritization', 'Stakeholder management', 'Experimentation', 'CRM'],
  metrics: [
    { value: '30', label: 'leads from two 24-day ad sprints' },
    { value: '30 min', label: 'to reply, down from 4 to 8 hours' },
    { value: 'CA$43', label: 'per lead, down from CA$80' },
    { value: '4', label: 'brand sites feeding one CRM' }
  ],
  coverImage: '/case-studies/pacific-coast-contracting/cover.webp',
  order: 0,
  published: true,
  body: `## The ask

Pacific Coast Contracting is a contractor in Greater Vancouver with four brands, each with its own website: **PCC**, **PCC Roofing**, **PCC Decking** and **PCC Renovations**.

They came to us asking for more leads. Fair enough. Every contractor wants more leads.

Before buying any, I wanted to answer a simpler question: what happens to the leads they already get?

## What was actually broken

- **Four websites, four separate inboxes,** and no single place to see who had asked for what.
- **Some leads were vanishing.** One form showed every visitor a cheerful "Thanks, we'll be in touch!" and then threw the message away. In one month alone, that was 26 enquiries gone.
- **Replies took 4 to 8 hours.** In home services that's an eternity. The first contractor to call back usually gets the job. The second one gets "sorry, we've already hired someone."
- **Nobody knew what a lead cost,** so there was no way to tell whether ad money was working.

So the problem wasn't "we need more leads". It was "we're losing the ones we have, and we can't see it." More traffic would just mean losing leads faster.

## What success looked like

I set four goals we could check at the end:

1. **One place:** every lead from every brand lands in one system.
2. **Nothing lost:** no lead disappears between the form and that system.
3. **Fast replies:** the owner hears about a lead straight away and replies within the hour.
4. **Known cost:** we know what a lead costs before spending more on ads.

## My role

We were a team of four: a marketer, a developer, a designer, and me as lead designer. With no product manager on the project, I acted as one. I framed the problem, set the goals and the order of work, made the calls on scope, and kept the client aligned. The developer wired the forms, the marketer ran the ad accounts, and the designer and I designed the pages.

## What we did, in order

The order was the main decision. Each step only pays off if the one before it works.

### 1. One inbox for four brands

Every form on all four websites now sends leads into one CRM (HubSpot), with tracking (Google Tag Manager and GA4) so each enquiry is counted once and labelled with the brand and page it came from.

**Why a CRM and not four inboxes:** an inbox tells you a message arrived. A CRM tells you who this person is: a first-time enquiry, a repeat customer, or someone worth more attention. That history is also what makes targeted ads possible later.

### 2. Find the leaks

We sent deliberately fake enquiries through every form, then checked whether they actually reached the CRM, not just whether the website said "thank you."

That found four silent failures, including the form that had been binning every message. All four are fixed.

### 3. Reply first

- **Instant alerts:** the owner is told the moment a lead arrives on any of the four sites.
- **WhatsApp follow-up:** it's where these homeowners actually reply, so that's where the first message goes.
- **Monthly newsletter:** past enquiries and customers hear from PCC every month, so when the next job comes up, they remember who to call.

### 4. Convince the client to wait for ads

This was the hard conversation. The client wanted ads running straight away.

My case was simple: if we pay for clicks before the sites are live and the system catches every lead, we pay to lose them. So we agreed on an order: get all four sites live, finish the lead system, then advertise.

I also pushed for a **separate landing page** instead of sending ad traffic to the main website. A page about one service, for one audience, has one job. The main site has twenty.

### 5. Advertise one service, then keep improving the page

We ran ads only for the main brand, pacificcoastcontracting.ca, pointing at one renovation service, in two 24-day sprints a month apart.

The landing page went through three or four rounds, each based on what visitors actually did:

- **People scrolled past the first screen without reading.** The page was slow, so we made it faster.
- **People kept clicking on the project photos, and nothing happened.** They wanted a closer look at the kitchens and bathrooms. We added a proper gallery.

Once tracking could be trusted, we also switched the campaign from paying for clicks to paying for leads.

![Two early layouts for the paid-ad landing page: Option A with hero and form side by side, Option B with a sticky call and WhatsApp bar and a call-back modal](/case-studies/pacific-coast-contracting/landing-ab.webp "Two early layouts of the landing page, before the speed and gallery changes. Phone number blurred.")

### 6. Local search for the other three brands

Roofing, Decking and Renovations got the same lead system, but no ad budget. Instead they were set up for local search, so they bring in nearby customers without paying for every visit.

## What we chose not to do

- **Advertise all four brands at once.** One brand, one service, one landing page kept the budget focused and the results readable.
- **Send ads to the main website.** It does too many jobs; the landing page does one.
- **Build anything custom.** An off-the-shelf CRM got the client running in weeks, not months.

## Did it work?

Back to the four goals:

1. **One place: yes.** All four sites feed one CRM, every lead labelled by brand and page.
2. **Nothing lost: yes.** All four silent failures found and fixed.
3. **Fast replies: yes.** Replies went from **4 to 8 hours down to about 25 to 30 minutes.** In a business where the first call-back wins, that's the headline.
4. **Known cost: yes, and it fell.** Cost per lead dropped from **CA$80 to CA$43.** A colleague also tuned the campaign in that window, so I'll share the credit.

And the ads themselves: **30 leads across two 24-day sprints** (16 in the first, 14 in the second), all from one landing page for one service.

Pacific Coast went from four websites quietly dropping enquiries to one system where every lead is caught, answered within half an hour, and measured.

## What I'd do differently

- **Record the starting numbers on day one.** I know the reply time before and after, but I'd like a clean before-and-after for total leads per month too.
- **Watch the system from the first day, not after a problem.** A weekly check of form fills against CRM contacts would have caught the silent failures in days instead of weeks.`
};
