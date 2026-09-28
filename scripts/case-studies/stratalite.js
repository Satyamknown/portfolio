export default {
  slug: 'stratalite',
  title: 'Stratalite',
  version: 'v2.1',
  summary:
    'Scoped the roles, permissions and success metrics for a 5-role property-management SaaS, then checked the build against the design and ran 106 UAT cases across roles. The product is live in beta.',
  role: 'Design lead · delivery & UAT',
  client: 'Stratalite · Vancouver',
  year: '2026',
  tags: ['B2B SaaS', 'Scope & requirements', 'Access control', 'KPI definition', 'UAT'],
  metrics: [
    { value: '106', label: 'UAT test cases' },
    { value: '15', label: 'distinct issues, 6 high-priority' },
    { value: '5 roles', label: 'by 13 actions in the access matrix' },
    { value: '10', label: 'KPIs traced to source fields' },
  ],
  coverImage: '/case-studies/stratalite/cover.webp',
  order: 1,
  published: true,
  body: `## At a glance

- **My role:** Design lead with delivery ownership, at Rsquare Web Studio. I joined before any screen existed and stayed through the build review and UAT.
- **Timeline:** About 8 months. The three UAT passes ran 18 to 20 Aug 2026.
- **Worked with:** the client's team at Stratalite, who aligned on priorities and KPIs, and the development team who built the product.
- **What I owned:** scope, the permission model, IA, flow requirements, KPI definition, the design-vs-build review and UAT.
- **Status:** live in beta with real property management companies, managers and vendors.

## The problem

Property management companies (PMCs) ran maintenance and renovation projects across a patchwork of tools: vendor onboarding over WhatsApp, coordination in email threads, approvals by phone. That had three business costs:

- **Slow approvals.** Quotes sat in inboxes; checking a milestone meant calling the vendor.
- **Disputes with no evidence.** Nobody could show what had been agreed, done or approved.
- **No portfolio view.** A PMC director could not see spend or progress across properties.

Existing platforms were too generic, too expensive, or made PMCs bend their workflow around the software. Stratalite set out to cover the whole pipeline in one place, from vendor onboarding to payment.

## What I owned

My title was designer; the job was closer to product delivery:

- **Scope:** what the platform covers, who uses it, and who sits outside it.
- **Rules:** who can do what, as a permission matrix and as business rules in the flows.
- **Requirements:** decision points and field specs for each flow, plus open questions for the client.
- **Success measures:** which dashboard numbers matter and where each comes from.
- **Quality:** the design-vs-build review, then UAT, with every issue given a priority and an owner action.

## How I scoped it

**Stakeholder map first.** Before any UI, I mapped the ecosystem in four rings: the 5 direct users, then owners, tenants and finance teams, then services the platform depends on (payment gateway, banking, insurance), then regulators. It settled what Stratalite owns and what it only connects to.

![Stakeholder map in four rings around the Stratalite platform](/case-studies/stratalite/stakeholder-map.webp "4 rings, 5 direct users: drawn before any screen to decide what the platform owns and what it only connects to")

**Traceability.** A system map linked 8 pain points to 8 core modules and 6 desired outcomes, so each module traced back to a real problem.

**Users and journeys.** Four persona cards and 11 journey-map boards broke each role's work into stages, touchpoints and pain points. The transactions board found a party with no account at all: Accounts Payable, who gets a shareable link from the manager, records the cheque and closes the project.

**Roles and permissions.** The personas exposed the biggest scoping question:

> Independent Manager and PMC Manager look like the same role but have completely different permission scopes.

The access matrix covers 5 roles by 13 actions in 5 domains, at three levels: full, conditional or none. The real rules sit in the conditional cells. A PMC Manager creates projects only on assigned properties; managers see quotations submitted to them and invoices shared with them; vendors see only their own. The Super Admin (Stratalite's own team) cannot view quotations or invoices: running the platform does not mean seeing a client's pricing.

![Role-based access control matrix](/case-studies/stratalite/rbac-matrix.webp "5 roles by 13 actions in 5 domains: permissions scoped at sign-up, not toggled later")

**Information architecture.** 13 sections, 22 groups and 118 leaf screens, mapped before design started.

![Part of the information architecture tree](/case-studies/stratalite/information-architecture.webp "5 of the 13 IA sections: the full tree has 22 groups and 118 leaf screens")

**Flows as requirements.** Three flow boards (Admin, Vendor, Manager) doubled as the spec, with decision points such as "Quotation approved?" and the business rules developers needed:

- A project asks for 1, 2 or 3 quotes, which caps how many vendors get shortlisted.
- The project tier is set after quote approval, based on value.
- Only vendors mark milestones complete; every milestone edit is timestamped.
- Announcements can be deleted only within 10 minutes.

Where the brief was unclear, I wrote the question on the screen for the client, such as whether submitting interest is the same as submitting a quote range.

![Manager flow from project assignment to cheque payment](/case-studies/stratalite/completion-to-payment-flow.webp "Assignment to payment: the dispute loop, the completion decision, and the hand-off to Accounts Payable, an external party with no account")

## Key decisions and trade-offs

### 1. Split "manager" into two roles at sign-up

- **Problem:** We first treated all managers as one type. But Independent Managers create their own properties; PMC Managers work on properties a PMC Admin assigns.
- **Decision:** Two roles, chosen at account creation. Permissions are scoped from login, not toggled later.
- **Trade-off:** Two onboarding paths and two permission sets to specify and test. Shared steps, such as project execution and payment, were specified once for both.
- **Result:** A cleaner IA and no permission confusion mid-flow.

### 2. Vendors earn the brief: interest, then shortlist, then unlock

- **Problem:** Showing full details to every vendor created noise; unqualified vendors applied to everything.
- **Decision:** Vendors submit interest first. Property details and the manager's contact unlock only after shortlisting.
- **Trade-off:** Vendors commit on less information, and the journey maps had already flagged incomplete briefs as a pain point, so the public brief still had to be enough to decide on.
- **Result:** A natural funnel. Managers deal only with vendors who opted in and were shortlisted.

![Vendor project view after submitting interest](/case-studies/stratalite/vendor-submit-interest.webp "The vendor side of the funnel: interest first, with the manager's contact unlocked only after shortlisting")

### 3. Put the invoice inside "Mark as complete"

- **Problem:** Completion and payment were separate flows. Managers approved completion, then chased the invoice, delaying payment on every project.
- **Decision:** Invoice number, file, amount and billing method moved into the Mark as Complete modal. One action closes the work and starts payment.
- **Trade-off:** A heavier last step: the vendor cannot mark a job done until the invoice is ready.
- **Result:** Payment data captured at one point, followed by a clear "Waiting for approval" state. That invoice amount later fed 6 of the 10 PMC Admin dashboard outputs.

### 4. Keep disputes inside the project

- **Problem:** A standalone disputes section lost context; managers forgot what an issue was about.
- **Decision:** Disputes live in the project view, with evidence and resolution notes on the project record.
- **Trade-off:** No separate dispute module. "Disputed" became a status filter on project lists instead.
- **Result:** Full context and an automatic audit trail on the project timeline.

## Defining what success looks like

Dashboard metrics are often picked because they look good, not because the data exists. Before designing any dashboard, I ran five steps:

1. **Inventory:** 35 input fields across 6 forms, with who enters each.
2. **Projection:** where each input appears in the UI.
3. **Field mapping:** an input-to-output matrix across 18 dashboard outputs.
4. **Stakeholder alignment:** the client's stakeholders agreed priority metrics before any design.
5. **Design** from the mapping.

Each of the 10 KPIs has a written justification:

| KPI | Question it answers | Source | Decision it supports |
|---|---|---|---|
| Total spend | What is my portfolio costing me? | Sum of invoice amounts from Mark as Complete | Are we over budget? Which properties cost most? |
| Invoice cleared / pending | What do I owe right now? | Invoice status, paid vs submitted | Is a payment backlog building? |
| New projects | What is sitting in my queue? | Projects with no vendor shortlisted yet | Start shortlisting before these slip |

The mapping also exposed a dependency: one field, the invoice amount, feeds 6 of the 10 PMC Admin outputs. An error there spreads through most of the director's dashboard.

For managers, a Next Step column turns each project status into a plain-language action:

> Status tells you where you are. Next Step tells you what to do.

![PMC Admin dashboard field matrix](/case-studies/stratalite/kpi-field-matrix.webp "PMC Admin field matrix: every dashboard output traced to its input. One field, the invoice amount (V17), feeds 6 of 10")

## Getting it built right

### Design-vs-build review

As the development team shipped flows, I placed about 200 captures of the live app beside the designs, grouped by numbered flow, and gave each flow a verdict: two "Approved: perfectly implemented", three "Partial match: structural difference".

### UAT

I ran three UAT passes on the dev environment. Vendor and manager/PMC accounts worked the same test project side by side, so each hand-off, from interest to payment, was checked from both ends. I mixed manual testing with AI browser automation, and checked outcomes where they land: for an email, the receiving inbox, not the in-app message.

| Pass | Date | Test cases | Passed | Flagged | Issues logged |
|---|---|---|---|---|---|
| Vendor side | 18 Aug | 43 | 31 | 6 | 9 |
| Manager side | 18 Aug | 21 | 17 | 2 | 5 |
| Manager / PMC Admin | 20 Aug | 42 | 38 | 4 | 6 |
| **Total** | **18 to 20 Aug** | **106** | **86** | **12** | **20 (15 distinct)** |

The other 8 cases were inconclusive or queued for retest. Merging issues seen from both sides left 15 distinct ones, each with an ID, test data, expected vs actual result, a priority and an owner action:

| Priority | Distinct issues | Owner action |
|---|---|---|
| High | 6 | Fix before rollout or the next release |
| Medium | 4 | Investigate and schedule a fix |
| Low | 5 | Track for a future polish pass |

The clearest example: inviting a manager showed "Invitation sent!", but no email arrived, on first send or re-send. Without the activation link, the new manager could not log in. The screen reported success while the business outcome failed. Both went in as High, "fix before manager onboarding rollout", with the activation retest queued behind the email fix.

The other High issues: quote emails not reaching the manager, no reminder for an expired vendor certificate, and broken change-email and change-password flows.

## Outcome

- Stratalite is live in beta with real PMCs, managers and vendors.
- The scope work (access matrix, IA, flow boards) defined the lifecycle UAT then tested, phase by phase.
- All 10 KPIs trace to a source field and were agreed before dashboard design.
- Design-vs-build: 2 flows approved as built, 3 flagged for structural differences.
- UAT: 106 cases, 15 distinct issues, 6 high-priority, each handed over with an owner action.

I don't have adoption or cycle-time figures from the beta to report.

## What I'd do differently

- **Set up the design system in Sprint 1.** We put shipping screens ahead of foundations, which caused visual inconsistency and handoff friction with the developers.
- **Test outcomes, not screens, from the first sprint.** Most high-priority issues were emails that never arrived and settings flows that failed. A design-vs-build review can't see those: the screens looked right. I'd write acceptance criteria that include side effects ("the invite email arrives") and test them every sprint.
- **Agree baseline metrics before beta.** The decisions above describe intended effects. I'd agree with the client how to measure them, such as time from completion to payment, so the beta could confirm or disprove them.
- **Keep the numbers in one place.** My own artefacts drifted: one slide said 4 roles instead of 5, a headline said 26 input fields where the tables list 35.
`,
};
