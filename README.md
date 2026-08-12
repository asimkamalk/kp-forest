# KP Forest Department Portal

Official public website and staff dashboard for the Forest Department, Government of Khyber Pakhtunkhwa.

Stack: **Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Auth.js · Tailwind CSS · shadcn/ui**

---

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

### Install

```bash
npm install
cp .env.example .env   # if present; otherwise create .env from the variables below
```

### Environment variables

Create a `.env` in the project root:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `APP_URL` | Public origin, e.g. `http://localhost:3000` or `https://forest.kp.gov.pk` |

Optional (depending on deployment):

| Variable | Purpose |
| --- | --- |
| `AUTH_TRUST_HOST` | Set `true` behind reverse proxies |

### Database

```bash
npm run db:generate   # Prisma client
npm run db:migrate    # apply migrations (dev)
npm run db:seed       # structural seed — see below
```

### Run

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Login: [http://localhost:3000/login](http://localhost:3000/login)

---

## Seed scripts: `db:seed` vs `db:seed-demo`

| Script | Command | What it does |
| --- | --- | --- |
| **Structural seed** | `npm run db:seed` | Site settings, navigation, hero slides, messages, full region/circle/division tree, and the default super-admin user. Safe to re-run (upserts). |
| **Demo content** | `npm run db:seed-demo` | Placeholder projects, media, downloads, galleries, pages, stats, and sample citizen requests for local UI review. **Requires `db:seed` first.** Does not replace structural org data. |

**Do not run `db:seed-demo` against production.**

---

## **⚠ Rotate default admin credentials**

`npm run db:seed` creates:

- **Email:** `admin@forest.kp.gov.pk`
- **Password:** `ChangeMe123!`

**Change this password immediately** after first login (or replace the user before any shared/staging/production deploy). Leaving the seeded password in place is a critical security failure.

---

## Deployment

1. Set production `DATABASE_URL`, `AUTH_SECRET`, and `APP_URL` (HTTPS).
2. Run migrations against production: `npx prisma migrate deploy`
3. Run **only** `npm run db:seed` once for bootstrap (or seed admin via a one-off secure process). Skip `db:seed-demo`.
4. Build and start:

```bash
npm run build
npm run start
```

5. Serve behind HTTPS. Point the reverse proxy at the Node process (or your platform’s Next.js adapter).
6. Ensure `public/uploads` is writable and backed up (or move uploads to object storage later).
7. After go-live: rotate the seeded admin password and revoke any temporary secrets.

---

## Backup strategy

| Asset | Recommendation |
| --- | --- |
| **PostgreSQL** | Nightly logical dump (`pg_dump`) retained ≥ 30 days; weekly full backup off-site. Test restore quarterly. |
| **Uploads** (`public/uploads`) | Include in filesystem or object-storage backup on the same schedule as the database. Media URLs in the DB are useless without the files. |
| **Secrets** | Store `AUTH_SECRET` and DB credentials in a secrets manager — never in git. |
| **Pre-migrate** | Take a DB snapshot before every production migration. |

---

## Useful scripts

```bash
npm run lint
npm run build
npm run db:studio      # Prisma Studio
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:seed-demo
```

---

## Architecture notes

- **Reads** → `src/lib/data/*.ts` (cached, tagged)
- **Writes** → `src/server/actions/*.ts` (`"use server"`, Zod, `requireRole`, audit log, `revalidateTag`)
- Public content queries filter `status: PUBLISHED`
- Bilingual fields: English + Urdu twins (`title` / `titleUr`, …)
