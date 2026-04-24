# AI-Driven Form Builder

A drag-and-drop form builder with an AI assistant, built with Vue 3 + TypeScript + Vite. Designs forms visually, previews them live, saves them to Firebase, and exports to Vue, React, or Angular components.

## Tech stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript**
- **Vite** — dev server & build
- **Pinia** — state (form tree, auth)
- **Vue Router 4** — HTML5 history mode
- **Tailwind CSS 4** — styling
- **Vue I18n** — `en` / `ar` with RTL support
- **Firebase** — Auth + Firestore
- **VueDraggable** — palette & canvas drag/drop
- **Lucide Vue Next** — icons

## Getting started

```bash
npm install
npm run dev        # Vite dev server
npm run build      # vue-tsc + vite build → dist/
npm run preview    # preview the production build
```

Node 18+ recommended.

## Environment variables

Create `.env.local` in the project root:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

All variables are required for auth and form persistence.

## Project structure

```
src/
├── views/          # Route components (Home, Builder, Forms, Preview, auth/*)
├── features/       # Domain logic — builder, preview, ai
├── components/     # Reusable cross-feature UI (AppDialog, etc.)
├── composables/    # useTheme, useLanguage
├── stores/         # Pinia stores (form, auth)
├── layouts/        # Shell layouts
├── router/         # Routes + auth guards
├── i18n.ts         # en / ar translations
└── firebase.ts     # Firebase init
```

Routes: `/`, `/builder`, `/forms`, `/preview`, `/login`, `/register`, `/verify-email`, `/forgot-password`.

## Features

- Visual form builder with a 3-panel layout (palette, canvas, properties)
- Recursive `row` containers for nested layouts
- Live preview
- Export form as a Vue / React / Angular component
- Save / load forms from Firestore (per-user)
- Dark theme (default) + light builder canvas
- Bilingual UI (English / Arabic) with automatic RTL

## Deploy to Vercel

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new).
3. Vercel auto-detects Vite — keep the defaults (`npm run build`, output `dist`).
4. Add the `VITE_FIREBASE_*` env vars under **Project Settings → Environment Variables**.
5. Deploy.

`vercel.json` ships with this repo and rewrites all paths to `/index.html` so Vue Router's history mode works on refresh / deep links.

## License

Private — not licensed for external use.
