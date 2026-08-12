# The Complete Build Guide
## KP Forest Department Web Portal — zero to deployed

**Stack:** Next.js 15 · PostgreSQL (Neon) · Prisma · Tailwind · Framer Motion
**Tool:** Cursor IDE
**Deliverable:** A fully dynamic bilingual government portal with an admin dashboard,
covering 3 forest regions, 8 circles and 32 divisions.

Follow the parts in order. Each one ends with a check — do not move on until it passes.

---

# Contents

| Part | What happens | Roughly |
|---|---|---|
| 1 | Install Node, Git and Cursor | 20 min |
| 2 | Create the database on Neon | 10 min |
| 3 | Create the Next.js app, configure Cursor | 15 min |
| 4 | Drop in the starter files | 10 min |
| 5 | Prompts 1–2: dependencies, schema, seed | 30 min |
| 6 | Prompt 3: the design system | 20 min |
| 7 | Add real photography | 30 min |
| 8 | Prompts 4–8: build the public site | 3–5 hrs |
| 9 | Prompts 9–10: auth and dashboard | 3–4 hrs |
| 10 | Prompts 11–15: remaining modules | 4–6 hrs |
| 11 | Prompt 16: harden and test | 2 hrs |
| 12 | Deploy | 1 hr |
| 13 | Troubleshooting and working habits | reference |

---

# Part 1 — Install the prerequisites

No Docker required. Three things only.

### Node.js 20 LTS

nodejs.org → download the **LTS** build (not Current). Accept all defaults.

### Git

git-scm.com → download → accept all defaults.

### Cursor

cursor.com → download → install → sign in.

### Verify

Open a **new** terminal:

```bash
node -v      # v20.x or v22.x
npm -v       # 10.x
git -v       # 2.x
```

**✅ Check:** all three print a version number. If `node` is not recognised on Windows,
restart your computer — the installer's PATH change needs it.

---

# Part 2 — Create the database on Neon

Neon is hosted PostgreSQL with a free tier. Nothing to install, and Prisma treats it
exactly like a local database.

1. Go to **neon.tech** → sign up (GitHub login is fastest).
2. **Create project.** Name it `kp-forest`. Pick the region closest to Pakistan —
   Singapore or Frankfurt.
3. On the dashboard, open **Connection Details**.
4. You need **two** connection strings. This is the part everyone gets wrong.

**Pooled** — the default one shown. Hostname contains `-pooler`:
```
postgresql://neondb_owner:npg_xxxx@ep-cool-frost-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Direct** — toggle off "Pooled connection" to reveal it. Same string, no `-pooler`:
```
postgresql://neondb_owner:npg_xxxx@ep-cool-frost-a1b2c3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Copy both into a scratch file for now.

**Why two?** Prisma runs normal queries through the pooler, but migrations need long-lived
sessions and advisory locks that a transaction-mode pooler silently breaks. Using the
pooled URL for migrations produces a hang with no error message.

### About hosting

Neon is US/EU/Asia hosted. KP government procurement often requires data residency in
Pakistan, and citizen complaint records containing CNIC numbers are exactly the data that
question gets asked about. Build on Neon — it costs nothing to switch later, since only the
connection string changes — but raise hosting with the department's IT wing **now**, not at
handover. That approval takes longer than the build does.

### If you must run PostgreSQL locally instead

Install PostgreSQL 16 from postgresql.org, add `C:\Program Files\PostgreSQL\16\bin` to your
PATH, then:

```bash
psql -U postgres
```
```sql
CREATE DATABASE kp_forest;
CREATE USER forest_admin WITH ENCRYPTED PASSWORD 'forest123';
GRANT ALL PRIVILEGES ON DATABASE kp_forest TO forest_admin;
\c kp_forest
GRANT ALL ON SCHEMA public TO forest_admin;
\q
```

That last `GRANT ALL ON SCHEMA public` is mandatory on PostgreSQL 15+. Without it the
migration fails with a permission error that looks unrelated to permissions.

Both `DATABASE_URL` and `DIRECT_URL` then point at the same local string.

**✅ Check:** you have two connection strings, and they differ only by `-pooler`.

---

# Part 3 — Create the app and configure Cursor

```bash
cd Documents            # or wherever you keep projects
npx create-next-app@latest kp-forest
```

Answer **exactly** this:

```
TypeScript?                        Yes
ESLint?                            Yes
Tailwind CSS?                      Yes
src/ directory?                    Yes
App Router?                        Yes
Turbopack for next dev?            Yes
Customize import alias?            Yes  →  @/*
```

Then:

```bash
cd kp-forest
cursor .
```

### Configure Cursor

1. **Settings → Models** — enable a strong model and make it the Composer default. Weaker
   models cannot hold a rules file this size in context, and you will spend the whole build
   correcting them.
2. **Settings → Features → Codebase Indexing** — turn it on. This is what lets Cursor see
   your Prisma schema while writing a component in another folder.
3. Always use **Agent mode** in Composer. Chat mode can only talk; Agent mode creates files
   and runs commands.

| Shortcut | Does |
|---|---|
| `Ctrl/Cmd + I` | Composer (Agent) — where every prompt below goes |
| `Ctrl/Cmd + L` | Chat about the current file |
| `Ctrl/Cmd + K` | Inline edit selected code |
| `@file` `@folder` | Attach specific context to a prompt |

**✅ Check:** `npm run dev` serves the Next.js welcome page at localhost:3000. Stop it with `Ctrl+C`.

---

# Part 4 — Starter files

Unzip `kp-forest-starter.zip` and merge its contents into your project:

```
kp-forest/
├── .cursorrules              ← rename from cursorrules.txt
├── .cursorignore             ← create this, contents below
├── .env                      ← create this, contents below
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── lib/prisma.ts
    ├── lib/data/site.ts
    └── components/
        ├── motion/reveal.tsx
        └── site/navbar.tsx
```

**The `.cursorrules` rename is critical.** Cursor reads only that exact path, and the leading
dot hides it. Verify with `ls -a` (Mac/Linux) or `dir /a` (Windows).

### `.cursorignore`

```
node_modules
.next
public/uploads
*.log
prisma/migrations
```

### `.env`

```bash
DATABASE_URL="<your pooled Neon string>&pgbouncer=true&connection_limit=1"
DIRECT_URL="<your direct Neon string>"
AUTH_SECRET="<generate below>"
AUTH_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

Generate the secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Confirm `.env` appears in `.gitignore`. It should by default — check anyway. A leaked
`AUTH_SECRET` on a government repository is a real incident, not a hypothetical one.

### Patch the schema for Neon

Open `prisma/schema.prisma` and change the datasource block to add `directUrl`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Commit the baseline

```bash
git init
git add -A
git commit -m "Baseline: schema, seed, design system, Cursor rules"
```

**Commit after every prompt from here on.** It is your only real undo. When Cursor
confidently rewrites six files you never mentioned, `git checkout .` fixes it in seconds.

**✅ Check:** `.cursorrules` exists at the project root, `.env` has four filled values, and
the schema has `directUrl`.

---

# Part 5 — Prompts 1 and 2: dependencies, schema, seed

Open Composer (`Ctrl/Cmd + I`), Agent mode. Paste one prompt, wait, verify, commit, move on.

### Prompt 1 — setup

```
Set up the foundation of the project.

1. Install:
   npm i @prisma/client next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers
         framer-motion lenis lucide-react @tanstack/react-table slugify
   npm i -D prisma tsx @types/bcryptjs

2. Initialise shadcn/ui and add: button card dialog form input textarea select table tabs
   badge dropdown-menu sheet sonner separator avatar skeleton

3. Use prisma/schema.prisma as it already exists in the repo. Do not rewrite it.
   Make exactly one change: add CHIEF_MINISTER and SECRETARY_CLIMATE_CHANGE to the
   MessageKind enum, before SECRETARY.

4. Add to package.json:
   "prisma": { "seed": "tsx prisma/seed.ts" }
   and scripts: db:migrate, db:seed, db:studio, db:reset

5. Run: npx prisma migrate dev --name init

Do not build any UI. Stop when the migration succeeds.
```

Verify yourself — do not take Cursor's word for it:

```bash
npx prisma studio      # opens localhost:5555
```

You should see empty tables including `Region`, `Circle`, `Division`, `NavItem`, `Message`.

```bash
git add -A && git commit -m "Prompt 1: dependencies, schema, first migration"
```

### Prompt 2 — seed

```
Use prisma/seed.ts as it exists. Update only the navigation array so the seeded navbar is
exactly this, in this order:

1. Home                     → /
2. About KP Forest          → /about
   - Introduction           → /about
   - Vision & Mission       → /about/vision-mission
   - Organogram             → /about/organogram
   - Functions & Mandate    → /about/mandate
3. Messages                 (dropdown, no href)
   - Message from the Chief Minister, KP        → /messages/chief-minister
   - Message from the Secretary, Climate Change → /messages/secretary-climate-change
4. KP Forest Regions        → /regions   (isDynamicRegions = true)
5. Projects                 (dropdown)
   - Completed              → /projects/completed
   - Ongoing                → /projects/ongoing
   - Future Projects        → /projects/future
6. Downloads                (dropdown)
   - Publications           → /downloads/publications
   - Notifications          → /downloads/notifications
   - Acts, Rules & Policies → /downloads/acts-rules-policies
7. Media Gallery            (dropdown, isMegaMenu = true)
   - Press Releases         → /media/press-releases
   - Photo Gallery          → /media/photos
   - Video Gallery          → /media/videos
   - News Coverage          → /media/news
8. Contact Us               (dropdown)
   - Contact Directory      → /contact
   - Lodge a Complaint      → /contact/complaint
   - Submit a Suggestion    → /contact/suggestion

Also change the two seeded Message records to kind CHIEF_MINISTER (slug "chief-minister")
and SECRETARY_CLIMATE_CHANGE (slug "secretary-climate-change").

Do not change anything else. The region, circle and division data must stay exactly as
written — 3 regions, 8 circles, 32 divisions, same names, same slugs, same headquarters.
Keep the seed idempotent.
```

```bash
npx prisma db seed
```

Expected:
```
✓ done — 3 regions, 8 circles, 32 divisions
  login: admin@forest.kp.gov.pk / ChangeMe123!
```

**Spot-check in Prisma Studio.** Open the `Division` table. Both *Buner Forest Division*
and *Buner Watershed Division* must exist as separate rows — they sit in different circles
and are genuinely different offices. If Cursor deduplicated them, tell it to restore both.

```bash
git commit -am "Prompt 2: seeded navigation, regions, circles, divisions"
```

**✅ Check:** 32 divisions in the database, 8 top-level nav items.

---

# Part 6 — Prompt 3: the design system

This step decides whether the site looks like a forest department or like every other
admin template. Do it before building pages — retrofitting a palette across forty
components is miserable.

```
Read @DESIGN_SYSTEM.md in full, then implement Section 7 exactly.

1. Replace src/app/globals.css with the CSS given there. Use the Tailwind v4 @theme block.
   Do not create a tailwind.config.ts.
2. Wire the four fonts in src/app/layout.tsx via next/font/google exactly as shown, and
   attach all four CSS variables to the <html> className.
3. Create src/components/motion/contour-field.tsx from the code given.
4. Remove every default colour Create Next App left behind. No blue, no gray-500, no plain
   black text. Every colour must be one of the six tokens: bark, deodar, moss, resin,
   paper, mist.

Then replace the DESIGN LANGUAGE section of .cursorrules with a condensed summary of
DESIGN_SYSTEM.md sections 1 through 6, so you follow it automatically from here on.

Do not build any pages yet.
```

**✅ Check:** run `npm run dev`, open DevTools, inspect `<body>`. Background must be
`#F1F3EC`, not white. If it is white, the `@theme` block did not apply.

```bash
git commit -am "Prompt 3: design system, fonts, contour signature"
```

---

# Part 7 — Add real photography

Cursor cannot source images. Create these folders and fill them yourself:

```
public/images/
├── hero/         forest-1.jpg, plantation.jpg, wildlife.jpg   (1920×1080)
├── regions/      central-southern.jpg, northern.jpg, malakand.jpg
├── messages/     chief-minister.jpg, secretary.jpg            (800×1000 portrait)
└── logo/         kp-emblem.png, forest-dept-logo.png
```

Use the department's own archive if at all possible. A KP government portal illustrated
with stock photography of Canadian pine forests is a genuine credibility problem, and
somebody will notice. Failing that, Unsplash has usable Swat, Kaghan and Galiyat imagery
under a licence that permits this.

Compress everything through **squoosh.app** first. Target under 300KB per hero image. Much
of your audience is on mobile data in mountain districts with weak coverage — this matters
more than it would on a commercial site.

**✅ Check:** every file above exists and none exceeds 300KB.

---

# Part 8 — Prompts 4 to 8: the public site

One prompt at a time. Run the app and actually look at the result after each.

### Prompt 4 — site shell and dynamic navbar

```
Build the public site shell.

Confirm src/lib/data/site.ts has cached read functions (unstable_cache with tags):
getNavigation, getSiteSettings, getHeroSlides, getMessages, getStatCounters, getRegions.
getNavigation must expand any NavItem with isDynamicRegions = true into the published
regions from the database.

Create src/app/(site)/layout.tsx:
- Server Component. Fetches navigation and site settings, passes them to <Navbar />.
- Wraps children in a Lenis smooth-scroll provider (client component).
- Renders <Footer /> below.

Refine src/components/site/navbar.tsx to the design system:
- Government top strip in --bark: "Government of Khyber Pakhtunkhwa" left; helpline,
  Emergency Contacts and an اردو toggle right. Hidden below md.
- Main bar: emblem, site name in English above Urdu below, then nav.
- Sticky. Past 24px scroll it becomes paper/90 with backdrop-blur and a soft shadow.
- Dropdowns open on hover (desktop) and click (keyboard/touch), close on Escape and on
  route change. aria-expanded and aria-haspopup set correctly.
- isMegaMenu items render a two-column panel; others a single column.
- Active route gets an animated --resin underline via framer-motion layoutId.
- Below lg: hamburger opens a right drawer with accordion sub-menus.

Create src/components/site/footer.tsx: four columns — About with emblem, Quick Links,
Regions from the database, Contact with social icons. Bottom bar with copyright.

Zero hardcoded links. Everything from the database.
```

**Check:** dropdowns open on hover and on keyboard. Escape closes them. The Regions
dropdown lists all three regions pulled from the database.

### Prompt 5 — animation layer

```
Create src/components/motion/reveal.tsx as a "use client" module exporting:

- <Reveal direction delay duration once> — fade and slide on scroll via whileInView,
  viewport margin "-80px".
- <Stagger gap delay> + <StaggerItem direction> — parent/child variant pair for lists.
- <AnimatedHeading text> — splits on spaces, animates each word up from behind an
  overflow-hidden mask.
- <Counter value suffix prefix> — springs 0 → value on viewport entry, toLocaleString.

Every one must call useReducedMotion() and fall back to a plain opacity fade — or to no
animation at all for AnimatedHeading. Export the shared easing constant [0.22, 1, 0.36, 1].

Also create src/components/providers/lenis-provider.tsx: initialise Lenis, destroy on
unmount, disable entirely under prefers-reduced-motion.

No other animation utilities anywhere. Every component imports from here.
```

**Check:** DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`. All motion
stops **and all content is still visible.** Content stuck at zero opacity is the single
most common bug in scroll-reveal code.

### Prompt 6 — hero

```
Create src/components/site/hero.tsx.

Server wrapper reads getHeroSlides() and passes to a client carousel. No published slides
means render nothing — no placeholder.

- Full-bleed, 88vh desktop, 70vh mobile, background --bark.
- Slides cross-fade over 900ms. Active slide runs Ken Burns scale 1.0 → 1.08 over 7s.
- <ContourField density="medium" opacity={0.08} parallax={30} /> sits between the photo
  and the dark scrim.
- Content: mono --resin eyebrow, <AnimatedHeading> title in the display face, subtitle
  fading up at 0.4s, primary and secondary CTAs at 0.6s.
- Bottom progress bars fill over the slide duration; click to jump; aria-label on each.
- Autoplay pauses on hover and on tab blur (visibilitychange).
- Prev/next arrows, keyboard accessible, hidden on mobile.
- Below the hero, a --bark band of animated <Counter> stats from getStatCounters(),
  numbers in the mono face with tabular-nums.

next/image with priority on slide one only, fill, object-cover, sizes="100vw".
Alt text from slide.imageAlt on every image.
```

### Prompt 7 — messages

```
Build the leadership messages feature.

src/components/site/messages-section.tsx (Server Component):
- Reads getMessages(), one card per message in orderIndex order.
- Card: portrait left (rounded-xl, object-cover, 4:5), text right — designation as a mono
  --resin eyebrow, name as a display-face heading, excerpt as a pull-quote in the display
  face with a decorative quote mark, then "Read the full message" with an arrow that
  slides 4px right on hover.
- Alternate the image side on every second card.
- Wrap each in <Reveal direction="up"> with delay index * 0.12.
- Missing photoUrl falls back to initials on --deodar.

src/app/(site)/messages/[slug]/page.tsx:
- generateStaticParams from published slugs; generateMetadata with OpenGraph.
- notFound() when missing or unpublished.
- Breadcrumb, large portrait, name, designation, body as prose. Signature image if present.
- "More messages" strip at the end.

src/app/(site)/messages/page.tsx: index of all published messages.
```

**Check:** `/messages/chief-minister` renders. Delete a photo URL in Prisma Studio and
confirm the initials fallback works.

### Prompt 8 — regions, circles, divisions

```
Build the three-level drill-down. This is the core navigation of the site.

Routes:
  /regions                          → all published regions
  /regions/[region]                 → that region's circles
  /regions/[region]/[circle]        → that circle's divisions
  /regions/[region]/[circle]/[div]  → division detail (header only for now)

Add to src/lib/data/site.ts: getRegionWithCircles(slug) and
getCircleWithDivisions(regionSlug, circleSlug). Filter PUBLISHED at every level, order by
orderIndex.

src/components/site/regions-section.tsx (homepage and /regions):
- Three cards. Each shows the Roman code as a large --mist watermark in the display face,
  region name, headquarters with a pin icon, shortDesc, and mono stat pills for circle and
  division counts.
- <ContourField> behind each card, with density mapped to real terrain:
    Region I  → "sparse"   (plains)
    Region II → "medium"   (Hazara)
    Region III→ "dense"    (Hindu Kush)
- Cover image with a --bark gradient overlay; image scales 1.06 on hover, card lifts 6px,
  shadow deepens to --shadow-card-hover.
- CTA reads "Explore the region" with an arrow translating 4px right.
- <Stagger> the three cards.

/regions/[region]/page.tsx:
- Header band: name, code, headquarters, description, and a MapLibre map of
  region.mapGeoJson when present — skip the map cleanly when null.
- Breadcrumb: Home / Regions / {region}.
- Circle cards: name, headquarters, division count badge, first four division names as
  chips plus a "+N more" chip. CTA "Explore the circle".
- generateStaticParams and generateMetadata per region.

/regions/[region]/[circle]/page.tsx:
- Breadcrumb: Home / Regions / {region} / {circle}.
- Header: circle name, Conservator name and contact when present.
- Division cards: name, headquarters, DFO name, sub-division count, "View division".
- A client-side search input filtering the list as you type (useState + useDeferredValue,
  no server round-trip).
- notFound() if the circle does not belong to the region in the URL.

Every page gets loading.tsx with skeletons matching the card layout, and not-found.tsx
with a link back up the hierarchy.
```

**Check:** click from `/regions` all the way down to a division. Contour density visibly
differs across the three regions. Try a deliberately wrong URL like
`/regions/northern-forest-region-ii/kohat-forest-circle` — that circle belongs to Region I,
so it must 404.

```bash
git commit -am "Prompts 4-8: public site complete"
```

---

# Part 9 — Prompts 9 and 10: auth and dashboard

### Prompt 9 — authentication and dashboard shell

```
Build authentication and the dashboard shell.

src/lib/auth.ts:
- Auth.js v5, Credentials provider, bcrypt compare against User.passwordHash.
- Reject inactive users. On success update lastLoginAt and write a LOGIN AuditLog row.
- JWT session carrying id, role, regionId, circleId, divisionId.
- Export scopeFilter(session) returning a Prisma where-fragment: SUPER_ADMIN sees all;
  REGION_ADMIN limited to its regionId; CIRCLE_ADMIN to circleId; DIVISION_ADMIN to
  divisionId.
- Export requireRole(...roles) for the top of every server action AND every dashboard page.

middleware.ts: protect /dashboard/* — redirect unauthenticated users to /login?next=...

src/app/login/page.tsx: centred card on --paper, email and password, react-hook-form with
Zod, inline errors, loading state. No public sign-up route.

src/app/(dashboard)/dashboard/layout.tsx:
- Server-side session check, redirect if absent.
- Collapsible sidebar, grouped: Overview; Content (Navigation, Hero, Messages, Pages);
  Organisation (Regions, Circles, Divisions); Projects; Downloads; Media Gallery;
  Requests & Complaints; Users; Audit Log; Settings.
- Sidebar filtered by role — a DIVISION_ADMIN never sees Users or Settings.
- Top bar: breadcrumb, search, user dropdown with sign out.
- <Toaster /> from sonner mounted here.

/dashboard: stat cards for regions/circles/divisions/published items, a pending-review
queue, and the ten most recent audit log entries.
```

**Log in** at `/login` with `admin@forest.kp.gov.pk` / `ChangeMe123!`

**Then test authorisation properly — this is the most commonly broken thing in these builds:**

1. In Prisma Studio create a second user, role `DIVISION_ADMIN`, with a `divisionId` set.
2. Log in as that user.
3. Confirm Users and Settings are absent from the sidebar.
4. **Now type `/dashboard/users` directly into the address bar.**

If that page loads, the check exists only in the sidebar. Tell Cursor:

```
Route-level authorisation is missing. Every dashboard page must call requireRole()
server-side. Hiding sidebar links is not access control.
```

### Prompt 10 — the CRUD pattern

```
Build the reusable dashboard CRUD layer, then apply it to Messages.

src/components/dashboard/data-table.tsx — TanStack Table wrapper: column sorting, global
filter, pagination, row actions dropdown (Edit, Duplicate, Archive, Delete with confirm
dialog), status badge column, bulk select.

src/components/dashboard/resource-form.tsx — form shell taking a Zod schema and field
descriptors, rendering shadcn controls, submitting through a server action, sonner toast on
result, blocking navigation on unsaved changes.

src/components/dashboard/sortable-list.tsx — drag-and-drop reordering persisting orderIndex.

src/components/dashboard/image-picker.tsx — media library dialog over MediaAsset, upload via
/api/upload (writes to UPLOAD_DIR, validates mime type, 5MB limit, creates a MediaAsset row),
returns the selected URL.

Then implement Messages using all of the above:
- src/lib/validators/message.ts — Zod schema, English required, Urdu optional
- src/server/actions/message.ts — create, update, delete, reorder, publish. Each one:
  requireRole → Zod parse → prisma write → AuditLog insert → revalidateTag("messages") →
  return { ok: true, data } | { ok: false, error }.
- /dashboard/messages — table view
- /dashboard/messages/new and /[id] — form with English/Urdu tabs and a live preview of
  the public card.

This is the pattern every other module will copy. Get it exactly right.
```

**Check:** edit a message in the dashboard, save, then reload the public homepage. The
change appears without restarting the dev server. If it does not, `revalidateTag` is missing.

```bash
git commit -am "Prompts 9-10: auth, dashboard shell, CRUD pattern"
```

---

# Part 10 — Prompts 11 to 15: remaining modules

Five prompts, one at a time, in this order. Each copies the Messages pattern.

### Prompt 11 — Projects
```
Implement the Projects module: public routes /projects/completed, /projects/ongoing,
/projects/future and /projects/[slug]; filter chips by region; a progress bar driven by
progressPct; dashboard CRUD at /dashboard/projects. Follow the exact pattern established
in the Messages module — same file layout, same naming, same
requireRole → Zod → prisma → AuditLog → revalidateTag sequence.
```

### Prompt 12 — Downloads
```
Implement Downloads: /downloads/publications, /downloads/notifications and
/downloads/acts-rules-policies, grouped by year, with file size and type badges, a search
box, and a download counter incremented through a server action. Dashboard CRUD at
/dashboard/downloads with PDF upload. Same pattern as Messages.
```

### Prompt 13 — Media Gallery
```
Implement the Media Gallery: /media/press-releases (list and detail), /media/photos (album
grid → lightbox with keyboard arrows and Escape), /media/videos (responsive embeds),
/media/news. Dashboard CRUD at /dashboard/media including multi-image album upload with
drag-and-drop reordering. Same pattern as Messages.
```

### Prompt 14 — Contact Us
```
Implement Contact Us: /contact with the departmental directory grouped by region and a
MapLibre map of the head office; /contact/complaint and /contact/suggestion as forms
writing to PublicRequest, showing a generated ticket number on success. Add a honeypot
field and rate limiting on the POST. Dashboard inbox at /dashboard/requests with the
status pipeline NEW → IN_REVIEW → APPROVED/REJECTED → FULFILLED, officer notes, and CSV
export. Same pattern as Messages.
```

### Prompt 15 — About
```
Implement About KP Forest: /about, /about/vision-mission, /about/organogram,
/about/mandate. Content comes from a new Page model (slug, title, titleUr, body, bodyUr,
coverImage, status) with dashboard CRUD and a rich text editor. Do not hardcode any copy.
```

**When Cursor drifts** — and it will, around module three or four, as context fills up:

```
Open @src/server/actions/message.ts and @src/app/(dashboard)/dashboard/messages/page.tsx.
Follow that exact structure. Same file layout, same naming, same sequence.
```

---

# Part 11 — Prompt 16: harden and test

```
Final pass before deployment. Work through these in order and report what you changed.

1. SEO: metadata on every route; sitemap.ts generated from published database rows;
   robots.ts; JSON-LD GovernmentOrganization on the homepage; OpenGraph images.
2. Accessibility: verify every interactive component for keyboard operation, --resin focus
   rings, aria attributes, alt text and 4.5:1 contrast. Add a skip-to-content link.
3. Security: rate-limit all public POST routes; CSRF protection on server actions; security
   headers in next.config.ts (CSP, X-Frame-Options, Referrer-Policy); validate and sanitise
   all uploads; confirm no server action is reachable without requireRole.
4. Errors: root error.tsx, global-error.tsx, a branded 404, Zod errors surfaced in every form.
5. Performance: audit the homepage bundle; lazy-load below-fold sections with next/dynamic;
   confirm image sizing. Target LCP under 2.5s on throttled 3G.
6. Write README.md: local setup, environment variables, seed command, deployment, backup
   strategy, and the default admin credentials with a bold warning to rotate them.
```

Then verify by hand:

```bash
npm run build          # zero type errors
npx tsc --noEmit
```

Lighthouse, **mobile + throttled 3G** profile. Targets: Performance ≥ 85, Accessibility ≥ 95,
SEO ≥ 95, Best Practices ≥ 95.

Manual checks Lighthouse cannot do:

- **Keyboard only.** Tab through the entire homepage. Visible focus ring on everything, and
  you must never get trapped inside the mobile drawer.
- **Reduced motion.** Content must be fully visible, not faded to zero waiting for an
  animation that no longer runs.
- **200% browser zoom.** Nothing overlaps, nothing scrolls horizontally.
- **Urdu rendering.** Nastaliq descenders must not collide. If they do, raise `line-height`.
- **Direct-URL authorisation.** Retest every dashboard route as a DIVISION_ADMIN.

---

# Part 12 — Deploy

### Rotate the credentials first

Before anything is publicly reachable, log in, open `/dashboard/users`, and change the
admin email and password. The seeded default is written in a file that will end up in a
Git repository.

### Staging on Vercel

Fastest way to get feedback from the department.

```bash
npm i -g vercel
vercel
```

In Project Settings → Environment Variables add `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
and `AUTH_URL` (your Vercel URL). Then:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Production on a government server

Likely where this ends up, so plan for it rather than assuming Vercel.

```bash
npm run build
npx prisma migrate deploy
npm i -g pm2
pm2 start npm --name kp-forest -- start
pm2 startup && pm2 save
```

Nginx in front for TLS and static caching. Then set up:

- Nightly `pg_dump` to off-server storage
- Nightly backup of `public/uploads` — those files are not in the database and not in Git
- Uptime monitoring

**Start the `.gov.pk` domain and TLS certificate request now.** That approval routinely
takes longer than the entire build, and it is the usual reason these projects sit finished
but unlaunched.

---

# Part 13 — Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `prisma migrate` hangs forever | Using the pooled URL for migrations | Set `directUrl` in the datasource block |
| `Can't reach database server` | Neon suspended after idle | Run any query; it wakes in a second or two |
| `permission denied for schema public` | Local PostgreSQL 15+ | `GRANT ALL ON SCHEMA public TO forest_admin;` |
| `psql is not recognized` | PATH not picked up | Close Cursor entirely and reopen — its terminal inherits PATH at launch |
| Dashboard edit does not show on the site | Missing `revalidateTag` | Add it to the server action after the write |
| Content invisible with reduced motion on | Reveal stuck at opacity 0 | Reduced-motion branch must render content, not a shortened animation |
| Type errors after a schema change | Stale client | `npx prisma generate`, then fix every error — no `any`, no `@ts-ignore` |
| Nav dropdown empty on first load | Cache tag never populated | Check `unstable_cache` tags match the `revalidateTag` calls |

### Recovery prompts

| Situation | Paste |
|---|---|
| Content hardcoded in JSX | `This violates rule 1 in .cursorrules. Content comes from the database via src/lib/data. Rewrite this component to read from the DB.` |
| Random dependency added | `Remove [package]. .cursorrules lists the approved stack. Reimplement with what is already installed.` |
| Too much animation | `Too much motion for a government portal. Reduce to a single fade-up on scroll. Transform and opacity only. Keep the reduced-motion fallback.` |
| Unprotected server action | `This action has no requireRole check, no Zod validation and no AuditLog write. Add all three, following src/server/actions/message.ts.` |
| Files changed you didn't ask about | `Revert everything outside [file]. Change only what I asked for.` |

---

# Working habits that decide how this goes

**One prompt, one commit.** Non-negotiable.

**Read the diff before accepting.** Agent mode confidently edits files you never mentioned.
Review every changed file, not just the expected one.

**Fresh Composer session per prompt.** Carrying the whole history forward fills context with
things that no longer matter and makes the model worse, not better.

**Re-anchor hourly.** `Re-read .cursorrules and list which rules this file violates.`

**Never let it touch the schema casually.** If Cursor proposes a Prisma change you did not
ask for, reject it. Schema drift breaks the seed and every query built on it.

**Describe symptoms, not fixes.** "The regions dropdown is empty on first load but populates
after a refresh" gets you a diagnosis. "Add a useEffect to the navbar" gets you a bug
wearing a hat.

**Do not hand-patch Cursor's output.** Tell it what rule it broke and let it fix its own
code. Hand-patching creates code the model no longer understands, and every subsequent
prompt gets worse.
