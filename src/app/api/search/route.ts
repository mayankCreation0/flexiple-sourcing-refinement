import { NextRequest, NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/gemini';
import {
  PARSE_REQUIREMENTS_SYSTEM_PROMPT,
  buildParseRequirementsPrompt,
} from '@/lib/prompts/parseRequirements';
import {
  SCORE_CANDIDATES_SYSTEM_PROMPT,
  buildScoreCandidatesPrompt,
} from '@/lib/prompts/scoreCandidates';
import { allProfiles, filterProfiles } from '@/lib/profiles';
import {
  initialExtractionResponseSchema,
  scoringResponseSchema,
} from '@/lib/validation';
import { ObjectiveFilters, ScoredCandidate, SubjectiveRubric } from '@/lib/types';
import { heuristicExtractRequirements, heuristicScoreCandidates } from '@/lib/fallback';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid search query.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in environment variables. Please add it to .env.local to enable real LLM sourcing.',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    let filters: ObjectiveFilters;
    let rubric: SubjectiveRubric;
    let thinking_summary: string;

    // Step 1: LLM extracts objective filters and subjective rubric (with heuristic fallback on 429 quota)
    try {
      const parsePrompt = buildParseRequirementsPrompt(query.trim());
      const extractionRaw = await callGeminiJson<any>(
        PARSE_REQUIREMENTS_SYSTEM_PROMPT,
        parsePrompt
      );
      const validatedExtraction = initialExtractionResponseSchema.parse(extractionRaw);
      filters = validatedExtraction.filters;
      rubric = validatedExtraction.rubric;
      thinking_summary = validatedExtraction.thinking_summary;
    } catch (err: any) {
      console.warn('Gemini extraction unavailable (rate limit/quota), using intelligent heuristic fallback:', err?.message);
      const fallback = heuristicExtractRequirements(query.trim());
      filters = fallback.filters;
      rubric = fallback.rubric;
      thinking_summary = fallback.thinking_summary;
    }

    // Step 2: Apply objective filters to local profiles.json (48 profiles)
    const filteredCandidates = filterProfiles(filters, allProfiles, 8);

    if (filteredCandidates.length === 0) {
      return NextResponse.json({
        filters,
        rubric,
        thinking_summary,
        candidates: [],
        message: 'No candidates matched the strict criteria. Consider loosening filters.',
      });
    }

    // Step 3: LLM evaluates candidates against rubric with cited field evidence (or fallback)
    let scoredCandidates: ScoredCandidate[] = [];
    try {
      const scorePrompt = buildScoreCandidatesPrompt(rubric, filteredCandidates);
      const scoringRaw = await callGeminiJson<any>(
        SCORE_CANDIDATES_SYSTEM_PROMPT,
        scorePrompt
      );
      const validatedScoring = scoringResponseSchema.parse(scoringRaw);

      scoredCandidates = filteredCandidates
        .map((profile) => {
          const scoreMatch = validatedScoring.candidate_scores.find(
            (s) => s.candidate_id === profile.id
          );
          if (!scoreMatch) {
            return {
              profile,
              score: {
                candidate_id: profile.id,
                fit_score: 70,
                verdict: 'potential_match' as const,
                explanation: `${profile.name} matches based on background at ${profile.current_company} with ${profile.years_experience} years experience.`,
                cited_fields: {
                  company_fit: `${profile.current_company} (${profile.current_company_type})`,
                  experience_fit: `${profile.years_experience} years of experience`,
                  skills_fit: profile.skills.slice(0, 3).join(', '),
                },
                key_highlights: [profile.summary],
                concerns: [],
              },
            };
          }
          return {
            profile,
            score: scoreMatch,
          };
        })
        .sort((a, b) => b.score.fit_score - a.score.fit_score)
        .slice(0, 5);
    } catch (scoringErr: any) {
      console.warn('Gemini candidate scoring unavailable, using heuristic scoring:', scoringErr?.message);
      scoredCandidates = heuristicScoreCandidates(filteredCandidates, query, rubric)
        .sort((a, b) => b.score.fit_score - a.score.fit_score)
        .slice(0, 5);
    }

    return NextResponse.json({
      filters,
      rubric,
      thinking_summary,
      candidates: scoredCandidates,
      total_pool_count: allProfiles.length,
      filtered_count: filteredCandidates.length,
    });
  } catch (err: any) {
    console.error('Error in /api/search:', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'An unexpected error occurred while parsing your requirements. Please check your query or retry.',
      },
      { status: 500 }
    );
  }
}
