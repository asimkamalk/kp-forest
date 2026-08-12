# Cursor IDE — Prompt Pack
## KP Forest Department Web Application

**How to use this file**

1. Put **Prompt 0** into `.cursorrules` at the project root. Cursor loads it into every request automatically — you never paste it again.
2. Then paste **Prompt 1 → 2 → 3 → …** one at a time, in order, into Cursor's Composer (`Cmd/Ctrl + I`) in **Agent mode**.
3. After each prompt, run the app, check it works, commit. Do **not** paste two prompts at once — Cursor loses accuracy on large multi-feature requests.
4. When Cursor drifts, re-anchor it with: `Re-read .cursorrules. You violated rule X. Fix only that.`

---

## Prompt 0 — `.cursorrules` (paste into the file, not the chat)

```
# PROJECT
Official web portal for the Forest Department, Government of Khyber Pakhtunkhwa, Pakistan.
Public-sector website. Bilingual (English + Urdu). Must be fully dynamic — every piece of
content, including navigation links and hero slides, is editable from an admin dashboard.
Nothing is hardcoded in JSX.

# STACK — do not substitute
- Next.js 15, App Router, TypeScript strict mode, src/ directory, alias "@/*"
- PostgreSQL + Prisma ORM
- Tailwind CSS + shadcn/ui (components copied into repo, no external UI dependency)
- Auth.js v5 (next-auth beta) — Credentials provider + bcryptjs. No OAuth providers.
- Framer Motion for animation, Lenis for smooth scroll
- react-hook-form + Zod (one Zod schema validates both client and server)
- TanStack Table for dashboard tables
- MapLibre GL for maps (no API key, no billing account)
- lucide-react for icons

# ARCHITECTURE RULES
1. Components NEVER import prisma directly.
   - Reads  -> src/lib/data/*.ts, wrapped in unstable_cache with a tag
   - Writes -> src/server/actions/*.ts, "use server", Zod-validated, then revalidateTag()
2. Default to Server Components. Add "use client" only for interactivity
   (state, effects, event handlers, framer-motion).
3. Every content model has: status (DRAFT|REVIEW|PUBLISHED|ARCHIVED) and orderIndex.
   Public queries ALWAYS filter status: "PUBLISHED".
4. Every user-facing text field has an Urdu twin (nameUr, titleUr, bodyUr...).
5. Row-level access control lives in src/lib/auth.ts via scopeFilter(session).
   Never enforce permissions in the UI only.
6. Every dashboard write creates an AuditLog row (userId, action, entity, before, after).
7. Slugs are unique per parent, not globally: @@unique([regionId, slug]).
8. All images use next/image. All links use next/link.
9. No `any`. No `@ts-ignore`. Export inferred types from Zod schemas.
10. Server actions return { ok: true, data } | { ok: false, error } — never throw to the client.

# ANIMATION RULES
- Only animate transform and opacity. Never width/height/top/left.
- Every animation respects useReducedMotion() from framer-motion.
- Use the shared primitives in src/components/motion/reveal.tsx
  (Reveal, Stagger, StaggerItem, AnimatedHeading). Do not write one-off variants.
- Shared easing everywhere: [0.22, 1, 0.36, 1].
- Animation is subtle and institutional. This is a government site, not a portfolio.

# ACCESSIBILITY (this WILL be audited)
- WCAG 2.1 AA. Real <button>/<a> elements, never clickable divs.
- Visible focus rings. Keyboard-navigable dropdowns. Escape closes overlays.
- aria-expanded / aria-haspopup on menu triggers. alt text on every image.
- Text contrast ratio >= 4.5:1.

# PERFORMANCE
Many users are on 3G mobile. No hero videos. No animation libraries beyond framer-motion.
Lazy-load below-the-fold sections. Keep the homepage JS bundle under 200KB.

# DESIGN LANGUAGE
Forest green primary (#166534), gold accent (#ca8a04), warm neutrals, generous whitespace.
Institutional and trustworthy. Rounded-xl cards, soft shadows, no gradients on text,
no glassmorphism, no neon. Inter for English, Noto Nastaliq Urdu for Urdu.

# WHEN UNSURE
Ask before inventing a new model, route, or dependency. Prefer editing existing files
over creating parallel ones. Never scaffold placeholder pages I did not ask for.
```

---

## Prompt 1 — Project setup and database

```
Set up the foundation of the project.

1. Install these dependencies:
   npm i @prisma/client next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers
         framer-motion lenis lucide-react @tanstack/react-table slugify
   npm i -D prisma tsx @types/bcryptjs

2. Initialise shadcn/ui and add: button card dialog form input textarea select table tabs
   badge dropdown-menu sheet sonner separator avatar skeleton

3. Use the prisma/schema.prisma file I have already placed in the repo. Do not rewrite it.
   Make only this change: add CHIEF_MINISTER and SECRETARY_CLIMATE_CHANGE to the
   MessageKind enum, before SECRETARY.

4. Create src/lib/prisma.ts as a singleton PrismaClient guarded against hot-reload
   duplication in development.

5. Create .env.example with DATABASE_URL, AUTH_SECRET, AUTH_URL, UPLOAD_DIR.

6. Add to package.json:
   "prisma": { "seed": "tsx prisma/seed.ts" }
   and scripts: "db:push", "db:migrate", "db:seed", "db:studio"

7. Run: npx prisma migrate dev --name init

8. Configure Tailwind: extend theme with a `forest` colour scale built around #166534
   and a `gold` scale around #ca8a04. Add the Inter and Noto Nastaliq Urdu fonts via
   next/font in src/app/layout.tsx.

Do not build any UI yet. Stop when the migration succeeds.
```

---

## Prompt 2 — Seed data

```
Use the prisma/seed.ts file already in the repo as the base. Update it so the seeded
navigation matches this exact top-level structure, in this order:

1. Home                     -> /
2. About KP Forest          -> /about
   - Introduction           -> /about
   - Vision & Mission       -> /about/vision-mission
   - Organogram             -> /about/organogram
   - Functions & Mandate    -> /about/mandate
3. Messages                 (dropdown, no href)
   - Message from the Chief Minister, KP        -> /messages/chief-minister
   - Message from the Secretary, Climate Change -> /messages/secretary-climate-change
4. KP Forest Regions        -> /regions   (isDynamicRegions = true, children generated from DB)
5. Projects                 (dropdown)
   - Completed              -> /projects/completed
   - Ongoing                -> /projects/ongoing
   - Future Projects        -> /projects/future
6. Downloads                (dropdown)
   - Publications           -> /downloads/publications
   - Notifications          -> /downloads/notifications
   - Acts, Rules & Policies -> /downloads/acts-rules-policies
7. Media Gallery            (dropdown, isMegaMenu = true)
   - Press Releases         -> /media/press-releases
   - Photo Gallery          -> /media/photos
   - Video Gallery          -> /media/videos
   - News Coverage          -> /media/news
8. Contact Us               (dropdown)
   - Contact Directory      -> /contact
   - Lodge a Complaint      -> /contact/complaint
   - Submit a Suggestion    -> /contact/suggestion

Also seed:
- Two Message records: kind CHIEF_MINISTER (slug "chief-minister") and
  SECRETARY_CLIMATE_CHANGE (slug "secretary-climate-change"), status PUBLISHED,
  with placeholder body text that says the real text is to be entered from the dashboard.
- Keep the existing region/circle/division seed data exactly as it is — 3 regions,
  8 circles, 32 divisions. Do not change any name, slug or headquarters.
- Keep the hero slides, stat counters, site settings and SUPER_ADMIN user.

The seed must be idempotent — safe to run repeatedly. Use upsert or count-guards.
Run it and print the final counts.
```

---

## Prompt 3 — Site shell and dynamic navbar

```
Build the public site shell.

Create src/lib/data/site.ts with cached read functions (unstable_cache + tags):
getNavigation, getSiteSettings, getHeroSlides, getMessages, getStatCounters, getRegions.
getNavigation must expand any NavItem with isDynamicRegions = true into the published
regions from the database.

Create src/app/(site)/layout.tsx:
- Server Component. Fetches navigation + site settings and passes them to <Navbar />.
- Wraps children in a Lenis smooth-scroll provider (client component).
- Renders <Footer /> below.

Create src/components/site/navbar.tsx ("use client"):
- Government top strip: "Government of Khyber Pakhtunkhwa" on the left; helpline number,
  Emergency Contacts link and an اردو language toggle on the right. Hidden below md.
- Main bar: departmental emblem + site name (English above, Urdu below), then the nav.
- Sticky. On scroll past 24px it becomes bg-white/90 with backdrop-blur and a soft shadow.
- Dropdowns open on hover (desktop) and on click (keyboard/touch), close on Escape,
  close on route change. aria-expanded and aria-haspopup set correctly.
- Items with isMegaMenu render a 2-column panel; others render a single column.
- Active route gets an animated underline using framer-motion layoutId.
- Below lg: hamburger opens a right-side drawer with accordion sub-menus.

Create src/components/site/footer.tsx: four columns — About + emblem, Quick Links,
Regions (from DB), Contact + social icons. Bottom bar with copyright and a
"Designed & developed for the Forest Department, Government of KP" line.

Everything renders from the database. Zero hardcoded links.
```

---

## Prompt 4 — Animation layer

```
Create src/components/motion/reveal.tsx as a "use client" module exporting:

- <Reveal direction="up|down|left|right|none" delay duration once> — fades and slides
  children in on scroll using whileInView, viewport margin "-80px".
- <Stagger gap delay> + <StaggerItem direction> — parent/child variant pair for lists.
- <AnimatedHeading text> — splits the string on spaces and animates each word up from
  behind an overflow-hidden mask.
- <Counter value suffix prefix duration> — animates 0 -> value with useSpring when the
  element enters the viewport. Formats with toLocaleString.

Every one of these must call useReducedMotion() and fall back to a plain opacity fade
(or no animation at all for AnimatedHeading) when the user prefers reduced motion.
Shared easing constant [0.22, 1, 0.36, 1] exported from this file.

Also create src/components/providers/lenis-provider.tsx — initialises Lenis, destroys it
on unmount, and disables itself entirely when prefers-reduced-motion is set.

Do not create any other animation utilities. Every other component imports from here.
```

---

## Prompt 5 — Hero section

```
Create src/components/site/hero.tsx.

Server Component wrapper reads slides via getHeroSlides() and passes them to a client
carousel. If there are no published slides, render nothing (no placeholder).

Carousel behaviour:
- Full-bleed, min-height 88vh on desktop, 70vh on mobile.
- Slides cross-fade over 900ms. The active slide's image runs a slow Ken Burns scale
  from 1.0 to 1.08 over the full 7s slide duration.
- Dark overlay whose opacity comes from slide.overlayOpacity (0-100).
- Content: eyebrow "Government of Khyber Pakhtunkhwa", then <AnimatedHeading> for the
  title, then subtitle fading up with a 0.4s delay, then the primary and secondary CTA
  buttons fading up at 0.6s.
- Progress indicators along the bottom: thin bars that fill over the slide duration.
  Clicking one jumps to that slide. aria-label on each.
- Autoplay pauses on hover and when the tab is hidden (visibilitychange).
- Prev/next arrow buttons, keyboard accessible, hidden on mobile.
- A subtle scroll-down chevron that bounces, hidden when prefers-reduced-motion.
- Below the hero, a band of animated <Counter> stats read from getStatCounters().

Images: next/image with priority on the first slide only, fill, object-cover,
sizes="100vw". Every image needs alt text from slide.imageAlt.
```

---

## Prompt 6 — Messages section

```
Build the leadership messages feature.

src/components/site/messages-section.tsx (Server Component):
- Section heading "Messages" with a short intro line.
- Reads getMessages(). Renders one card per message in orderIndex order.
- Card layout: portrait photo on the left (rounded-xl, object-cover, 4:5 ratio),
  text on the right — designation as a small gold uppercase eyebrow, person name as
  the heading, then the excerpt in a serif italic pull-quote style with a decorative
  quote mark, then a "Read full message" link with an arrow that slides right on hover.
- Alternate the image side on every second card.
- Wrap each card in <Reveal direction="up"> with a stagger delay of index * 0.12.
- Handle a missing photoUrl gracefully with an initials avatar on a forest-green background.

src/app/(site)/messages/[slug]/page.tsx:
- generateStaticParams from published message slugs.
- generateMetadata with title, description from excerpt, and OpenGraph image from photoUrl.
- notFound() when the message is missing or not published.
- Layout: breadcrumb, large portrait, name and designation, then the body rendered as
  prose (Tailwind typography). Signature image at the bottom if signatureUrl exists.
- A "More messages" strip at the end linking to the other published messages.

src/app/(site)/messages/page.tsx: index listing all published messages.
```

---

## Prompt 7 — Regions → Explore → Circles → Explore

```
Build the three-level organisational drill-down. This is the core navigation of the site.

Routes:
  /regions                          -> all published regions
  /regions/[region]                 -> that region's circles
  /regions/[region]/[circle]        -> that circle's divisions
  /regions/[region]/[circle]/[div]  -> division detail (stub for now, just the header)

Add to src/lib/data/site.ts: getRegionWithCircles(slug) and
getCircleWithDivisions(regionSlug, circleSlug). Both filter status PUBLISHED at every
level and order by orderIndex.

src/components/site/regions-section.tsx (used on the homepage and on /regions):
- Three large cards, one per region. Each shows: the Roman numeral code in a large
  translucent watermark, the region name, headquarters with a pin icon, shortDesc,
  and two stat pills — circle count and total division count.
- Cover image with a forest-green gradient overlay; the image scales to 1.06 on hover
  while the overlay darkens. Card lifts 6px with a deepening shadow.
- The CTA reads "Explore Region" with an arrow that translates 4px right on hover.
- <Stagger> the three cards.

/regions/[region]/page.tsx:
- Page header band: region name, code, headquarters, description, and a MapLibre map
  rendering region.mapGeoJson when present (skip the map cleanly when it is null).
- Breadcrumb: Home / Regions / {region}.
- Grid of circle cards. Each card: circle name, headquarters, division count badge,
  and the first four division names as small chips with a "+N more" chip.
  CTA "Explore Circle".
- generateStaticParams from published region slugs. generateMetadata per region.

/regions/[region]/[circle]/page.tsx:
- Breadcrumb: Home / Regions / {region} / {circle}.
- Header: circle name, Conservator of Forests name and contact if present.
- Grid of division cards: name, headquarters, DFO name, sub-division count,
  and a "View Division" link.
- A client-side search input that filters the division list as you type
  (useState + useDeferredValue, no server round-trip).
- notFound() if the circle does not belong to the region in the URL.

Every page must have loading.tsx with skeletons matching the card layout, and
not-found.tsx with a link back up the hierarchy.
```

---

## Prompt 8 — Auth and dashboard shell

```
Build authentication and the dashboard shell.

src/lib/auth.ts:
- Auth.js v5 config, Credentials provider, bcrypt compare against User.passwordHash.
- Reject inactive users. Update lastLoginAt and write a LOGIN AuditLog row on success.
- JWT session carrying: id, role, regionId, circleId, divisionId.
- Export a `scopeFilter(session)` helper that returns a Prisma where-fragment restricting
  rows by the user's role: SUPER_ADMIN sees everything; REGION_ADMIN is limited to its
  regionId; CIRCLE_ADMIN to its circleId; DIVISION_ADMIN to its divisionId.
- Export `requireRole(...roles)` for use at the top of every server action.

middleware.ts: protect /dashboard/* — redirect unauthenticated users to /login?next=...

src/app/login/page.tsx: centred card, email + password, react-hook-form + Zod,
inline error messages, loading state on submit. No public sign-up route.

src/app/(dashboard)/dashboard/layout.tsx:
- Server-side session check, redirect if absent.
- Collapsible left sidebar with grouped nav: Overview, Content (Navigation, Hero,
  Messages, Pages), Organisation (Regions, Circles, Divisions), Projects, Downloads,
  Media Gallery, Requests & Complaints, Users, Audit Log, Settings.
- Sidebar items are filtered by role — a DIVISION_ADMIN never sees Users or Settings.
- Top bar: breadcrumb, search, user dropdown with sign-out.
- <Toaster /> from sonner mounted here.

/dashboard (Overview): stat cards for regions/circles/divisions/published items,
a "pending review" queue, and the ten most recent audit log entries.
```

---

## Prompt 9 — Dashboard CRUD generator

```
Build the reusable dashboard CRUD layer, then apply it to Messages first.

src/components/dashboard/data-table.tsx:
Generic TanStack Table wrapper with column sorting, a global filter input,
pagination, a per-row actions dropdown (Edit, Duplicate, Archive, Delete with a
confirm dialog), a status badge column, and a bulk-select header.

src/components/dashboard/resource-form.tsx:
A form shell taking a Zod schema and field descriptors, rendering shadcn form controls,
handling submit through a server action, showing a sonner toast on success or error,
and blocking navigation on unsaved changes.

src/components/dashboard/sortable-list.tsx:
Drag-and-drop reordering that persists orderIndex through a server action.

src/components/dashboard/image-picker.tsx:
Opens a media library dialog listing MediaAsset rows, supports upload via
/api/upload (writes to UPLOAD_DIR, validates mime type and a 5MB limit,
generates a MediaAsset row), and returns the selected URL.

Then implement the Messages module using all of the above:
- src/lib/validators/message.ts — Zod schema, English fields required, Urdu optional
- src/server/actions/message.ts — createMessage, updateMessage, deleteMessage,
  reorderMessages, publishMessage. Each one: requireRole, Zod parse, prisma write,
  AuditLog insert, revalidateTag("messages"), return the result object.
- /dashboard/messages — table view
- /dashboard/messages/new and /dashboard/messages/[id] — form view with an
  English/Urdu tab pair and a live preview of the public card.

Once this works I will ask you to repeat the identical pattern for the other modules.
```

---

## Prompt 10 — Remaining public modules

Run these **one at a time**, in this order. Each follows the same shape as Prompt 9.

```
Implement the Projects module: public routes /projects/completed, /projects/ongoing,
/projects/future and /projects/[slug]; filter chips by region; a progress bar driven by
progressPct; and the dashboard CRUD at /dashboard/projects. Follow the exact pattern
established in the Messages module.
```

```
Implement the Downloads module: /downloads/publications and /downloads/notifications,
grouped by year, with file size and type badges, a search box, and a download counter
that increments through a server action. Dashboard CRUD at /dashboard/downloads with
PDF upload.
```

```
Implement the Media Gallery: /media/press-releases (list + detail),
/media/photos (album grid -> lightbox with keyboard arrows and Escape),
/media/videos (responsive embeds), /media/news. Dashboard CRUD at /dashboard/media
including multi-image album upload with drag-and-drop reordering.
```

```
Implement Contact Us: /contact with the departmental directory grouped by region and a
MapLibre map of the head office; /contact/complaint and /contact/suggestion as forms
writing to PublicRequest with a generated ticket number shown on success. Add honeypot
+ rate limiting on the POST. Dashboard inbox at /dashboard/requests with a status
pipeline (NEW -> IN_REVIEW -> APPROVED/REJECTED -> FULFILLED), officer notes, and
CSV export.
```

```
Implement About KP Forest: /about, /about/vision-mission, /about/organogram,
/about/mandate. Content comes from a new Page model (slug, title, titleUr, body, bodyUr,
coverImage, status) with dashboard CRUD and a rich text editor. Do not hardcode any copy.
```

---

## Prompt 11 — Hardening before handover

```
Final pass before deployment. Work through these in order and report what you changed.

1. SEO: metadata on every route, sitemap.ts generated from published DB rows,
   robots.ts, JSON-LD GovernmentOrganization on the homepage, OpenGraph images.
2. Accessibility: run through every interactive component and verify keyboard operation,
   focus rings, aria attributes, alt text, and 4.5:1 contrast. Add a skip-to-content link.
3. Security: rate-limit all public POST routes, add CSRF protection on server actions,
   set security headers in next.config.ts (CSP, X-Frame-Options, Referrer-Policy),
   validate and sanitise all uploads, ensure no server action is reachable without
   requireRole.
4. Errors: root error.tsx and global-error.tsx, a branded 404, and Zod error surfacing
   in every form.
5. Performance: audit the homepage bundle, lazy-load below-the-fold sections with
   next/dynamic, confirm images are sized correctly, and check Lighthouse on a
   throttled 3G profile. Target LCP under 2.5s.
6. Write README.md covering local setup, environment variables, the seed command,
   deployment steps, backup strategy (nightly pg_dump plus the uploads directory),
   and the default admin credentials with a bold warning to rotate them.
```

---

## Quick reference — recovery prompts

| Situation | Paste this |
|---|---|
| Cursor hardcoded content | `This violates rule 1 in .cursorrules. Content must come from the database via src/lib/data. Rewrite this component to read from the DB.` |
| It added a random dependency | `Remove [package]. .cursorrules lists the approved stack. Reimplement using what is already installed.` |
| Animations feel excessive | `Too much motion for a government portal. Reduce to a single fade-up on scroll. Only transform and opacity. Keep the reduced-motion fallback.` |
| A server action is unprotected | `This server action has no requireRole check, no Zod validation, and no AuditLog write. Add all three, following the pattern in src/server/actions/message.ts.` |
| It refactored files you did not ask about | `Revert everything outside [file]. Change only what I asked for. Do not touch unrelated files.` |
| Types are broken after a schema change | `Run npx prisma generate, then fix every resulting type error. Do not use any or @ts-ignore.` |
