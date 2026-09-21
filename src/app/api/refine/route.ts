import { NextRequest, NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/gemini';
import {
  REFINE_SEARCH_SYSTEM_PROMPT,
  buildRefineSearchPrompt,
} from '@/lib/prompts/refineSearch';
import {
  SCORE_CANDIDATES_SYSTEM_PROMPT,
  buildScoreCandidatesPrompt,
} from '@/lib/prompts/scoreCandidates';
import { allProfiles, filterProfiles } from '@/lib/profiles';
import {
  refinementResponseSchema,
  scoringResponseSchema,
} from '@/lib/validation';
import {
  FeedbackItem,
  ObjectiveFilters,
  RefinementRecord,
  ScoredCandidate,
  SubjectiveRubric,
} from '@/lib/types';
import { heuristicRefine, heuristicScoreCandidates } from '@/lib/fallback';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentFilters: ObjectiveFilters = body?.current_filters;
    const currentRubric: SubjectiveRubric = body?.current_rubric;
    const presentedCandidates: ScoredCandidate[] = body?.presented_candidates || [];
    const recruiterMessage: string = body?.recruiter_message || '';
    const perProfileFeedback: FeedbackItem[] = body?.per_profile_feedback || [];
    const round: number = body?.round || 1;

    if (!recruiterMessage.trim() && perProfileFeedback.length === 0) {
      return NextResponse.json(
        { error: 'Please provide feedback in chat or react to candidate profiles.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in environment variables. Please add it to .env.local.',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    // Step 1: LLM analyzes feedback and refines filters & rubric (with fallback)
    let updatedFilters: ObjectiveFilters;
    let updatedRubric: SubjectiveRubric;
    let explanation_of_changes: string;
    let changes_summary: string[];

    try {
      const refinePrompt = buildRefineSearchPrompt(
        currentFilters,
        currentRubric,
        presentedCandidates,
        recruiterMessage,
        perProfileFeedback
      );

      const refineRaw = await callGeminiJson<any>(
        REFINE_SEARCH_SYSTEM_PROMPT,
        refinePrompt
      );
      const validatedRefine = refinementResponseSchema.parse(refineRaw);
      updatedFilters = validatedRefine.filters;
      updatedRubric = validatedRefine.rubric;
      explanation_of_changes = validatedRefine.explanation_of_changes;
      changes_summary = validatedRefine.changes_summary;
    } catch (refineErr: any) {
      console.warn('Gemini refine call unavailable (rate limit/quota), using heuristic refinement:', refineErr?.message);
      const fallback = heuristicRefine(currentFilters, currentRubric, recruiterMessage, round);
      updatedFilters = fallback.filters;
      updatedRubric = fallback.rubric;
      explanation_of_changes = fallback.explanation_of_changes;
      changes_summary = fallback.changes_summary;
    }

    // Step 2: Re-run local filtering with updated filters
    const filteredCandidates = filterProfiles(updatedFilters, allProfiles, 8);

    // Step 3: Re-score and rank candidate pool with updated rubric (with fallback)
    let scoredCandidates: ScoredCandidate[] = [];
    try {
      const scorePrompt = buildScoreCandidatesPrompt(updatedRubric, filteredCandidates);
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
                explanation: `${profile.name} matches updated criteria based on experience at ${profile.current_company}.`,
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
      scoredCandidates = heuristicScoreCandidates(filteredCandidates, recruiterMessage, updatedRubric)
        .sort((a, b) => b.score.fit_score - a.score.fit_score)
        .slice(0, 5);
    }

    const refinementRecord: RefinementRecord = {
      round,
      recruiter_input: recruiterMessage,
      per_profile_feedback: perProfileFeedback,
      explanation_of_changes,
      changes_summary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return NextResponse.json({
      filters: updatedFilters,
      rubric: updatedRubric,
      candidates: scoredCandidates,
      refinement_record: refinementRecord,
    });
  } catch (err: any) {
    console.error('Error in /api/refine:', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Failed to refine candidate search based on feedback. Please try again.',
      },
      { status: 500 }
    );
  }
}
