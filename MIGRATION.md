# Bento redesign — transfer notes

Branch: `redesign/bento`. Written 2026-10-10.

This redesign changes **only the homepage UI and the site header**. No database,
API, auth, email or routing code was touched. Everything below is the checklist
that proves it, plus how to back up the CMS before merging.

---

## 1. Back up the CMS first (one command)

```bash
npm run export
```

Runs `scripts/export-content.js` against `MONGODB_URI` from your `.env`. It is
**read-only** (only `find()`), and writes every collection to
`backups/<timestamp>/<collection>.json` with a `_summary.json` of counts.
`backups/` is gitignored, so nothing private gets committed.

Keep that folder. If anything ever looked wrong after the redesign, the counts in
`_summary.json` are what to compare against.

---

## 2. What changed

| File | Change |
| --- | --- |
| `src/pages/Home.jsx` | Rewritten: scrolling "Worked with" logo strip, short intro + photo, every project in one bento grid, a one-line contact card. The form is no longer on the homepage; it lives on `/contact` (same component, same API). |
| `src/components/Layout.jsx` | Header is now the signature mark plus two buttons: **Work** (scrolls to projects) and **Contact me** (opens `/contact`). |
| `src/bento.css` | New stylesheet, every class prefixed `bn-`. Imported only by `Home.jsx` and `Layout.jsx`. |
| `src/data/site.js` | Added `home.intro`, `home.featured`, and `companies`. Nothing existing was removed. |
| `scripts/export-content.js`, `package.json`, `.gitignore` | The backup script above. |

`src/index.css` was **not edited**. All legacy classes (`.admin-*`, `.editor-*`,
`.prose`, `.field*`, `.index-row`, …) are untouched, so `/admin`, the editor and
every inner page render exactly as before.

---

## 3. Where your content comes from now

| Homepage block | Source | Edit it in |
| --- | --- | --- |
| Logo strip | `companies` (name, optional `logo`) | `src/data/site.js`, logos in `public/logos/` |
| Intro (name, headline, paragraph, status) | `home.intro`, `profile` | `src/data/site.js` |
| Photo | `home.intro.photo` (defaults to `/mocks/mock-portrait.png`) | Replace the file, or change the path |
| Project bento | `GET /api/projects` (published only). Slugs in `home.featured` go first and get the large tile; the rest follow CMS order. Tile sizes adapt to any count so rows always end flush. | `/admin` + `site.js` |
| Cover images | `coverImage` from the CMS, then the existing `/mocks/*` fallbacks | `/admin` |
| Contact | Homepage shows a short card linking to `/contact`; the form there is the unchanged `AppointmentForm` → `POST /api/appointments` | unchanged |

Publishing, unpublishing, reordering or editing a case study in `/admin` shows up
on the new homepage with no code change, same as before.

---

## 4. Things that must keep working (verify after deploy)

- [ ] `/` loads, shows every published project, featured cards link to `/work/<slug>`
- [ ] Contact form on `/contact` submits; a notification email arrives at `NOTIFY_EMAIL`
- [ ] Honeypot (`website` field) still hidden
- [ ] `/work`, `/work/:slug`, `/writing`, `/writing/:slug`, `/about` render
- [ ] `/design`, `/design/:slug` render (separate stylesheet, untouched)
- [ ] `/login` → `/admin`: list, edit, publish a draft, unpublish it again
- [ ] Share links: `/go/<token>` unlocks the site and redirects
- [ ] Site-access password gate still appears for a fresh browser
- [ ] `/tracker` still works (standalone, never wrapped in Layout)
- [ ] `/resume.pdf` and `/design/resume.pdf` download

---

## 5. Deploying

Pushes to `main` auto-deploy. Commit as **Satyamknown** (see AGENTS.md, "the
commit-author trap") or Vercel blocks the deploy.

Safer path: push the branch first. Vercel builds a **preview URL** for it, which
uses the same database, so you can run section 4 against real data before merging
to `main`.

To roll back: Vercel → Deployments → previous production deploy → Promote.
Your data is unaffected either way.
