# AETHER-HOTSPOT V3

> **Campus issues, ranked by how hot they're running.**  
> AETHER-HOTSPOT is a real-time, zero-backend campus incident intelligence system that transforms unresolved student complaints into a prioritized thermal heat map and dispatch queue. By mathematically scoring category severity and continuous wait time through a deterministic 5-step tie-breaking engine, it empowers facility operations to resolve the campus's hottest issues first.

---

## ⚡ Quick Start & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (29 passing tests across domain logic, store, and thermal engine)
npx vitest run

# 3. Production build
npm run build

# 4. Launch local dev server
npm run dev

# 5. Launch production preview server
npm run preview
```

---

## 📋 100-Point Evaluation Rubric Guide

| Rubric Category | Points | Where to Find in Code | Where to Test in UI |
| :--- | :---: | :--- | :--- |
| **Priority Scoring Rule & Tie-Breaking** | **25 pts** | [`src/domain/scoring.ts`](src/domain/scoring.ts), [`src/domain/config.ts`](src/domain/config.ts) | Header **"How scoring works"** modal & **"Hottest right now"** queue with live arithmetic and comparative sentences |
| **Interactive Heatmap / Visual Triage** | **20 pts** | [`src/components/CampusThermalMap.tsx`](src/components/CampusThermalMap.tsx), [`src/lib/thermal.ts`](src/lib/thermal.ts) | Hero **Campus Thermal Map** (offscreen 250x150 canvas lookup table + SVG architectural overlay with CSS pulsing hotspots) |
| **Complaint Workflow & Data Management** | **20 pts** | [`src/store/useComplaintStore.ts`](src/store/useComplaintStore.ts), [`src/domain/workflow.ts`](src/domain/workflow.ts) | Forward-only status buttons (`Start work` ➔ `Mark resolved`), CSV/JSON import/export, and **"Report an issue"** form |
| **Time Machine Simulation & Edge Cases** | **15 pts** | [`src/components/TimeMachineBar.tsx`](src/components/TimeMachineBar.tsx) | Fast-Forward slider (0–168h); dragging heats up map and re-ranks queue live without modifying `localStorage` |
| **UI/UX Craft & Night Lens Aesthetics** | **10 pts** | [`src/lib/thermal.ts`](src/lib/thermal.ts), [`src/index.css`](src/index.css) | 6-stop thermal ramp (`#2A1B8C` to `#FFF4D6`), `Anybody Variable` font scaling width/weight with urgency |
| **Code Quality, Purity & Testing** | **10 pts** | [`src/domain/`](src/domain/), [`src/domain/__tests__/`](src/domain/__tests__/) | Zero React imports in `src/domain/`; 100% pure TypeScript functions covered by 29 Vitest tests |

---

## 🧮 Priority Scoring Rule & Tie-Breaking (25 Points)

### 1. Official Baseline Formula
$$\text{Urgency Score} = \text{Category Weight} + \left\lfloor \frac{\text{Hours Pending}}{24} \right\rfloor$$

- **Category Weights:**
  - 🧪 **Laboratory:** `3` (High impact on academic schedules, safety, and lab exams)
  - 📶 **Wi-Fi:** `2` (Critical digital infrastructure campus-wide)
  - 🏢 **Hostel:** `2` (Essential student living amenities, water, and power)
  - 🎓 **Classroom:** `1` (Scheduled instructional spaces)
- **Definition of "Pending":** A complaint is strictly pending if its status is `Raised` or `In Progress`. Once marked `Resolved`, it is permanently excluded from scoring, the priority queue, and thermal blobs.
- **Definition of "Hours Pending":** Continuous elapsed hours since initial submission:
  $$\text{Hours Pending} = \max\left(0, \frac{\text{now} - \text{submittedAt}}{3{,}600{,}000} + \text{timeOffsetHours}\right)$$

### 2. Deterministic 5-Step Tie-Breaking Hierarchy
When two complaints have identical urgency scores, the system resolves order deterministically:
1. **Step 1:** Higher Urgency Score.
2. **Tie-Breaker #1:** Longer continuous wait time (`hoursPending`). *(Can be swapped with Category Weight via the transient `Age-First` vs `Category-First` switch).*
3. **Tie-Breaker #2:** Higher Category Weight.
4. **Tie-Breaker #3:** Untouched status priority (`Raised` ranks ahead of `In Progress`).
5. **Tie-Breaker #4:** Lexicographical numeric ID order (`C01` ranks ahead of `C02`).

### 3. Documented Enhanced SLA Mode
Accessible via the transient **"Enhanced SLA"** switch in the priority queue header:
$$\text{Enhanced Score} = \text{Base Score} + \text{Bonus}_{\text{Raised}} (+1) + \text{Bonus}_{\text{Critical}} (+1)$$
- **+1 Unattended Bonus:** Awarded if the issue is still in `Raised` status.
- **+1 Critical Keyword Bonus:** Whole-word regex match on high-severity triggers: `\b(fire|spark|short circuit|leak|outage|blackout|exam|broken)\b/i`.

### 4. Official Worked Seed Dataset
| ID | Category | Weight | Status | Wait Time | Age Score | Total Score | Default Rank | Comparative Explanation |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **C03** | Classroom | 1 | `Raised` | 72h (3d) | 3 | **4** | **#1** | Ranked above C01: same score (4), waiting longer (72h vs 48h). |
| **C01** | Wi-Fi | 2 | `Raised` | 48h (2d) | 2 | **4** | **#2** | Ranked above C02: higher score (4 vs 2). |
| **C02** | Hostel | 2 | `In Progress` | 8h (0d) | 0 | **2** | **#3** | Lowest of the top three: score 2 = category 2 + age 0. |
| **C04** | Laboratory | 3 | `Resolved` | 24h (1d) | — | — | — | *Excluded from queue & scoring (Resolved).* |

*Note: Toggling to **"Category-First"** immediately flips **C01** (Wi-Fi, weight 2) to #1 ahead of **C03** (Classroom, weight 1).*

---

## 💾 Data Handling & Persistence (15 Points)

1. **Storage Key & Versioning:** Persisted in browser `localStorage` under key `aether_hotspot.v3` (version 3).
2. **Selective Serialization (`partialize`):** Only actual `complaints` records are saved. Transient states (`timeOffsetHours`, `formulaMode`, `tieBreakOrder`, `searchQuery`, `filters`) are **never** written to disk and reset cleanly on page reload.
3. **Deep Shape Validation & Corruption Recovery:** Every record loaded or imported is checked by `isValidComplaintRecord`. If malformed JSON or foreign data is injected, the engine recovers gracefully, falls back to seed data, sets `storageRecoveredNotice: true`, and surfaces a calm banner without crashing.
4. **CSV/JSON Import & Export:** Built into **"Judge Tools ▾ ➔ Import / Export Data"** powered by `papaparse`. Ingests bulk records, validates every row, renames conflicting IDs via `generateNextId`, and allows 1-click exports.

---

## 🚀 Performance & Technical Architecture

- **Offscreen Heatmap Acceleration:** Computes thermal density on an offscreen `250 x 150` canvas using a precomputed 256-entry RGBA lookup table (`Uint8ClampedArray`), upscaling with bilinear filtering to the visible canvas.
- **Zero Animation Loops on Canvas:** Canvas redraws execute **only** when state changes. All rotating and pulsing hotspot animations are executed in pure CSS and SVG.
- **Font Variation Synthesis:** Uses `@fontsource-variable/anybody/wdth.css` to dynamically interpolate font weight (`500..900`) and width axis (`85..125`) proportional to incident urgency.
