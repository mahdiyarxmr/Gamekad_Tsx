# Feature matrix

| Reference feature | Module | Route | API | Entities | Acceptance |
|---|---|---|---|---|---|
| Home + section order | homepage | `/` | `GET /homepage` `PUT /admin/homepage` | HomepageSection, SiteSetting | Reorder/disable reflects live |
| Events | events | `/events` `/events/:id` | `/events` | Event | Filters, remaining seats accurate |
| Book | reservations | event detail | `POST /reservations` | Reservation | Concurrent capacity safe |
| Pay wallet/gateway/venue | payments, wallet | `/account/wallet` `/payments/:id/result` | `/wallet` `/payments/*` | Payment, WalletTransaction | One method; ledger |
| Categories TABLE/ELECTRONIC | categories | `/games` | `/categories` | GameCategory | kind filter |
| Electronic catalogue | electronic-games | `/games/electronic` | `/electronic-games` | ElectronicGame | CRUD admin |
| Scenarios & roles | scenarios, game-roles | `/guide` `/guide/scenarios/:slug` `/guide/roles` | `/scenarios` `/game-roles` | Scenario, GameRole | Public guide, no live roles leak |
| Leaderboard | leaderboard | `/leaderboard` `/:categorySlug` | `/leaderboard` | PlayerStat | Sort + Rokad mark |
| Players | users | `/players` `/players/:username` | `/players` | User | Search, pagination, mark |
| Profile stats | player-stats | profile | `/players/:username` | PlayerStat, MatchPlayer, UserBadge | Empty if no data |
| Auth | auth | `/login` `/register` `/account` | `/auth/*` | User, RefreshSession | Rate limit, generic errors |
| Membership | membership | admin users | `PATCH /admin/users/:id` | User.membershipOrigin | Admin only |
| Badges | badges | profile / admin | `/badges` | Badge, UserBadge | Grant/revoke audited |
| MVP | mvp | home / hall | `/mvp` | MvpAward | History kept |
| Matches | matches | admin | `/admin/matches` | Match, MatchPlayer | Reverse deltas |
| God Game | god-game | `/host/god-game` | `/god-game/*` | GodGame* | Setup, deal, live, import once |
| Articles | content | `/learn` | `/articles` | Article | No comments |
| Admin shell | admin | `/admin/*` | `/admin/*` | AuditLog | Permission-aware |
| Settings / gateway | settings | `/admin/settings` | `/settings` | SiteSetting | Secrets never to FE |
| Comments / reviews | — | **removed** | **none** | **none** | Absent everywhere |
