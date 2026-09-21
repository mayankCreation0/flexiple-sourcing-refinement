import { NextRequest, NextResponse } from 'next/server';
import { callGeminiJson, getGeminiApiKey } from '@/lib/gemini';
import {
  SCORE_CANDIDATES_SYSTEM_PROMPT,
  buildScoreCandidatesPrompt,
} from '@/lib/prompts/scoreCandidates';
import { allProfiles, filterProfiles } from '@/lib/profiles';
import { scoringResponseSchema } from '@/lib/validation';
import { ObjectiveFilters, ScoredCandidate, SubjectiveRubric } from '@/lib/types';
import { getErrorMessage } from '@/lib/errors';
import { heuristicScoreCandidates } from '@/lib/fallback';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filters: ObjectiveFilters = body?.filters;
    const rubric: SubjectiveRubric = body?.rubric;

    if (!filters || !rubric) {
      return NextResponse.json(
        { error: 'Filters and Rubric are required to re-rank.' },
        { status: 400 }
      );
    }

    if (!getGeminiApiKey()) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is not configured. Add it to .env.local — see .env.example.',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    // Step 1: Re-filter profiles (hard objective constraints)
    const filteredCandidates = filterProfiles(filters, allProfiles, 8);

    if (filteredCandidates.length === 0) {
      return NextResponse.json({
        candidates: [],
        filtered_count: 0,
        message: 'No candidates matched the updated criteria. Consider loosening filters.',
      });
    }

    // Step 2: Score against rubric (LLM with heuristic fallback)
    let scoredCandidates: ScoredCandidate[] = [];
    try {
      const scorePrompt = buildScoreCandidatesPrompt(rubric, filteredCandidates);
      const scoringRaw = await callGeminiJson(
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
                explanation: `${profile.name} matches edited criteria based on experience at ${profile.current_company}.`,
                cited_fields: {
                  company_fit: `${profile.current_company} (${profile.current_company_type})`,
                  experience_fit: `${profile.years_experience} years experience`,
                  skills_fit: profile.skills.slice(0, 3).join(', '),
                },
                key_highlights: [profile.summary],
                concerns: [],
              },
            };
          }
          return { profile, score: scoreMatch };
        })
        .sort((a, b) => b.score.fit_score - a.score.fit_score)
        .slice(0, 5);
    } catch (scoringErr: unknown) {
      console.warn('Gemini re-rank scoring unavailable, using heuristic:', getErrorMessage(scoringErr));
      scoredCandidates = heuristicScoreCandidates(
        filteredCandidates,
        rubric.role_summary,
        rubric
      )
        .sort((a, b) => b.score.fit_score - a.score.fit_score)
        .slice(0, 5);
    }

    return NextResponse.json({
      candidates: scoredCandidates,
      filtered_count: filteredCandidates.length,
    });
  } catch (err: unknown) {
    console.error('Error in /api/rerank:', err);
    return NextResponse.json(
      {
        error:
          getErrorMessage(err) ||
          'Failed to re-rank candidates with updated criteria. Please retry.',
      },
      { status: 500 }
    );
  }
}
