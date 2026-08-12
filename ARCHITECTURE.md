# KP Forest Department — Web Application Architecture

Government of Khyber Pakhtunkhwa · Forest Department
Stack: **Next.js 15 (App Router) + PostgreSQL + Prisma**

---

## 1. Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | Server Components = fast public pages, SEO for a gov site |
| DB | PostgreSQL 16 | Required; also gives JSONB for GeoJSON map boundaries |
| ORM | Prisma | Type-safe, easy migrations, good in Cursor (schema is self-documenting context) |
| Auth | Auth.js v5 (NextAuth) — Credentials provider + bcrypt | No third-party IdP dependency; gov IT usually forbids Google/GitHub login |
| Styling | Tailwind CSS + shadcn/ui | shadcn components are copied into repo — no vendor lock, auditable for gov procurement |
| Animation | Framer Motion + Lenis (smooth scroll) | Declarative, respects `prefers-reduced-motion` |
| Maps | MapLibre GL + GeoJSON stored in Postgres | No API key, no billing account — important for gov |
| Forms | react-hook-form + Zod | Same Zod schema validates client *and* server action |
| Tables (dashboard) | TanStack Table | Sorting/filtering/pagination for 32 divisions × content |
| File uploads | Local disk `/uploads` behind a route handler, or MinIO (S3-compatible) | On-prem hosting friendly. Avoid Cloudinary/UploadThing if data must stay in-country |
| i18n | `next-intl` | English + اردو. Every content model already has `*Ur` fields |

### Why every content model has `status` + `orderIndex`
The site must be **completely dynamic**: nothing — not even the navbar links or hero slides — is hardcoded. Editors control order and publish state from the dashboard.

---

## 2. Content hierarchy (from your document)

```
Region (3)
└── Circle (8)
    └── Division (32)
        ├── Gallery (required for every division)
        ├── Sub-division info
        ├── Activities
        ├── Contact persons
        └── Social media links
```

| Region | Circles | Divisions |
|---|---|---|
| Central Southern Forest Region – I, Peshawar | Central (Peshawar), Kohat, Bannu | 13 |
| Northern Forest Region – II, Abbottabad | Lower Hazara, Upper Hazara, Watershed | 14 |
| Malakand Forest Region – III, Swat | Malakand East, Malakand West | 10 |

URL scheme:

```
/regions                          → all 3 regions
/regions/[region]                 → Explore → circles in that region
/regions/[region]/[circle]        → Explore → divisions in that circle
/regions/[region]/[circle]/[div]  → division detail + gallery + activities
```

---

## 3. Build phases

### ✅ Phase 1 (this delivery)
1. **Navbar** — dynamic, DB-driven, unlimited nesting via self-relation
2. **Hero section** — DB-driven slides, Ken Burns + parallax
3. **Messages** — Minister / Secretary / Chief Conservator cards → detail page
4. **Regions → Explore → Circles → Explore** — the full drill-down
5. **Animation layer** — scroll reveals, page transitions, counters

### Phase 2 — Division detail
Sub-division info, activities, per-division gallery, contacts, socials, maps.

### Phase 3 — Operational modules
Forest Operations (Marking / Harvesting / Actions / Monitoring), Plantation Campaigns (targets vs achievements + success stories), Projects (Completed / Ongoing / Future).

### Phase 4 — Media Centre & Public Services
Press releases, press notes, news coverage, interviews, Myths vs Facts, Rapid Response, Know Your Forest, Wildlife, Plant/Research requests, Emergency contacts, Downloads (acts, rules, policies).

The Prisma schema shipped here **already models Phases 2–4**, so you never rewrite migrations. Build the UI phase by phase against a stable database.

---

## 4. Folder structure

```
src/
├── app/
│   ├── (site)/                    # public website
│   │   ├── layout.tsx             # Navbar + Footer + Lenis
│   │   ├── page.tsx               # Hero + Messages + Regions
│   │   ├── messages/[slug]/
│   │   └── regions/
│   │       ├── page.tsx
│   │       └── [region]/
│   │           ├── page.tsx       # circles
│   │           └── [circle]/
│   │               ├── page.tsx   # divisions
│   │               └── [division]/
│   ├── (dashboard)/dashboard/     # admin panel
│   │   ├── layout.tsx             # auth guard + sidebar
│   │   ├── page.tsx               # stats overview
│   │   ├── navigation/            # edit the navbar
│   │   ├── hero/
│   │   ├── messages/
│   │   ├── regions/ circles/ divisions/
│   │   ├── media/                 # media library
│   │   ├── users/
│   │   └── audit/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── upload/
│   └── globals.css
├── components/
│   ├── site/                      # public components
│   ├── dashboard/                 # admin components
│   ├── motion/                    # animation primitives
│   └── ui/                        # shadcn
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── slug.ts
│   ├── data/                      # all DB reads (cached)
│   └── validators/                # Zod schemas
├── server/actions/                # server actions (all DB writes)
└── types/
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

**Rule:** components never touch Prisma directly. Reads go through `lib/data/*`, writes through `server/actions/*`. This keeps the dashboard and the public site sharing one validated layer.

---

## 5. Dashboard specification

### Roles

| Role | Scope |
|---|---|
| `SUPER_ADMIN` | Everything, including users, navbar, site settings |
| `REGION_ADMIN` | One region + its circles + divisions |
| `CIRCLE_ADMIN` | One circle + its divisions |
| `DIVISION_ADMIN` | One division only |
| `EDITOR` | Create/edit content, cannot publish |
| `VIEWER` | Read-only |

Scoping is enforced in `lib/auth.ts` via a `scopeFilter(session)` helper injected into every Prisma query — not in the UI. Never trust the client for row-level access.

### Editorial workflow
`DRAFT → REVIEW → PUBLISHED → ARCHIVED`. `EDITOR` can move to `REVIEW`; only admins can `PUBLISH`. Every publish writes an `AuditLog` row (who, what, before/after JSON).

### Dashboard modules
- **Overview** — counts per region/circle/division, pending reviews, recent activity, plantation target-vs-achievement chart
- **Navigation builder** — drag-and-drop tree, controls the public navbar live
- **Hero manager** — slides, order, schedule (`startsAt`/`endsAt`)
- **Messages** — leadership messages with photo, designation, ordering
- **Org structure** — Regions / Circles / Divisions CRUD with map GeoJSON upload
- **Media library** — central image/document store, reused everywhere
- **Requests inbox** — plant requests & research requests with status pipeline
- **Users & audit log**

### Cache invalidation
Public pages use `unstable_cache` with tags (`nav`, `hero`, `messages`, `regions`). Every server action calls `revalidateTag()` after a write, so a dashboard edit reflects on the live site immediately without a rebuild.

---

## 6. Setup

```bash
npx create-next-app@latest kp-forest --ts --tailwind --app --src-dir --import-alias "@/*"
cd kp-forest

npm i @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod \
      react-hook-form @hookform/resolvers framer-motion lenis \
      lucide-react @tanstack/react-table next-intl maplibre-gl slugify
npm i -D prisma tsx @types/bcryptjs

npx shadcn@latest init
npx shadcn@latest add button card dialog form input textarea select table tabs badge dropdown-menu sheet sonner

# copy the provided prisma/, src/ files in, then:
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

`.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/kp_forest"
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
```

`package.json`:
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

Default seeded login: `admin@forest.kp.gov.pk` / `ChangeMe123!` — **rotate before deployment.**

---

## 7. Non-negotiables for a government site

- **Accessibility (WCAG 2.1 AA)** — gov portals get audited. All animations wrapped in `prefers-reduced-motion` checks; keyboard-navigable nav; real `<button>`/`<a>` elements; visible focus rings.
- **Bilingual** — Urdu fields exist in the schema from day one. Retrofitting i18n is expensive.
- **Performance on 3G** — much of KP browses on mobile data. `next/image` everywhere, no heavy hero videos, animations are transform/opacity only.
- **Audit trail** — who changed what, when. Expected in public-sector systems.
- **Rate-limit public forms** — plant/research requests will be spam targets.
- **Backups** — nightly `pg_dump` + uploads directory.
