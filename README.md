# Fable & Ink

> Read it. Write it. Fork it.

A home for storytellers — where stories get read for how they're written, not who
wrote them. This is a working React implementation of the **Fable & Ink** Claude
Design prototype (`Fable & Ink.dc.html`), rebuilt faithfully on the NxB Unify
design system.

## Screens

| Screen | What it does |
| --- | --- |
| **Home** | Hero, Blind Read pitch, feature grid, category shelf, fresh stories |
| **Discover** | Story feed with genre filters and a **Blind Read** toggle that hides authors/stats and reveals first lines instead |
| **Reader** | Chapter reader with chapters panel, remix tree, font sizing, and a floating **Listen** player (adaptive narration, playback speed, seek) |
| **Editor** | Draft editor with **Beautify** (voice-preserving suggestions you accept/skip) and **Story Health** notes; an **Arrange** tab with drag-to-reorder scene cards |
| **Publish** | Title/blurb/genre/visibility form |
| **Profile** | Author page — published stories and forks of their work |
| **Mobile Reader** | The reader inside an iPhone frame |

Light/dark theme toggle lives in the header and drives the whole NxB token set.

## Design system

The `client/public/ds/` folder is the **NxB Unify** design system, copied verbatim from
the handoff bundle: `colors_and_type.css` (tokens + licensed fonts),
`nxb-components.css` and `nxb-components-extracted.css` (the `.nxb-*` component
layer). The React components reuse those classes and tokens directly so the output
matches the prototype pixel-for-pixel. `index.html` links `/ds/styles.css`, which
imports the rest.

## Run

This is a full-stack app: a React frontend and a Node/TypeScript API. Run both
(two terminals). The frontend proxies `/api` to the backend, so no CORS fuss.

**Terminal 1 — backend** (starts an in-memory MongoDB and seeds it, no install):

```bash
cd server
npm install
npm run dev      # http://localhost:4000
```

**Terminal 2 — frontend:**

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

Open http://localhost:5173. You're auto-logged-in as the demo author, June
Okafor. Other builds:

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

## Backend

The API (Express + Mongoose) lives in [`server/`](server) — see
[server/README.md](server/README.md) for the full endpoint list and data model.
Highlights:

- **Blind Read is enforced server-side** — with `blind=true` the API never sends
  author names or stats, only genre + first line. It's a real guarantee, not a
  CSS trick.
- **Forks are first-class** — a fork is a story with a `parentStory` link; the
  remix tree and "forks of your work" are real queries over that graph.
- **Beautify and Story Health call Google Gemini** (`src/ai.ts`) with strict
  JSON schemas and server-side validation; set `GEMINI_API_KEY` in
  `server/.env`. Without a key they fall back to built-in stubs, and narration
  still awaits a TTS provider.

Story content comes from the API; the frontend keeps only presentation
constants (genre colors/labels) in [client/src/data.js](client/src/data.js).

## Structure

```
client/                # React frontend (Vite)
  index.html
  vite.config.js       # dev server + /api proxy to the backend
  public/ds/           # NxB Unify design system (CSS + fonts)
  src/
    App.jsx            # app state + navigation, data loading, fork modal, toast
    api.js             # fetch client for the backend API (token + endpoints)
    data.js            # presentation constants only (genre colors/labels)
    components/
      Header.jsx       # sticky nav + theme toggle
      Icon.jsx         # line icons (exact SVG paths from the design)
      IOSDevice.jsx    # iPhone frame for the Mobile Reader
    screens/           # one file per screen (prop-driven from the API)
server/                # Node + TypeScript API (Express + Mongoose) — see server/README.md
```

The original design and handoff bundle are kept under `_handoff/` for reference.
