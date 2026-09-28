// Skooltag case study (PM framing). Facts sourced from the Figma file
// 3tbYHEmj1wddRierSmyBfl and /Users/abhishek/Downloads/apm-resume/projects/skooltag.md.
// Done at Student Junction, 2021–22 (confirmed by Abhishek on 2026-09-28), not as a Rsquare client.

export default {
  slug: 'skooltag',
  title: 'Skooltag',
  version: 'v2.5',
  summary:
    'A school-uniform retailer that had sold offline in Delhi NCR since 1989 was moving online, and the team had no product manager. Alongside design, I wrote the backend requirements, split the build into phases, mapped the back office for three operational roles and organised the developer handoff.',
  role: 'UI/UX designer · brand, app & back office',
  client: 'Skooltag · Delhi NCR',
  year: '2021-22',
  tags: ['Requirements (SRS)', 'Phasing & roadmap', 'Stakeholder management', 'Developer handoff', 'E-commerce'],
  metrics: [
    { value: '15-page', label: 'SRS' },
    { value: '3', label: 'release phases' },
    { value: '272', label: 'back-office flow steps' },
    { value: '85', label: 'screens handed off' }
  ],
  coverImage: '/case-studies/skooltag/cover.webp',
  order: 2,
  published: true,
  body: `## At a glance

- **The work:** take a 35-year-old offline uniform business online: a parent ordering app, a school-partnership website, and a back office for admins, stores, delivery agents and schools.
- **Team:** two designers (me and one other) and three developers, at Student Junction. There was no product manager.
- **My part:** the brand from zero, the app design through 5 iterations, and the back-office requirements, phasing and handoff.
- **What exists:** the brand, now on Skooltag's shop sign and posters; a 15-page SRS, a three-phase plan with estimates, 3 journey maps, 272 steps of back-office flows, 85 app screens in 14 flows, and a 62-screen prototype.
- **Scope:** the design of the app and the back office, the website assets, and the brand. The build was the developers' work, so there are no launch numbers here.

## The business problem

Skooltag has sold school uniforms in Delhi NCR since 1989, only offline until this project. In the shop, a parent names the school, class and house, and the shopkeeper hands over the right package in about 20 minutes. Online, the same parent meets a generic store: search for the school, scroll dozens of products, guess a size, get the wrong shirt, send it back. Competitors were already online.

The online version had to serve four groups at once:

- **Parents**, who want the right set before term starts, often for more than one child.
- **Schools**, which partner with Skooltag and earn a commission on sales.
- **Stores**, which hold stock, take walk-in orders and dispatch online ones.
- **Delivery agents**, who carry orders and collect cash.

So this was a customer app plus a back office that had to hold online and offline sales, stock across stores, and school commissions in one place.

## The brand, out in the world

There was no design system or brand to inherit. I built Skooltag's brand from zero, the logo, colours and the asset kit I handed over, while a developer was already shipping. This is a Skooltag factory outlet today: the brand on the shop sign, and on the school-shoe posters out front.

![A Skooltag factory outlet: the yellow Skooltag sign above the shop, with school bags hanging below and co-branded school-shoe posters on the pavement](/case-studies/skooltag/storefront.webp "A Skooltag factory outlet: the brand on the shop sign and on the shoe posters out front.")

## No PM on the team: what I took on

There was no product manager, so I coordinated the graphic designer, the motion designer and the developer while also designing. Each needed something different from every deliverable. In practice I took on the work a PM would normally own:

- I wrote the backend requirements before any back-office screens existed.
- I split the build into phases and attached estimates.
- I mapped how each back-office role would move through the system.
- I put open questions to the client in writing, next to the flow each one affected.
- I organised the Figma file so developers could find the final screens.

The customer app and the website were shared design work with the second designer. The build belonged to the three developers.

## Writing the requirements

I wrote a 15-page Software Requirement Specification for the backend. It starts with purpose and scope, then sets out functional and non-functional requirements for four modules:

| Module | What it covers |
|---|---|
| Admin | inventory, sales, stores, stock assignment, analytics, packages and coupons, schools, users, notifications, security (11 sections) |
| Store Manager | inventory, online and offline orders, sales, cash management, delivery management, staff |
| School Reporting | sales overview, commission, item and date reports, custom reports, analytics |
| Delivery Agent | profile, assigned orders, tracking, cash, performance, alerts (8 sections) |

The SRS and the flows between them define five system roles: Admin, Store Manager, Delivery Agent, School (view-only) and Parent.

The business rules are the most useful part, because that's where the offline business shows up:

- **School commission.** The system works out the commission owed to each school, per item or package, and shows it in the school's report.
- **Primary-store routing.** Each school has a primary store. Online orders for that school go to it automatically.
- **OTP handshakes.** Stock moves from the admin to a store only after the manager enters an OTP shown on the admin dashboard. Deliveries are confirmed by OTP. A delivery agent's cash is cleared only when the manager gives them an OTP.
- **Read-only access for schools.** Schools get a view-only dashboard through secure links, and view-only users are verified by OTP.
- **One order list.** Walk-in "Fast Checkout" orders and online orders appear in the same tracking view.

Non-functional requirements cover encryption, role-based access, audit logs and CSV, PDF and Excel export. The SRS and plan also name the KPIs to instrument: average order value, return rate, customer lifetime value, cart abandonment, failed versus successful checkouts, inventory turnover, delivery completion rate and average delivery time.

![The first two pages of the Skooltag backend SRS: introduction, scope and admin inventory requirements](/case-studies/skooltag/srs-pages.webp "The first two of the SRS's 15 pages: the scope sets the four modules, and each requirement lists its fields, rules and alerts.")

## Phasing the build

A back office for four roles is a lot to build at once, so I split it into Phase 1, Phase 2, Phase 3 and an Extra bucket, across the Admin, Store Manager and Delivery Agent dashboards. The plan carries two estimates: 1.5 months for backend design and 5 months for backend development.

| Phase | Admin | Store Manager | Delivery Agent |
|---|---|---|---|
| Phase 1 | 9 feature groups, 33 items: insights, inventory, multi-store and school management (with commission), order status, payments, activity logs, notifications, support tools, CMS | 4 groups, 13 items: sales analytics, order tracking, online and offline order processing, export | none |
| Phase 2 | alerts; access control with 2FA and audit trails | order processing, delivery oversight with cash clearance, CRM and loyalty, alerts, 2FA | none |
| Phase 3 | user management; package and offer creation | cash-flow management; permissions granted by the admin | the delivery agent web app |
| Extra | none | delivery assignment, route optimisation, delivery performance | none |

Phase 1 holds what the business needs to take an order, allocate stock to stores, handle payments, pay schools their commission and see what's selling. Three things went to later phases: the delivery agent app, CRM with loyalty programmes, and two-factor authentication. Undecided items, such as trend analysis, were marked TBD rather than forced into a phase.

One gap: the Phase 1 tables have columns for design time and development time per feature. They were set up but never filled in, so the two top-level estimates were the only numbers in the plan.

![Phase 1 of the plan, showing the 5-month development and 1.5-month design estimates above the admin feature table](/case-studies/skooltag/phase-1-plan.webp "Phase 1 of the plan: the two estimates sit at the top, and the per-feature time columns on the right are still empty.")

![The Phase 2 table with columns for Admin, Store Manager and Delivery agent](/case-studies/skooltag/phase-2-deferred.webp "Phase 2 held 2FA and CRM. The Delivery agent column is empty; the agent app sits in Phase 3.")

## Mapping the back office

**Journey maps.** I made three maps, each with rows for stages, user actions, touch points and pain points:

- a school admin handling a low-stock alert (7 steps)
- a school admin managing inventory (8 steps)
- an admin monitoring stock revenue (10 steps)

The revenue map lists pain points such as inconsistent data between offline and online sales, and unclear revenue-sharing details. Both correspond to requirements in the SRS: one order list across channels, and commission reporting per school.

**User flows.** I flowed the Admin, Store Manager and Delivery Agent sides in 33 sections and 272 steps. Admin alone has 20 sub-sections. The delivery agent side covers OTP login, a daily dashboard and the cash-clearance loop with the manager.

**Client questions, logged in place.** Where a step needed a decision that wasn't mine, I left the question on a sticky note beside it, so the client could answer with the flow in front of them:

- Should the admin get read and write access to a manager's dashboard, or only read and delete?
- Does the admin need to see a delivery agent's clearance record?
- In an emergency, can stores allocate stock to one another?
- Is purchase-bill upload needed, or should it work another way?

I also asked the client for inputs the design depended on: real school data for testing, the full package data for each school, and school logos.

![Admin journey map for monitoring stock revenue, with stages, user actions, touch points and pain points](/case-studies/skooltag/journey-map-admin.webp "One of three back-office journey maps. Each of its 10 steps has a pain point, and several match requirements in the SRS.")

![Backend user flow for the admin's store view, including stock allocation by OTP and primary-store settings](/case-studies/skooltag/backend-flow-store-view.webp "The admin's store view: the OTP stock handshake and primary-store routing drawn as steps, with open questions to the client pinned beside them.")

## The customer app, briefly

The parent app was shared design work. My requirements job there was writing edge cases down as screens, so developers didn't have to guess:

- **Onboarding** asks for what a parent would tell the shopkeeper: the school first, then the child's name, class, gender and house. The package is set up before the home screen loads.
- **More than one child.** A "Buying for" switcher sits at the top of every screen, and the catalogue changes with it.
- **Sizing.** There are three checks: a size chart with international conversions, a warning on important items that doesn't block the purchase, and a "did you get everything right?" step before checkout.
- **After the order.** Parents get tracking, item-level cancellation and invoice download. The replacement flow has five reason codes and won't accept the same size that was ordered before.
- **Failure states.** The screens cover a wrong OTP, the resend timer, an empty order list, and location turned off at checkout.

![The replacement flow: item selection, reason codes, size re-selection and confirmation](/case-studies/skooltag/replacement-flow.webp "The replacement flow: reason codes, a block on re-picking the same size, and a confirmation step. Mock addresses are removed.")

## Handoff

The file grew to 36 pages because it kept every iteration, so the handoff had to point to one final version:

- **Status markers.** Handoff pages carry a check mark and "(Handoff)" in their names. Older iterations stay in the file on their own labelled pages.
- **Frontend and backend kept apart** with divider pages, so app screens and back-office specs don't mix.
- **Links from the cover page** straight to the website and app handoff pages.
- **App handoff:** 85 mobile screens in 14 flows, from login to cancellation, with 549 interactive elements wired.
- **Website handoff:** the landing page, the school-partnership page and four contact-form states.
- **Prototype:** 62 screens and 665 interactions across 5 named flows, used to walk through the journey before build.

The website carried the B2B side. Its 45-node information architecture includes a partnership page for schools covering revenue sharing and the Directorate of Education order on uniform sales, ending in a lead form where a school verifies its number by OTP before getting a salesperson's contact.

![Overview of the web app handoff section: 14 flow groups of mobile screens](/case-studies/skooltag/web-app-handoff.webp "The app handoff page: 85 screens grouped into 14 flows, one group per journey from login to cancellation.")

## Constraints and what I'd do differently

**Constraints**

- **No research budget.** No formal usability sessions, no paid participants. Decisions drew on the client's 35 years of direct contact with parents and on reference ordering flows. The persona was a working assumption, not a finding.
- **No PM.** Requirements, phasing and client questions sat with me, on top of design.
- **Parallel build.** A developer was building while design was still changing, so requirements had to be written down early instead of agreed in passing.

**What was left unfinished**

- The SRS has no date, a duplicated section and inconsistent page numbers. It needed version control.
- The per-feature time columns in the phase plan are empty. Two top-level estimates aren't enough to track progress against.
- The brief fields on the cover page ("Why are we doing this?" and "What are the design constraints and goals?") were never filled in.
- The back office exists only as requirements, flows and journey maps. No dashboard screens were designed in this file.
- The SRS names the KPIs to measure; the build, and any results, were outside my part.

**What I'd do differently**

- Write the goals and success measures first, and get the client to agree to them before starting the SRS.
- Fill in the per-feature estimates with the developers, so Phase 1 has a date and not just a scope.
- Keep client questions in one decision log with an owner and a status, not on sticky notes spread across the flows.
- Test onboarding and sizing with even five parents from the client's stores. It would have cost very little.
- Fix two slips I noted myself: a home screen that was too dense, and a billing line reading "FREE Delivery" beside "None".
`
};
