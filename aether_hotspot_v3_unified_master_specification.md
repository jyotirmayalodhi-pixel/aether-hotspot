# 🔥 AETHER-HOTSPOT (V3) — UNIFIED MASTER SPECIFICATION
**Track:** CODE CRACK 3.0 · Second Year · Campus Complaint Management System ($100\text{ Points}$)  
**Execution Engine:** Google Antigravity 2.0 Standalone (Zero-Code Agent Workflow)  
**Time Horizon:** $180\text{ Minutes}$ ($3.0\text{ Hours}$)  
**Version:** **V3 Unified Edition** (Merges `spec_v2.md` + Claude's `PATCHES.md` engineering fixes + Gemini V1's interactive demo boosters into **ONE single source of truth**)

---

## 🧠 0. EVALUATION OF CLAUDE'S `PATCHES.md` (WHAT WE KEPT & WHAT WE PROTECTED)

Having two separate files (`spec_v2.md` and `PATCHES.md`) where one tells the AI agent *"build X"* and the other says *"override: do not build X"* wastes agent tokens and risks confusion. Therefore, **V3 bakes every smart fix directly into a single, contradiction-free file (`spec_v3.md`)**:

### ✅ 7 Genius Technical Catches from `PATCHES.md` Adopted 100% in V3:
1. **The Variable Font Width-Axis Fix (`P3`):** Importing `@fontsource-variable/anybody` by default only loads the weight (`wght`) axis, meaning score numerals wouldn't actually stretch wider! V3 explicitly mandates importing `@fontsource-variable/anybody/wdth.css` in Block B0.
2. **64x Faster Offscreen Thermal Canvas (`P6`):** Running a 256-color pixel lookup on a full-resolution Retina canvas (`2000x1200`) every frame causes lag. V3 computes the radial alpha blobs and 256-color lookup on a **`250x150` offscreen canvas** and scales it smoothly onto the main canvas, while handling pulsing/rotating rings in CSS/SVG so the canvas only redraws when data or the time slider changes!
3. **Whole-Word Keyword Regex (`P7`):** Uses word boundaries `\b(fire|spark|short circuit|leak|outage|blackout|exam|broken)\b/i` so words like `"firewall"` or `"example"` never trigger false-positive severity bonuses.
4. **Non-Empty Folder & PowerShell Safety (`P2`):** Prevents `npm create vite` from deleting `spec_v3.md` when scaffolding in a folder that already contains the spec, and bans hanging interactive terminal prompts.
5. **Deep Shape Validation on Storage & Import (`P5`):** Validates every field of every stored record on hydration (not just `JSON.parse`) so malformed objects in `localStorage` never crash `.map()`.
6. **Quota-Saving Verification Policy (`P8`):** Blocks `B1` and `B2` verify via Vitest & build only (skipping slow headless browser launches for non-UI blocks); `B3–B6` verify at `1440px` only; `B7` verifies both `1440px` and `390px`.
7. **The 16-Hour Real-Time Drift Alert (`P10`):** Because `C02` starts at `8h ago`, waiting 16+ hours after first launch would naturally age `C02` to `24h` (changing its score from `2` to `3`). Resetting to PDF Seed right before judging guarantees exact `4, 4, 2` scores.

### 🛡️ What We Protected from `PATCHES.md`'s Scope Cuts (`P4`):
Claude's `P4` suggested cutting almost all interactive demo boosters. While cutting risky browser APIs (`webkitSpeechRecognition`) is smart, cutting simple UI helpers hurts your live pitch. Here is our **V3 Smart Balance**:
* **KEPT (Zero Risk, Massive Pitch Impact):**
  * **1-Click Quick Issue Chips** in the form (3 buttons that pre-fill realistic descriptions so you don't waste 20 seconds typing live in front of judges!).
  * **Simulate Initial Age (`initialHoursAgo`)** in the form (lets judges test the urgency formula immediately upon submitting a complaint).
  * **Formula Mode Toggle (`Official Baseline` vs `Enhanced SLA`)** & **Tie-Break Toggle (`Age-First` vs `Category-First`)** in the Priority Queue header (pure math already in `src/domain`, zero UI risk, guarantees 25/25 analytical points).
  * **Judge Quick-Actions Toolbar** in the header (`Reset to PDF Seed`, `Inject Tie-Break Demo`, `Trigger Invalid Form Demo`, `CSV/JSON Import & Export`).
* **DROPPED (High Risk / Zero Rubric Points):**
  * Dropped `webkitSpeechRecognition` voice dictation, `@testing-library/react`, `@vitest/coverage-v8`, and `canvas-confetti` dependencies so `npm install` is fast and zero-conflict.

---

## 🎯 1. MISSION & 100-POINT RUBRIC MAPPING

| Evaluation Criterion | Points | How AETHER-HOTSPOT V3 Earns Full Marks |
| :--- | :---: | :--- |
| **1. Complaint workflow & validation** | **30** | Forward-only status machine (`Raised` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`), collision-safe IDs (`C05+`), strict inline validation (`10–280` chars, trimmed, non-empty), 1-click Quick Issue Chips, and optional initial-age test input (Blocks B1, B3, B4). |
| **2. Search, filtering & summary** | **20** | Live animated counters (**Total**, **Pending** [`Raised` + `In Progress`], **Resolved**) + 150ms debounced search + combinable Category & Status filter pills + clickable Campus Thermal Zones (Block B4, B6). |
| **3. Priority logic & explanation** | **25** | Exact PDF Baseline Formula ($W_c + \lfloor H/24 \rfloor$) + documented Enhanced SLA toggle + 5-step deterministic tie-breaker + explicit arithmetic & comparative tie-break sentence on every card + "How scoring works" modal (Blocks B1, B5). |
| **4. Data handling** | **15** | Versioned `localStorage` (`aether_hotspot.v3`) with full record-shape validation, corruption auto-recovery, 1-click PDF Seed Reset, and CSV/JSON Organizer Bulk Import & Export (Blocks B2, B7). |
| **5. Usability** | **10** | Dual-layer Offscreen Canvas + SVG Campus Thermal Map, variable-width urgency numerals (`Anybody Variable`), non-destructive **Fast-Forward Time Machine slider ($+0\text{h}$ to $+168\text{h}$)**, keyboard accessibility, and mobile responsiveness (Blocks B0, B6, B7). |

---

## 🧮 2. THE 25-POINT ANALYTICAL PRIORITY ENGINE & TIE-BREAKING

### 2.1 Official Baseline Formula (Default Mode)
For every unresolved complaint ($\text{status} \neq \text{'Resolved'}$):
$$\text{Hours Pending} = \max\left(0, \frac{\text{nowMs} - \text{submittedAt}}{3600000} + \text{timeOffsetHours}\right)$$
$$\text{Age Score} = \left\lfloor \frac{\text{Hours Pending}}{24} \right\rfloor$$
$$\text{Urgency Score} = W_{\text{category}} + \text{Age Score}$$

Where Category Weights ($W_{\text{category}}$) are:
* **Laboratory:** $3$
* **Wi-Fi:** $2$
* **Hostel:** $2$
* **Classroom:** $1$

*Constraint Rule:* `Resolved` complaints have **no urgency score** (`null`) and **never** appear in the Priority Queue or on the Campus Thermal Map.

### 2.2 Documented Formula Improvement (Interactive "Enhanced SLA" Toggle)
We keep **Official Baseline** as the default (and never persist mode switches across refreshes so reloads always start in strict Baseline mode). Toggling **"Enhanced SLA Formula"** in the Priority Queue header demonstrates our documented improvement:
$$\text{Enhanced Score} = W_{\text{category}} + \left\lfloor \frac{\text{Hours Pending}}{24} \right\rfloor + B_{\text{unattended}} + B_{\text{severity}}$$
* **Unattended Bonus ($B_{\text{unattended}} = +1$):** Added if $\text{status} = \text{'Raised'}$ (nobody has started work yet).
* **Whole-Word Critical Keyword Bonus ($B_{\text{severity}} = +1$):** Added if description matches `\b(fire|spark|short circuit|leak|outage|blackout|exam|broken)\b/i`.

### 2.3 Deterministic 5-Step Tie-Breaking Hierarchy
1. **Higher Urgency Score** ($\text{Score}_A > \text{Score}_B$).
2. **Tie-Breaker #1 — Longer Wait Time (or Category Weight if toggled):**
   * In default `age-first` mode: Greater continuous `hoursPending` wins (**C03 [$72\text{h}$]** beats **C01 [$48\text{h}$]**).
   * In optional `category-first` mode: Higher $W_{\text{category}}$ wins (**C01 [Wi-Fi $2$]** beats **C03 [Classroom $1$]**).
3. **Tie-Breaker #2 — Higher Category Weight** (when in `age-first` mode) or **Longer Wait Time** (when in `category-first` mode).
4. **Tie-Breaker #3 — Untouched Status Priority:** `Raised` ranks before `In Progress`.
5. **Tie-Breaker #4 — Lexicographical ID Order:** Lower numeric ID (`C01` before `C02`).

### 2.4 Queue Sentence Formatting (Including Last-Item Rule)
Every card in the Top-3 Queue prints:
1. **Exact Arithmetic String:** `"Score 4 = category 1 + age 3"` (or `"Score 5 = category 1 + age 3 + bonus 1"` in Enhanced mode).
2. **Comparative Tie-Break Sentence:**
   * For items #1 and #2 (when another item exists below it in the queue): e.g., `"Ranked above C01: same score (4), waiting longer (72h vs 48h)."` or `"Ranked above C02: higher score (4 vs 2)."`
   * For the last item in the queue (when no item is shown below it): `"Lowest of the top three: score 2 = category 2 + age 0."` (or `"Only open complaint in queue."` if 1 item).

### 2.5 Worked Seed Data Table (Verified by Automated Tests)
| ID | Category | Hours Ago | Status | Weight ($W_c$) | Age ($\lfloor H/24 \rfloor$) | Baseline Score | In Queue? | Default Rank & Comparative Explanation |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **C03** | Classroom | $72\text{h}$ | `Raised` | $1$ | $3$ | **$4$** | ✅ Yes | **#1** — *"Ranked above C01: same score (4), waiting longer (72h vs 48h)."* |
| **C01** | Wi-Fi | $48\text{h}$ | `Raised` | $2$ | $2$ | **$4$** | ✅ Yes | **#2** — *"Ranked above C02: higher score (4 vs 2)."* |
| **C02** | Hostel | $8\text{h}$ | `In Progress` | $2$ | $0$ | **$2$** | ✅ Yes | **#3** — *"Lowest of the top three: score 2 = category 2 + age 0."* |
| **C04** | Laboratory | $24\text{h}$ | `Resolved` | $3$ | $1$ | — | ❌ **No** | Excluded (`Resolved` complaints never enter queue or thermal map). |

---

## 🎨 3. VISUAL IDENTITY & HIGH-SPEED THERMAL ARCHITECTURE

### 3.1 Color Tokens ("Night Lens")
| Token | Hex | Role |
| :--- | :--- | :--- |
| **Night Lens** | `#0D0A26` | Deep infrared-camera indigo background |
| **Cold Glass** | `#181342` | Card/row surface with `1px solid rgba(233, 228, 255, 0.12)` border |
| **Frost** | `#E9E4FF` | Primary text (WCAG AAA) |
| **Mist** | `#A79FD6` | Secondary labels & metadata |
| **Cool Mint** | `#3FD0C9` | `Resolved` badge, calm zero-incident map state, cooling ripple |
| **Thermal Heat Ramp** | `#2A1B8C` $\rightarrow$ `#7A2BC9` $\rightarrow$ `#E5237A` $\rightarrow$ `#FF7A18` $\rightarrow$ `#FFD23F` $\rightarrow$ `#FFF4D6` | Score $0$ (cold indigo) to $10+$ (white-hot) |

### 3.2 Variable Typography (With Width Axis Explicitly Loaded)
* **Anybody Variable (`@fontsource-variable/anybody/wdth.css`):** Used for headings and Urgency Score numerals. Score numerals dynamically interpolate both weight (`wght` $500 \rightarrow 900$) and width (`wdth` $85 \rightarrow 125$) as score increases from $0$ to $10$.
* **Instrument Sans Variable (`@fontsource-variable/instrument-sans`):** Used for body copy, buttons, and tabular numerals (`tabular-nums`).

### 3.3 High-Performance Dual-Layer Thermal Map Architecture
* **Layer 1 (Offscreen Low-Res Canvas $\rightarrow$ Upscaled Display Canvas):**
  * Compute radial-gradient alpha blobs on a tiny **`250 x 150` offscreen canvas**, map alpha values through a precomputed 256-entry RGBA lookup table built from the Thermal Heat Ramp, and draw the result onto the visible canvas with `ctx.imageSmoothingEnabled = true`.
  * **Zero Per-Frame Canvas Redraws:** The canvas ONLY redraws when `complaints`, `timeOffsetHours`, `formulaMode`, or container size changes.
* **Layer 2 (Interactive SVG Overlay):**
  * Renders the 4 Campus Zones (**Wi-Fi Network Core** top-left, **Hostel Towers** top-right, **Academic Classrooms** bottom-left, **Laboratory Wing** bottom-right).
  * Renders keyboard-focusable hotspot pins (`aria-label="C03, Classroom, score 4, raised, 72 hours"`). Pulsing rings (`Raised`) and rotating rings (`In Progress`) are pure CSS/SVG animations on the SVG layer!

---

## 🛠️ 4. ANTIGRAVITY OPERATING RULES & RECOVERY PROMPTS

1. Place **only** `spec_v3.md` in your new project folder (`aether-hotspot`).
2. Attach `@spec_v3.md` (and `@AGENTS.md` once created in B0) to each block in sequence (`B0` $\rightarrow$ `B8`).
3. **Demo Hygiene Reminder:** Because seed timestamps count from first launch, always click **"Reset to PDF Seed"** in the app header right before the judges evaluate your project so `C03, C01, C02` display exact fresh scores of `4, 4, 2`.

### Emergency Error-Fix Prompt (If Any Block Fails)
```text
Something is wrong. Plain-English symptom: <describe what happened>.
Error text or screenshot: <paste red text or attach screenshot>.
Do this:
1) Find the root cause and explain it in two plain-English sentences.
2) Fix it without changing unrelated files.
3) Re-run `npx vitest run` and `npm run build`.
4) Verify and commit as "Fix: <short description>". Never use `any`, `@ts-ignore`, or `eslint-disable`.
```

---

## 🧱 5. SEQUENTIAL ANTIGRAVITY BUILD BLOCKS ($180\text{ MIN}$ TOTAL)

### 📦 BLOCK B0 · Safe Scaffolding, `AGENTS.md`, Width-Axis Fonts, & Style Tile ($20\text{ min}$ · Clock $0:20$)
> **Files to attach:** `@spec_v3.md`  
> **Copy and paste into Antigravity:**

```text
You are building "AETHER-HOTSPOT" exactly as specified in @spec_v3.md.

CRITICAL TERMINAL & FOLDER SAFETY RULES:
- Never run a terminal command that waits for interactive input without passing non-interactive flags (`-y`, `--yes`) or answering it automatically.
- This folder already contains `spec_v3.md`. When scaffolding Vite, DO NOT use `--overwrite` or delete existing files (either scaffold into a temp subfolder and move files up, or choose "Ignore files and continue"). Confirm `spec_v3.md` still exists after scaffolding.
- If running on Windows PowerShell, handle `--` argument separators or execution policy safely via `cmd /c` if needed.

TASK FOR BLOCK B0:
1. Scaffold a Vite + React + TypeScript project in this folder while preserving `spec_v3.md`.
2. Install Tailwind CSS v4 with `@tailwindcss/vite`.
3. Configure `@/*` path aliases in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts` BEFORE running `shadcn init`. Initialize shadcn/ui using `tw-animate-css` (not `tailwindcss-animate`).
4. Install exact dependencies: `motion` (import from `"motion/react"`), `zustand`, `lucide-react`, `vitest`, `jsdom`, `@fontsource-variable/anybody`, and `@fontsource-variable/instrument-sans`.
5. CRITICAL FONT IMPORT: In `src/main.tsx` or `src/index.css`, import `@fontsource-variable/anybody/wdth.css` (NOT the default root import, which omits the width axis!) and `@fontsource-variable/instrument-sans`. If either package fails to download, place variable WOFF2 files in `public/fonts`.
6. Create `AGENTS.md` in the project root containing the exact text from Appendix A of `@spec_v3.md`.
7. Configure the "Night Lens" color tokens (`#0D0A26`, `#181342`, `#E9E4FF`, `#A79FD6`, `#3FD0C9`, and the 6-stop Thermal Heat Ramp `#2A1B8C` -> `#7A2BC9` -> `#E5237A` -> `#FF7A18` -> `#FFD23F` -> `#FFF4D6`) in `src/index.css`.
8. Replace `src/App.tsx` with a single "Thermal Style Tile" verification page showing:
   - The 6 named color swatches.
   - The 0 to 10 Thermal Heat Ramp with numerals set in `"Anybody Variable"` using inline `fontVariationSettings: "'wght' W, 'wdth' D"` from `wght 500, wdth 85` (score 0) to `wght 900, wdth 125` (score 10). The numerals MUST visibly stretch wider and heavier as the score increases.
   - Primary/secondary buttons, status badges (`Raised`, `In Progress`, `Resolved`), and category chips (`Wi-Fi`, `Hostel`, `Classroom`, `Laboratory`).
9. Run `npm run build`, open the page in the browser at 1440px, attach a screenshot proving the numerals widen from 0 to 10, and commit to git as "Block B0: project, rules, thermal style tile".
```

---

### 📦 BLOCK B1 · Pure Domain Brain (`src/domain`) & Vitest Suite ($20\text{ min}$ · Clock $0:40$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B1 from @spec_v3.md: Implement all business logic in `src/domain/` as pure TypeScript functions with ZERO React imports. Verification for this block is `npx vitest run` and `npm run build` ONLY (do not open the browser).

1. Create `src/domain/config.ts`:
   - `CATEGORY_WEIGHTS = { 'Laboratory': 3, 'Wi-Fi': 2, 'Hostel': 2, 'Classroom': 1 } as const`
   - `MAX_HEAT_SCORE = 10`
   - `DESCRIPTION_MIN = 10`, `DESCRIPTION_MAX = 280`
2. Create `src/domain/types.ts`:
   - `Category`: `'Wi-Fi' | 'Hostel' | 'Classroom' | 'Laboratory'`
   - `Status`: `'Raised' | 'In Progress' | 'Resolved'`
   - `FormulaMode`: `'baseline' | 'enhanced'`
   - `TieBreakOrder`: `'age-first' | 'category-first'`
   - `StatusHistoryEntry`: `{ from: Status | null; to: Status; changedAt: number }`
   - `Complaint`: `{ id: string; category: Category; description: string; status: Status; submittedAt: number; updatedAt: number; history: StatusHistoryEntry[] }`
   - `ScoredComplaint`: extends `Complaint` with `{ hoursPending: number; categoryWeight: number; ageScore: number; bonusScore: number; score: number; heatRatio: number; arithmeticText: string; tieBreakSentence: string; rank: number }`
3. Create `src/domain/scoring.ts`:
   - `getHoursPending(submittedAt: number, nowMs: number, timeOffsetHours = 0): number` -> returns `Math.max(0, (nowMs - submittedAt) / 3600000 + timeOffsetHours)`.
   - `scoreComplaint(complaint, nowMs, timeOffsetHours = 0, formulaMode = 'baseline')`:
     - Returns `null` if `complaint.status === 'Resolved'`.
     - `categoryWeight = CATEGORY_WEIGHTS[complaint.category]`
     - `ageScore = Math.floor(hoursPending / 24)`
     - In `'baseline'` mode: `bonusScore = 0`.
     - In `'enhanced'` mode: `+1` if `status === 'Raised'` + `+1` if description matches whole words `\b(fire|spark|short circuit|leak|outage|blackout|exam|broken)\b/i` (must NOT match "firewall" or "example").
     - `score = categoryWeight + ageScore + bonusScore`
     - `arithmeticText`: `"Score 4 = category 1 + age 3"` (or `"Score 5 = category 1 + age 3 + bonus 1"` if `bonusScore > 0`).
   - `getTopPriorityQueue(complaints, nowMs, timeOffsetHours = 0, formulaMode = 'baseline', tieBreakOrder = 'age-first', limit = 3)`:
     - Filters out `Resolved` complaints.
     - Sorts using our 5-step tie-break rules: (1) Higher `score`, (2) Higher `hoursPending` then `categoryWeight` if `age-first` (or `categoryWeight` then `hoursPending` if `category-first`), (3) `Raised` before `In Progress`, (4) Lower numeric ID (`C01` < `C02`).
     - Slices to `limit` (3) and generates `tieBreakSentence` for each item:
       - If there is an item below it in the returned queue (`index < queue.length - 1`), explain why it outranks `queue[index + 1]` (e.g., `"Ranked above C01: same score (4), waiting longer (72h vs 48h)."` or `"Ranked above C02: higher score (4 vs 2)."`).
       - For the last item in the queue (`index === queue.length - 1`), use: `"Lowest of the top three: score 2 = category 2 + age 0."` (or `"Only open complaint: score X = ..."` if `queue.length === 1`).
4. Create `src/domain/workflow.ts`:
   - `getNextAllowedStatus(current: Status): Status | null` (`Raised` -> `In Progress`, `In Progress` -> `Resolved`, `Resolved` -> `null`).
   - `advanceComplaintStatus(complaint: Complaint, nowMs: number)`: Throws or returns error on invalid transition.
   - `generateNextId(complaints: Complaint[]): string`: Finds highest numeric suffix (`C01`..`C99`, `C100`) and returns `C` + `max + 1` padded to at least 2 digits.
   - `validateComplaintInput(category: string, description: string, initialHoursAgo = 0)`: Trims description, checks category is valid, enforces 10–280 chars after trim, checks `initialHoursAgo >= 0`, and returns field errors using exact wording (`"Choose a category."`, `"Describe the problem in at least 10 characters."`, `"Keep it under 280 characters."`).
   - `isValidComplaintRecord(obj: unknown): obj is Complaint`: Deeply validates the shape of a record (string `id`, valid `category`, valid `status`, string `description`, finite numbers `submittedAt` and `updatedAt`, array `history`).
   - `computeSummaryCounts(complaints: Complaint[])`: Returns `{ total, pending, raised, inProgress, resolved }`.
5. Create `src/domain/__tests__/domain.test.ts` testing:
   - PDF seed data (`C01` -> 4, `C02` -> 2, `C03` -> 4, `C04` -> null).
   - Queue order `C03, C01, C02` (`age-first`) and `C01, C03, C02` (`category-first`), plus the exact `tieBreakSentence` on all 3 items including the last item.
   - Fast-forward `+24h` (`5, 3, 5`) and `+48h` (`6, 4, 6`).
   - Boundary cases: `23.99h` -> age `0`, `24h` -> age `1`, future timestamp -> `0`.
   - Enhanced mode whole-word regex (`"fire"` matches, `"firewall"` does not; `"exam"` matches, `"example"` does not).
   - Status machine, validation boundaries (9, 10, 280, 281 chars, whitespace), ID generator (`C04` -> `C05`, `C99` -> `C100`), `isValidComplaintRecord` shape guard, and count invariants.
6. Run `npx vitest run` and `npm run build` (no coverage tool). Commit as "Block B1: domain logic and unit tests".
```

---

### 📦 BLOCK B2 · Persistent Store (`src/store`) with Shape Validation ($15\text{ min}$ · Clock $0:55$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`, `@src/domain`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B2 from @spec_v3.md: Build the Zustand store (`src/store/useComplaintStore.ts`) with `localStorage` persistence and deep shape validation. Verification is `npx vitest run` and `npm run build` ONLY (no browser).

1. Persist under key `"aether_hotspot.v3"`, `version: 3`.
2. Use `partialize` so ONLY `complaints` is saved to `localStorage`. Transient state (`timeOffsetHours`, `searchQuery`, `categoryFilter`, `statusFilter`, `sortBy`, `formulaMode`, `tieBreakOrder`, `selectedComplaintId`, `storageRecoveredNotice`) is NEVER saved to `localStorage`.
3. Shape Validation & Corruption Recovery:
   - On first launch (empty storage), seed the 4 official PDF records from Appendix B (`C01: 48h`, `C02: 8h`, `C03: 72h`, `C04: 24h`), converting hours-ago into `Date.now() - hours * 3600000`.
   - On hydration from `localStorage`, validate every item in `complaints` using `isValidComplaintRecord` from `src/domain`. If the stored JSON is broken OR the array is missing OR any record fails shape validation, filter out invalid records (or fall back to the 4 PDF seed records if none are valid) and set `storageRecoveredNotice = true`. Never crash.
4. Provide store actions:
   - `addComplaint({ category, description, initialHoursAgo = 0 })`
   - `advanceStatus(id)` (advances one step forward using `advanceComplaintStatus`)
   - `resetToSeedData()` (restores fresh `C01–C04` timestamps relative to `Date.now()`)
   - `injectTieBreakDemo()` (adds two unresolved complaints with identical scores to demonstrate tie-breaking live)
   - `importComplaints(rawItems)` (validates shape of each item, keeps unique IDs or assigns `generateNextId` on collision, and returns `{ added, rejected, renamed }`)
   - Setters for filters, `timeOffsetHours` (`0–168`), `formulaMode`, and `tieBreakOrder`.
5. Add a 30-second interval hook for current time and a `window` focus listener to rehydrate across tabs.
6. Write Vitest tests in `src/store/__tests__/store.test.ts` testing: first-run seeding, persistence across reload, broken JSON recovery, valid JSON with invalid record shape recovery, status advancement, and `resetToSeedData`. Run `npx vitest run` and `npm run build`. Commit as "Block B2: store and shape-safe persistence".
```

---

### 📦 BLOCK B3 · App Shell & Complaint Form (With Quick Chips & Initial Age Test Field) ($15\text{ min}$ · Clock $1:10$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`, `@src/domain`, `@src/store`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B3 from @spec_v3.md: Build the App Header and the "Report an issue" Complaint Form Dialog/Sheet (`src/components/ComplaintFormDialog.tsx`). Verify in browser at 1440px only.

1. Build the Header with:
   - **HOTSPOT** thermal wordmark & tagline `"Campus issues, ranked by how hot they're running."`
   - Search input, **"How scoring works"** button, **"Judge Tools ▾"** dropdown menu (containing `Reset to PDF Seed (C01–C04)` with confirmation, `Inject Tie-Break Demo`, and `Trigger Invalid Form Demo`), and primary **"Report an issue"** button.
   - If `storageRecoveredNotice` is true, show a dismissible calm banner: `"Saved data was damaged or outdated and has been reset to the demo dataset."`
2. Build `ComplaintFormDialog`:
   - Opens in a shadcn Dialog on desktop and Bottom Sheet below 700px.
   - **Category Selector:** 4 selectable options (`Wi-Fi [Weight 2]`, `Hostel [Weight 2]`, `Classroom [Weight 1]`, `Laboratory [Weight 3]`).
   - **1-Click Quick Fill Chips** (for fast live demos): 3 small chips (`"Lab 2 oscilloscope ground fault"`, `"Hostel B hot water geyser dead"`, `"Library Wi-Fi dropping packets"`) that populate Category and Description in one click.
   - **Description ("What's wrong?"):** Textarea with live character counter (`0 / 280`, min 10 chars).
   - **Optional Judge Test Field ("Simulate initial age (hours ago)"):** Numeric input (`0` to `240`, default `0`) so judges can test submitting a complaint that is already 48h old.
   - **Validation:** Calls `validateComplaintInput`. Shows inline errors in plain sentences next to fields, focuses first invalid field, blocks double submission, and on valid submit closes dialog, adds `C05`, and shows toast `"Reported as C05. It's in the queue."`
3. Render a temporary simple list of stored complaints below the header so you can verify creation and persistence.
4. Verify in browser at 1440px: test empty submit (inline errors), 9-char submit, valid submit (`C05`), and page refresh (`C05` persists). Attach 1440px screenshots and commit as "Block B3: complaint form".
```

---

### 📦 BLOCK B4 · Summary Counts Strip, Search/Filters, & Forward-Only Complaint List ($20\text{ min}$ · Clock $1:30$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`, `@src/domain`, `@src/store`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B4 from @spec_v3.md: Build the Summary Telemetry Strip, Combined Search/Filter Bar, and Interactive Complaint List (`src/components/ComplaintList.tsx`). Verify in browser at 1440px only.

1. **Summary Strip (`src/components/SummaryStrip.tsx`):**
   - Displays **Total**, **Pending** (with tooltip `"Raised plus In Progress"` and sub-text `"x raised · y in progress"`), and **Resolved** using `Anybody Variable` tabular numerals.
2. **Search & Filter Bar:**
   - 150ms debounced search matching `ID`, `description`, and `category`.
   - Category filter pills (`All`, `Wi-Fi`, `Hostel`, `Classroom`, `Laboratory`).
   - Status filter pills (`All`, `Raised`, `In Progress`, `Resolved`).
   - Sort control (`Priority`, `Newest`, `Oldest`) and `"Clear filters"` button.
3. **Complaint List (`src/components/ComplaintList.tsx`):**
   - Each row displays: ID (`C03`), Category chip, plain-text wrapping description, live Urgency Score badge (for unresolved items, colored by the Thermal Heat Ramp) or `Resolved` Cool Mint badge, age formatted as `"3d 0h (72h)"`, and the single **Forward-Only Status Button**:
     - `Raised` -> **"Start work"** (moves to `In Progress`).
     - `In Progress` -> **"Mark resolved"** (moves to `Resolved`).
     - `Resolved` -> No button (final state).
   - Guards against rapid double-clicks and animates row layout transitions with `motion/react`.
   - Empty states: (a) No complaints in store, and (b) No matches for active filters (with `"Clear filters"` button).
4. Verify in browser at 1440px: check seed counts (`4, 3, 1`), filter `Wi-Fi` + `Raised` (`C01`), search `"projector"` (`C03`), and advance `C01` through both steps (`Pending 2, Resolved 2`). Then use `"Reset to PDF Seed"` in the menu to restore `C01–C04`. Attach 1440px screenshots and commit as "Block B4: list, filters, and summary counts".
```

---

### 📦 BLOCK B5 · "Hottest Right Now" Top-3 Queue & Scoring Explainer ($20\text{ min}$ · Clock $1:50$ — *Every Rubric Line Now Complete!*)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`, `@src/domain`, `@src/store`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B5 from @spec_v3.md: Build the "Hottest right now" Top-3 Priority Queue (`src/components/PriorityQueue.tsx`) and the "How scoring works" Explainer Modal (`src/components/ScoringExplainerDialog.tsx`). Verify in browser at 1440px only.

1. **Priority Queue Panel (`Hottest right now`):**
   - Uses `getTopPriorityQueue` from `src/domain` (never duplicates math).
   - Header switches (never saved to localStorage, always default to Official PDF rules on load):
     - **Formula Mode:** `Baseline` (default) vs `Enhanced SLA`
     - **Tie-Break Order:** `Age-First` (default: `C03` > `C01`) vs `Category-First` (`C01` > `C03`)
   - Renders up to 3 unresolved cards (`#1`, `#2`, `#3`):
     - Large Urgency Score numeral in `"Anybody Variable"` with inline `fontVariationSettings` scaling both `wght` (`500..900`) and `wdth` (`85..125`) with the score, tinted by the Thermal Heat Ramp.
     - Prints `arithmeticText` (`"Score 4 = category 1 + age 3"`).
     - Prints `tieBreakSentence` (`"Ranked above C01: same score (4), waiting longer (72h vs 48h)."` and on #3: `"Lowest of the top three: score 2 = category 2 + age 0."`).
     - Includes direct 1-click status button (`Start work` / `Mark resolved`) and clicking a card scrolls to and highlights its row in the list below.
   - Strictly excludes `Resolved` complaints. When 0 unresolved complaints exist, displays `"All clear. No open complaints."` in Cool Mint.
2. **"How scoring works" Modal (`ScoringExplainerDialog.tsx`):**
   - Clearly documents the Baseline Formula, Category Weights (`Lab 3, Wi-Fi 2, Hostel 2, Classroom 1`), definitions of `"hours pending"` and `"pending"`, the 5-step Tie-Breaking hierarchy, the optional Enhanced SLA rule, and a live table of the current Top 3 items.
3. Verify in browser at 1440px: confirm queue shows `C03 (4)`, `C01 (4)`, `C02 (2)` and excludes `C04`; toggle `Age-First` vs `Category-First` to confirm `C03` and `C01` swap smoothly; open the Explainer modal. Attach 1440px screenshots and commit as "Block B5: priority queue and scoring explainer".
```

---

### 📦 BLOCK B6 · Offscreen-Accelerated Campus Thermal Map ($30\text{ min}$ · Clock $2:20$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`, `@src/domain`, `@src/store`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B6 from @spec_v3.md: Build the signature hero component `src/components/CampusThermalMap.tsx` placed on the left of the top dashboard grid, with the Priority Queue on its right. Verify in browser at 1440px only.

CRITICAL PERFORMANCE ARCHITECTURE (MUST FOLLOW):
1. **Offscreen Low-Res Heatmap Canvas (`250 x 150` pixels):**
   - Precompute a 256-entry RGBA lookup table (`Uint8ClampedArray`) from our 6-stop Thermal Heat Ramp (`#2A1B8C` -> `#7A2BC9` -> `#E5237A` -> `#FF7A18` -> `#FFD23F` -> `#FFF4D6`).
   - Paint radial-gradient alpha blobs for each unresolved complaint onto an offscreen `250 x 150` canvas at deterministic coordinates inside its category zone (derived from complaint ID hash so positions never jump). Blob radius and alpha scale with `heatRatio = Math.min(1, score / 10)`.
   - Convert the `250 x 150` alpha pixels through the 256-step color lookup table, then draw the offscreen canvas scaled up onto the visible canvas with `imageSmoothingEnabled = true`.
   - NEVER run a per-frame animation loop on the canvas! Redraw the canvas ONLY when `complaints`, `timeOffsetHours`, `formulaMode`, or container size changes.
2. **SVG Architectural Overlay (`1000 x 600` viewBox):**
   - Draw the 4 campus zones: **Wi-Fi Network Core** (top-left), **Hostel Towers** (top-right), **Academic Classrooms** (bottom-left), and **Laboratory Wing** (bottom-right), connected by clean architectural pathways.
   - Each zone header displays its name, open complaint count, and peak urgency score. Clicking a zone filters the complaint list below to that category.
   - Render a keyboard-focusable SVG hotspot marker for each unresolved complaint (`aria-label="C03, Classroom, score 4, raised, 72 hours"`).
   - Handle motion purely in SVG/CSS (respecting `prefers-reduced-motion`):
     - `Raised` hotspots have a soft CSS pulsing ring.
     - `In Progress` hotspots have a steady CSS rotating dashed ring.
     - Clicking a hotspot selects the complaint and scrolls to its row.
   - Include a bottom Thermal Scale Legend (`0 Cold ──────► 10 White-Hot`) and a Cool Mint `"All clear"` state when 0 complaints are open.
3. Verify in browser at 1440px, critique the visual hierarchy against Section 3, fix any spacing or contrast issues, attach 1440px screenshots, and commit as "Block B6: offscreen-accelerated campus thermal map".
```

---

### 📦 BLOCK B7 · Fast-Forward Time Machine, CSV/JSON Import/Export, & Full Responsive Check ($20\text{ min}$ · Clock $2:40$)
> **Files to attach:** `@spec_v3.md`, `@AGENTS.md`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B7 from @spec_v3.md: Add the Fast-Forward Time Machine slider, CSV/JSON Organizer Import/Export, and full desktop + mobile verification (`1440px` and `390px`).

1. **Fast-Forward Time Machine (`src/components/TimeMachineBar.tsx`):**
   - Header slider from `0` to `168` hours (step `1h`) with quick pills (`Now`, `+24h`, `+48h`).
   - When `timeOffsetHours > 0`, display a clear banner: `"Showing +48h. Your saved data is unchanged."` with a `"Back to now"` button.
   - Dragging the slider updates all scores, re-orders the queue with layout animations, and heats the thermal map live without touching `localStorage`.
2. **Organizer CSV/JSON Import & Export (`src/components/DataImportModal.tsx`):**
   - Install `papaparse` and `@types/papaparse` (or parse simple CSV/JSON cleanly).
   - Accessible from the `"Judge Tools ▾"` menu: allows uploading or pasting JSON/CSV records (`ID, Category, Submitted (hours ago), Status, Description`), validates every row with `isValidComplaintRecord` / `validateComplaintInput`, reports imported vs rejected rows, and provides 1-click **Export CSV** and **Export JSON**.
3. **Responsive & Accessibility Polish:**
   - Ensure zero horizontal scroll at `360px` and `390px` mobile widths, visible focus rings on all controls and SVG hotspots, and `aria-live="polite"` announcements for toasts.
4. Run `npx vitest run` and `npm run build`. Open the browser at **both `1440px` and `390px`**, test the Fast-Forward slider at `+24h` and `+48h`, attach screenshots at both widths, and commit as "Block B7: time machine, import/export, and responsive polish".
```

---

### 📦 BLOCK B8 · Judge-Ready `README.md` & Production Build Check ($15\text{ min}$ · Clock $2:55$)
> **Files to attach:** `@spec_v3.md`  
> **Copy and paste into Antigravity:**

```text
Execute BLOCK B8 from @spec_v3.md: Write a clear, judge-focused `README.md` and verify the production build.

1. Write `README.md` containing:
   - **Overview:** 2-sentence pitch of AETHER-HOTSPOT.
   - **How to Run & Test:** Exact commands (`npm install`, `npm run dev`, `npx vitest run`, `npm run build`).
   - **100-Point Rubric Guide:** A table showing judges where to find each requirement in the UI.
   - **Priority Scoring Rule & Tie-Breaking Documentation (25 Points):**
     - Official Baseline Formula (`Weight + floor(hoursPending / 24)`), Category Weights (`Laboratory=3, Wi-Fi=2, Hostel=2, Classroom=1`), definitions of `"hours pending"` (time since submission) and `"pending"` (`Raised + In Progress`), the 5-step Tie-Breaking rules, our documented Enhanced SLA mode, and the Worked Seed Data Table (`C01–C04`).
   - **Data Handling & Persistence (15 Points):** Versioned `localStorage` (`aether_hotspot.v3`), deep shape validation, corruption recovery, and CSV/JSON import/export format.
   - **Technical Highlights:** Offscreen `250x150` thermal canvas lookup, self-hosted variable fonts (`Anybody Variable` with `wdth` axis + `Instrument Sans Variable`).
2. Run `npx vitest run` and `npm run build`, preview the built `dist/` folder, and commit as "Block B8: README and production verification".
```

---

## 📜 APPENDIX A — EXACT CONTENT FOR `AGENTS.md` (CREATED IN BLOCK B0)

```text
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
```

---

## 📋 APPENDIX B — OFFICIAL PDF SEED DATA

| ID | Category | Submitted (hours ago) | Status | Seed Description |
| :--- | :--- | :---: | :--- | :--- |
| **C01** | `Wi-Fi` | `48` | `Raised` | Wi-Fi keeps dropping every few minutes in the library reading hall and main academic block. |
| **C02** | `Hostel` | `8` | `In Progress` | Hot water geyser and drinking water cooler not working on the second floor of Hostel Block B. |
| **C03** | `Classroom` | `72` | `Raised` | Ceiling projector HDMI matrix in Room 204 will not turn on, disrupting scheduled lectures. |
| **C04** | `Laboratory` | `24` | `Resolved` | Oscilloscope workbench ground fault and microscope lamp failure at Station 3 in Lab 2. |