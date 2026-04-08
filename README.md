# VibeHack

VibeHack is a privacy-first anonymous social UI prototype built for hackathon judging.

## Core Experience

- Login / Sign up gate with guest mode for quick demos
- Anonymous identity with randomized avatar + handle
- Temporary room model with context-based discovery
- Sidebar-driven navigation (Home, Discover, Active Rooms, Profile, Settings)
- Day/Night themes, trust-style profile metrics, and lightweight analytics
- Local persistence for rooms, preferences, selected room, and settings

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
2. Set Root Directory to `frontend`.
3. Deploy.

You can also use Netlify with the same setup:

1. New site from Git.
2. Base directory: `frontend`.
3. Publish directory: `.`

## Repo Hygiene

The following local reference files are intentionally ignored:

- `Command & Frontend.md`
- `Rules & Regulation.md`
- `docs/judge-handoff.md`
