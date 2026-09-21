import profilesData from '../data/profiles.json';
import { CandidateProfile, ObjectiveFilters } from './types';

export const allProfiles: CandidateProfile[] = profilesData as CandidateProfile[];

export interface FilterResult {
  candidate: CandidateProfile;
  matchesHardFilters: boolean;
  matchScore: number;
  matchReasons: string[];
  mismatches: string[];
}

/**
 * Checks if candidate has experience with a specific company type
 * across both current and past roles.
 */
export function hasCompanyType(
  candidate: CandidateProfile,
  types: string[]
): boolean {
  if (!types || types.length === 0) return true;
  const lowerTypes = types.map((t) => t.toLowerCase());

  if (lowerTypes.includes(candidate.current_company_type.toLowerCase())) {
    return true;
  }

  return candidate.past_companies.some((past) =>
    lowerTypes.includes(past.company_type.toLowerCase())
  );
}

/**
 * Checks skill overlap between candidate and requested skills.
 */
export function getMatchedSkills(
  candidate: CandidateProfile,
  skills: string[]
): string[] {
  if (!skills || skills.length === 0) return [];
  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());

  return skills.filter((skill) => {
    const sLower = skill.toLowerCase();
    return (
      candidateSkillsLower.some(
        (cs) => cs.includes(sLower) || sLower.includes(cs)
      ) || candidate.summary.toLowerCase().includes(sLower)
    );
  });
}

/**
 * Filter and prioritize candidate profiles against objective filters.
 * Returns both strictly matching candidates and top candidates with soft relaxation
 * if strict pool is too small.
 */
export function filterProfiles(
  filters: ObjectiveFilters,
  profiles: CandidateProfile[] = allProfiles,
  targetCount: number = 8
): CandidateProfile[] {
  const scored = profiles.map((candidate) => {
    let score = 0;
    const reasons: string[] = [];
    const mismatches: string[] = [];

    // 1. Experience Check
    const yoe = candidate.years_experience;
    const minYoE = filters.min_years_experience ?? 0;
    const maxYoE = filters.max_years_experience ?? 50;

    if (yoe >= minYoE && yoe <= maxYoE) {
      score += 25;
      reasons.push(`${yoe} years experience fits ${minYoE}-${maxYoE} range`);
    } else if (Math.abs(yoe - minYoE) <= 1 || Math.abs(yoe - maxYoE) <= 1) {
      score += 15;
      mismatches.push(
        `${yoe} years experience is near margin of ${minYoE}-${maxYoE}`
      );
    } else {
      mismatches.push(
        `${yoe} years experience outside ${minYoE}-${maxYoE} range`
      );
    }

    // 2. Location Check
    if (filters.locations.length > 0) {
      const locMatch = filters.locations.some((loc) =>
        candidate.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (locMatch) {
        score += 25;
        reasons.push(`Based in ${candidate.location}`);
      } else {
        mismatches.push(
          `Location ${candidate.location} does not match ${filters.locations.join(
            ', '
          )}`
        );
      }
    } else {
      score += 25;
    }

    // 3. Company Type Check (startup / scaleup / enterprise / agency)
    if (filters.company_types.length > 0) {
      if (hasCompanyType(candidate, filters.company_types)) {
        score += 25;
        reasons.push(
          `Experience at ${candidate.current_company_type} (${candidate.current_company})`
        );
      } else {
        mismatches.push(
          `No documented experience at ${filters.company_types.join('/')}`
        );
      }
    } else {
      score += 25;
    }

    // 4. Skills Check
    if (filters.skills.length > 0) {
      const matched = getMatchedSkills(candidate, filters.skills);
      const ratio = matched.length / filters.skills.length;
      score += Math.round(ratio * 25);
      if (matched.length > 0) {
        reasons.push(`Skills: ${matched.join(', ')}`);
      } else {
        mismatches.push(`Lacks required skills: ${filters.skills.join(', ')}`);
      }
    } else {
      score += 25;
    }

    return {
      candidate,
      score,
      reasons,
      mismatches,
    };
  });

  // Sort descending by objective match score
  scored.sort((a, b) => b.score - a.score);

  // Return top N candidates to pass to LLM scoring layer
  return scored.slice(0, targetCount).map((s) => s.candidate);
}
