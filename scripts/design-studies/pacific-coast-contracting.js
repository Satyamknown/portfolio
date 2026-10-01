// Design case study: Pacific Coast Contracting. Numbers come from the "Outcomes
// evidence" list in second-mind/Team/Design track.md.
const img = (name) => `/design/pacific-coast-contracting/${name}.webp`;

export default {
  slug: 'pacific-coast-contracting',
  version: 'v1.1',
  order: 2,
  published: true,
  title: 'Pacific Coast Contracting',
  tagline: 'One contractor, four brands, four websites, each page planned from search data.',
  summary:
    'A Vancouver home-services contractor came in for a rebrand. I recommended splitting it into four trade brands, planned each site\'s structure from search demand, and shipped 88 pages across four websites with the dev team.',
  role: 'Design Lead, Rsquare Web Studio',
  client: 'Pacific Coast Contracting, Vancouver',
  timeline: 'September 2025 to now',
  team: 'Me on brand structure, IA and page plans. The dev team built the sites; a colleague co-owned the roofing sitemap.',
  tools: ['Figma', 'Google Sheets', 'GA4', 'Google Tag Manager', 'Google Ads', 'HubSpot', 'Microsoft Clarity'],
  heroImage: img('hero'),
  heroAlt: 'The recommendation slide: one umbrella brand, PCC, and three trade brands, PCC Renovations, PCC Roofing and PCC Decking',
  impact: [
    {
      value: '1 → 4',
      label: 'brands, from my recommendation to split the business',
      note: 'Accepted by the client within the first three months'
    },
    {
      value: '88',
      label: 'web pages shipped across 4 sites with the dev team',
      note: '36 city pages and 30 project pages'
    },
    {
      value: '37',
      label: 'pages of real scope found when I checked the roofing plan against the live site',
      note: '64 planned: 27 live, 17 folded into a hub, 20 missing'
    },
    {
      value: '163 → 27',
      label: 'items the client thought were pending, reconciled to what was really open',
      note: '136 of them, 83%, were already done. From one 258-item tracker.'
    }
  ],
  sections: [
    {
      type: 'text',
      label: 'The problem',
      heading: 'A general name, competing in three trades and winning none',
      body: `The client sold renovation, roofing and decking under one name and asked for a rebrand to win better clients.

In local search, trade-specific brands were winning, because the name, the searcher's intent and the keyword all matched. A general contractor's name was competing in three trades at once and ranking in none of them.

> A new logo would not fix it. The structure of the business online had to change.`
    },
    {
      type: 'text',
      label: 'My role',
      heading: 'Design Lead, from brand structure to the live sites',
      body: `- **Owned:** the brand-structure recommendation, competitor research, sitemaps and page plans, the landing-page layouts, and checking each live site against its plan.
- **Worked with:** the dev team, who built and deployed the sites, and a colleague who co-owned the roofing sitemap.
- **Also ran** the delivery tracker and QA, so every plan made it to a live page.`
    },
    {
      type: 'decision',
      label: 'Decision 01',
      heading: 'Split one brand into four',
      body: `Before any design work, I researched competitors across the Lower Mainland: naming, page structures, keyword volumes and local listings. Five findings became planning rules.

**Decision:** an umbrella brand plus three trade brands, each with its own site and its own search targets.

**Trade-off:** four sites to design, build and maintain instead of one.

**Why:** name, intent and keyword need to match to rank locally. The client accepted it, and it set the scope for the brand, web, search and ads work that followed.`,
      images: [
        {
          src: img('competitor-findings'),
          alt: 'Five key findings from the competitor and market analysis',
          caption: 'Five research findings, each turned into a planning rule.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 02',
      heading: 'No page without search demand behind it',
      body: `Every page in a sitemap needed a keyword with real demand and one search intent.

**Why:** it kept four sites from turning into four copies of the same site, and gave every page a reason to exist.

For PCC Roofing the plan grew from **33 pages to 64**, each with a primary keyword and a note on how it would beat the named competitors.

Over the 90 days from 14 Jun to 11 Sep 2026, the rebuilt roofing site earned 31,625 organic Google impressions and 102 clicks. That is the site's result, built by the dev team, not mine alone.`,
      images: [
        {
          src: img('sitemap-ia'),
          alt: 'Full site structure for the umbrella site: core, about, projects, services, emergency services, blog, landing and location pages',
          caption: 'The umbrella site: page types, city pages, and separate domains for the three trade brands.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 03',
      heading: 'Two landing-page layouts for two kinds of visitor',
      body: `Paid-ad visitors behave differently: some fill in a form, some just want to call.

**Decision:** two layouts. One puts the form beside the hero. The other adds a sticky call and WhatsApp bar and a call-back modal.

**Why:** design for both behaviours instead of guessing one, then let the campaign data pick.`,
      images: [
        {
          src: img('landing-ab'),
          alt: 'Two layouts for the paid-ad landing page: Option A with the form beside the hero, Option B with a sticky call bar and call-back modal',
          caption: 'Option A and Option B. Phone number blurred.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 04',
      heading: 'Check the plan against the live site, page by page',
      body: `After the roofing site was rebuilt, it felt "mostly done". I checked all 64 planned pages against a fresh crawl: **27 live, 17 folded into a hub page, 20 missing.**

**Why:** a plan only matters if it ships. That check turned a feeling into **37 pages of real scope**.`,
      images: [
        {
          src: img('roofing-audit'),
          alt: 'Waffle chart of 64 planned roofing pages: 27 live, 17 live only as a section, 20 missing',
          caption: 'Plan vs live, August 2026.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Process',
      heading: 'Research, structure, plans, then the build',
      body: `- **Competitor research** across the Lower Mainland, plus a citation audit of 30 listings across 25 directories.
- **Brand structure:** one umbrella brand and three trade brands.
- **Information architecture:** a sitemap per brand, every page tied to a keyword.
- **Page plans and landing layouts,** handed to the dev team.
- **QA:** 27 issues logged in 4 brand catalogs, and 4 lead-loss incidents documented and fixed with the team, each turned into a team rule.`
    },
    {
      type: 'gallery',
      label: 'Final screens',
      heading: 'The live sites',
      body: 'Live pages, built by the dev team from the site plans. Phone numbers blurred.',
      layout: 'grid-2',
      images: [
        {
          src: img('live-renovations-commercial'),
          alt: 'PCC Renovations commercial renovation page: hero, overview and service blocks',
          caption: 'PCC Renovations: commercial renovation.'
        },
        {
          src: img('live-renovations-specialty'),
          alt: 'PCC Renovations specialty sectors page',
          caption: 'PCC Renovations: specialty sectors.'
        },
        {
          src: img('live-renovations-painting'),
          alt: 'PCC Renovations painting services page',
          caption: 'PCC Renovations: painting services.'
        },
        {
          src: img('live-pcc-project-page'),
          alt: 'Pacific Coast Contracting project page for a bathroom renovation in Port Coquitlam',
          caption: 'The umbrella site: one of 30 project pages.'
        }
      ]
    },
    {
      type: 'text',
      label: "What I'd do next",
      heading: 'Next time',
      body: `- **Build the 37 remaining roofing pages and the 24 new renovation pages** already scoped.
- **Run the two landing layouts against each other** once the paid campaign restarts.
- **Set up a weekly check** that compares form submissions, contacts created and conversions recorded. It would have caught three of the four lead-loss incidents within days.`
    }
  ]
};
