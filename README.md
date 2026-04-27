# Mini Israel

**A real-time multiplayer economic simulation game built on Next.js App Router — where the hardest engineering problem is keeping 3,450 shared tiles consistent across concurrent players without WebSockets.**

---

## What it is

Mini Israel is a browser-based city-builder set on a shared 230×15-tile world. Players claim land, run farms, buy and trade items, attack neighbors to steal coins, and compete on a live leaderboard — all in Hebrew, with full RTL layout. Donations to real Israeli charities are baked into the economy.

The game runs entirely in the browser with no install required and is designed to be left open in a tab — farms produce coins hourly, push notifications fire on attacks, and the world changes while you're away.

---

## Technical Highlights

### Next.js App Router + Hybrid Rendering
- All game state is **fully client-side** (`"use client"`) — the board is a 230×15 grid of React-managed HTML `div` elements, not a canvas
- Server-side logic lives entirely in **54 Next.js Route Handlers** (`/api/**`), keeping the client thin and stateless
- No SSR/SSG for game pages by design — the board must reflect current live state on every load

### State Management
- **Zustand** (with `persist` middleware) handles the authenticated user slice across page navigations and hard reloads — synced to `localStorage` as `mini-clans-user`
- Component-local `useState` / `useRef` handles ephemeral UI state (modals, tooltips, scroll targets)
- No global server-state cache — each player action triggers a targeted re-fetch of the affected resource

### Epoch-Based Farm Production (No Cron Jobs)
Farms generate coins hourly with zero background infrastructure. Each farm cell stores `lastEggEpoch`. On fetch:
```js
const currentHourEpoch = Math.floor(Date.now() / 3600000);
if (cell.lastEggEpoch < currentHourEpoch) // egg is ready
```
The server computes readiness lazily at read time — no schedulers, no polling loops.

### Web Push Notifications
Real-time attack and message alerts via the **Web Push API** (VAPID). A service worker (`public/sw.js`) receives push events server-side triggered through `/api/push` after each relevant action. Notification clicks deep-link back into the game via `?goto=<uid>`.

### AI-Driven Feature Implementation
The admin panel lets anyone submit a feature idea. Clicking "Implement" hits `/api/admin/implement-idea`, which spawns a detached child process running a **Claude Opus 4.6 agent** (via `@anthropic-ai/claude-agent-sdk`) with `maxTurns: 60` and full filesystem tools. The agent reads the codebase, edits or creates files, commits, pushes a branch, and opens a GitHub PR — autonomously, end-to-end.

---

## Architecture & Data Flow

```
Browser (React 19 / Zustand)
    │
    ├── Firebase Auth (Google OAuth)
    │       └── POST /api/auth/user  →  MongoDB users
    │
    ├── GET /api/board  →  MongoDB board (single 230×15 document)
    │
    ├── Player actions (farm, attack, buy, move)
    │       └── POST /api/**  →  atomic MongoDB updates
    │                          └── Web Push / Nodemailer notifications
    │
    └── Admin agent pipeline
            └── POST /api/admin/implement-idea
                    └── child_process → Claude SDK agent
                                      → git branch + commit + gh pr create
```

**MongoDB collections (15+):** `users`, `board`, `messages`, `donations`, `push_subscriptions`, `neighborhood_claims`, `cashout_requests`, `feature_ideas`, `polls`, `ads`, and more.

The board is stored as a **single document** with a `cells` array — one atomic write per player action keeps consistency simple at the cost of document size.

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=flat-square)
![Claude](https://img.shields.io/badge/Claude_SDK-6B4FBB?style=flat-square&logo=anthropic&logoColor=white)
![Web Push](https://img.shields.io/badge/Web_Push_(VAPID)-4285F4?style=flat-square&logo=google-chrome&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS_Modules-000000?style=flat-square&logo=css3)

---

## Notable Engineering Decisions

**Tile grid as HTML, not canvas** — Each of the 3,450 cells is a positioned `div`. This makes it trivial to attach React event handlers, apply CSS transitions, and render rich HTML tooltips per tile. The tradeoff (no GPU compositing) is acceptable at this grid size.

**Single board document in MongoDB** — Storing the entire 230×15 world as one document means any read gets a full consistent snapshot. Writes use `$set` on specific cell paths (`cells.${index}.building`). This avoids multi-document transactions for most actions.

**Epoch math instead of cron** — Hourly farm production is computed purely from timestamps at read time. No background worker, no scheduled function, no clock drift risk.

**Deep-link scrolling with clean history** — `?goto=<uid>` fetches the target's house row, scrolls the board to center on it, then calls `window.history.replaceState` to remove the param. Sharing an attack notification link takes the recipient directly to the attacker's tile without polluting history.

**Weapon economics as a coin sink** — Weapons (rifle → 10% steal, tank → 100% steal) consume coins to buy and create risk-weighted PvP. Combined with farms, VIP bonuses, and power boosts, the economy has enough sinks and sources to stay interesting without backend balancing logic.

**Fully autonomous AI code agent** — Feature ideas are crowd-sourced in-game and implemented by a Claude agent that has read/write access to the repo. The agent commits with `Co-Authored-By: Claude Opus 4.6`, opens a PR, and updates the feature's status in MongoDB — closing the loop without human intervention.

---

## Run Locally

```bash
git clone https://github.com/<your-username>/mini-israel
cd mini-israel
npm install
```

Create `.env.local` with:

```env
# Firebase
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=

# MongoDB Atlas
MONGO=mongodb+srv://...

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Email — optional, for attack notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Claude agent — optional, for AI feature implementation
ANTHROPIC_API_KEY=
```

```bash
npm run dev
# → http://localhost:3000
```

testfgdsgssfdg