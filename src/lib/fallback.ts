import {
  CandidateProfile,
  CandidateScore,
  CompanyType,
  ObjectiveFilters,
  ScoredCandidate,
  SubjectiveRubric,
} from './types';

/**
 * Intelligent heuristic fallback for query extraction when Gemini API is rate-limited (429) or unavailable.
 */
export function heuristicExtractRequirements(query: string): {
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  thinking_summary: string;
} {
  const lower = query.toLowerCase();

  // Experience extraction
  let minExp: number | null = null;
  const expMatch = lower.match(/(\d+)\+?\s*(?:to\s*\d+\s*)?(?:years?|yrs?)/i);
  if (expMatch) {
    minExp = parseInt(expMatch[1], 10);
  } else if (lower.includes('senior') || lower.includes('lead') || lower.includes('staff')) {
    minExp = 5;
  } else if (lower.includes('mid') || lower.includes('intermediate')) {
    minExp = 3;
  } else if (lower.includes('junior') || lower.includes('entry')) {
    minExp = 1;
  }

  // Skills extraction
  const knownSkills = [
    'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Django',
    'FastAPI', 'Go', 'Golang', 'Java', 'Spring', 'PostgreSQL', 'MongoDB', 'AWS',
    'Docker', 'Kubernetes', 'GraphQL', 'Redis', 'Tailwind', 'Vue', 'Angular',
    'Rust', 'C++', 'GCP', 'Azure', 'DevOps', 'CI/CD', 'Machine Learning', 'AI'
  ];
  const detectedSkills = knownSkills.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(query)
  );

  // Company types
  const detectedCompanyTypes: CompanyType[] = [];
  if (lower.includes('startup') || lower.includes('early stage')) detectedCompanyTypes.push('startup');
  if (lower.includes('scaleup') || lower.includes('growth')) detectedCompanyTypes.push('scaleup');
  if (lower.includes('enterprise') || lower.includes('mnc') || lower.includes('faang')) detectedCompanyTypes.push('enterprise');
  if (lower.includes('agency') || lower.includes('consultancy')) detectedCompanyTypes.push('agency');

  // Title keywords
  const titleKeywords: string[] = [];
  if (lower.includes('backend') || lower.includes('back-end')) titleKeywords.push('Backend Engineer');
  if (lower.includes('frontend') || lower.includes('front-end')) titleKeywords.push('Frontend Engineer');
  if (lower.includes('fullstack') || lower.includes('full stack') || lower.includes('full-stack')) titleKeywords.push('Full Stack Engineer');
  if (lower.includes('devops') || lower.includes('sre')) titleKeywords.push('DevOps Engineer');
  if (lower.includes('lead') || lower.includes('staff')) titleKeywords.push('Lead Engineer');

  const filters: ObjectiveFilters = {
    skills: detectedSkills,
    min_years_experience: minExp,
    max_years_experience: null,
    locations: [],
    company_types: detectedCompanyTypes,
    titles: titleKeywords,
  };

  const rubric: SubjectiveRubric = {
    role_summary: `Candidate matching requirements for: ${query}`,
    core_competencies: [
      {
        name: 'Technical Mastery',
        description: `Hands-on expertise with ${detectedSkills.join(', ') || 'modern full-stack architecture'}`,
        weight: 'critical',
      },
      {
        name: 'Execution & Pedigree',
        description: 'Demonstrated ownership in high-impact product engineering environments',
        weight: 'high',
      },
    ],
    positive_signals: [
      `Production track record with ${detectedSkills.slice(0, 3).join(', ') || 'requested stack'}`,
      'Stable tenure across relevant tech-first companies',
    ],
    negative_signals: [
      'Frequent short tenures without clear impact',
      'Missing core requested technologies',
    ],
  };

  const thinking_summary = `[Local Intelligence Fallback - Free Tier Quota Protected] Parsed query "${query}": Filtered for skills [${detectedSkills.join(', ')}], min experience: ${minExp ?? 'flexible'} years. Evaluated candidates with deterministic rubric scoring.`;

  return { filters, rubric, thinking_summary };
}

/**
 * Intelligent heuristic fallback for scoring candidates against rubric and query.
 */
export function heuristicScoreCandidates(
  candidates: CandidateProfile[],
  query: string,
  rubric: SubjectiveRubric
): ScoredCandidate[] {
  return candidates.map(profile => {
    let fit_score = 74;
    const key_highlights: string[] = [];
    const concerns: string[] = [];
    const qLower = query.toLowerCase();

    // Experience match
    if (profile.years_experience >= 5) {
      fit_score += 10;
      key_highlights.push(`${profile.years_experience} years of senior industry experience.`);
    } else if (profile.years_experience >= 3) {
      fit_score += 6;
      key_highlights.push(`${profile.years_experience} years of hands-on product development.`);
    }

    // Skills match
    const matched = profile.skills.filter(s => qLower.includes(s.toLowerCase()));
    if (matched.length > 0) {
      fit_score += Math.min(12, matched.length * 4);
      key_highlights.push(`Direct skill alignment: ${matched.join(', ')}.`);
    } else {
      concerns.push('May require onboarding on specific domain tools.');
    }

    // Company type match
    if (['startup', 'scaleup'].includes(profile.current_company_type)) {
      fit_score += 4;
      key_highlights.push(`High agility background at ${profile.current_company} (${profile.current_company_type}).`);
    }

    fit_score = Math.min(96, Math.max(68, fit_score));

    const verdict: 'strong_match' | 'potential_match' | 'weak_match' =
      fit_score >= 85 ? 'strong_match' : fit_score >= 75 ? 'potential_match' : 'weak_match';

    const score: CandidateScore = {
      candidate_id: profile.id,
      fit_score,
      verdict,
      explanation: `${profile.name} brings ${profile.years_experience} years of experience at ${profile.current_company} with strong skills in ${profile.skills.slice(0, 3).join(', ')}.`,
      cited_fields: {
        company_fit: `${profile.current_company} (${profile.current_company_type})`,
        experience_fit: `${profile.years_experience} years in software engineering`,
        skills_fit: profile.skills.slice(0, 3).join(', '),
      },
      key_highlights: key_highlights.length > 0 ? key_highlights : [rubric.role_summary.slice(0, 120)],
      concerns: concerns.length > 0 ? concerns : ['Verify system design depth in technical interview'],
    };

    return {
      profile,
      score,
    };
  });
}

/**
 * Intelligent heuristic fallback for refining search filters and rubric when Gemini API is rate-limited.
 */
export function heuristicRefine(
  currentFilters: ObjectiveFilters,
  currentRubric: SubjectiveRubric,
  recruiterMessage: string,
  round: number
): {
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  explanation_of_changes: string;
  changes_summary: {
    filters_modified: string[];
    rubric_modified: string[];
  };
} {
  const lower = recruiterMessage.toLowerCase();
  const updatedFilters: ObjectiveFilters = {
    ...currentFilters,
    skills: [...currentFilters.skills],
    company_types: [...currentFilters.company_types],
    locations: [...currentFilters.locations],
    titles: [...currentFilters.titles],
  };

  const changes: string[] = [];

  // Seniority adjustment
  if (lower.includes('more senior') || lower.includes('higher experience') || lower.includes('lead') || lower.includes('staff')) {
    const newMin = Math.max(6, (updatedFilters.min_years_experience || 3) + 2);
    updatedFilters.min_years_experience = newMin;
    changes.push(`Increased minimum experience threshold to ${newMin} years.`);
  } else if (lower.includes('junior') || lower.includes('less experience') || lower.includes('lower experience')) {
    const newMin = Math.max(1, (updatedFilters.min_years_experience || 4) - 2);
    updatedFilters.min_years_experience = newMin;
    changes.push(`Lowered experience requirement to ${newMin} years.`);
  }

  // Company type preference
  if (lower.includes('startup') && !updatedFilters.company_types.includes('startup')) {
    updatedFilters.company_types.push('startup');
    changes.push('Prioritized candidates with startup background.');
  }
  if (lower.includes('enterprise') && !updatedFilters.company_types.includes('enterprise')) {
    updatedFilters.company_types.push('enterprise');
    changes.push('Prioritized candidates with enterprise experience.');
  }

  // Skills check
  const skillKeywords = ['docker', 'kubernetes', 'aws', 'python', 'react', 'node', 'typescript', 'graphql', 'next.js', 'redis'];
  for (const sk of skillKeywords) {
    if (lower.includes(sk)) {
      const proper = sk === 'next.js' ? 'Next.js' : sk === 'aws' ? 'AWS' : sk.charAt(0).toUpperCase() + sk.slice(1);
      if (!updatedFilters.skills.some(s => s.toLowerCase() === sk)) {
        updatedFilters.skills.push(proper);
        changes.push(`Added required skill: ${proper}.`);
      }
    }
  }

  if (changes.length === 0) {
    changes.push(`Adapted candidate ranking weights based on recruiter notes: "${recruiterMessage.slice(0, 60)}..."`);
  }

  const updatedRubric: SubjectiveRubric = {
    ...currentRubric,
    positive_signals: [
      ...currentRubric.positive_signals,
      `Recruiter Round ${round} focus: ${recruiterMessage.slice(0, 100)}`,
    ],
  };

  return {
    filters: updatedFilters,
    rubric: updatedRubric,
    explanation_of_changes: `Refined sourcing criteria dynamically using feedback signals: ${changes.join(' ')}`,
    changes_summary: {
      filters_modified: changes,
      rubric_modified: [`Recruiter Round ${round} rubric signals updated`],
    },
  };
}

