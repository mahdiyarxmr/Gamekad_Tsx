# Business rules

## Membership

- `membershipOrigin`: `ROKAD` | `EXTERNAL` (legacy `rokad` / `guest`).
- Only admin may change origin. Audited.
- Rokad PNG (`mark-teal.png`) beside display name everywhere via `PlayerIdentity`. Never for EXTERNAL.

## Audience

- Event `audience`: `boys` | `girls` | `mixed`.
- Server rejects booking if profile gender does not match a non-mixed event.
- Missing gender + restricted event → 409 asking to complete profile.

## Reservations

- One active reservation (`pending` hold or confirmed) per user per event.
- Capacity: `UPDATE … WHERE reservedCount + seats <= capacity` in a transaction.
- Occupying payments: `paid`, `partially_paid`, `venue_due`.
- Unpaid `pending` hold expires after 15 minutes and decrements `reservedCount`.
- Browser must not send price or remaining seats as trusted input.

## Payment

- Modes: `full` online, `deposit` (onlineAmount or 30% default) + remainder at venue, `venue` (amount 0 online).
- If wallet balance ≥ amount → **only** wallet debit. Else **only** gateway. Never both.
- Integer toman. Ledger row for every balance change. Idempotency keys.
- Gateway sandbox: issue `trackingCode`, verify server-side. Never trust UI success.
- Financial rows are never deleted on cancel.

## Scoring

- Match save writes `Match`, `MatchPlayer`, increments `PlayerStat`.
- Edit/reverse applies **deltas**, not re-sum from client.
- God Game import unique on `godGameSessionId`; once only.

## God Game

- Permission `godGameAllowed` or admin. No general admin leak.
- 4–24 seats. Lock requires role quantity = seat count.
- Hidden roles never in public APIs.
- Kick/kill/reset require explicit confirm + action log.
- Timer is display; phase is server state.
- Finder is a **search list**, not overlay. Seat reorder: pointer handles, not HTML5 drag-only.
- Dead label: «مرده». Kick control is destructive (red). Vote: filled circle.

## Leaderboard

- Sort: points desc, wins desc, userId asc.
- Optional gender split and Rokad/external filter.
- No client-side totals.

## Comments

- None. No table, API, UI, homepage voices.
