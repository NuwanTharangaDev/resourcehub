# ResourceHub: Resource Reservation Management System

A full-stack web application for managing shared rooms and equipment and booking them without double bookings. 

## The problem

Reservations were handled through informal messages and manual records. This caused overlapping bookings, confusion about dates and times, and no clear view of what was free. ResourceHub gives the organisation one place to manage its resources, check availability and book them. Overlapping bookings are rejected by the database itself, so they cannot happen even when two people book at the same moment.

## Features

- Sign in with roles: administrators manage resources, members book and cancel their own reservations
- Resource management: create, edit, search by name, filter by category and status, deactivate and reactivate (history is always kept)
- Reservations: create, list, view details, filter by date, resource and status, search by title, view upcoming and previous, cancel
- Availability search for a date and time range, showing which resources are free and the booked periods of each
- Dashboard with live figures from the database (active resources, today's reservations, upcoming bookings, resources free right now, recent activity)
- Server-side validation with clear messages for conflicts and invalid input
- Responsive layout with keyboard-accessible forms, visible focus states and status badges

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 |
| ORM and migrations | Prisma 6 |
| Validation | Zod |
| Styling | Tailwind CSS, Lucide icons |
| Authentication | Signed session cookie (jose), passwords hashed with bcryptjs |
| Tests | Vitest |
| Version control | Git and GitHub |

## Prerequisites

- Node.js 20.9 or newer
- PostgreSQL 16 running locally
- Git

## Setup

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/NuwanTharangaDev/resourcehub.git
   cd resourcehub
   npm install
   ```

2. Create two empty databases (with pgAdmin or psql): `resourcehub` and `resourcehub_test`.

   ```sql
   CREATE DATABASE resourcehub;
   CREATE DATABASE resourcehub_test;
   ```

3. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   # macOS / Linux
   cp .env.example .env
   ```

   | Variable | Purpose |
   |---|---|
   | `DATABASE_URL` | Connection string for the `resourcehub` database |
   | `TEST_DATABASE_URL` | Connection string for the `resourcehub_test` database |
   | `SEED_PASSWORD` | Password given to the demo accounts by the seed script |
   | `SESSION_SECRET` | Random string of at least 32 characters, used to sign sessions |

   If your database password contains special characters such as `@`, `#` or `/`, URL-encode them in the connection strings.

4. Apply the migrations and load the demo data:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. Start the app and open http://localhost:3000:

   ```bash
   npm run dev
   ```

### Demo accounts

All demo accounts use the password you set in `SEED_PASSWORD`.

| Email | Role |
|---|---|
| admin@resourcehub.test | Administrator |
| nimal@resourcehub.test | Member |
| kavindi@resourcehub.test | Member |

The seed data is only loaded by the explicit `npx prisma db seed` command. The seed is safe to run again: it skips users and resources that already exist and does not add reservations twice. Demo reservation dates are relative to today. To wipe the database and start again with fresh demo data:

```bash
npx prisma migrate reset
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check |
| `npm test` | Run the tests |

## Tests

The tests are integration tests that run against the separate `resourcehub_test` database, and they refuse to run against any other database. Create its tables once:

```powershell
# PowerShell
$env:DATABASE_URL = "<your TEST_DATABASE_URL value>"
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL
```

Then run:

```bash
npm test
```

They cover a valid booking, overlapping bookings, back to back bookings, an invalid time range, a cancellation freeing its slot, bookings on an inactive resource, and two simultaneous requests for the same slot.

## Business rules

- Two active reservations for the same resource cannot overlap. Cancelled reservations do not block anything.
- Overlap means: existing start is before the requested end, and existing end is after the requested start.
- A booking that ends exactly when another begins is allowed (10:00 to 11:00 and 11:00 to 12:00).
- Inactive resources cannot be booked. Deactivating a resource keeps all of its reservations.
- Reservations cannot start in the past, and the end time must be after the start time.
- Statuses: CONFIRMED can become CANCELLED (by the owner or an administrator, before it starts) or COMPLETED (automatically once it has ended). Nothing moves back to an active state.
- Members can only cancel their own reservations. Only administrators create, edit or deactivate resources.

## Design decisions

- **Overlap protection is in PostgreSQL.** A check in application code followed by an insert has a race condition: two simultaneous requests can both pass the check. Instead, an exclusion constraint on `(resourceId, tstzrange(startAt, endAt, '[)'))` for non-cancelled rows makes double booking impossible. The constraint lives in `prisma/migrations/*_init/migration.sql`. The service catches the database error and shows a friendly message, never the raw SQL error.
- **Time zones.** Times are stored as `timestamptz` (UTC instants). Times typed by users are read as Asia/Colombo (UTC+05:30, no daylight saving) and displayed in that zone, so they are never silently read as UTC.
- **Authorization on the server.** Every page and server action calls `requireUser()` or `requireAdmin()`. The user's role is read from the database on each request, never from the cookie or a form field, so hiding a button is only cosmetic.
- **Safe booking against inactive resources.** The booking transaction locks the resource row (`FOR SHARE`), so a booking and a deactivation cannot slip past each other.
- **Service layer.** Business logic lives in `src/services`, so pages and actions stay thin and the rules are not duplicated.
- **History is preserved.** Foreign keys use `onDelete: Restrict` and resources are deactivated rather than deleted.
- **Category as an enum** instead of a separate table, to keep the scope small.
- **Completed status** is applied when the dashboard and reservation list load, so no background job is needed.

## Project structure

```
prisma/          schema, migrations, seed script
src/app/         pages and server actions (App Router)
src/components/  shared UI components
src/lib/         session, validation, dates and helpers
src/services/    resource, reservation and dashboard logic
tests/           Vitest integration tests
docs/            ER diagram
```

## Database design

Three tables: `User`, `Resource` and `Reservation`. One user makes many reservations, and one resource has many reservations. Database-level rules:

- `Reservation_valid_range`: `endAt` must be greater than `startAt`
- `Reservation_no_overlap`: exclusion constraint described above
- Unique `User.email` and unique `Resource.name`
- Indexes on `Reservation(resourceId, startAt)`, `Reservation(userId)`, `Reservation(status, startAt)` and `Resource(category, isActive)`


## Known limitations

- No self-registration, password reset or user management screen. Accounts are created by the seed script.
- No recurring reservations, email notifications or approval workflow.
- The time zone is fixed to Asia/Colombo.
- Login attempts are not rate limited.
- Reservations are marked COMPLETED when pages load, not by a scheduled job.
