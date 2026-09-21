export type CompanyType = 'startup' | 'scaleup' | 'enterprise' | 'agency';

export interface PastCompany {
  company: string;
  company_type: CompanyType;
  title: string;
  years: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  current_title: string;
  years_experience: number;
  location: string;
  current_company: string;
  current_company_type: CompanyType;
  skills: string[];
  past_companies: PastCompany[];
  education: string;
  summary: string;
}

export interface ObjectiveFilters {
  skills: string[];
  min_years_experience: number | null;
  max_years_experience: number | null;
  locations: string[];
  company_types: CompanyType[];
  titles: string[];
}

export interface RubricCompetency {
  name: string;
  description: string;
  weight: 'critical' | 'high' | 'medium';
}

export interface SubjectiveRubric {
  role_summary: string;
  core_competencies: RubricCompetency[];
  positive_signals: string[];
  negative_signals: string[];
}

export interface CandidateScore {
  candidate_id: string;
  fit_score: number; // 0 to 100
  verdict: 'strong_match' | 'potential_match' | 'weak_match';
  explanation: string; // Specific cited explanation
  cited_fields: {
    company_fit?: string;
    experience_fit?: string;
    skills_fit?: string;
    education_fit?: string;
  };
  key_highlights: string[];
  concerns: string[];
}

export interface ScoredCandidate {
  profile: CandidateProfile;
  score: CandidateScore;
}

export interface FeedbackItem {
  candidate_id: string;
  rating: 'yes' | 'no';
  reason?: string;
}

export interface RefinementRecord {
  round: number;
  recruiter_input: string;
  per_profile_feedback?: FeedbackItem[];
  explanation_of_changes: string;
  changes_summary: {
    filters_modified?: string[];
    rubric_modified?: string[];
  };
  timestamp: string;
}

export interface SearchSessionState {
  raw_query: string;
  objective_filters: ObjectiveFilters;
  subjective_rubric: SubjectiveRubric;
  active_candidates: ScoredCandidate[];
  refinements: RefinementRecord[];
  is_frozen: boolean;
  round: number;
}
