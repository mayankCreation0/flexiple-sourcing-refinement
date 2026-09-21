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

  // Experience extraction — support "4-7 years", "4 to 7 years", "at least 5", "5+"
  let minExp: number | null = null;
  let maxExp: number | null = null;

  const rangeMatch = lower.match(/(\d+)\s*(?:-|to|–)\s*(\d+)\s*(?:years?|yrs?)/i);
  const atLeastMatch = lower.match(/(?:at least|minimum|min)\s*(\d+)\s*(?:years?|yrs?)/i);
  const plusMatch = lower.match(/(\d+)\+\s*(?:years?|yrs?)/i);
  const singleMatch = lower.match(/(\d+)\s*(?:years?|yrs?)/i);

  if (rangeMatch) {
    minExp = parseInt(rangeMatch[1], 10);
    maxExp = parseInt(rangeMatch[2], 10);
  } else if (atLeastMatch) {
    minExp = parseInt(atLeastMatch[1], 10);
  } else if (plusMatch) {
    minExp = parseInt(plusMatch[1], 10);
  } else if (singleMatch) {
    minExp = parseInt(singleMatch[1], 10);
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
    'AWS RDS', 'RDS', 'Docker', 'Kubernetes', 'GraphQL', 'Redis', 'Tailwind', 'Vue',
    'Angular', 'Rust', 'C++', 'GCP', 'Azure', 'DevOps', 'CI/CD', 'Machine Learning', 'AI',
    'Backend',
  ];
  const detectedSkills = knownSkills.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(query)
  );

  // Company types
  const detectedCompanyTypes: CompanyType[] = [];
  if (lower.includes('startup') || lower.includes('early-stage') || lower.includes('early stage')) {
    detectedCompanyTypes.push('startup');
  }
  if (lower.includes('scaleup') || lower.includes('growth')) detectedCompanyTypes.push('scaleup');
  if (lower.includes('enterprise') || lower.includes('mnc') || lower.includes('faang')) {
    detectedCompanyTypes.push('enterprise');
  }
  if (lower.includes('agency') || lower.includes('consultancy')) detectedCompanyTypes.push('agency');

  // Locations
  const knownLocations = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune',
    'Remote', 'India',
  ];
  const detectedLocations = knownLocations.filter((loc) =>
    new RegExp(`\\b${loc}\\b`, 'i').test(query)
  );

  // Title keywords
  const titleKeywords: string[] = [];
  if (lower.includes('backend') || lower.includes('back-end')) titleKeywords.push('Backend Engineer');
  if (lower.includes('frontend') || lower.includes('front-end')) titleKeywords.push('Frontend Engineer');
  if (lower.includes('fullstack') || lower.includes('full stack') || lower.includes('full-stack')) {
    titleKeywords.push('Full Stack Engineer');
  }
  if (lower.includes('devops') || lower.includes('sre')) titleKeywords.push('DevOps Engineer');
  if (lower.includes('lead') || lower.includes('staff')) titleKeywords.push('Lead Engineer');

  const filters: ObjectiveFilters = {
    skills: detectedSkills,
    min_years_experience: minExp,
    max_years_experience: maxExp,
    locations: detectedLocations,
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

  const thinking_summary = `[Heuristic fallback] Parsed "${query}": skills [${detectedSkills.join(', ')}], YoE ${minExp ?? 'any'}–${maxExp ?? 'any'}, locations [${detectedLocations.join(', ') || 'any'}].`;

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
  return candidates.map((profile) => {
    let fit_score = 70;
    const key_highlights: string[] = [];
    const concerns: string[] = [];
    const qLower = query.toLowerCase();

    if (profile.years_experience >= 5) {
      fit_score += 10;
      key_highlights.push(`${profile.years_experience} years of experience.`);
    } else if (profile.years_experience >= 3) {
      fit_score += 6;
      key_highlights.push(`${profile.years_experience} years of hands-on product development.`);
    }

    const matched = profile.skills.filter((s) => qLower.includes(s.toLowerCase()));
    if (matched.length > 0) {
      fit_score += Math.min(12, matched.length * 4);
      key_highlights.push(`Direct skill alignment: ${matched.join(', ')}.`);
    } else {
      concerns.push('May require onboarding on specific domain tools.');
    }

    if (['startup', 'scaleup'].includes(profile.current_company_type)) {
      fit_score += 4;
      key_highlights.push(
        `High agility background at ${profile.current_company} (${profile.current_company_type}).`
      );
    }

    fit_score = Math.min(96, Math.max(55, fit_score));

    const verdict: 'strong_match' | 'potential_match' | 'weak_match' =
      fit_score >= 85 ? 'strong_match' : fit_score >= 70 ? 'potential_match' : 'weak_match';

    const score: CandidateScore = {
      candidate_id: profile.id,
      fit_score,
      verdict,
      explanation: `${profile.name} brings ${profile.years_experience} years at ${profile.current_company} (${profile.current_company_type}) in ${profile.location}, with skills including ${profile.skills.slice(0, 3).join(', ')}.`,
      cited_fields: {
        company_fit: `${profile.current_company} (${profile.current_company_type})`,
        experience_fit: `${profile.years_experience} years in software engineering`,
        skills_fit: profile.skills.slice(0, 3).join(', '),
        education_fit: profile.education,
      },
      key_highlights:
        key_highlights.length > 0 ? key_highlights : [rubric.role_summary.slice(0, 120)],
      concerns:
        concerns.length > 0 ? concerns : ['Verify system design depth in technical interview'],
    };

    return { profile, score };
  });
}

/**
 * Heuristic refine fallback when Gemini is rate-limited.
 * Must interpret "too junior" as INCREASE min YoE — not decrease.
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

  const filtersModified: string[] = [];
  const rubricModified: string[] = [];
  const changes: string[] = [];

  const wantsMoreSenior =
    lower.includes('too junior') ||
    lower.includes('more senior') ||
    lower.includes('higher experience') ||
    lower.includes('not senior enough') ||
    /require (?:at least )?(\d+)/.test(lower) ||
    /at least (\d+) years?/.test(lower);

  const wantsMoreJunior =
    !wantsMoreSenior &&
    (lower.includes('too senior') ||
      lower.includes('less experience') ||
      lower.includes('lower experience') ||
      lower.includes('more junior'));

  const requireYears = lower.match(/(?:at least|require(?:s)?(?: at least)?)\s*(\d+)\s*(?:years?|yrs?)?/i);

  if (requireYears) {
    const newMin = parseInt(requireYears[1], 10);
    updatedFilters.min_years_experience = newMin;
    filtersModified.push('min_years_experience');
    changes.push(
      `Raised minimum experience to ${newMin} years based on recruiter feedback.`
    );
  } else if (wantsMoreSenior) {
    const current = updatedFilters.min_years_experience ?? 3;
    const newMin = Math.max(current + 1, 5);
    updatedFilters.min_years_experience = newMin;
    filtersModified.push('min_years_experience');
    changes.push(
      `Increased minimum experience from ${current} to ${newMin} years because feedback indicated candidates were too junior.`
    );
  } else if (wantsMoreJunior) {
    const current = updatedFilters.min_years_experience ?? 5;
    const newMin = Math.max(1, current - 2);
    updatedFilters.min_years_experience = newMin;
    filtersModified.push('min_years_experience');
    changes.push(`Lowered experience requirement to ${newMin} years.`);
  }

  if (
    (lower.includes('startup') || lower.includes('early-stage') || lower.includes('early stage')) &&
    !updatedFilters.company_types.includes('startup')
  ) {
    updatedFilters.company_types.push('startup');
    filtersModified.push('company_types');
    changes.push('Prioritized candidates with startup background.');
  }

  if (lower.includes('no agency') || lower.includes('not agency')) {
    updatedFilters.company_types = updatedFilters.company_types.filter((t) => t !== 'agency');
    filtersModified.push('company_types');
    changes.push('Removed agency from company background filters.');
  }

  const skillKeywords: Array<{ match: string; label: string }> = [
    { match: 'postgresql', label: 'PostgreSQL' },
    { match: 'aws rds', label: 'AWS RDS' },
    { match: 'rds', label: 'AWS RDS' },
    { match: 'docker', label: 'Docker' },
    { match: 'kubernetes', label: 'Kubernetes' },
    { match: 'aws', label: 'AWS' },
    { match: 'python', label: 'Python' },
    { match: 'react', label: 'React' },
    { match: 'node', label: 'Node.js' },
    { match: 'typescript', label: 'TypeScript' },
    { match: 'graphql', label: 'GraphQL' },
    { match: 'redis', label: 'Redis' },
    { match: 'next.js', label: 'Next.js' },
  ];

  for (const { match, label } of skillKeywords) {
    if (lower.includes(match) && !updatedFilters.skills.some((s) => s.toLowerCase() === label.toLowerCase())) {
      updatedFilters.skills.push(label);
      if (!filtersModified.includes('skills')) filtersModified.push('skills');
      changes.push(`Added required skill: ${label}.`);
    }
  }

  if (changes.length === 0) {
    changes.push(
      `Adjusted ranking emphasis based on recruiter notes: "${recruiterMessage.slice(0, 80)}".`
    );
  }

  const updatedRubric: SubjectiveRubric = {
    ...currentRubric,
    positive_signals: [
      ...currentRubric.positive_signals.filter(
        (s) => !s.startsWith(`Recruiter Round ${round}`)
      ),
      `Recruiter Round ${round} focus: ${recruiterMessage.slice(0, 100)}`,
    ],
    negative_signals: wantsMoreSenior
      ? [
          ...currentRubric.negative_signals,
          'Under the raised experience threshold, or senior titles without sufficient production tenure.',
        ]
      : currentRubric.negative_signals,
  };
  rubricModified.push('positive_signals');
  if (wantsMoreSenior) rubricModified.push('negative_signals');

  return {
    filters: updatedFilters,
    rubric: updatedRubric,
    explanation_of_changes: changes.join(' '),
    changes_summary: {
      filters_modified: filtersModified.length ? filtersModified : ['ranking_weights'],
      rubric_modified: rubricModified,
    },
  };
}
