// Design case study: RoohConnect. DRAFT, unpublished: the evidence is too thin to
// go live. Before publishing, settle with Abhishek: dates and team, "43 fields in 5
// phases" vs "25-step onboarding", what the Maze test showed, the 2 or 3 sequencing
// decisions, and which frames to export. Then set published: true and bump version.
export default {
  slug: 'roohconnect',
  version: 'v0.1',
  order: 4,
  published: false,
  title: 'RoohConnect',
  tagline: 'A matchmaking product for divorced, widowed and single-parent Muslims in the UK.',
  summary:
    'I scoped the MVP and designed its language system and onboarding for an audience generic matrimony products have let down.',
  role: 'Design Lead',
  client: 'RoohConnect, London',
  tools: ['Figma', 'Maze'],
  heroImage: '',
  heroAlt: 'RoohConnect cover: onboarding and profile screens',
  impact: [
    { value: '4', label: 'competitors studied in UK market sizing' },
    { value: '2 of 9', label: 'target niches chosen' },
    { value: '1', label: 'Maze test of the MVP' }
  ],
  sections: [
    {
      type: 'text',
      label: 'The problem',
      heading: 'A form that has to earn trust',
      body: `This audience has been let down by generic matrimony products. Asking many questions of someone coming back after a divorce or a loss is an act of trust, not a form. The real design work was the order: what to ask first, what to leave for later, and what never to ask.`
    },
    {
      type: 'text',
      label: 'Process',
      heading: 'Discovery, then the language system, then onboarding',
      body: `- **Discovery:** UK market sizing, 4 competitors, and 2 target niches chosen from 9.
- **Design language system first,** then the onboarding, then the marketing site, so the long onboarding was not designed twice.
- **A Maze test** of the MVP.`,
      layout: 'grid-2',
      images: [
        { placeholder: true, alt: 'The onboarding phases as a flow, one frame per phase' },
        { placeholder: true, alt: 'Design system foundations: colour, type, components' }
      ]
    }
  ]
};
