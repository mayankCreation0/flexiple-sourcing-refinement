import profilesData from '../data/profiles.json';
import { CandidateProfile, ObjectiveFilters } from './types';

export const allProfiles: CandidateProfile[] = profilesData as CandidateProfile[];

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

function passesHardYoE(candidate: CandidateProfile, filters: ObjectiveFilters): boolean {
  const yoe = candidate.years_experience;
  const minYoE = filters.min_years_experience;
  const maxYoE = filters.max_years_experience;
  if (minYoE != null && yoe < minYoE) return false;
  if (maxYoE != null && yoe > maxYoE) return false;
  return true;
}

function passesHardLocation(candidate: CandidateProfile, filters: ObjectiveFilters): boolean {
  if (!filters.locations.length) return true;
  return filters.locations.some((loc) =>
    candidate.location.toLowerCase().includes(loc.toLowerCase())
  );
}

function passesHardCompanyType(candidate: CandidateProfile, filters: ObjectiveFilters): boolean {
  if (!filters.company_types.length) return true;
  return hasCompanyType(candidate, filters.company_types);
}

/** Soft skill gate: require at least one matched skill when skills are specified. */
function passesHardSkills(candidate: CandidateProfile, filters: ObjectiveFilters): boolean {
  if (!filters.skills.length) return true;
  return getMatchedSkills(candidate, filters.skills).length > 0;
}

function scoreCandidate(
  candidate: CandidateProfile,
  filters: ObjectiveFilters
): number {
  let score = 0;
  const yoe = candidate.years_experience;
  const minYoE = filters.min_years_experience ?? 0;
  const maxYoE = filters.max_years_experience ?? 50;

  if (yoe >= minYoE && yoe <= maxYoE) score += 25;

  if (filters.locations.length > 0) {
    if (passesHardLocation(candidate, filters)) score += 25;
  } else {
    score += 25;
  }

  if (filters.company_types.length > 0) {
    if (hasCompanyType(candidate, filters.company_types)) score += 25;
  } else {
    score += 25;
  }

  if (filters.skills.length > 0) {
    const matched = getMatchedSkills(candidate, filters.skills);
    score += Math.round((matched.length / filters.skills.length) * 25);
  } else {
    score += 25;
  }

  return score;
}

/**
 * Filter profiles against objective filters.
 * YoE, location, and company type are hard constraints (never soft-relaxed).
 * Skills may soft-relax only if the hard pool is too small — so a refined
 * Min YoE of 5 never returns a 4-year candidate.
 */
export function filterProfiles(
  filters: ObjectiveFilters,
  profiles: CandidateProfile[] = allProfiles,
  targetCount: number = 8
): CandidateProfile[] {
  const rank = (list: CandidateProfile[]) =>
    [...list]
      .map((candidate) => ({ candidate, score: scoreCandidate(candidate, filters) }))
      .sort((a, b) => b.score - a.score)
      .map((s) => s.candidate);

  const hardMatch = profiles.filter(
    (c) =>
      passesHardYoE(c, filters) &&
      passesHardLocation(c, filters) &&
      passesHardCompanyType(c, filters) &&
      passesHardSkills(c, filters)
  );

  if (hardMatch.length >= Math.min(4, targetCount)) {
    return rank(hardMatch).slice(0, targetCount);
  }

  // Soft-relax skills only — YoE / location / company stay hard
  const skillRelaxed = profiles.filter(
    (c) =>
      passesHardYoE(c, filters) &&
      passesHardLocation(c, filters) &&
      passesHardCompanyType(c, filters)
  );

  return rank(skillRelaxed.length > 0 ? skillRelaxed : hardMatch).slice(
    0,
    targetCount
  );
}
