# Abhishek Manjhi — Portfolio

MERN portfolio with an admin dashboard for publishing case studies and blog posts.
React (Vite) frontend, Express API, MongoDB via Mongoose. Deploys to Vercel as a
single project — the API runs as a serverless function under `/api`.

## Stack

| Layer    | Choice                                    |
| -------- | ----------------------------------------- |
| Frontend | React 18 + React Router + Vite            |
| API      | Express 4 (serverless on Vercel)          |
| Database | MongoDB Atlas + Mongoose                  |
| Auth     | JWT, single admin account, bcrypt hash    |
| Content  | Markdown, rendered with `marked`          |

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a MongoDB Atlas database

Sign up at mongodb.com/atlas, create a free M0 cluster, add a database user, and
under Network Access allow `0.0.0.0/0` (Vercel's function IPs are dynamic).
Copy the connection string.

### 3. Set your environment variables

```bash
cp .env.example .env
```

Generate the password hash for your admin login:

```bash
npm run hash -- "your-chosen-password"
```

Paste the output into `.env` along with your Mongo URI and a long random
`JWT_SECRET`. Your plain password never gets stored anywhere — only the hash.

### 4. Run locally

```bash
npm run dev
```

Frontend on `localhost:5173`, API on `localhost:5001`. Vite proxies `/api` calls
to the backend automatically. (Port 5000 is taken by macOS AirPlay Receiver, so
the API uses 5001.)

If `MONGODB_URI` is missing, `npm run dev` boots a local MongoDB on disk instead,
storing data in `.localdb/`. Set `MONGODB_URI` to use Atlas.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at vercel.com/new. Vercel detects Vite — leave the build settings alone.
3. Under **Settings → Environment Variables**, add all four values from your `.env`:
   `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.
4. Deploy.

`vercel.json` routes `/api/*` to the Express function and everything else to the
React app so client-side routing works on refresh.

## Content

Site copy — hero, positioning, the two argument sections, in-progress items, bios,
and microcopy — lives in `src/data/site.js`. Case studies and posts live in
MongoDB and are edited at `/admin`.

To reload the five seeded case studies (idempotent, upserts by slug):

```bash
npm run seed
```

## Publishing content

Go to `/login`, sign in with your admin email and password, and you land on `/admin`.

**Case studies** support a version label (the `v1.4` markers on the changelog),
role, client, year, tags, and metrics. Metrics use one line each, formatted
`value | label` — so `52 | calls` renders as a `52 calls` chip.

**Posts** are simpler: title, excerpt, tags, body.

Anything left unpublished stays a draft and is invisible to the public API.

### The editor

The body field is a Markdown editor with a formatting toolbar — headings, bold,
italic, links, quotes, bulleted and numbered lists, code blocks, images, and
dividers. `⌘B`, `⌘I`, and `⌘K` work as shortcuts. Toolbar actions apply to the
current selection and toggle off if you press them again.

Three view modes sit at the right of the toolbar:

| Mode      | What it does                        |
| --------- | ----------------------------------- |
| Write     | Just the Markdown source            |
| Split     | Source and live preview side by side |
| Preview   | Rendered output only                |

Word count and estimated read time show under the editor.

### Images and captions

The toolbar's image button opens a small form with three fields: **URL**, **alt
text**, and an optional **caption**. It inserts:

```markdown
![alt text](https://example.com/shot.png "Your caption")
```

The caption goes in the title slot, and a custom renderer turns any image with
one into a `<figure>` with a centered `<figcaption>` underneath. Images without a
caption still render as figures, just without the text.

Both content types also have a cover image field. Everything expects a URL rather
than a file upload — host images on Cloudinary (free tier is generous) or S3 and
paste the link. Adding direct uploads later means adding a storage provider; URLs
keep the deploy to one service.

## Structure

```
api/index.js          Express app, exported for Vercel
server/
  db.js               Cached Mongoose connection (serverless-safe)
  models/             Project, Post
  routes/             auth, projects, posts
  middleware/auth.js  JWT verification
  dev.js              Local dev server (falls back to an on-disk local Mongo)
src/
  pages/              Home, Work, WorkDetail, Writing, WritingDetail, Login, Admin
  components/         Layout, Editor, Markdown, Loading
  lib/api.js          Fetch wrapper + token handling
  index.css           Design tokens and all styling
scripts/hash.js       Generates the admin password hash
```
