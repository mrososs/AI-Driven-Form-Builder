# AI-Driven Form Builder

A drag-and-drop form builder with an AI assistant, built with Vue 3 + TypeScript + Vite. Design forms visually, generate them from natural language prompts, preview them live, save them to Firebase, and export to Vue, React, or Angular components.

## Tech stack

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript**
- **Vite** — dev server & build
- **Pinia** — state (form tree, auth, multi-step flows)
- **Vue Router 4** — HTML5 history mode with auth guards
- **Tailwind CSS 4** — styling
- **Vue I18n** — `en` / `ar` with RTL support
- **Firebase** — Auth + Firestore (persistence + quota tracking)
- **Google GenAI** — AI form generation via streaming SSE
- **VueDraggable** — palette & canvas drag/drop
- **Lucide Vue Next** — icons
- **Zod** — schema validation for AI-generated output

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
VITE_GEMINI_API_KEY=
```

All Firebase variables are required for auth and form persistence. `VITE_GEMINI_API_KEY` is required for AI form generation.

## Project structure

```
src/
├── views/          # Route components (Home, Builder, Forms, Preview, Docs, Examples, auth/*)
├── features/
│   ├── builder/    # Single-step form builder + AI generation + export
│   ├── multistep/  # Multi-step builder, step rail, logic rules, AI generation
│   ├── preview/    # Live form preview with desktop/mobile viewports
│   ├── home/       # Landing page sections
│   └── shared/     # Shared feature UI
├── components/     # Reusable cross-feature UI (AppDialog, Navbar, Footer)
├── composables/    # useTheme, useLanguage, useAiQuota, useBuilderUI, useClipboard, usePreviewValues
├── stores/         # Pinia stores (form, multistepForm, auth)
├── services/ai/    # AI generation orchestration and SSE stream client
├── utils/codegen/  # Framework-specific code generators (vue, react, angular)
├── layouts/        # Shell layouts
├── router/         # Routes + auth guards
├── i18n.ts         # en / ar translations
└── firebase.ts     # Firebase init
```

## Routes

| Path | View | Auth required |
|---|---|---|
| `/` | Home — landing page | No |
| `/builder` | Single-step form builder | Yes |
| `/builder/multi-step` | Multi-step form builder | Yes |
| `/forms` | Saved forms dashboard | Yes |
| `/preview` | Live form preview | Yes |
| `/docs` | Documentation | No |
| `/examples` | Example gallery | No |
| `/login` | Sign in | No |
| `/register` | Create account | No |
| `/verify-email` | Email verification gate | Yes |
| `/forgot-password` | Password reset | No |

## Features

### Form builder

- 3-panel layout: draggable element palette → canvas → properties panel
- Recursive `row` containers for multi-column nested layouts
- Rich element library: text, email, phone, URL, number, select, radio, checkbox, date, time, datetime, file upload
- Per-element property editing: label, placeholder, required, options
- Visibility rules — conditionally show/hide fields based on other field values
- Options mapping — populate a field's choices dynamically based on a parent field's value

### Multi-step form builder

- Visual step rail with reorderable steps
- 5 built-in step templates: onboarding, survey, payment, notification, appointment
- Progress display styles: numbered, progress bar, dots, sidebar
- Flow settings: linear progression, require-all-fields enforcement
- Logic rule engine with four rule types:
  - **Branch** — jump to a different step based on a field value
  - **Skip** — skip one or more steps conditionally
  - **Require** — mark a field as required only when a condition is met
  - **Async** — trigger an external validation call before advancing
- Visual rule editor per step with plain-language rule summaries

### AI form generation

- Natural language prompt → fully structured form, streamed field-by-field
- Works for both single-step and multi-step flows
- Daily quota: 2 generations per user per day (tracked live in Firestore)
- Requires verified email to use
- Output validated with Zod before being applied to the store

### Live preview

- Renders the form exactly as end-users will see it
- Desktop / mobile viewport toggle
- Interactive field input and real-time validation

### Code export

Generates complete, production-ready components in three frameworks:

| Framework | Output |
|---|---|
| Vue 3 | Single-file component with `<script setup>` + `<template>` |
| React | TypeScript functional component with a `useForm` hook |
| Angular | Component with reactive `FormGroup` and template |

Multi-step forms include visibility rules and conditional field options in the generated code.

### Authentication

- Email / password sign-up and sign-in via Firebase Auth
- Email verification gate — AI features require a verified address
- Forgot-password flow via email
- Per-user form isolation in Firestore

### Persistence

- Save and load single-step and multi-step forms to/from Firestore
- Local draft auto-saved to `localStorage` in the builder
- Forms dashboard lists all saved forms with edit and delete actions

### Internationalisation & RTL

- Full English and Arabic UI translation via Vue I18n
- Automatic `dir="rtl"` / `dir="ltr"` switching on language change

### Content pages

- **Docs** — in-app documentation covering builder usage, element types, properties, preview, export, AI prompts, and multi-step workflows
- **Examples** — visual gallery of form types: onboarding, mobile preview, export samples, AI-generated forms

## Deploy to Vercel

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new).
3. Vercel auto-detects Vite — keep the defaults (`npm run build`, output `dist`).
4. Add all `VITE_FIREBASE_*` and `VITE_GEMINI_API_KEY` env vars under **Project Settings → Environment Variables**.
5. Deploy.

`vercel.json` ships with this repo and rewrites all paths to `/index.html` so Vue Router's history mode works on refresh and deep links.

## License

Private — not licensed for external use.
