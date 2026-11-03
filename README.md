# Rokad / GameKAD

**Rokad / GameKAD** is an event reservation, player statistics, and session hosting platform.

The platform allows users to discover and reserve events, track player statistics, and host gaming sessions.

> The project uses an original interface design and does not copy its visual reference. Public user reviews are not included.

---

## Features

- Event reservation and management
- Player statistics
- Gaming session hosting
- Rokad membership integration
- External user support
- Role-based user access
- Persian RTL interface
- Jalali calendar support
- Tehran timezone (`Asia/Tehran`)
- REST API with Swagger documentation

## Tech Stack

- **Database:** PostgreSQL 17
- **Backend:** NestJS / Prisma
- **Frontend:** React
- **API:** REST (`/api/v1`)
- **API Documentation:** Swagger (`/api/docs`)

---

## Requirements

Before running the project, make sure you have:

- Node.js and npm
- PostgreSQL 17
- Docker Desktop (optional)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd gamekad
```

### 2. Start PostgreSQL

**Option A — Docker Desktop (Recommended)**

From the project root, run:

```powershell
docker compose up -d
```

**Option B — Manual Installation**

Install PostgreSQL 17 and execute the following SQL commands using `psql`:

```sql
CREATE USER rokad WITH PASSWORD 'rokad' SUPERUSER;
CREATE DATABASE rokad OWNER rokad;
```

### 3. Configure Environment Variables

Copy the example environment file:

```powershell
cp .env.example apps/api/.env
```

Update the following values in `apps/api/.env`:

- `JWT_SECRET`
- `ADMIN_BOOTSTRAP_PASSWORD`

Make sure to use secure values, especially in production.

### 4. Install Dependencies & Initialize Database

From the project root:

```powershell
npm install
```

Initialize Prisma and the database:

```powershell
cd apps/api

npx prisma generate
npx prisma db push
npx prisma db seed

cd ../..
```

---

## Running the Project

Open two separate PowerShell terminals.

**Terminal 1 — Backend API**

```powershell
cd gamekad
npm run api
```

API runs at:

`http://localhost:3001`

Swagger documentation:

`http://localhost:3001/api/docs`

**Terminal 2 — Frontend**

```powershell
cd gamekad
npm run web
```

Frontend runs at:

`http://localhost:8080`

---

## Demo Accounts

The following accounts are provided by the development seed.

| Username | Password | Account Type |
|---|---|---|
| `player` | `player-pass-9` | Rokad Member |
| `host` | `host-pass-9` | Host |
| `sara` | Seed-defined | External User |

**Admin account:** The administrator password is configured through `ADMIN_BOOTSTRAP_PASSWORD`.

> These credentials are for local development and testing only. Never use them in production.

---

## API & Platform Conventions

| Item | Convention |
|---|---|
| API Base Path | `/api/v1` |
| Swagger | `/api/docs` |
| Rokad Membership | `ROKAD` |
| External Membership | `EXTERNAL` |
| Currency | Toman (Integer) |
| Timezone | `Asia/Tehran` |
| Calendar | Jalali |
| UI Direction | RTL |
| Language | Persian |

### Membership Types

- **ROKAD:** Users who are registered members of the Rokad platform.
- **EXTERNAL:** Users who are not registered members of Rokad.

Rokad members are identified by a PNG badge displayed next to their names. External users do not receive this badge.

---

## Important Notes

- This setup is intended for local development.
- Replace all default credentials before deployment.
- Keep `.env` files and sensitive secrets out of version control.
- PostgreSQL must be running before starting the API.
- Database initialization should be performed before the first launch.

---

## Project Status

Rokad / GameKAD is under development.

