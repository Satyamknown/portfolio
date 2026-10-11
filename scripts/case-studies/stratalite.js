// PM-framed rewrite (v3.1, drawn diagrams replace the stakeholder map and access matrix): one story across 18 months, from scoping to a small
// beta, pulling it back, and fixing what touches money first. Facts confirmed by
// Abhishek on 2026-10-10. A production deploy publishes this file to the CMS
// (the v2.1 copy is backed up first). Same slug, so resume links keep working.
export default {
  slug: 'stratalite',
  title: 'Stratalite',
  version: 'v3.5',
  tagline: 'One place for property managers to hire vendors, track the work and get it paid.',
  summary:
    'Property managers were running repairs and renovations over WhatsApp, email and phone calls. On a team of three with no product manager, I acted as one for 18 months: I scoped a five-role platform, decided who sees what, chose the numbers the dashboard should show, ran a beta with 4 companies, 12 managers and 6 vendors, and when real use showed it was not ready, pulled it back and fixed the things that touch money first. Almost all issues are now fixed.',
  role: 'Acting product owner (no PM on the team), lead designer',
  client: 'Stratalite · Vancouver',
  year: '2025-26',
  tags: ['B2B SaaS', 'Product scoping', 'Access control', 'Success metrics', 'Beta and quality'],
  metrics: [
    { value: '18 months', label: 'from first sketch through beta and fixes' },
    { value: '4 companies', label: 'in the beta, with 12 managers and 6 vendors' },
    { value: '106', label: 'test cases across the vendor, manager and admin accounts' },
    { value: '15', label: 'distinct issues found, 6 high priority; almost all now fixed' }
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

We were a team of three at Rsquare Web Studio: one developer, one designer, and me as lead designer. There was no product manager on our team, so I did that job too, working with the client's product owner on every open question.

I decided what the platform covers and who it's for, wrote the rules for who can do what, turned them into requirements the developer could build from, agreed the metrics with the client, ran the beta, and decided what got fixed first when it went wrong.

## The timeline

| Phase | When | What happened |
|---|---|---|
| 1. Understand the problem | Months 1–3 | Studied how companies actually ran their jobs, mapped who the product touches, and set the four goals. |
| 2. Define the product | Months 3–8 | Wrote who can do what for each role and made the big product calls. |
| 3. Build | Months 6–14 | The developer built it piece by piece. Agreed the dashboard numbers with the client. |
| 4. Small beta | July 2026 | Opened it to 4 companies: 12 managers and 6 vendors running real jobs. |
| 5. Pull it back | Right after | Real use showed it was buggier than expected, so we took it back instead of letting users work around it. |
| 6. Stress test and fix | Aug 2026 onwards | Tested the vendor, manager and admin accounts with AI help, ranked every problem by business risk, and fixed money and work first. Almost all issues are now fixed. |

One job, start to finish, in real screens (click any image to zoom):

![All 26 steps of a Stratalite job as small real screens, colour-coded by role (manager side, vendor, accounts payable), from posting the job to Payment Completed](/case-studies/stratalite/lifecycle-overview.webp "Every step of one job, from posting to paid, and who acts at each")

## Part 1: Building the right thing

### 1. Decide what the platform owns

Before any UI, I mapped everyone the product touches, in four rings: the five people who log in, then owners, tenants and finance teams, then the services it relies on (payments, banking, insurance), then regulators.

That one map settled the most expensive question early: what Stratalite does itself, and what it only connects to. It also found someone easy to forget: the accounts payable person who pays the vendor but never logs in. They get a shareable link instead of an account.

![Diagram: inside Stratalite are the five roles and the work they do; outside, it connects to payments, banking, insurance and an accounts payable contact who pays by link](/case-studies/stratalite/scope-diagram.webp "The scope in one picture: the five roles work inside Stratalite; money and paperwork connect from outside")

### 2. Split "manager" into two roles

At first we treated every manager as one type of user. Looking at how they actually worked showed two very different jobs:

- **Independent managers** create and run their own properties.
- **Company managers** only work on properties their company assigns to them.

Same title, completely different access. So they became two roles, chosen at sign-up, each with its own permissions from the first login. It meant two onboarding paths to build and test, but it removed a whole class of "wait, why can I see this?" moments.

Then I wrote down who can do what across all five roles. The interesting rules were the in-between ones: managers see only the quotes sent to them, vendors see only their own, and Stratalite's own admin team can't see any client's pricing. Running the platform doesn't mean reading everyone's invoices.

![Diagram: independent managers run their own properties, company managers only assigned ones; who sees quotes and invoices](/case-studies/stratalite/roles-diagram.webp "Two manager roles from sign-up, and who gets to see pricing")

### 3. Make vendors earn the details

If every vendor sees every job in full, managers drown in applications from vendors who were never a fit.

So vendors first say they're interested. Only once a manager shortlists them do they see the property details and the manager's contact. The trade-off: vendors decide on less information, so the public job brief had to be good enough to decide on. In return, managers only ever talk to vendors who opted in and made the cut.

![Manager project view listing interested vendors, each with a Shortlist button](/design/stratalite/screen-interested.webp "The manager's side: vendors who said they're interested, waiting to be shortlisted")

![Eight real Stratalite screens in order: the manager fills in and posts a job, the job appears in the vendor feed, the vendor opens it and submits interest, the manager is notified, sees the vendor under Interested Vendors and opens their profile](/case-studies/stratalite/lifecycle-1-post-and-interest.webp "Steps 1 to 6: a job is posted and vendors raise their hand")

![Eight real Stratalite screens in order: the manager requests compliance documents, the vendor grants access, the manager sees GST, WCB and insurance, shortlists the vendor, the vendor books a site visit, the manager sees the visit, and the vendor marks it complete](/case-studies/stratalite/lifecycle-2-check-and-shortlist.webp "Steps 7 to 10: documents checked, vendor shortlisted, site visited")

![Nine real Stratalite screens in order: the vendor submits a quotation, the manager is notified and opens the quotation details, asks for changes, the vendor sees them and sends a revised quote, the manager accepts and assigns, and the vendor sees the project under progress](/case-studies/stratalite/lifecycle-3-quote-and-award.webp "Steps 11 to 15: quote, change request, award")

### 4. Put the invoice inside "Mark as complete"

Finishing a job and getting paid were two separate steps. Managers approved the work, then chased the invoice, and every payment waited on that chase.

I moved the invoice into "Mark as complete". One action now closes the job and starts the payment. The vendor's last step gets a little heavier, but the chasing ends, and the invoice amount is captured in one place.

![Vendor project page with every task ticked and a Proceed with Invoice card](/design/stratalite/proceed-with-invoice.webp "Finishing the job and sending the invoice became one step")

![Seven real Stratalite screens in order: the vendor adds and ticks milestones, posts an update, the manager sees it on the timeline, the vendor marks the job complete with the invoice, and the manager sees Project Completed and opens the invoice](/case-studies/stratalite/lifecycle-4-do-the-work.webp "Steps 16 to 19: milestones, updates, and completion with the invoice")

### 5. Keep disputes inside the project

A separate disputes section lost the context: by the time anyone opened it, nobody remembered what the job was. So disputes live on the project itself, with the evidence and the resolution right there. "Disputed" became a filter on the project list instead of a feature of its own.

![Five real Stratalite screens in order: the manager raises an issue, the vendor sees it and resubmits, the project is back in review, the manager confirms completion and the job is complete](/case-studies/stratalite/lifecycle-5-review-and-sign-off.webp "Steps 20 and 21: an issue raised and resolved on the project, then sign-off")

![Eight real Stratalite screens in order: the manager sends the invoice to accounts payable, accounts payable opens the emailed link, picks the vendor's payment method, records the e-transfer, the page awaits confirmation, the vendor confirms and rates, and the manager sees Payment Completed](/case-studies/stratalite/lifecycle-6-get-paid.webp "Steps 22 to 26: invoice to accounts payable, payment by link, project closed")

### 6. Pick dashboard numbers the data can actually support

Dashboards often show numbers because they look impressive, not because the product collects the data behind them.

So I worked backwards: listed every piece of information people enter, traced where it ends up, and only then agreed with the client which ten numbers the director's dashboard shows. Each one answers a real question, like "what do I owe right now?" or "what's stuck in my queue?"

It also flagged a risk: the invoice amount feeds six of the ten numbers. One wrong entry there skews most of the dashboard. Remember that one; it comes back.

![Company admin dashboard annotated with the source behind each number](/design/stratalite/kpi-pmc-annotated.webp "Every number on the director's dashboard, traced back to where its data comes from")

## Part 2: The beta, and pulling it back

### 7. A small beta, on purpose

We didn't launch to everyone. In July 2026 we opened Stratalite to 4 property management companies, 12 of their managers and 6 vendors, and let them run real jobs through it.

That was the point of a small beta: to find out what breaks while the damage is still small.

### 8. Then we took it back

It did its job. Real use showed the platform was buggier than we expected, and some of the problems touched money. Rather than ask early users to work around them, we pulled the beta back and fixed things properly first.

It's not the exciting decision, but it's the right one for a product that handles other people's payments. A vendor who gets paid wrong once doesn't come back.

### 9. Use AI to test like a much bigger team

With a team of three, we couldn't hire a QA team. So I used AI to do the heavy lifting: AI agents stress-tested the application, ran QA tests across the vendor, manager and company-admin accounts, and hunted for edge cases and system faults: the odd paths real users take that nobody writes a test for.

I set what to test, decided what counted as a real problem (anything that could harm someone's work, money or records), and reviewed every result before it went to the developer. Over three rounds that was 106 test cases, with a vendor and a manager working the same job side by side, so every hand-off was checked from both ends.

The most important finds weren't broken buttons. They were missing checks:

- **An invoice above the agreed price could be accepted without review.** (Remember the invoice amount that feeds six dashboard numbers? This is why it mattered.)
- **A job posted by a company admin never reached the building's manager.** Their page showed zero projects, so the same job could be posted and hired twice.
- **Some jobs could get stuck.** A project marked incomplete couldn't be reopened, and a vendor who lost a job was never told.
- **Deleting a finished project erased its history for everyone,** which breaks the paper trail the whole product promises.

### 10. Fix in order of business risk

Not every bug matters equally, so every finding went back to the developer straight away, ranked:

1. **First: anything touching vendors' work or money.** Quotes, approvals, invoices, payments, and the project record. If it can pay someone wrong or lose a job's history, it's fixed before anything else.
2. **Then: messaging and everything else.** Notifications, messages and the rest: annoying when broken, but nobody loses money.

Where a problem was really a business decision rather than a bug (should a manager be able to reopen a finished job?), I didn't guess. It went to the client as a question, marked as a blocker, a decision or a clarification.

The money and work issues were fixed first. Almost all of the rest are now fixed too, and anything left is on a list with a priority and an owner.


## What we chose not to do

- **One "manager" role with toggles.** Faster to build, but it would have meant permission mistakes in the middle of real jobs.
- **A separate disputes feature.** It looked tidy on paper and lost all the context in practice.
- **A dashboard full of numbers we couldn't source.** Ten numbers we can trust beat thirty we can't.
- **Keeping the beta running while we fixed things.** Early users shouldn't be our testers for payment bugs.

## Where it landed

**What the design delivered,** against the four goals:

1. **One place.** Vendor onboarding, quotes, milestones, disputes and payment all run inside Stratalite.
2. **Right access.** Five roles, each set at sign-up, and no client's pricing visible to Stratalite's own team.
3. **A paper trail.** Every quote, milestone and dispute sits on the project record.
4. **A dashboard the data supports.** All ten numbers trace back to data the product actually collects, agreed with the client before design.

**What real use and testing showed:** the July beta with 4 companies, 12 managers and 6 vendors showed the build was not ready. Testing after it ran 106 cases (86 passed) and found 15 distinct issues, 6 of them high priority, including gaps in the paper trail and a job that never reached the right manager. Money and work issues were fixed first, and almost all of them are now fixed.

![Payment completed view with payment, invoice and quotation details together](/design/stratalite/screen-payment.webp "Quote, invoice and payment for a job, in one place")

The beta did what a beta is for: it showed us the problems while only 4 companies were using it, not hundreds.


## What I'd do differently

- **Test the risky parts from day one, not after the beta.** The worst issues were around money. I'd stress-test quotes, approvals and payments every sprint, not just before launch.
- **Get the business rules signed off before building.** Many "bugs" were really open questions. A one-page rules sheet agreed with the client would have settled them before a line of code.
- **Bring AI testing in earlier.** It let a team of three test like a team of ten. I'd use it from the first build, not the first beta.
- **Agree how to measure success before the beta.** A baseline like "time from job done to vendor paid" would let the beta prove the decisions worked, not just that they were sensible.
`
};
