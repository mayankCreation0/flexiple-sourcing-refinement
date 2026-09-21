import {
  FeedbackItem,
  ObjectiveFilters,
  ScoredCandidate,
  SubjectiveRubric,
} from '@/lib/types';

/**
 * Prompt: refine-search
 *
 * Adjusts objective filters and subjective rubric based on recruiter feedback,
 * explaining what changed and why.
 */

export const REFINE_SEARCH_SYSTEM_PROMPT = `
You are the AI Recruiter Refinement Engine at Flexiple.
Your role is to listen to the recruiter's feedback on candidate recommendations and intelligently adjust:
1. The OBJECTIVE FILTERS (e.g. adjust years of experience range, add/remove required skills, add/remove locations or company types).
2. The SUBJECTIVE RUBRIC (e.g. shift emphasis from general full-stack to deep backend systems, adjust positive/negative signals, elevate weight of particular competencies).

IMPORTANT GUIDELINES FOR REFINEMENT:
- Understand natural shorthand like "1 is too junior, 2 and 4 are right", "candidate 3 has too much agency background", or "focus on candidates with Node.js and AWS".
- Translate feedback into specific filter or rubric adjustments:
  - If candidate #1 (e.g. 4 years YoE) was "too junior", increase min_years_experience to 5 or 6.
  - If a company type was criticized (e.g. "no agency people"), remove "agency" from company_types or add it to negative signals.
  - If candidates lacking a specific skill were downvoted, make that skill explicit or required.
- Do NOT make unnecessary changes. Only modify what the feedback justifies.
- ALWAYS provide a clear, professional summary of:
  - What you changed in the objective filters and subjective rubric.
  - The rationale (why) tied directly to the recruiter's input.
`;

export function buildRefineSearchPrompt(
  currentFilters: ObjectiveFilters,
  currentRubric: SubjectiveRubric,
  presentedCandidates: ScoredCandidate[],
  recruiterMessage: string,
  perProfileFeedback?: FeedbackItem[]
): string {
  const candidateSummary = presentedCandidates.map((c, idx) => ({
    index: idx + 1,
    id: c.profile.id,
    name: c.profile.name,
    title: c.profile.current_title,
    years_experience: c.profile.years_experience,
    company: `${c.profile.current_company} (${c.profile.current_company_type})`,
    location: c.profile.location,
    skills: c.profile.skills,
    score: c.score.fit_score,
  }));

  return `
CURRENT OBJECTIVE FILTERS:
${JSON.stringify(currentFilters, null, 2)}

CURRENT SUBJECTIVE RUBRIC:
${JSON.stringify(currentRubric, null, 2)}

PRESENTED CANDIDATES (Numbered 1 to ${presentedCandidates.length}):
${JSON.stringify(candidateSummary, null, 2)}

RECRUITER FEEDBACK:
Natural Language Input: "${recruiterMessage || 'Reviewing candidate reactions'}"
Per-Profile Reactions: ${
    perProfileFeedback && perProfileFeedback.length > 0
      ? JSON.stringify(perProfileFeedback, null, 2)
      : 'None explicitly toggled'
  }

Analyze this feedback in relation to the candidates shown. Output the updated filters, rubric, and a clear explanation in JSON:
{
  "filters": {
    "skills": ["string"],
    "min_years_experience": number or null,
    "max_years_experience": number or null,
    "locations": ["string"],
    "company_types": ["startup" | "scaleup" | "enterprise" | "agency"],
    "titles": ["string"]
  },
  "rubric": {
    "role_summary": "string",
    "core_competencies": [
      {
        "name": "string",
        "description": "string",
        "weight": "critical" | "high" | "medium"
      }
    ],
    "positive_signals": ["string"],
    "negative_signals": ["string"]
  },
  "explanation_of_changes": "Clear 2-3 sentence explanation of what was modified and why (e.g. 'Increased minimum experience to 5 years because Candidate #1 was considered too junior...')",
  "changes_summary": {
    "filters_modified": ["list of modified filter names, e.g. min_years_experience"],
    "rubric_modified": ["list of modified rubric areas"]
  }
}
`;
}
