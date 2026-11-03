# AETHER-HOTSPOT V3 Agent Rules

1. Single Source of Truth: `spec_v3.md` is the authoritative specification. Read the relevant sections before each block. Never edit, overwrite, or delete `spec_v3.md` or `AGENTS.md`.
2. Terminal Safety: Never run interactive commands that hang waiting for keyboard input; always pass non-interactive flags (`-y`, `--yes`) and never use `--overwrite` or force-delete flags.
3. User Context: The user is a non-coder at a 3-hour hackathon. Run all commands yourself and explain results in concise plain English.
4. Locked Stack: Vite, React, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (`tw-animate-css`), `motion` (import from `"motion/react"`), `zustand` (`persist`), `lucide-react`, `vitest` (`jsdom`), `@fontsource-variable/anybody/wdth.css`, and `@fontsource-variable/instrument-sans`. No backend, no external network calls, no Three.js.
5. Domain Purity: All scoring, tie-breaking, status transitions, validation, shape checking, ID generation, and counts live in `src/domain/` with zero React imports and full Vitest unit tests.
6. Strict Invariants:
   - `Resolved` complaints NEVER appear in the priority queue or draw blobs on the thermal map.
   - Status moves forward-only one step at a time (`Raised` -> `In Progress` -> `Resolved`).
   - Fast-forward (`timeOffsetHours`), filters, and formula toggles are NEVER saved to `localStorage`.
   - Every stored or imported record is shape-validated on load so bad JSON or wrong object shapes never crash the app.
7. Thermal Map Performance: Always compute the heatmap on an offscreen `250x150` canvas using a 256-entry color lookup table and upscale to the visible canvas. Handle pulsing/rotating rings in SVG/CSS, never via per-frame canvas redraws.
8. Verification Policy:
   - Blocks B1 & B2: Verify via `npx vitest run` and `npm run build` only (no browser).
   - Blocks B3–B6: Verify via tests, build, and 1440px browser screenshots only.
   - Block B7: Verify at both 1440px and 390px.
