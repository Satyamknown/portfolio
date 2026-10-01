// Design case study: AI in my design workflow (Stratalite flow mapping, design QA
// and flowmap). Numbers come from the "Outcomes evidence" list in
// second-mind/Team/Design track.md and from apm-resume/projects/stratalite-platform-audit.md
// (section 2, verified numbers). flowmap facts come from ~/Downloads/flowmap
// (README.md, FLOWMAP.md, LIVE.md). Change a number at its source first, then here.
const img = (name) => `/design/ai-design-workflow/${name}.webp`;

export default {
  slug: 'ai-design-workflow',
  version: 'v1.0',
  order: 5,
  published: true,
  title: 'AI in my design workflow',
  tagline: 'Directing AI agents to map and check a live five-role product, and building the tool that turns screens into flow boards.',
  summary:
    'On Stratalite I used AI browser agents to map every flow of the live product and test whole project lifecycles across roles. I set the rules the agents worked to, kept the judgement calls and the risky actions for myself, and built flowmap, a tool that captures a live web app and lays each screen out as a FigJam flow board.',
  role: 'Design Lead, Rsquare Web Studio',
  client: 'Stratalite, Vancouver',
  timeline: 'September 2026, alongside the Stratalite beta',
  team: 'Me, directing AI browser agents (Claude, and Codex for one August test pass). The client\'s product owner answered the open questions.',
  tools: ['FigJam', 'Figma plugin API', 'Claude Code', 'AI browser agents', 'Playwright', 'Chrome extension (flowmap)'],
  heroImage: img('hero'),
  heroAlt: 'The flowmap canvas: captured screens of the vendor flow laid out as cards in labelled groups, joined by arrows',
  impact: [
    {
      value: '237',
      label: 'flows mapped on 5 FigJam boards, one board per role',
      note: '43 + 58 + 56 + 52 + 28, each board organised by that role\'s sidebar'
    },
    {
      value: '73',
      label: 'scripted lifecycle tests, run with AI browser agents across 3 roles',
      note: 'I approved every test that changed or deleted data'
    },
    {
      value: '30',
      label: 'corrections to an earlier flow board, found by comparing roles on the same record',
      note: '29 applied'
    },
    {
      value: '340 → 106',
      label: 'notes on the company admin board after I set the voice rules',
      note: 'Short notes about the product, not about how the board was made'
    }
  ],
  sections: [
    {
      type: 'text',
      label: 'The problem',
      heading: 'Five products in one, and documents that disagreed',
      body: `Stratalite is live in beta, and each of its five roles sees a different product: platform admins, company admins, company managers, independent managers and vendors each get their own sidebar, rules and view of the same project.

The documents describing it were written one role at a time. They did not always agree with each other, or with the live build. A flow board that does not match the product is worse than no board, because the team designs and builds against it.

The old way to fix that was slow: screenshot every screen by hand, copy the field labels into a document, then build the FigJam board box by box. For five roles that was weeks of clicking before any design thinking happened.

> I wanted the clicking done by machines, so my time went on what the flows meant.`
    },
    {
      type: 'text',
      label: 'My role',
      heading: 'Design Lead, setting the rules the agents worked to',
      body: `- **I owned:** the scope, the shape and voice of every board, what counted as a problem, every risky action, and the review of what the agents produced.
- **The agents did:** the clicking, a log of every click, field and system response, and first drafts of the boards from content files I could audit.
- **I built:** flowmap, the capture tool, including its canvas and its Figma plugin.
- **Judged by harm:** a problem was something that could hurt someone's work, money or records. A slightly odd button was not.`
    },
    {
      type: 'decision',
      label: 'Decision 01',
      heading: 'Organise every board by the sidebar the user sees',
      body: `For each role the agent first listed the live sidebar: every option, the screen it opens, every control and every dialog. Each board then has one block per sidebar tab, and every hand-off between flows says why the user moves on, not just where.

**Trade-off:** edge cases and defects stay off the board and go into separate registers, so a reader has to open a second document to see what is broken.

**Why:** the board is read by the client as a map of the product. Defects scattered over it bury the flow.`,
      images: [
        {
          src: img('board-sidebar-blocks'),
          alt: 'Top of the platform admin flow board: a sidebar lane on the left with arrows into the Dashboard, Projects and New Profiles blocks',
          caption: 'The sidebar lane on the left; each tab opens its own block of flows.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 02',
      heading: 'Write the board grammar down, then make it a check',
      body: `AI drafts drift. Left alone, they write paragraphs in boxes and engineering notes on stickies. So I set the grammar:

- Boxes hold screens and states, in 2 to 5 words.
- A click is an arrow label, not a box.
- Form fields sit inline as one blue shape per form.
- Stickies are only for the product's own words.
- Flows sit side by side in lanes. The first platform admin board was a single 58,534 px column.
- No routes, no internal names, and no notes about how the board was made.

These rules became audits in the board generators. The platform admin generator refuses to write while any audit fails.

**Trade-off:** setting up the audits took time before the first board appeared.

**Why:** a rule the agent can check is a rule it keeps. On the company admin board, notes dropped from 340 to 106.`,
      layout: 'grid-2',
      images: [
        {
          src: img('board-section-share'),
          alt: 'Flow section: a decision on which control is used, a blue input shape for the share form, and yellow stickies quoting the product\'s own messages',
          caption: 'Clicks on arrows, the share form inline in blue, product copy on yellow stickies.'
        },
        {
          src: img('board-section-incomplete'),
          alt: 'Flow section for an incomplete project: the controls available, a red error state and the vendor resubmitting',
          caption: 'An incomplete project: each control, the error it hits, and the way back.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 03',
      heading: 'Compare the same record from every role',
      body: `An earlier board, built from walking one role, claimed three serious problems, including that finished projects had no edit lock. I had an agent reopen the same projects as the manager who owned them and compare every control, button by button.

All three claims were wrong. The controls existed, locked for that role. A single-role walk cannot tell "missing from the product" from "missing for this role", and that difference is the whole access design.

**Decision:** every screen is now checked against the roles already documented, with four questions, and corrections go back to the older boards.

**Result:** 30 corrections to that board, 29 applied, and one real gap the single-role walk had missed.`,
      layout: 'grid-2',
      images: [
        {
          src: img('test-awarded'),
          alt: 'A dated test project in the Awarded state, with the assigned vendor and the accepted quote',
          caption: 'One dated test record, awarded to a vendor.'
        },
        {
          src: img('test-paid'),
          alt: 'The same test project after payment, showing Payment Completed and Payment Successfully Completed',
          caption: 'The same record after payment, checked from each role in turn.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 04',
      heading: 'Keep the judgement calls human',
      body: `Each role had its own signed-in browser on shared test records, so one action could be checked from every side. The agents ran 73 lifecycle tests, from posting a job to paying for it. What stayed with me:

- **Risky actions.** Agents paused and asked before anything that changed or deleted data or sent an email. I approved suspensions, deletes of throwaway paid projects, and the email-sending steps.
- **Sign-in.** I typed the passwords myself.
- **Business calls.** Gaps that needed one went to the client as 87 questions, not as fixes I had already picked.
- **UX judgement.** The agents found that the screens approving completion and sending an invoice never show the amount. Whether that matters, and how much, was my call.

**Trade-off:** slower runs. An agent waiting on my approval is an agent not clicking.

**Why:** a confident wrong claim costs more than a slow right one, as Decision 03 showed.`
    },
    {
      type: 'decision',
      label: 'Decision 05',
      heading: 'Build flowmap, then redesign it twice',
      body: `flowmap captures a live web app screen by screen and lays the screens out as a FigJam flow board, with real frames and connectors. It replaced hand-built screenshot boards.

- **Version one** was a crawler that only wrote boards. Wrong job. My existing board had to be the input: walk the product against it and report where they disagree.
- **Version two** let an agent walk the product on its own. Matching its clicks to my board was brittle, and one vendor board had 721 steps, over a thousand model calls to walk.
- **Version three** puts me in the driver's seat. I browse, press Capture, and the extension takes a full-page shot. I arrange the cards on a canvas, and drawing an arrow is how screens get linked. A Figma plugin builds the board. Once set up, no model is involved at all.

**Trade-off:** I still click through every screen myself.

**Why:** no wrong click ever reaches the board, and a designer decides the flow, not a crawler. Every canvas action is reachable by pointing, with the keyboard only as a shortcut. FigJam, not Figma Design, because only FigJam has connectors.`,
      images: [
        {
          src: img('canvas-overview'),
          alt: 'The whole flowmap canvas for the vendor flow, with grouped screen cards and the tool bar: Select, Hand, Screen, If/else, Connect',
          caption: 'The whole canvas, with the tool bar: Select, Hand, Screen, If/else, Connect.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Process',
      heading: 'Map, draft, test, compare, correct',
      body: `- **Sidebar maps first,** one per role: every option, screen, control and dialog.
- **Boards from content files,** run through a layout engine and the house-style audits before anything reached FigJam. On one board, 16 agents pulled content, 16 checked it and 3 critiqued it.
- **Lifecycle tests on the development site,** each role in its own browser, on dated test records, with a click log as the ground truth.
- **Cross-role checks** on every screen, with corrections sent back to older boards.
- **Review comments** from the team applied in place, never by redrawing a board from scratch.
- **Outside Stratalite,** I built and published ExportKit, a Figma Community plugin that exports WebP and AVIF with vector detection, using AI-assisted development.`
    },
    {
      type: 'gallery',
      label: 'Final boards',
      heading: 'Five boards, one per role',
      body: '237 flows across the platform admin, company admin, company manager, independent manager and vendor boards, each organised by that role\'s sidebar.',
      images: [
        {
          src: img('board-platform-admin'),
          alt: 'Overview of the platform admin flow board with 13 numbered sidebar blocks',
          caption: 'The platform admin board in full: 43 flows, one block per sidebar tab.'
        }
      ]
    },
    {
      type: 'text',
      label: "What I'd do next",
      heading: 'Next time',
      body: `- **Record who checked what.** The agents wrote most of the logs. I should have marked which findings I re-checked by hand.
- **Compare roles from day one.** The single-role walk produced confident claims that were wrong.
- **Agree the business rules first.** Many gaps were really open questions a one-page rules sheet would have settled.
- **Make flowmap shareable with the team,** after deciding access control and storage. The screenshots are a client's product behind a login, so that is not a decision to rush.`
    }
  ]
};
