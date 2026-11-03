# Open questions

`gamekad.zip` is **not present** in this workspace snapshot (PHP + SQLite were removed in earlier sessions). Decisions below are non-blocking so implementation can proceed. Reverse them if the archive is restored.

| ID | Topic | Decision |
|---|---|---|
| Q1 | Archive missing | Reconstruct from remaining brand files, `DESIGN.md` (anti-pattern only), this contract, and previously observed product behavior. |
| Q2 | Badge progression formula | Source helpers not on disk. **Admin-granted levels** (`UserBadge.level`, `winsToward`, `lastEarnedAt`). No automatic inventing of win-streak math. |
| Q3 | Next-match / top-half cutoff | Not implemented until the exact source rule is confirmed. Leaderboard shows rank only. |
| Q4 | Phone on register | Optional. Required only if `settings.phoneRequired=true`. |
| Q5 | Self-assign Rokad | Users **cannot** set `membershipOrigin=ROKAD`. Admin only, audited. |
| Q6 | Auth | JWT access 20m + hashed refresh 14d in Http-bearer. Cookies not required for SPA+proxy. |
| Q7 | Password hash | Argon2id via `argon2` if native build works; otherwise documented bcrypt fallback. |
| Q8 | Seat occupancy | Confirmed `paid`, `partially_paid`, `venue_due` occupy seats. `pending` payment holds 15 minutes then releases. |
| Q9 | One reservation / event | Enforced. |
| Q10 | God Game player count | 4–24, must equal sum of role quantities to lock. |
| Q11 | Comments | Fully excluded. |
| Q12 | Compact membership mark | Use original `mark-teal.png` (195×256, bolt + «رکاد»). Height 18–22px, `object-contain`. |
| Q13 | Venue / contact | From `SiteSetting` (seed uses Mashhad Rokad address as **demo** copy, flagged in seed). |
| Q14 | Prisma location | Keep `apps/api/prisma` (two-app repo). Documented in architecture. |
