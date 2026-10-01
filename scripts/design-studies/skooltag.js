// Design case study: Skooltag. Numbers come from the "Outcomes evidence" list in
// second-mind/Team/Design track.md. Placeholders mark frames still to export.
const img = (name) => `/design/skooltag/${name}.webp`;

export default {
  slug: 'skooltag',
  version: 'v1.1',
  order: 3,
  published: true,
  title: 'Skooltag',
  tagline: 'A uniform shop that had sold only in person since 1989, moving online with an app parents can trust.',
  summary:
    'A Delhi NCR school-uniform retailer was going online. I built the brand and the component library from zero, designed the parent app through 5 iterations, and handed off 85 screens with a clickable prototype.',
  role: 'UI/UX Designer, Student Junction',
  client: 'Skooltag, Delhi NCR',
  timeline: '2021 to 2022',
  team: 'Two designers (me and one other) and three developers. No product manager, so I also coordinated the graphic designer, the motion designer and the developers.',
  tools: ['Figma'],
  heroImage: img('hero'),
  heroAlt: 'Skooltag app home screens on a yellow background: uniform categories, packages and recommended items',
  impact: [
    { value: '5', label: 'design iterations with the client to settle the parent app' },
    { value: '85', label: 'screens handed off in 14 flows, from login to cancellation' },
    {
      value: '665',
      label: 'interactions in a 62-screen prototype',
      note: 'Used to walk the client and developers through the journey before build'
    },
    {
      value: '15',
      label: 'page SRS for the back office',
      note: 'Admin, store, delivery and school roles, in 3 phases'
    }
  ],
  sections: [
    {
      type: 'text',
      label: 'The problem',
      heading: 'Competing with a shopkeeper who knows the family',
      body: `In the shop, a parent names the school, the class and the house, and the shopkeeper hands over the right package in about 20 minutes. No browsing, no guessing.

Online, the same parent met a generic store: search for the school, scroll dozens of products, guess a size, get the wrong shirt, send it back. Competitors were already online.

> The app was not competing with big marketplaces. It was competing with a shopkeeper who has known the family for years.`
    },
    {
      type: 'text',
      label: 'My role',
      heading: 'Brand, app and back office, from zero',
      body: `- **Owned:** the brand, the component library, the parent app through 5 iterations, the website assets, and the back-office requirements and handoff.
- **Designed for** the parent, not the student: a parent of two children at different schools who wants the right uniform before term starts. Her two worries: will it fit, and will the school accept it.
- **No research budget.** Decisions drew on the client's years of talking to parents in the shop and on ordering flows I studied. The persona was a working assumption, not a finding.`
    },
    {
      type: 'decision',
      label: 'Decision 01',
      heading: 'Ask what the shopkeeper asks',
      body: `Onboarding collects the school, then the child's name, class, gender and house: the same things a parent says at the counter. The package is ready before the home screen loads, so shopping becomes confirming, not searching.

**Why:** every extra choice in a purchase flow is a chance to drop off.`,
      images: [
        {
          src: img('onboarding'),
          alt: 'Onboarding screens: choose the school, then add the child\'s details',
          caption: 'Onboarding starts with the school, like the conversation at the counter.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 02',
      heading: 'One tap to switch child',
      body: `The active child sits as a "Buying for" chip at the top of every screen. Switching reloads the packages, the recommended items and the house colours.

**Why:** most parents buy for more than one child, often at different schools.`,
      images: [
        {
          src: img('bundle-package'),
          alt: 'Three app screens: the Buying for chip, the Select profile sheet with two children, and a school package with a coupon applied',
          caption: 'The "Buying for" switcher and a school package, set up for the selected child.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 03',
      heading: 'Handle sizing at three points',
      body: `A size chart with international conversions, a warning on important items that does not block the purchase, and a "Did you get everything right?" check before checkout.

**Why:** sizing, more than price, was the worry that stops parents buying uniforms online.

After the order mattered as much: tracking, item-level cancellation, invoice download, and a replacement flow that will not accept the same size again.`,
      images: [
        {
          src: img('replacement-flow'),
          alt: 'The replacement flow: item selection, reason codes, size re-selection and confirmation',
          caption: 'Replacement: a reason, a new size, and a block on re-picking the same one.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Process',
      heading: 'Flows first, then five rounds with the client',
      body: `- **Early flows:** 7 flows, ending in a final flow for the app.
- **5 named iterations** with the client, with reference ordering flows studied along the way.
- **Website IA:** 45 nodes for the parent site and the school-partnership side.
- **Back office:** 3 journey maps and 272 steps of flows for admin, store and delivery roles, plus a 15-page SRS, because the app was only half the product.`,
      images: [
        {
          src: img('backend-flow-store-view'),
          alt: "Back-office flow for the admin's store view, with open questions to the client beside it",
          caption: 'Back-office flow: the admin\'s store view, with client questions pinned beside each step.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Design system',
      heading: 'A brand and a component library, from zero',
      body: `There was no brand or design system to inherit, and a developer was already shipping. I built the brand (logo, colours, asset kit) and the component library: buttons and inputs, product cards, the profile switch, headers, chips, a colour palette with status colours (yellow arriving, green delivered, red cancelled), a type scale in two fonts, elevation levels and spacing tokens.`
    },
    {
      type: 'gallery',
      label: 'Final screens',
      heading: 'Handed off as one marked page',
      body: '85 mobile screens in 14 flows, each journey grouped from login to cancellation, with a 62-screen prototype on top.',
      images: [
        {
          src: img('web-app-handoff'),
          alt: 'Overview of the web app handoff page: 14 flow groups of mobile screens',
          caption: 'The app handoff page: one group per journey.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Outcome',
      heading: 'The brand is on the shop',
      body: `The brand now runs on Skooltag's shop sign and the posters out front. The app design, website assets, prototype and back-office specs went to the three developers. The build was theirs, so I have no launch numbers to report.`,
      layout: 'grid-2',
      images: [
        {
          src: img('storefront'),
          alt: 'The Skooltag shop front with the new sign',
          caption: 'The Skooltag sign on the shop.'
        },
        {
          src: img('journey-map-admin'),
          alt: 'Admin journey map for the back office',
          caption: 'Admin journey map, one of three for the back office.'
        }
      ]
    },
    {
      type: 'text',
      label: "What I'd do next",
      heading: 'Next time',
      body: `- **Test onboarding and sizing with even five parents** from the client's shops. It would have cost very little.
- **Give the pre-built package its own screen.** The home screen was too dense.
- **Fix a slip I caught myself:** "FREE Delivery" shown next to "None". Copy is design.
- **Write goals and success measures with the client** before the first screen.`
    }
  ]
};
