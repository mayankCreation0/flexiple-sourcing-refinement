# Flexiple AI Recruiter — Sourcing Refinement Loop

Full-stack AI sourcing refinement app built for the **Flexiple Engineering Challenge**.

A recruiter enters a free-text hiring requirement. The app uses **Google Gemini** to extract objective filters and a subjective fit rubric, deterministically filters **48 local profiles**, scores candidates with **field-level citations**, accepts recruiter feedback to refine the search, and freezes a final shortlist.

---

## Live Demo

> Add your Vercel URL here after deployment, e.g. `https://flexiple-sourcing-refinement.vercel.app`

**Loom walkthrough (≤15 min):** [Insert your Loom link here]

---

## Quick Start (Evaluator Instructions)

Evaluators should be able to run the app locally in **two commands** after setting the API key.

```bash
git clone git@github.com:mayankCreation0/flexiple-sourcing-refinement.git
cd flexiple-sourcing-refinement
npm install
cp .env.example .env.local
# Edit .env.local and add your Gemini API key (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build (optional)

```bash
npm run build
npm start
```

---

## API Key Environment Variable

Obtain a free key from [Google AI Studio](https://aistudio.google.com/).

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Supported variable names** (either works — server-side only, never exposed to the client):

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Primary (recommended) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Alias also supported |

See [`.env.example`](.env.example) for the template.

---

## Repository Structure

```text
flexiple-sourcing-refinement/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── search/route.ts    # Free-text → filters + rubric + initial ranking
│   │   │   ├── refine/route.ts    # Feedback → updated filters/rubric + re-rank
│   │   │   └── rerank/route.ts    # Manual criteria edits → re-rank
│   │   ├── page.tsx               # Main recruiter UI
│   │   └── layout.tsx
│   ├── components/                # UI components (cards, drawer, refinement chat, etc.)
│   ├── data/
│   │   └── profiles.json          # 48 candidate profiles (local talent pool)
│   ├── lib/                       # Filtering, Gemini client, validation, fallbacks
│   └── prompts/                   # LLM prompts (reviewed by evaluators)
│       ├── parse-search.ts
│       ├── score-candidates.ts
│       └── refine-search.ts
├── .env.example
├── README.md
└── package.json
```

---

## End-to-End Flow

```text
Free-text requirement
        ↓
/api/search  →  Gemini extracts objective filters + subjective rubric
        ↓
Deterministic filter over profiles.json (48 profiles)
        ↓
Gemini scores filtered candidates with field citations
        ↓
Top 4–5 ranked candidate cards displayed
        ↓
Recruiter Match/Skip + free-text refinement
        ↓
/api/refine  →  Gemini adjusts filters/rubric + explains what changed & why
        ↓
New ranked results
        ↓
Freeze Search  →  Final filters, rubric, and shortlist (export JSON / copy)
```

---

## Engineering Decisions: What We Prioritised, What We Cut, and Why

### What we prioritised

1. **End-to-end sourcing refinement loop** — search → rank → feedback → refine → freeze in one session
2. **Real LLM integration** — Gemini API for extraction, scoring, and refinement (with heuristic fallback on rate limits)
3. **Structured LLM output** — JSON-mode responses validated with Zod schemas
4. **Deterministic objective filtering** — hard constraints applied locally over `profiles.json` before LLM scoring
5. **Evidence-based explanations** — every candidate card cites actual profile fields (company, YoE, skills, education)
6. **Visible refinement diff** — app shows what changed in filters/rubric and why after each feedback round
7. **Recruiter control** — editable filters and rubric with instant re-rank via `/api/rerank`
8. **Designed UI states** — empty, loading/thinking, empty results, LLM error + retry, frozen shortlist
9. **Failure/recovery demo** — "Simulate 429 Demo" button for Loom walkthrough of graceful error handling

### What we cut

| Cut | Why |
|---|---|
| Authentication / login | Assignment focuses on one recruiter session, not multi-user access |
| Database / persistence | 48-profile dataset fits in memory; no migrations needed |
| Search history across sessions | Single-session refinement loop is the product goal |
| Multiple recruiter roles | Out of scope per assignment brief |
| Vector DB / external talent infra | Unnecessary for 48 profiles; local filter + LLM rank is faster and deterministic |
| Heavy UI libraries | Custom Tailwind components for a focused recruiting workspace |

The supplied dataset is only **48 profiles** and the assignment explicitly focuses on **one sourcing session**, so we prioritised recruiter experience, LLM reasoning quality, and the refinement loop over production-scale infrastructure.

---

## LLM Prompts

Prompts live in [`src/prompts/`](src/prompts/) as required by the assignment:

| File | Purpose |
|---|---|
| [`parse-search.ts`](src/prompts/parse-search.ts) | Free-text → objective filters + subjective rubric |
| [`score-candidates.ts`](src/prompts/score-candidates.ts) | Rubric-based scoring with field citations |
| [`refine-search.ts`](src/prompts/refine-search.ts) | Feedback → filter/rubric adjustments + change explanation |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |

Pre-commit hooks (Husky + lint-staged) run ESLint and `tsc --noEmit` on staged `.ts`/`.tsx` files.

---

## Submission Checklist

### Functionality

- [x] Free-text search with real Gemini LLM calls
- [x] Objective filters + subjective rubric generated
- [x] Filters and rubric editable with re-rank
- [x] `profiles.json` filtered deterministically
- [x] Candidates LLM-scored with top 4–5 displayed
- [x] Explanations cite actual profile fields
- [x] Match/Skip + free-text refinement
- [x] LLM changes filters/rubric with visible diff + rationale
- [x] Repeatable refinement rounds
- [x] Freeze → final filters, rubric, shortlist

### UX states

- [x] Initial / empty state
- [x] Loading / thinking indicator
- [x] Empty results state (with "Loosen Filters")
- [x] LLM error banner + Retry
- [x] Simulated 429 failure demo
- [x] Frozen shortlist view
- [x] Current filters and rubric always visible

### Repository

- [x] README with setup + API key variable name
- [x] Decisions section (prioritised / cut / why)
- [x] `.env.example` (no secrets committed)
- [x] LLM prompts in `src/prompts/`
- [x] `src/data/profiles.json` included

### Loom (record before submitting)

- [ ] Full flow: search → rank → refine → freeze (one session)
- [ ] At least one refinement round with visible filter change
- [ ] One failure/recovery moment (use Simulate 429 Demo + Retry)
- [ ] ≤15 minutes total

---

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Google Gemini** (`@google/generative-ai`, model: `gemini-flash-latest`)
- **Zod** for response validation
- **Vercel**-ready (serverless API routes, no external DB)

---

## License

Built for the Flexiple Engineering Hiring assignment.
