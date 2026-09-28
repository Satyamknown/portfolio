export default {
  slug: 'stratalite-platform-testing',
  title: 'Stratalite: mapping and testing the live platform',
  version: 'v1.0',
  summary:
    'Mapped every flow of a 5-role property-management SaaS, one role at a time, then directed AI-assisted lifecycle tests across roles and wrote up the gaps as questions for the client.',
  role: 'Design lead · QA & product audit',
  client: 'Stratalite · Vancouver',
  year: '2026',
  tags: ['B2B SaaS', 'User flow mapping', 'E2E testing', 'AI-assisted QA', 'Gap analysis'],
  metrics: [
    { value: '237', label: 'flows mapped across 5 roles' },
    { value: '73', label: 'scripted lifecycle tests' },
    { value: '30', label: 'board corrections from cross-role checks' },
    { value: '87', label: 'business questions for the client' },
  ],
  coverImage: '/case-studies/stratalite/information-architecture.webp',
  order: 3,
  published: true,
  body: `## At a glance

- **Product:** Stratalite, a B2B SaaS that connects property managers with the vendors who do the work and the accounts payable teams who pay for it. The main Stratalite case study covers how I scoped it and the August UAT.
- **This project:** in September 2026 I mapped the live product role by role and tested whole project lifecycles across roles, to find where the product and the business rules disagree.
- **Scope:** 5 signed-in roles (platform admins, company admins, company managers, independent managers, vendors), plus the accounts payable contact who pays on a link with no login.
- **Numbers:** 237 flows on 5 boards, 73 scripted tests, and 2 business audits with 87 questions for the client.

## Why map it again

Each role sees a different product. The platform's own admins, company admins, company managers, independent managers and vendors each get their own sidebar, rules and view of the same project. Earlier documents described the product one role at a time, and they did not always agree with each other or with the live build.

## How I mapped it

For each role I listed every sidebar item, every screen it opens and every control, then laid the flows out on a FigJam board organised by the sidebar. Every hand-off between flows says why the user moves on. Edge cases stayed off the boards and went into separate registers, so a board shows how the product works today.

| Role | Flows on the board | How it was checked | Issues logged |
|---|---|---|---|
| Platform admins | 43 | 19 scripted tests | 41 business gaps |
| Company admins | 58 | 26 scripted tests | 80 gaps |
| Company managers | 56 | 64-item live walk | 54 questions for the client |
| Independent managers | 52 | 28 scripted tests | 97 gaps |
| Vendors | 28 | 54-case QA register | 20 issues |

Many problems showed up in several roles, so these counts overlap and are not added together.

## How I tested it

I tested whole project lifecycles on the development site, from posting a job to paying for it. Each role had its own signed-in browser, working on the same test records, so one action could be checked from every side.

AI browser agents did the clicking and logged every click, field and system response. I set the scope and the house rules, decided what counted as a problem (harm to someone's work, money or records), approved every test that changed or deleted data, and reviewed the results.

## What I found

The biggest finds were not broken buttons. They were missing checks between people:

- An invoice above the agreed price could be accepted without review.
- The screens that approve completion and send an invoice never show the amount being approved.
- Work done by one role could appear on the project record as another role's.
- Some states had no way out. A project marked incomplete could not be reopened by its owner, and a vendor who lost a job was never told.
- Deleting a finished project removed its history for everyone.

Gaps that needed a business call went to the client as questions, not as fixes I had already picked: 87 questions across two business audits, each marked as a blocker, a decision or a clarification.

## The habit that paid off

Comparing the same record across roles. An earlier board, built from walking one role, claimed three serious problems. Opening the same projects as the manager who owned them showed all three were wrong: the controls existed, just locked for that role.

From then on every screen was checked against the roles already documented, and corrections went back to the older boards. That produced 30 corrections to the platform admin board, 29 of them applied, and it exposed a real gap the single-role walk had missed.

## What I'd do differently

- **Agree the business rules first.** Many gaps were really open questions. A short rules sheet signed off by the client would have settled them before testing.
- **Test across roles from day one.** The single-role walk produced confident claims that were wrong.
- **Record who checked what.** The AI agents wrote most of the logs; I should have marked which findings I re-checked by hand.`
};
