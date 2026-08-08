# AGENTS.md

Working notes for whoever picks this up next — human or agent. Written 2026-08-08.

**Never put secret values in this file.** Variable *names* only. Real values live in
local `.env` (gitignored) and Vercel project settings.

---

## 1. What this is

Abhishek Manjhi's portfolio — a MERN app that doubles as its own CMS. Public site plus
an admin dashboard for publishing case studies and blog posts, deployed as a single
Vercel project where the Express API runs as one serverless function under `/api`.

| Layer    | Choice                                          |
| -------- | ----------------------------------------------- |
| Frontend | React 19 + React Router 7 + Vite 8              |
| API      | Express 5, serverless on Vercel                 |
| Database | MongoDB Atlas + Mongoose 9                      |
| Auth     | JWT, single admin account, bcrypt hash          |
| Content  | Markdown, rendered with `marked`                |
| Email    | Resend REST API (no SDK, just `fetch`)          |

Node v24 locally. No TypeScript. Linting is `oxlint`.

---

## 2. Repo and deployment

- **GitHub:** `Satyamknown/portfolio` (private), branch `main`
- **Vercel:** team `uplof`, project `portfolio`
- **Live:** https://portfolio-uplof.vercel.app
- Pushes to `main` auto-deploy. No manual step.

### ⚠️ The commit-author trap

Vercel Hobby **blocks deployments whose commit author isn't a recognized collaborator.**
This repo's local git identity is deliberately set to the account connected to Vercel:

```
user.name  = Satyamknown
user.email = 204048596+Satyamknown@users.noreply.github.com
```

If you commit under a different identity the deploy shows **Blocked** and Vercel offers
"Upgrade to Pro" — which is a red herring, not the actual fix. Just re-commit under the
right author. Check with `git log --format='%an <%ae>' -1` before pushing.

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

The first rule is **load-bearing**. Without it Vercel's filesystem routing looks for
`api/projects.js`, `api/posts.js` etc., finds nothing, and 404s every API call. All
`/api/*` traffic must land on the single `api/index.js` function, which routes internally.

---

## 3. Environment variables

Same six names locally (`.env`) and on Vercel (Production + Preview):

| Name                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `MONGODB_URI`         | Atlas connection string, `portfolio` database       |
| `JWT_SECRET`          | Signs admin session tokens (7-day expiry)           |
| `ADMIN_EMAIL`         | The only account that can log in                    |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — generate with `npm run hash -- "pw"`  |
| `RESEND_API_KEY`      | Email sending                                       |
| `NOTIFY_EMAIL`        | Where appointment notifications go                  |

### ⚠️ Vercel env-var gotchas, both hit in practice

1. **Adding a variable does not update an existing deployment.** Env vars are baked in
   at build time. After saving one you *must* redeploy or push a commit.
2. **A variable can exist with an empty value and look completely fine in the UI.**
   `RESEND_API_KEY` was saved blank once; the dashboard showed it present and
   "Sensitive", the Value field showed only greyed placeholder text, and emails silently
   did nothing for an hour. Sensitive values can't be read back, so if email breaks,
   diagnose from the runtime rather than the UI — a temporary endpoint reporting
   `{ present, length }` (never the value) settles it in one deploy.

Atlas **Network Access must allow `0.0.0.0/0`** — Vercel function IPs are dynamic. If a
deploy builds fine but shows zero case studies, check this first.

---

## 4. Local development

```bash
npm install
cp .env.example .env      # then fill it in
npm run dev
```

Frontend on `:5173`, API on `:5001`. Vite proxies `/api` to the backend.

**Port 5001, not 5000** — macOS AirPlay Receiver squats on 5000 and returns `403
AirTunes`, which looks exactly like a broken server.

If `MONGODB_URI` is unset, `server/dev.js` boots a local on-disk MongoDB into
`.localdb/` so `npm run dev` works with no cloud setup. Set the URI to use Atlas.

| Script            | Does                                              |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | API + Vite together via `concurrently`            |
| `npm run build`   | Production build                                  |
| `npm run lint`    | oxlint                                            |
| `npm run hash`    | bcrypt an admin password: `npm run hash -- "pw"`  |
| `npm run seed`    | Upsert the five case studies (idempotent, by slug)|

`mongodb-memory-server` is a devDependency whose postinstall downloads a ~148MB binary.
It's disabled via `config.mongodbMemoryServer.disablePostinstall` in `package.json` so
Vercel builds don't pay for it. Don't remove that.

---

## 5. File map

```
api/index.js              Express app, default-exported for Vercel
server/
  db.js                   Cached Mongoose connection (serverless-safe)
  dev.js                  Local server; falls back to on-disk Mongo
  models/                 Project, Post, Appointment
  routes/                 auth, projects, posts, appointments
  middleware/auth.js      JWT verification
  lib/notify.js           Resend send wrappers
  lib/emails.js           HTML email templates
src/
  main.jsx, App.jsx       Entry + routes
  index.css               Entire design system, single file
  data/site.js            All static copy
  lib/api.js              Fetch wrapper + token handling
  lib/effects.js          Homepage scroll/cursor effects
  components/             Layout, Editor, Markdown, AppointmentForm, Inline, Loading
  pages/                  Home, Work, WorkDetail, Writing, WritingDetail,
                          About, Contact, Login, Admin, NotFound
scripts/hash.js           Admin password hasher
scripts/seed.js           Case-study seeder
public/mocks/             Placeholder imagery
```

### Routes

Public: `/` `/work` `/work/:slug` `/writing` `/writing/:slug` `/about` `/contact`
Auth: `/login` → `/admin`
Catch-all: 404

### API

| Method | Path                     | Auth | Notes                                  |
| ------ | ------------------------ | ---- | -------------------------------------- |
| GET    | `/api/health`            | —    | `{ ok: true }`                         |
| POST   | `/api/auth/login`        | —    | Returns JWT                            |
| GET    | `/api/projects`          | —    | Published only                         |
| GET    | `/api/projects?all=1`    | ✓    | Includes drafts                        |
| GET    | `/api/projects/:slug`    | —    | Published only, else 404               |
| POST/PUT/DELETE | `/api/projects[/:id]` | ✓ |                                     |
| —      | `/api/posts…`            |      | Same shape as projects                 |
| POST   | `/api/appointments`      | —    | Contact form                           |

Drafts never leak: unpublished items are excluded from list and detail responses, and
`?all=1` requires a valid token. This is verified behaviour — keep it that way.

---

## 6. Design system

Everything lives in `src/index.css`. No CSS modules, no Tailwind, no styled-components.

Current look came from a design handoff (light, type-driven, structured-minimal, with
Japanese handwritten accents). Tokens:

```
bg #f4f2ed · surface #efece5 / #e9e6df
border #dcd8cf (inputs #cfcabf) · border-hover #a39d8f
ink #171512 · body #2e2b26 / #514d44 · muted #6f6a60 · faint #8d887c
accent green #35c24a · on-green text #0e2410 · notice text #2a7a34
```

Type: **Archivo** (variable) for everything, **IBM Plex Mono** for labels/meta/buttons,
**Yomogi** (Caveat fallback) for handwritten accents. Google Fonts via `<link>` in
`index.html`.

Radius is **0 everywhere** except pills/chips/buttons (999px) and the hero capsule.
Hairlines always 1px. Page gutter 28px. Section label column 180–200px.

Legacy class names (`.admin-*`, `.editor-*`, `.prose`, `.field*`, `.index-row`, …) were
deliberately kept and reskinned rather than renamed, so the CMS and inner pages survived
the redesign. **Don't rename them casually** — Admin and the editor depend on them.

---

## 7. Homepage effects (`src/lib/effects.js`)

Two exports, both called from `Home.jsx`, both returning cleanup functions. All of it is
**desktop-only** (`pointer:fine`, >920px) and respects `prefers-reduced-motion`.

**`initHomeEffects(root)`** — custom cursor (ink dot + lerping green ring that swells to
"view" over work cards), sticker trail spawning every ~90px of travel, wheel-intercepted
smooth-scroll lerp, and scroll-drift parallax on `[data-drift]` cards.

**`initReel({ slot, reel, track, fadeOut })`** — the hero capsule grows into a fullscreen
showreel, holds, then shrinks and fades upward before Selected Work.

The reel is lifted to `position: fixed` and its geometry is rewritten every frame from
the in-flow slot's live rect, so it reads as one continuous element instead of a swap.
Stage boundaries are constants at the top of the file:

```js
GROW_END   = 0.42   // pill → fullscreen
EXIT_START = 0.72   // fullscreen → shrink away
TRACK_VH   = 1.7    // scroll runway, set on the spacer from JS
```

The spacer's height is applied from JS (not CSS) so no-JS and mobile layouts stay flush.

### ⚠️ Three traps in this file

1. **`inset` is a shorthand.** Setting `style.inset = 'auto'` *after* `left`/`top` wipes
   them. Order matters; it's commented in place.
2. **CSS animations beat inline styles.** The capsule's float animation had to be killed
   via an `is-driving` class before JS transforms would apply.
3. **rAF loops need a `running` guard.** A frame queued just before cleanup reschedules
   itself forever otherwise, and React StrictMode's double-invoke hits this every mount.

---

## 8. Content

**Static copy** → `src/data/site.js` (hero, positioning, About, Contact, in-progress
items, bios, microcopy). Edit the file, not the components.

**Case studies and posts** → MongoDB, edited at `/admin`.

The admin body field is a Markdown editor with a formatting toolbar, `⌘B`/`⌘I`/`⌘K`
shortcuts, and Write / Split / Preview modes. Images support captions —
`![alt](url "caption")` renders as `<figure>` + `<figcaption>` via a custom `marked`
renderer in `components/Markdown.jsx`.

---

## 9. Email

`server/lib/emails.js` holds two templates, both table-based with inline styles and
plain-text alternatives:

- **Notification** (to `NOTIFY_EMAIL`) — crown mark, ruled headline, mono detail rows,
  green-bordered message quote. `reply_to` is the sender, so hitting reply works.
- **Auto-reply** (to the submitter) — ASCII cat telling them to sit tight. ASCII rather
  than an image because Gmail strips `<svg>` and blocks `data:` URIs in `img src`.

Both go out via `Promise.allSettled` in `routes/appointments.js` — a failed email can't
affect the saved record or the HTTP response. The form also carries a honeypot field
(`website`); when filled, the server returns a normal 201 without saving.

### ⚠️ Auto-reply needs a verified domain

The shared `onboarding@resend.dev` sender **only delivers to the Resend account owner.**
Real visitors won't get the auto-reply until a domain is verified in Resend and
`RESEND_FROM` is set. It fails silently and harmlessly until then.

---

## 10. Open items

- [ ] **Two case studies missing from the DB.** Only 3 of 5 are live
      (`pacific-coast-contracting`, `exportkit`, `stratalite`). RoohConnect and Skooltag
      are in `scripts/seed.js` but absent from Atlas — either deleted via `/admin` or
      never persisted. `npm run seed` restores them; unresolved whether removal was
      intentional.
- [ ] **Showreel video.** Drop an MP4 at `public/mocks/reel.mp4` and it's picked up with
      no code change. Currently falls back to the portrait placeholder, which is why the
      fullscreen state looks like a heavily-cropped portrait — `object-fit: cover`
      stretching a 10:19 image across a landscape viewport. Use 16:9, muted, loopable.
- [ ] **Real portrait** at `public/mocks/mock-portrait.png`.
- [ ] **Project screenshots.** `coverImage` in MongoDB takes precedence over the mocks;
      the fallback chain is already wired.
- [ ] **Resume PDF** — footer and buttons link `/resume.pdf`, which doesn't exist yet.
- [ ] **LinkedIn URL** in `site.js` was guessed; verify it.
- [ ] **Metrics gaps** — ExportKit install count, plus Stratalite/Skooltag numbers and
      years, are deliberately blank. Left empty rather than invented; only Abhishek can
      fill them.
- [ ] **Rotate credentials.** The Mongo password and Resend API key were both pasted in
      plaintext chat during development. Neither is in git, but both should be rotated.
- [ ] **Case-study page width.** Inner pages use the 720px reading column; the design
      handoff specifies 1100px for case studies. Not yet applied.
- [ ] One appointment record in the DB is a test submission, not a real inquiry.

---

## 12. Recent local changes

- Added contact page cat attention prompt and phone CTA prompt text.
- Wired explicit tap sound feedback to contact phone link, form submit button, and email alternate link.
- Added `src/lib/feedback.js` with audio/tap presets and browser audio unlock handling.
- Added `src/lib/interaction.js` to initialize global tap/typing feedback and button press state.
- Added `src/lib/scrollIndicator.js` and removed scroll haptics, keeping the visual scroll thumb only.
- Updated `src/components/ContactCat.jsx` to make the cat prompt bubble accessible and render the current prompt.
- Updated `src/components/AppointmentForm.jsx` to trigger cat focus and feedback on form interaction and submission.
- Updated `src/pages/Contact.jsx` prompt copy and contact CTA.
- Committed and pushed the contact prompt / feedback changes to `origin/main`.

## 11. Conventions

- Match surrounding style: no semicolon-free experiments, no new dependencies without
  reason. The stack is deliberately small.
- Comments explain *why*, not *what*. Several in `effects.js` and `vercel.json` exist to
  stop someone re-breaking a subtle fix — leave them.
- `npm run build && npm run lint` before pushing. One known lint warning remains
  (`Admin.jsx` exhaustive-deps on a deliberate mount-only effect); everything else should
  stay clean.
- Verify in a browser, don't assume. Several bugs here (API 404s, blank env var, the
  `inset` shorthand) looked fine in code and only surfaced at runtime.
- Never commit `.env` or `.localdb/`. Both are gitignored; check `git status` before a
  broad `git add`.
