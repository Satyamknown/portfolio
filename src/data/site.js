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
  linkedin: 'https://www.linkedin.com/in/abhishekmanjhi/',
  resume: '/resume.pdf'
};

// Homepage (flowing design) copy
export const home = {
  scribble: 'やあ!',
  headline: ['Hey,', 'making things make sense'],
  heroMeta: "hey I'm abhishek Manjhi,Mumbai, IN",
  handNote: 'design → pm',
  heroPara: {
    before: 'Design Lead → Product Manager. Founder-level owner of ',
    bold: 'funnels, design systems & internal tools',
    after:
      ' for four years — shipping the parts of the product most PMs only spec. Now making the product work explicit.'
  },
  availability: 'Open to opportunities — 2026',
  progressIntro: 'Three things built between July and October 2026, in public.',
  aboutStatement:
    "For four years I've been the de facto product owner on work that never had a PM assigned to it.",
  aboutPara:
    'Contracting clients in Vancouver, a founding-cohort platform in London, a D2C brand in Delhi — the brief arrived as "make this look better," and the job turned out to be figuring out what to build and why. Now I\'m making that explicit: an 84-day sprint, three things built in public.',
  contactHand: '話しましょう'
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

export const inProgress = {
  intro: 'Three things I’m building between July and October 2026, in public.',
  items: [
    {
      name: 'Discovery Doc',
      percent: 70,
      detail:
        'A full product discovery write-up, run the way a PM would run their first ninety days on an unfamiliar product.'
    },
    {
      name: 'RoofSpark AI Audit Tool',
      percent: 40,
      detail:
        'A scoped, shippable AI-powered marketing audit for a live roofing client. The interesting constraint: RoofSpark’s whole positioning is “Real people. Not software.” — so the tool has to do the diagnosis without pretending to do the work a human does.'
    },
    {
      name: 'This portfolio',
      percent: 95,
      detail: 'Spec’d, designed, and shipped as its own small product. You’re looking at it.'
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
    'I’m a Design Lead based in Mumbai, and for four years I’ve been the de facto product owner on work that never had a PM assigned to it. Contracting clients in Vancouver, a founding-cohort platform in London, a D2C brand in Delhi — in each case the brief arrived as “make this look better,” and the actual job turned out to be figuring out what to build and why.',
    'That gap is what pushed me toward product management. I already do discovery, prioritization, and stakeholder work; I just do it under a design title, without the vocabulary or the frameworks to make it legible to anyone outside the project.',
    'So I’m making it explicit. Over an 84-day sprint I’m building three things in public — a discovery doc, an AI audit tool for a live client, and this site — and writing down what I learn along the way.'
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
