# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check (vue-tsc) then build production bundle
npm run preview    # Preview production build locally
```

No test runner is configured yet.

## Architecture

**Stack:** Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind CSS 4 + Vue I18n

### Routing
Two routes defined in `src/router/index.ts`:
- `/` → `HomeView` (marketing landing page)
- `/builder` → `BuilderView` (lazy-loaded, form builder interface)

### State
`src/stores/form.ts` (Pinia) — central form state:
- `elements[]` is a recursive tree — `row` type elements contain `children[]`
- `findElement()` traverses this tree recursively to locate by ID
- `selectedElementId` drives the properties panel

### Feature Layout
The builder uses a strict 3-panel layout:
- `BuilderSidebar` — draggable element palette (uses VueDraggable)
- `BuilderCanvas` — form preview, light-themed even in dark mode
- `BuilderProperties` — property editor for the selected element

`src/features/` holds domain logic. `src/components/` holds reusable cross-feature UI. `src/composables/` has `useTheme()` (dark mode via @vueuse/core) and `useLanguage()` (i18n + RTL toggle).

### i18n & RTL
`src/i18n.ts` supports `en` and `ar`. The `useLanguage()` composable sets `document.dir = 'rtl'/'ltr'` when switching. Both directions must be tested for any layout changes.

### Dark Mode
Dark is the default. `index.html` contains an inline script to prevent flash on load. The builder canvas intentionally uses a **light theme** — this is a deliberate brand decision, not a bug.

## Design System

Full guidelines are in `.impeccable.md`. Key constraints:

- **Theme:** Dark glassmorphic base with indigo/purple accents. Reference aesthetic: hashbrown.dev.
- **Fonts:** Bricolage Grotesque (headings) + Plus Jakarta Sans (body) — configured in `tailwind.config.js`
- **Icons:** Lucide Vue Next only
- **Motion:** Purposeful, smooth, exponential easing. No bouncy/elastic animations.
- **Color:** Strategic accent pops. Do not add ambient gradients or glowing-cyan AI clichés.
- **Accessibility:** WCAG AA target — semantic HTML, keyboard nav, `prefers-reduced-motion` support.
- **Builder canvas** uses light theme; marketing pages use dark theme — do not conflate.
