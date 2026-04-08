# VibeHack

VibeHack is a privacy-first anonymous social UI prototype built for hackathon judging.

## Core Experience

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

## Judge Test (60 Seconds)

1. Open app and switch between Home, Discover, Active Rooms, Profile, Settings.
2. Create a new room from Discover or Active Rooms.
3. Open room Details drawer and set a room active.
4. Toggle 1 to 2 settings and switch theme.
5. Refresh page and confirm state persisted.
6. Optional: use Settings -> Reset to restore clean demo defaults.

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
