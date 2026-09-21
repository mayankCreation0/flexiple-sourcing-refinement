import { z } from 'zod';

export const companyTypeSchema = z.enum(['startup', 'scaleup', 'enterprise', 'agency']);

export const objectiveFiltersSchema = z.object({
  skills: z.array(z.string()).default([]),
  min_years_experience: z.number().nullable().default(null),
  max_years_experience: z.number().nullable().default(null),
  locations: z.array(z.string()).default([]),
  company_types: z.array(companyTypeSchema).default([]),
  titles: z.array(z.string()).default([]),
});

export const rubricCompetencySchema = z.object({
  name: z.string(),
  description: z.string(),
  weight: z.enum(['critical', 'high', 'medium']).default('high'),
});

export const subjectiveRubricSchema = z.object({
  role_summary: z.string(),
  core_competencies: z.array(rubricCompetencySchema).default([]),
  positive_signals: z.array(z.string()).default([]),
  negative_signals: z.array(z.string()).default([]),
});

export const initialExtractionResponseSchema = z.object({
  filters: objectiveFiltersSchema,
  rubric: subjectiveRubricSchema,
  thinking_summary: z.string().default(''),
});

export const candidateScoreSchema = z.object({
  candidate_id: z.string(),
  fit_score: z.number().min(0).max(100),
  verdict: z.enum(['strong_match', 'potential_match', 'weak_match']),
  explanation: z.string(),
  cited_fields: z.object({
    company_fit: z.string().optional(),
    experience_fit: z.string().optional(),
    skills_fit: z.string().optional(),
    education_fit: z.string().optional(),
  }).default({}),
  key_highlights: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
});

export const scoringResponseSchema = z.object({
  candidate_scores: z.array(candidateScoreSchema),
});

export const refinementResponseSchema = z.object({
  filters: objectiveFiltersSchema,
  rubric: subjectiveRubricSchema,
  explanation_of_changes: z.string(),
  changes_summary: z.object({
    filters_modified: z.array(z.string()).default([]),
    rubric_modified: z.array(z.string()).default([]),
  }),
});
