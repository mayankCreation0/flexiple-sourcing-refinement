import { CandidateProfile, SubjectiveRubric } from '@/lib/types';

/**
 * Prompt: score-candidates
 *
 * Evaluates candidate profiles against the subjective fit rubric with grounded,
 * field-level citations and a 0–100 fit score.
 */

export const SCORE_CANDIDATES_SYSTEM_PROMPT = `
You are the AI Recruiter Scoring Engine at Flexiple.
Your role is to rigorously evaluate a list of candidate profiles against a Subjective Fit Rubric.

CRITICAL INSTRUCTIONS FOR EXPLANATIONS & CITATIONS:
- You MUST cite actual fields from the candidate profile in every explanation (e.g. mention the exact company name, years of experience, specific skills, or education).
- Do NOT use generic praise like "Great communicator" or "Impressive background".
- Explicitly explain why the candidate is a fit or near-miss based on their actual background.
- Provide structured field-level citations:
  - company_fit: how current or past company types/names match the rubric
  - experience_fit: how years of experience and seniority level align
  - skills_fit: which exact skills match the core competencies
  - education_fit: relevant academic background or degrees

Verdict criteria:
- "strong_match": Candidate satisfies all core competencies and has strong positive signals (Score 80-100)
- "potential_match": Candidate meets most criteria but has a minor gap (e.g. slightly off YoE or scaleup instead of startup) (Score 55-79)
- "weak_match": Candidate has significant gaps or negative signals (Score 0-54)

Output MUST be valid JSON conforming to the schema.
`;

export function buildScoreCandidatesPrompt(
  rubric: SubjectiveRubric,
  candidates: CandidateProfile[]
): string {
  return `
SUBJECTIVE FIT RUBRIC:
Role Summary: ${rubric.role_summary}
Core Competencies:
${rubric.core_competencies.map((c) => `- ${c.name} (${c.weight}): ${c.description}`).join('\n')}

Positive Signals:
${rubric.positive_signals.map((s) => `- ${s}`).join('\n')}

Negative Signals:
${rubric.negative_signals.map((s) => `- ${s}`).join('\n')}

CANDIDATES TO EVALUATE:
${JSON.stringify(candidates, null, 2)}

Score every candidate in the list against the rubric. Output in JSON format:
{
  "candidate_scores": [
    {
      "candidate_id": "string",
      "fit_score": number, // 0 to 100
      "verdict": "strong_match" | "potential_match" | "weak_match",
      "explanation": "2-3 sentences citing exact candidate details (company name, YoE, skills)",
      "cited_fields": {
        "company_fit": "e.g., Currently at NimbusPay (startup), previously at Freshworks (scaleup)",
        "experience_fit": "e.g., 6 years of backend experience fits the 4-7 year target",
        "skills_fit": "e.g., Proficient in AWS RDS, PostgreSQL, and Node.js",
        "education_fit": "e.g., B.Tech CSE from IIT Madras"
      },
      "key_highlights": ["string citing profile facts"],
      "concerns": ["string citing profile facts or gaps"]
    }
  ]
}
`;
}
