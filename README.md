# Flexiple AI Recruiter: The Sourcing Refinement Loop

A full-stack, AI-powered sourcing refinement platform built for the **Flexiple Engineering Challenge**.

This application implements the sourcing refinement loop end-to-end: a recruiter enters a free-text requirement, the server-side LLM extracts structured objective filters and a subjective fit rubric, screens candidate profiles against hard constraints from the talent pool, scores candidates with **grounded, field-level citations**, refines the criteria dynamically based on conversational recruiter feedback, and freezes the finalized shortlist.

---

## Live Demo & Loom Walkthrough
- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Deployment**: Vercel-ready (Serverless, zero external database dependencies)
- **Primary LLM**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **Loom Walkthrough**: [Link to 15-minute Loom Walkthrough] *(Insert Loom link here)*

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- A Google Gemini API Key (free tier available at [Google AI Studio](https://aistudio.google.com/))

### 2. Environment Variable
Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Populate the required environment variable:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **API Key Name**: `GEMINI_API_KEY` (read strictly server-side in API route handlers; never exposed to the client bundle).

### 3. Install Dependencies & Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architectural Flow & Pipeline

```
  [ Recruiter Free-Text Prompt ]
                │
                ▼
  [ 1. Extraction: /api/search ]
    - Structured Objective Filters (Skills, YoE, Location, Company Type)
    - Subjective Fit Rubric (Mission, Competencies, Green/Red Flags)
                │
                ▼
  [ 2. Deterministic Screening ]
    - Local filter engine over 48 profiles in profiles.json
    - Soft relaxation if hard criteria are overly restrictive
                │
                ▼
  [ 3. LLM Grounded Scoring ]
    - Scores candidate profiles against the rubric (0-100%)
    - Strict citation requirement: cites actual fields (company, YoE, skills)
    - Ranks top 4-5 candidate cards
                │
                ▼
  [ 4. Refinement Loop: /api/refine ]
    - Conversational feedback ("1 is too junior, 2 and 4 are right")
    - Per-profile Yes/No match reactions
    - LLM adjusts filters & rubric, explaining WHAT changed and WHY
                │
                ▼
  [ 5. Direct Criteria Edits: /api/rerank ]
    - Recruiter can manually adjust any filter or rubric parameter
    - Instant re-filtering and scoring
                │
                ▼
  [ 6. Freeze Search ]
    - Locked shortlist presentation
    - Export to JSON & formatted copy for outreach
```

---

## Engineering Decisions: What We Prioritised, What We Cut, and Why

### What We Prioritised
1. **Field-Specific Grounded Citations**:
   - Generic LLM praise ("impressive background", "hard worker") destroys recruiter trust. We engineered the scoring prompt to strictly cite candidate fields (e.g. `NimbusPay (startup)`, `6 years YoE`, `AWS RDS + PostgreSQL`, `IIT Madras`).
2. **Transparent Diff Explanations**:
   - When a recruiter submits feedback like *"1 is too junior, 2 and 4 are right"*, the system explicitly articulates **what changed** (e.g. raised minimum YoE from 4 to 5) and **why** (tied directly to candidate #1's seniority).
3. **Editable Strategy Drawer**:
   - The recruiter remains in full control. Objective filters and subjective rubric criteria can be inspected at a glance and directly edited at any point, with instant re-ranking.
4. **Resilient Failure & Recovery Architecture**:
   - Rate limits (HTTP 429), API quota exhaustion, and malformed outputs are intercepted with exponential backoff retries and descriptive recovery banners rather than unhandled crashes.
   - Includes an in-app **"Simulate Loom Failure Demo"** button to easily demonstrate graceful error handling during walkthroughs.
5. **Zero-Setup Vercel Deployment**:
   - Session state is managed reactively on the client while LLM calls and profile filtering remain server-side. No database setup or migrations are needed to run locally or deploy to Vercel.

### What We Cut (and Why)
1. **User Authentication & Multi-Role Permissions**:
   - Cut per challenge instructions (*"no login, no multiple roles, no persistence across sessions"*). Omitting auth kept the focus strictly on recruiter interaction quality and LLM reasoning.
2. **External Vector Database (e.g. Pinecone/Qdrant)**:
   - For a 48-profile dataset, local in-memory filtering combined with direct LLM ranking is faster (0ms DB latency), fully deterministic, and avoids external network points of failure.
3. **Heavy UI Component Libraries**:
   - Handcrafted Tailwind CSS components tailored to modern recruiting SaaS interfaces (Linear/Ashby aesthetic) avoided bulky third-party dependencies and CSS conflicts.

---

## Repository Prompts

All LLM prompts are centralized and documented in [`src/lib/prompts/`](file:///Users/user/Documents/my%20folder/flexiple-sourcing-refinement/src/lib/prompts):
- [`parseRequirements.ts`](file:///Users/user/Documents/my%20folder/flexiple-sourcing-refinement/src/lib/prompts/parseRequirements.ts): Free-text requirement to objective filters + subjective rubric.
- [`scoreCandidates.ts`](file:///Users/user/Documents/my%20folder/flexiple-sourcing-refinement/src/lib/prompts/scoreCandidates.ts): Candidate evaluation with field citations and fit scoring.
- [`refineSearch.ts`](file:///Users/user/Documents/my%20folder/flexiple-sourcing-refinement/src/lib/prompts/refineSearch.ts): Natural language and reaction feedback translation to criteria adjustments.

---

## Verification & Test Checklist

- [x] TypeScript compilation passes without errors (`npm run build`).
- [x] Tested with the challenge prompt: *"RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore."*
- [x] Objective filters extracted: Skills (`AWS RDS`, `PostgreSQL`), YoE (`4-7`), Location (`Bangalore`), Company types (`startup`).
- [x] Top 4-5 profiles scored and ranked with verified field citations.
- [x] Conversational refinement tested with *"1 is too junior, 2 and 4 are right"*.
- [x] Criteria drawer supports direct editing and re-ranking.
- [x] Freeze search locks state, triggers confetti, and enables shortlist export.
- [x] Error handling & recovery tested for missing API keys and simulated rate limits.
