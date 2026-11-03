# Source inventory

**Status:** `gamekad.zip` was not in this workspace. PHP pages, `includes/`, `assets/js/*.js` and `data/gamekad.sqlite` are absent. Inventory below is reconstructed from remaining files + the product contract + prior inspection notes.

## Present in this workspace

| Path | Role |
|---|---|
| `apps/web/public/img/brand/*` | Original Rokad marks (copied to `public/assets/brand/`) |
| `apps/web/public/img/logo-emblem.png` | Square emblem |
| `apps/web/public/img/presets/*` | Avatar presets (not presented as real people) |
| `apps/web/public/img/cat-*.jpg`, `egame-*`, `hero-*`, `blog-*` | Older generated/editorial art — **not** used as the new visual system |
| `/home/user/uploads/DESIGN.md` | Old visual system. **Not a design spec.** |
| `/home/user/uploads/*.pdf` | Scenario PDFs (Capo, Investigator, Business Ecosystem) — content reference only |
| Current Nest/React tree | Previous rebuild; being replaced to match this contract |

## Reference PHP map (from prior inspection, not on disk)

**pages/:** home, account, blog, electronic games, God Game, guide, leaderboard, login, payment, player profile, player directory, registration, reservations/events, roles, wallet.

**admin/:** dashboard, badges, blog, categories/scenarios/roles, electronic games, gateway, God Game, homepage layout, leaderboard, MVP, recent matches, reservations, sessions, settings, player statistics, users. Comments admin **excluded**.

**includes/:** auth, db helpers, business rules, God Game panel, homepage blocks, Rokad membership helpers.

**assets/js/:** `god-night.js`, `godgame.js`, `main.js`.

**data/gamekad.sqlite:** not imported. Known tables included users (`origin` rokad/guest), sessions/events, reservations, payments, wallet ledger, player_stats, badges, mvp, god game seats, homepage sections, comments (**dropped**).

## Intentionally not copied

Old CSS, sticker collage, rotated headlines, IRANSansX scale, mint/navy landing, comments/voices.
