// Design case study: Stratalite. Numbers come from the "Outcomes evidence" list in
// second-mind/Team/Design track.md. Change a number there first, then here.
const img = (name) => `/design/stratalite/${name}.webp`;

export default {
  slug: 'stratalite',
  version: 'v1.6',
  order: 1,
  published: true,
  title: 'Stratalite',
  tagline: 'One project workflow for five roles that each see a different product.',
  summary:
    'A Vancouver B2B marketplace where property companies post work to vendors, and vendors complete it under the guidance of the company\'s managers. I owned the UX and UI from the first whiteboard session to the screens now live in beta, and designed the access model the whole product rests on.',
  role: 'Design Lead, Rsquare Web Studio',
  client: 'Stratalite, Vancouver',
  timeline: 'About 8 months, 2026. Live in beta.',
  team: "Me on UX and UI, with the client's team and the developers who built it",
  tools: ['Figma', 'FigJam', 'Google Sheets'],
  heroImage: img('screen-project-detail'),
  heroAlt: 'Manager view of a project: scope of work, location map, site visit booking and photos',
  impact: [
    {
      value: '5 × 13',
      label: 'roles by actions in the access model I designed, which became each role\'s navigation',
      note: 'With conditional rules such as "assigned property only"'
    },
    {
      value: '~210',
      label: 'frames designed across 5 role views, now live in beta',
      note: 'The IA has 13 sections and 118 screens; the frame count adds the dialogs and states drawn as full screens'
    },
    {
      value: '87',
      label: 'business questions I raised with the client while mapping the flows',
      note: 'Plus 30 corrections to the flow boards from cross-role checks, 29 applied'
    },
    {
      value: '35 → 18',
      label: 'input fields traced to dashboard outputs before any dashboard was drawn',
      note: '10 KPIs agreed with the client; the invoice amount alone feeds 6 of the 10 company-admin numbers'
    }
  ],
  sections: [
    {
      type: 'text',
      label: 'The problem',
      heading: 'Five roles, one project, and no shared view of it',
      body: `Property management companies ran projects over WhatsApp, email threads and phone calls. Quotes sat in inboxes, nobody could show what had been agreed, and a director could not see spend across properties.

Stratalite is a marketplace where property companies post work to vendors, and vendors complete it under the guidance of the company's managers. It puts the whole pipeline in one place: vendor onboarding, projects, shortlisting, site visits, quotes, milestones and payment.

The design problem was not the screens. It was that **five roles** (platform admins, company admins, company managers, independent managers and vendors) plus an accounts payable contact with no login all touch the same project, and each needs a different view of it.

> Get the access model wrong and every screen after it is wrong.`
    },
    {
      type: 'text',
      label: 'My role',
      heading: 'Design Lead, from the whiteboard to the live build',
      body: `- **Owned:** stakeholder map, personas, journey maps, information architecture, flows, about 210 designed frames, the access model, the design-vs-build review, and the acceptance testing before rollout.
- **Worked with:** the client's team at Stratalite on priorities and KPIs, and the developers who built the product.
- **Joined** before any screen existed, and stayed until the live build matched the design.`
    },
    {
      type: 'gallery',
      label: 'The product',
      heading: 'Shortlisting and quotes, on the manager\'s screen',
      layout: 'grid-2',
      images: [
        {
          src: img('screen-quote-drawer'),
          alt: 'Shortlisted vendor card with visit status, budget and quote number',
          caption: 'Shortlisted vendor: visit status, budget and quote on one card.'
        },
        {
          src: img('screen-quotes'),
          alt: 'Vendor quotation drawer with the quote, other quotations and an Accept Quote and Assign Project button',
          caption: 'Quote review: compare bids and accept without leaving the project.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 01',
      heading: 'Design the permissions before the screens',
      body: `Every role wanted something that clashed with another role:

- **Vendors** want the full brief before they commit. Managers don't want every vendor seeing a client's property.
- **Company managers** need to run projects, but only on the properties their company assigned them.
- **Independent managers** look like company managers, but they own their properties and have nobody above them.
- **Company admins** need oversight of every property and every manager.
- **Platform admins** run Stratalite itself and step in when a project goes wrong, but they should not start a client's work or bill for it.

So before any screen, I mapped **13 actions against 5 roles**, in 5 domains, at three levels: full, conditional or none. The design lives in the conditional cells. "Assigned property only", "submitted to them", "brief until shortlisted", "own only": each one is a rule a screen has to show, hide or explain.`
    },
    {
      type: 'matrix',
      label: 'The matrix',
      heading: '5 roles × 13 actions',
      body: `Rebuilt from my role-based access matrix. Read across a row to see who can do one thing; read down a column to see one role's product.`,
      data: {
        roles: ['Platform admin', 'Company admin', 'Company manager', 'Independent manager', 'Vendor'],
        groups: [
          {
            name: 'Property and project',
            rows: [
              { action: 'Create property', cells: ['none', 'full', 'none', 'full', 'none'] },
              {
                action: 'Create project',
                cells: ['none', 'full', { v: 'cond', note: 'assigned property only' }, 'full', 'none']
              },
              {
                action: 'View project',
                cells: [
                  'full',
                  'full',
                  { v: 'cond', note: 'assigned property only' },
                  'full',
                  { v: 'cond', note: 'brief until shortlisted' }
                ]
              }
            ]
          },
          {
            name: 'Vendor management',
            rows: [
              { action: 'Shortlist vendor', cells: ['full', 'full', 'full', 'full', 'none'] },
              { action: 'Remove company manager from project', cells: ['none', 'full', 'none', 'none', 'none'] }
            ]
          },
          {
            name: 'Quotations',
            rows: [
              { action: 'Create quotation', cells: ['none', 'none', 'none', 'none', 'full'] },
              {
                action: 'View quotation',
                cells: [
                  { v: 'cond', note: 'inside a project record' },
                  'full',
                  { v: 'cond', note: 'submitted to them' },
                  { v: 'cond', note: 'submitted to them' },
                  { v: 'cond', note: 'own only' }
                ]
              },
              {
                action: 'Accept quotation',
                cells: [{ v: 'full', note: 'on behalf of others' }, 'full', 'full', 'full', 'none']
              }
            ]
          },
          {
            name: 'Invoices',
            rows: [
              {
                action: 'Create invoice',
                cells: ['none', 'none', 'none', 'none', { v: 'full', note: 'inside "Mark as complete"' }]
              },
              {
                action: 'View invoice',
                cells: [
                  { v: 'cond', note: 'inside a project record' },
                  'full',
                  { v: 'cond', note: 'submitted to them' },
                  { v: 'cond', note: 'submitted to them' },
                  { v: 'cond', note: 'own only' }
                ]
              }
            ]
          },
          {
            name: 'Platform and admin',
            rows: [
              { action: 'User management', cells: ['full', 'full', 'none', 'none', 'none'] },
              {
                action: 'Create reports',
                cells: ['none', 'full', { v: 'cond', note: 'own projects' }, 'full', 'none']
              },
              {
                action: 'Put project on dispute',
                cells: [{ v: 'full', note: 'on behalf of others' }, 'full', 'full', 'full', 'none']
              }
            ]
          }
        ]
      }
    },
    {
      type: 'text',
      label: 'What each role sees',
      heading: 'The matrix became the navigation',
      body: `Each role gets its own sidebar and its own view of the same project. The matrix decided what goes in each one:

- **Company admin:** the portfolio. Spend across properties, every manager, and the power to assign or remove a manager from a project.
- **Company manager:** only the properties assigned to them, with the quotes and invoices submitted to them.
- **Independent manager:** a full owner. Creates their own properties and projects, with no company above them.
- **Vendor:** briefs, and only their own quotes and invoices. The property details and the manager's contact unlock after shortlisting. The vendor is the only role that creates an invoice, inside "Mark as complete".
- **Platform admin:** runs the platform and can step into any project, its quote and its invoice included, but never creates a property, a project or an invoice.`,
      layout: 'grid-3',
      images: [
        {
          src: img('role-pmc-admin'),
          alt: 'Company admin dashboard: all properties, assigned properties, verified and unverified managers',
          caption: 'Company admin: the whole portfolio and every manager.'
        },
        {
          src: img('role-manager'),
          alt: 'Manager dashboard: current projects, site visits, messages and final bids',
          caption: 'Manager: their own projects, site visits and bids.'
        },
        {
          src: img('role-vendor-interest'),
          alt: "Vendor project view with a prompt to follow up with the manager after submitting interest",
          caption: 'Vendor: a brief to act on, with the details still locked.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 02',
      heading: 'Split "manager" into two roles at sign-up',
      body: `We first treated every manager as one type. Writing the personas from the client team's requirements showed they were not: independent managers create their own properties, company managers work only on properties an admin assigns.

**Decision:** two roles, chosen when the account is created, so permissions are set from the first login instead of toggled later.

**Trade-off:** two onboarding paths and two permission sets to design and test. Shared steps, such as running a project and paying for it, were designed once for both.

**Why it was worth it:** a cleaner IA and no permission surprises halfway through a flow.`
    },
    {
      type: 'text',
      label: 'Testing the build',
      heading: 'Tested across roles, not one screen at a time',
      body: `A permission model is only right if every role sees the right thing at the same moment. So before rollout I ran user acceptance testing (UAT) the way the product is used: **vendor and manager accounts working the same test project side by side**, so each hand-off from interest to payment was checked from both ends.

| Pass | Date | Test cases | Passed | Flagged | Needed a retest |
|---|---|---|---|---|---|
| Vendor side | 18 Aug | 43 | 31 | 6 | 6 |
| Manager side | 18 Aug | 21 | 17 | 2 | 2 |
| Manager and company admin | 20 Aug | 42 | 38 | 4 | 0 |
| **Total** | | **106** | **86** | **12** | **8** |

"Needed a retest" means the result was inconclusive, so those 8 cases count as neither passed nor flagged. Issues were logged on flagged cases and on some that passed: 20 in all, and **15 distinct** once repeats across passes were merged, **6 of them high priority**, each with a priority and an owner action. The clearest: inviting a manager showed "Invitation sent!", but no email arrived, so the new manager could never log in. The screen said success while the outcome failed.

Later I mapped the live product one role at a time: **237 flows** across 5 roles and **73 scripted lifecycle tests**, with each role signed in to its own browser on the same records. That walk produced **30 corrections** to the flow boards, 29 of them applied, and **87 business questions** I took back to the client.`
    },
    {
      type: 'decision',
      label: 'Decision 03',
      heading: 'Vendors earn the brief',
      body: `Showing full details to every vendor created noise, and unqualified vendors applied to everything.

**Decision:** vendors submit interest first. Property details and the manager's contact unlock only after shortlisting.

**Trade-off:** vendors commit on less information, so the public brief still had to be enough to decide on.

**Why:** managers only deal with vendors who opted in and were picked.`,
      layout: 'grid-2',
      images: [
        {
          src: img('screen-interested'),
          alt: 'Manager project view listing interested vendors with their ratings and a Shortlist button',
          caption: 'Manager side: interested vendors, ready to shortlist.'
        },
        {
          src: img('screen-shortlist'),
          alt: 'Manager project view after shortlisting, with the vendor listed under site visits',
          caption: 'After shortlisting: the vendor moves into site visits, before the quote deadline.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 04',
      heading: 'Put the invoice inside "Mark as complete"',
      body: `Completion and payment were two separate flows. The vendor marked the job done, the manager approved it, and then the manager chased the invoice.

**Decision:** the vendor adds the invoice number, file, amount and billing method inside "Mark as complete". The manager reviews the work and the invoice together, then confirms or raises an issue. One action closes the work and starts payment.

**Trade-off:** a heavier last step. A vendor can't mark a job done until the invoice is ready.

**Why:** payment data is captured once, at the right moment. That one amount later fed 6 of the 10 company-admin dashboard numbers.`,
      layout: 'grid-2',
      images: [
        {
          src: img('mark-complete'),
          alt: "Vendor's project page with the Mark project as complete button and a note to use it only after all tasks are finished",
          caption: 'Design mockup with sample data: the vendor\'s "Mark project as complete", with a note to use it only once every task is done.'
        },
        {
          src: img('proceed-with-invoice'),
          alt: 'All tasks ticked, and a Proceed with Invoice card on the vendor project page',
          caption: 'With every task ticked, the same page asks the vendor to proceed with the invoice.'
        },
        {
          src: img('screen-completed'),
          alt: 'Project marked complete, with the invoice ready to review and confirm',
          caption: 'Design mockup with sample data: the manager sees the completed project with its invoice attached.'
        },
        {
          src: img('screen-payment'),
          alt: 'Payment completed view with payment, invoice and quotation details in one place',
          caption: 'Design mockup with sample data: payment, invoice and quote close on the same record.'
        }
      ]
    },
    {
      type: 'decision',
      label: 'Decision 05',
      heading: 'Design the dashboards from the data, not the other way round',
      body: `Before any dashboard, I listed **35 input fields across 6 forms**, traced each one to **18 dashboard outputs**, and agreed the priority numbers with the client. Every one of the 10 KPIs has a source field and a reason.

For managers, a "Next step" column turns each status into a plain action:

> Status tells you where you are. Next step tells you what to do.`,
      layout: 'grid-2',
      images: [
        {
          src: img('kpi-pmc-annotated'),
          alt: 'Company admin dashboard annotated with the source field behind each number',
          caption: 'Company admin dashboard, annotated: every number traced to its source.'
        },
        {
          src: img('kpi-field-matrix'),
          alt: 'Field matrix mapping form inputs to dashboard outputs',
          caption: 'The field matrix: one field, the invoice amount, feeds 6 of 10 outputs.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Process',
      heading: 'Map the system, then design inside it',
      body: `- **Stakeholder map:** 4 rings and 5 direct users, to decide what the platform owns and what it only connects to.
- **Personas and journeys:** 4 personas and 11 journey-map boards. The personas were working assumptions built from the client team's requirements, not interviews. The transactions board found a party with no account at all: accounts payable, who pays on a shared link.
- **Information architecture:** 13 sections, 22 groups and 118 screens, mapped before design.
- **Flows as the spec:** three flow boards with decision points, business rules, and open questions written on the board for the client.
- **Design vs build:** about 200 captures of the live app beside the designs. 2 flows approved as built, 3 flagged for structural differences.`,
      layout: 'grid-2',
      images: [
        {
          src: img('stakeholder-map'),
          alt: 'Stakeholder map in four rings around the platform',
          caption: 'Stakeholder map: drawn before any screen.'
        },
        {
          src: img('information-architecture'),
          alt: 'Part of the information architecture tree',
          caption: 'Information architecture: 13 sections, 118 screens.'
        },
        {
          src: img('kpi-manager-annotated'),
          alt: 'Manager dashboard annotated with data sources',
          caption: 'Manager dashboard, annotated before build.'
        }
      ]
    },
    {
      type: 'text',
      label: 'Design system',
      heading: 'The honest part',
      body: `There was no formal design system. We put shipping screens ahead of foundations, and components grew sprint by sprint. That caused visual drift between screens and friction at handoff. It is the first thing I would change.`
    },
    {
      type: 'text',
      label: "What I'd do next",
      heading: 'Next time',
      body: `- **Start a component library and shared tokens in sprint 1.**
- **Write acceptance criteria for what happens after the screen,** such as "the invite email arrives". The worst issues were on screens that looked right.
- **Agree how to measure each decision before beta,** such as time from completion to payment, so the beta can prove or disprove it.`
    }
  ]
};
