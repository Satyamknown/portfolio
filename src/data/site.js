// Static site copy. Case studies and posts live in MongoDB; everything here is
// positioning that changes rarely and doesn't need a CMS.

export const profile = {
  name: 'Abhishek Manjhi',
  eyebrow: 'Candidate spec — Product Manager',
  from: 'Design Lead v4.0',
  to: 'Product Manager v1.0',
  stage: 'BETA',
  sprint: '84-day sprint',
  location: 'Mumbai, IN',
  role: 'Design Lead → Product Manager',
  status: 'Open to opportunities',
  email: 'abhishek.manjhi21@comp.sce.edu.in',
  linkedin: 'https://www.linkedin.com/in/akmanjhi/',
  resume: '/resume.pdf'
};

// Homepage (flowing design) copy
export const home = {
  scribble: 'やあ!',
  headline: 'Turning problems into products.',
  heroMeta: "Abhishek Manjhi | 4 Years exp · 20+ project · 4 industries",
  handNote: 'design → pm',
  heroPara: {
    before: 'Design Lead → Product Manager. Founder-level owner of ',
    bold: 'funnels, design systems & internal tools',
    after:
      ' for four years — shipping the parts of the product most PMs only spec. Now making the product work explicit.'
  },
  availability: 'Open to opportunities — 2026',
  progressIntro: 'What I’m working on now.',
  aboutStatement:
    "For four years I've been the de facto product owner on work that never had a PM assigned to it.",
  aboutPara:
    'Contracting clients in Vancouver, a founding-cohort platform in London, a D2C brand in Delhi. The brief arrived as "make this look better," and the job turned out to be figuring out what to build and why. Now I\'m making that the job: moving into product management.',
  contactHand: '話しましょう',

  // Bento homepage (redesign/bento). The intro card and photo tile.
  intro: {
    headline: 'Design Lead → Product Manager.',
    body:
      'Four years owning funnels, design systems and internal tools for clients in Canada, the UK and India.',
    contactLine: 'Open to product roles at B2B SaaS companies. I reply within a day.',
    photo: '/portrait.webp',
    photoAlt: 'Portrait of Abhishek Manjhi'
  },

  // Slugs of the two big project cards. Missing or unpublished slugs fall back
  // to the first projects in CMS order, so this can never empty the grid.
  featured: ['stratalite', 'pacific-coast-contracting']
};

// "Worked with" strip: only brands that also appear in the case studies.
// Logos (public/logos/) come from the Rsquare Figma "Logos" board, each kept on
// its own brand background. Without a `logo`, the strip shows a monogram + name.
export const companies = [
  { name: 'Stratalite', logo: '/logos/stratalite.png', url: 'https://stratalite.ca/' },
  { name: 'Pacific Coast Contracting', logo: '/logos/pcc.png', url: 'https://pacificcoastcontracting.ca/' },
  { name: 'Skooltag', logo: '/logos/skooltag.png', url: 'https://skooltag.com/' },
  { name: 'PCC Roofing', logo: '/logos/pcc-roofing.png', url: 'https://pccroofing.ca/' },
  { name: 'PCC Renovations', logo: '/logos/pcc-renovations.png', url: 'https://www.pccrenovations.ca/' },
  { name: 'PCC Decking', logo: '/logos/pcc-decking.png', url: 'https://pccdecking.com/' }
];

// Live sites per client, matched by slug prefix like brandIcons. The first link
// is the "Visit site" button; the rest show as extra links. A Website URL set
// in /admin for a case study takes priority over the first entry here.
export const projectLinks = {
  'pacific-coast-contracting': [
    { label: 'PCC', url: 'https://pacificcoastcontracting.ca/' },
    { label: 'PCC Roofing', url: 'https://pccroofing.ca/' },
    { label: 'PCC Decking', url: 'https://pccdecking.com/' },
    { label: 'PCC Renovations', url: 'https://www.pccrenovations.ca/' }
  ],
  stratalite: [
    { label: 'Stratalite', url: 'https://stratalite.ca/' },
    { label: 'Beta app', url: 'https://dev-app.stratalite.ca/' }
  ],
  skooltag: [{ label: 'Skooltag', url: 'https://skooltag.com/' }]
};

// Project covers: the live product in a browser (or phone) frame on a gradient
// in the client's colours, plus the one-line stat under the card title.
// Keyed by slug; a project without an entry keeps the generated stat cover.
export const projectCovers = {
  stratalite: {
    frame: 'browser',
    domain: 'app.stratalite.ca',
    shot: '/design/stratalite/screen-project-detail.webp',
    eyebrow: 'B2B SaaS · Live in beta',
    tone: 'dark',
    background: 'radial-gradient(120% 90% at 85% 110%, #ff6a2b 0%, #c2410c 28%, #1a0d07 62%, #0b0b0b 100%)',
    stat: '106 UAT cases run across 5 roles before beta'
  },
  'pacific-coast-contracting': {
    frame: 'browser',
    domain: 'pacificcoastcontracting.ca',
    shot: '/design/pacific-coast-contracting/live-umbrella-home.webp',
    eyebrow: 'Lead management · 4 brands',
    tone: 'light',
    background: 'radial-gradient(110% 80% at 15% 0%, #fffaf0 0%, #fbeec8 45%, #eccb73 100%)',
    stat: 'Replies in 30 min, not 4-8 hours, across 4 brands'
  },
  skooltag: {
    frame: 'phone',
    shot: '/design/skooltag/phone-onboarding.webp',
    eyebrow: 'E-commerce · Parent app',
    tone: 'light',
    background: 'radial-gradient(90% 70% at 50% 100%, #fff3b0 0%, #fbd53a 45%, #f4b400 100%)',
    stat: '85 screens handed off in 3 release phases'
  },
  'stratalite-platform-testing': {
    frame: 'browser',
    domain: 'dev-app.stratalite.ca',
    shot: '/design/stratalite/screen-quotes.webp',
    eyebrow: 'B2B SaaS · Product audit',
    tone: 'dark',
    background: 'radial-gradient(70% 90% at 95% 120%, rgba(255,90,31,.55) 0%, rgba(255,90,31,0) 70%), radial-gradient(110% 90% at 10% 0%, #2a2f3a 0%, #14161c 55%, #0b0b0b 100%)',
    stat: '237 flows mapped, 87 business questions raised'
  }
};

// Square brand icon for each project card, matched by the start of the
// project's slug (so "stratalite-platform-testing" also gets Stratalite's).
export const brandIcons = {
  stratalite: '/logos/stratalite-icon.png',
  'pacific-coast-contracting': '/logos/pcc-icon.png',
  skooltag: '/logos/skooltag-icon.png'
};

export const positioning =
  'Four years of shipping the parts of the product most PMs only spec — landing pages, growth systems, onboarding flows, internal tools — for contracting, hospitality, and SaaS clients across three continents. Now formalizing the discovery and prioritization work I was already doing, with AI tooling built into the workflow from day one.';

export const objection = [
  'Most PM candidates learn discovery and prioritization in a classroom. **I learned them at the point of client push-back** — defending a layout to a contractor who wanted five CTAs above the fold, or explaining why a broken conversion tag mattered more than the new landing page he’d asked for.',
  'Design is where product decisions get tested against a real user first. Every layout argument is a prioritization argument wearing different clothes.',
  'This transition isn’t a pivot away from that experience — it’s the next layer on top of it. I’ve been the closest thing to a product owner on funnels, design systems, and internal tools for clients who never had one. The work below is me making that role explicit, with the same rigor I’d bring to a shipped feature.'
];

export const requirements = [
  {
    competency: 'Discovery',
    claim: 'Data before opinion',
    evidence:
      'Ran a full cross-platform tracking audit across three GTM containers, GA4, Google Ads, and HubSpot before recommending a single design change. Found the conversion tag firing on page load, which meant every optimization decision for the prior quarter had been made on numbers that weren’t measuring anything.'
  },
  {
    competency: 'Prioritization',
    claim: 'Dependencies mapped, not guessed',
    evidence:
      'Built the Rooh design language system before the onboarding flow, and the onboarding flow before the marketing site. Not because it was more interesting — because 43 fields across five phases couldn’t be designed twice.'
  },
  {
    competency: 'Execution',
    claim: 'Ships without a hand-off',
    evidence:
      'Designs, builds, and instruments the work end to end. Figma to HTML to GTM to live. Nothing gets lost in translation to an engineer because there usually isn’t one.'
  },
  {
    competency: 'AI fluency',
    claim: 'In the workflow, not bolted on',
    evidence:
      'Running local models via Ollama for client work that can’t leave the machine, and using AI as a standing collaborator across research, copy, and QA. Currently building an AI audit tool for a live roofing-marketing client.'
  }
];

// Each item shows either `percent` (a project with a finish line) or `status`
// (ongoing work, where a bar would be a made-up number).
export const inProgress = {
  intro: 'What I’m working on now.',
  items: [
    {
      name: 'Design Lead at Rsquare Web Studio',
      status: 'Ongoing',
      detail:
        'Product work for clients in India, Canada, and the UK since January 2022; right now that’s Stratalite, a construction project and vendor platform, where I build user-flow boards for every role and QA the live product end to end.'
    },
    {
      name: 'RoofSpark AI Audit Tool',
      percent: 40,
      detail:
        'A scoped, shippable AI-powered marketing audit for a live roofing client. The interesting constraint: RoofSpark’s whole positioning is “Real people. Not software.” So the tool has to do the diagnosis without pretending to do the work a human does.'
    },
    {
      name: 'flowmap',
      status: 'Ongoing',
      detail:
        'A Chrome extension and Figma plugin I built that captures a live web app’s user flows into FigJam boards.'
    }
  ]
};

export const contact = {
  heading: 'Let’s talk',
  body: 'Open to AI-fluent PM roles at Series A–C product companies — B2B SaaS especially. The fastest way in is a direct message. I usually reply within a day.'
};

export const bio = {
  short:
    'Design Lead → Product Manager · Shipped growth systems, design systems, and a Figma plugin used worldwide',
  medium:
    'Abhishek Manjhi is a Design Lead in Mumbai moving into product management. Over four years he’s owned funnels, design systems, and internal tools for clients in Canada, the UK, and India — usually as the only person in the room thinking about the product. He ships his own tools, too.',
  long: [
    'I’m a Design Lead based in Mumbai, and for four years I’ve been the de facto product owner on work that never had a PM assigned to it. Contracting clients in Vancouver, a founding-cohort platform in London, a D2C brand in Delhi. In each case the brief arrived as “make this look better,” and the actual job turned out to be figuring out what to build and why.',
    'That gap is what pushed me toward product management. I already do discovery, prioritization, and stakeholder work; I just do it under a design title, without the vocabulary or the frameworks to make it legible to anyone outside the project.',
    'So I’m making it explicit: I’m moving into product management, and writing down what I learn along the way.'
  ]
};

export const microcopy = {
  workIntro:
    'Shipped product and growth work, written the way I’d write a spec — problem, constraints, decisions, and what the numbers did afterwards.',
  writingIntro:
    'Working notes on product, design systems, and the transition from design lead to PM.',
  workEmpty: 'No case studies published yet.',
  writingEmpty: 'Nothing written here yet — the first post is in drafts.',
  notFound: 'That URL doesn’t match anything on this site.',
  footer: 'SPEC-AM-01 — built and maintained by Abhishek Manjhi. React · Express · MongoDB.'
};
