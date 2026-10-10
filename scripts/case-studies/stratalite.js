// PM-framed rewrite (v3.0): one story across 18 months, from scoping to a small
// beta, pulling it back, and fixing what touches money first. Facts confirmed by
// Abhishek on 2026-10-10. A production deploy publishes this file to the CMS
// (the v2.1 copy is backed up first). Same slug, so resume links keep working.
export default {
  slug: 'stratalite',
  title: 'Stratalite',
  version: 'v3.0',
  tagline: 'One place for property managers to hire vendors, track the work and get it paid.',
  summary:
    'Property managers were running repairs and renovations over WhatsApp, email and phone calls. On a team of three with no product manager, I acted as one for 18 months: I scoped a five-role platform, decided who sees what, chose the numbers the dashboard should show, ran a small beta, and when it showed us problems, pulled it back and fixed the things that touch money first.',
  role: 'Lead designer, acting product owner',
  client: 'Stratalite · Vancouver',
  year: '2025-26',
  tags: ['B2B SaaS', 'Product scoping', 'Access control', 'Success metrics', 'Beta and quality'],
  metrics: [
    { value: '18 months', label: 'from first sketch to a stable product' },
    { value: '5', label: 'roles, each seeing only what it should' },
    { value: '106', label: 'test cases run across every role' },
    { value: '10', label: 'dashboard numbers, each tied to real data' }
  ],
  coverImage: '/case-studies/stratalite/cover.webp',
  order: 1,
  published: true,
  body: `## The ask

Stratalite is a Vancouver startup building software for property management companies: the firms that look after buildings for their owners and hire vendors to fix, maintain and renovate them.

They wanted one platform for the whole job, from finding a vendor to paying them. I joined before a single screen existed and stayed through the beta and the clean-up after it.

## What was actually broken

The problem wasn't missing features. It was that the work lived in five places at once:

- **Vendors were found and onboarded over WhatsApp.** Coordination happened in email threads. Approvals happened on the phone.
- **Quotes sat in inboxes.** Checking whether a job was done meant calling the vendor and hoping they picked up.
- **Nobody could prove anything.** When a vendor and a manager disagreed about what was agreed, there was no record to point at.
- **The boss was flying blind.** A director couldn't see spend or progress across their properties without asking around.

Existing tools were too generic, too expensive, or made companies change how they work to suit the software. Nobody wants to retrain a whole office just to approve a gutter repair.

There was also a split worth noticing early: the person who **buys** Stratalite (the company's director) is not the person who **uses** it every day (managers and vendors). The product had to win both.

## What success looked like

Before designing anything, I set four goals:

1. **One place:** every step, from hiring a vendor to paying them, happens inside Stratalite.
2. **Right access:** each person sees exactly what their job needs, and nothing else.
3. **A paper trail:** every quote, milestone and dispute is on the project record.
4. **A useful dashboard:** the numbers a director sees come from real data, not wishful thinking.

## My role

We were a team of three at Rsquare Web Studio: one developer, one designer, and me as lead designer. There was no product manager, so I did that job too.

I decided what the platform covers and who it's for, wrote the rules for who can do what, turned them into requirements the developer could build from, agreed the metrics with the client, ran the beta, and decided what got fixed first when it went wrong.

## The timeline

| Phase | When | What happened |
|---|---|---|
| 1. Understand the problem | Months 1–3 | Studied how companies actually ran their jobs, mapped who the product touches, and set the four goals. |
| 2. Define the product | Months 3–8 | Wrote who can do what for each role and made the big product calls. |
| 3. Build | Months 6–14 | The developer built it piece by piece. Agreed the dashboard numbers with the client. |
| 4. Small beta | Around month 14 | Opened it to a small group of real managers and vendors. |
| 5. Pull it back | Right after | The beta surfaced problems, so we took it back instead of letting real users work around them. |
| 6. Stress test and fix | Aug 2026 onwards | Tested every role with AI help, ranked every problem by business risk, and fixed money and work first. Most issues are now patched. |

## Part 1: Building the right thing

### 1. Decide what the platform owns

Before any UI, I mapped everyone the product touches, in four rings: the five people who log in, then owners, tenants and finance teams, then the services it relies on (payments, banking, insurance), then regulators.

That one map settled the most expensive question early: what Stratalite does itself, and what it only connects to. It also found someone easy to forget: the accounts payable person who pays the vendor but never logs in. They get a shareable link instead of an account.

![Stakeholder map in four rings around the Stratalite platform](/case-studies/stratalite/stakeholder-map.webp "Everyone the platform touches: what Stratalite owns, and what it only connects to")

### 2. Split "manager" into two roles

At first we treated every manager as one type of user. Looking at how they actually worked showed two very different jobs:

- **Independent managers** create and run their own properties.
- **Company managers** only work on properties their company assigns to them.

Same title, completely different access. So they became two roles, chosen at sign-up, each with its own permissions from the first login. It meant two onboarding paths to build and test, but it removed a whole class of "wait, why can I see this?" moments.

Then I wrote down who can do what across all five roles. The interesting rules were the in-between ones: managers see only the quotes sent to them, vendors see only their own, and Stratalite's own admin team can't see any client's pricing. Running the platform doesn't mean reading everyone's invoices.

![Who-can-do-what matrix for the five roles](/case-studies/stratalite/rbac-matrix.webp "Five roles, each with access set at sign-up rather than switched on later")

### 3. Make vendors earn the details

If every vendor sees every job in full, managers drown in applications from vendors who were never a fit.

So vendors first say they're interested. Only once a manager shortlists them do they see the property details and the manager's contact. The trade-off: vendors decide on less information, so the public job brief had to be good enough to decide on. In return, managers only ever talk to vendors who opted in and made the cut.

![Manager project view listing interested vendors, each with a Shortlist button](/design/stratalite/screen-interested.webp "The manager's side: vendors who said they're interested, waiting to be shortlisted")

### 4. Put the invoice inside "Mark as complete"

Finishing a job and getting paid were two separate steps. Managers approved the work, then chased the invoice, and every payment waited on that chase.

I moved the invoice into "Mark as complete". One action now closes the job and starts the payment. The vendor's last step gets a little heavier, but the chasing ends, and the invoice amount is captured in one place.

![Vendor project page with every task ticked and a Proceed with Invoice card](/design/stratalite/proceed-with-invoice.webp "Finishing the job and sending the invoice became one step")

### 5. Keep disputes inside the project

A separate disputes section lost the context: by the time anyone opened it, nobody remembered what the job was. So disputes live on the project itself, with the evidence and the resolution right there. "Disputed" became a filter on the project list instead of a feature of its own.

### 6. Pick dashboard numbers the data can actually support

Dashboards often show numbers because they look impressive, not because the product collects the data behind them.

So I worked backwards: listed every piece of information people enter, traced where it ends up, and only then agreed with the client which ten numbers the director's dashboard shows. Each one answers a real question, like "what do I owe right now?" or "what's stuck in my queue?"

It also flagged a risk: the invoice amount feeds six of the ten numbers. One wrong entry there skews most of the dashboard. Remember that one; it comes back.

![Company admin dashboard annotated with the source behind each number](/design/stratalite/kpi-pmc-annotated.webp "Every number on the director's dashboard, traced back to where its data comes from")

## Part 2: The beta, and pulling it back

### 7. A small beta, on purpose

We didn't launch to everyone. We opened Stratalite to a small group of real managers and vendors and let them run real jobs through it.

That was the point of a small beta: to find out what breaks while the damage is still small.

### 8. Then we took it back

It did its job. Real use surfaced problems we hadn't caught, and some of them touched money. Rather than ask early users to work around them, we pulled the beta back and fixed things properly first.

It's not the exciting decision, but it's the right one for a product that handles other people's payments. A vendor who gets paid wrong once doesn't come back.

### 9. Use AI to test like a much bigger team

With a team of three, we couldn't hire a QA team. So I used AI to do the heavy lifting: AI agents stress-tested the application, ran QA tests across all five roles, and hunted for edge cases and system faults: the odd paths real users take that nobody writes a test for.

I set what to test, decided what counted as a real problem (anything that could harm someone's work, money or records), and reviewed every result before it went to the developer. Over three rounds that was 106 test cases, with a vendor and a manager working the same job side by side, so every hand-off was checked from both ends.

The most important finds weren't broken buttons. They were missing checks:

- **An invoice above the agreed price could be accepted without review.** (Remember the invoice amount that feeds six dashboard numbers? This is why it mattered.)
- **The approval screen didn't show the amount being approved.** Managers were saying yes to a number they couldn't see.
- **Some jobs could get stuck.** A project marked incomplete couldn't be reopened, and a vendor who lost a job was never told.
- **Deleting a finished project erased its history for everyone,** which breaks the paper trail the whole product promises.

### 10. Fix in order of business risk

Not every bug matters equally, so every finding went back to the developer straight away, ranked:

1. **First: anything touching vendors' work or money.** Quotes, approvals, invoices, payments, and the project record. If it can pay someone wrong or lose a job's history, it's fixed before anything else.
2. **Then: messaging and everything else.** Notifications, messages and the rest: annoying when broken, but nobody loses money.

Where a problem was really a business decision rather than a bug (should a manager be able to reopen a finished job?), I didn't guess. It went to the client as a question, marked as a blocker, a decision or a clarification.

The money and work issues were fixed first, and most of the rest are now patched. What's left is on a list with a priority and an owner.


## What we chose not to do

- **One "manager" role with toggles.** Faster to build, but it would have meant permission mistakes in the middle of real jobs.
- **A separate disputes feature.** It looked tidy on paper and lost all the context in practice.
- **A dashboard full of numbers we couldn't source.** Ten numbers we can trust beat thirty we can't.
- **Keeping the beta running while we fixed things.** Early users shouldn't be our testers for payment bugs.

## Did it work?

Back to the four goals:

1. **One place: yes.** Vendor onboarding, quotes, milestones, disputes and payment all run inside Stratalite.
2. **Right access: yes.** Five roles, each with access set at sign-up, and no client's pricing visible to anyone who shouldn't see it.
3. **A paper trail: yes, after the fixes.** Testing found the gaps (lost history, missing amounts on approval), and they were first in line to be fixed.
4. **A useful dashboard: yes.** All ten numbers trace back to data the product actually collects, and the client agreed them before design.

![Payment completed view with payment, invoice and quotation details together](/design/stratalite/screen-payment.webp "Quote, invoice and payment for a job, in one place")

And the product: the beta did what a beta is for. It showed us the problems while they were small, we fixed the ones that touch money and work first, and most of the rest are patched.


## What I'd do differently

- **Test the risky parts from day one, not after the beta.** The worst issues were around money. I'd stress-test quotes, approvals and payments every sprint, not just before launch.
- **Get the business rules signed off before building.** Many "bugs" were really open questions. A one-page rules sheet agreed with the client would have settled them before a line of code.
- **Bring AI testing in earlier.** It let a team of three test like a team of ten. I'd use it from the first build, not the first beta.
- **Agree how to measure success before the beta.** A baseline like "time from job done to vendor paid" would let the beta prove the decisions worked, not just that they were sensible.
`
};
