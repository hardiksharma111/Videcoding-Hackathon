# VibeHack

VibeHack is a privacy-first anonymous social UI prototype built for hackathon judging.

## Core Experience

- Login / Sign up gate with guest mode for quick demos
- Anonymous identity with randomized avatar + handle
- Temporary room model with context-based discovery
- Sidebar-driven navigation (Home, Discover, Active Rooms, Profile, Settings)
- Day/Night themes, trust-style profile metrics, and lightweight analytics
- Local persistence for rooms, preferences, selected room, and settings

## Activity Point Criteria (Current)

Authenticity points are backend-owned (`User.auth_points`) and currently increase by:

1. Heartbeat activity: `+1` point when the client sends a `heartbeat` socket event while in a joined room.
2. Gifting points: `+1` point when another authenticated user calls `POST /api/users/gift/{ghost_name}`.

Current notes:

- No hard daily cap is enforced yet.
- Points are permanently stored in the database.
- Ghost identity pointer used for room privacy expires after 24 hours.

## Feature Screenshots

### Home Dashboard

![Home dashboard](docs/screenshots/home.png)

### Discover

![Discover view](docs/screenshots/discover.png)

### Active Rooms

![Active rooms view](docs/screenshots/rooms.png)

### Chat Room

![Chat room view](docs/screenshots/chat-room.png)

### Profile

![Profile view](docs/screenshots/profile.png)

### Settings

![Settings view](docs/screenshots/settings.png)

## Project Layout

- `frontend/` - complete user-facing application (HTML/CSS/JS)
- `backend/` - reserved for backend teammate integration
- `docs/` - AI prompt log and internal handoff notes

## Run Locally

Option 1:
- Open `frontend/index.html` directly in your browser.

Option 2 (static server):
- From repo root, run a local static server that points to `frontend/`.

## Frontend Testing

From `frontend/`:

1. `npm install`
2. `npm test`

Current suite covers auth utility validation and session flows.

## Regenerate Screenshots

From `frontend/`:

1. `npm install`
2. `npx playwright install chromium`
3. Ensure backend is running on `http://127.0.0.1:8000`
4. `node scripts/capture-screenshots.mjs`

## Judge Test (60 Seconds)

1. Login, sign up, or continue as guest.
2. Open app and switch between Home, Discover, Active Rooms, Profile, Settings.
3. Create a new room from Discover or Active Rooms.
4. Open room Details drawer and set a room active.
5. Toggle 1 to 2 settings and switch theme.
6. Refresh page and confirm state persisted.
7. Optional: use Settings -> Reset to restore clean demo defaults.

## Deployment

No repo workflow is required. Fastest zero-config option:

1. Import this repo into Vercel.
2. Keep project root at repo root (do not use `frontend` root override).
3. Deploy (repo includes `vercel.json` to force static frontend output and avoid Next.js auto-detection).

### Frontend + Backend Sync on Vercel

This repo now includes `vercel.json` rewrites so the frontend and backend stay connected automatically:

- `/api/*` -> proxied to backend deployment
- `/socket.io/*` -> proxied to backend deployment
- all other routes -> SPA fallback to `frontend/index.html`

Current backend target is configured in `vercel.json`. If your backend domain changes, update only these two rewrite destinations once and redeploy.

You can also use Netlify with the same setup:

1. New site from Git.
2. Base directory: `frontend`.
3. Publish directory: `.`

## Repo Hygiene

The following local reference files are intentionally ignored:

- `Command & Frontend.md`
- `Rules & Regulation.md`
- `docs/judge-handoff.md`
