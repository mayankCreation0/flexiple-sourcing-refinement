import React, { useState } from 'react';
import {
  Filter,
  Award,
  Check,
  Plus,
  X,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { CompanyType, ObjectiveFilters, RefinementRecord, SubjectiveRubric } from '@/lib/types';
import { InfoTooltip } from '@/components/InfoTooltip';

interface FilterRubricDrawerProps {
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  onUpdateCriteria: (filters: ObjectiveFilters, rubric: SubjectiveRubric) => void;
  isUpdating?: boolean;
  modifiedFilters?: string[];
  isFrozen?: boolean;
  refinements?: RefinementRecord[];
}

const ALL_COMPANY_TYPES: CompanyType[] = ['startup', 'scaleup', 'enterprise', 'agency'];

const humanizeChange = (key: string): string => {
  const labels: Record<string, string> = {
    min_years_experience: 'Minimum experience threshold',
    max_years_experience: 'Maximum experience threshold',
    skills: 'Required skills',
    locations: 'Target locations',
    company_types: 'Company background',
    positive_signals: 'Green flags',
    negative_signals: 'Anti-patterns',
    core_competencies: 'Core competencies',
    role_summary: 'Role essence',
  };
  return labels[key] ?? key.replace(/_/g, ' ');
};

export const FilterRubricDrawer: React.FC<FilterRubricDrawerProps> = (props) => {
  const syncKey = `${JSON.stringify(props.filters)}::${JSON.stringify(props.rubric)}`;
  return <FilterRubricDrawerInner key={syncKey} {...props} />;
};

const FilterRubricDrawerInner: React.FC<FilterRubricDrawerProps> = ({
  filters: initialFilters,
  rubric: initialRubric,
  onUpdateCriteria,
  isUpdating = false,
  modifiedFilters = [],
  isFrozen = false,
  refinements = [],
}) => {
  const [filters, setFilters] = useState<ObjectiveFilters>(initialFilters);
  const [rubric, setRubric] = useState<SubjectiveRubric>(initialRubric);
  const [isDirty, setIsDirty] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const lastRefinement = refinements[refinements.length - 1];
  const wasAiRefined = modifiedFilters.length > 0 || refinements.length > 0;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || filters.skills.includes(newSkill.trim())) return;
    setFilters({ ...filters, skills: [...filters.skills, newSkill.trim()] });
    setIsDirty(true);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
    setIsDirty(true);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || filters.locations.includes(newLocation.trim())) return;
    setFilters({ ...filters, locations: [...filters.locations, newLocation.trim()] });
    setIsDirty(true);
    setNewLocation('');
  };

  const handleRemoveLocation = (loc: string) => {
    setFilters({ ...filters, locations: filters.locations.filter((l) => l !== loc) });
    setIsDirty(true);
  };

  const handleToggleCompanyType = (type: CompanyType) => {
    const exists = filters.company_types.includes(type);
    setFilters({
      ...filters,
      company_types: exists
        ? filters.company_types.filter((t) => t !== type)
        : [...filters.company_types, type],
    });
    setIsDirty(true);
  };

  const handleApplyChanges = () => {
    onUpdateCriteria(filters, rubric);
    setIsDirty(false);
  };

  const isFieldAiRefined = (fieldKey: string) =>
    modifiedFilters.some((k) => k.toLowerCase().includes(fieldKey.toLowerCase())) ||
    modifiedFilters.includes('filters');

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FF3333]" />
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
            Search Criteria
          </h2>
          <InfoTooltip text="Objective filters decide who gets considered. The fit rubric decides who ranks higher among matches." />
        </div>
        <div className="flex items-center gap-2">
          {isDirty && !isFrozen && (
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FF0000] hover:bg-[#CC0000] text-white transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              Apply
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-[#1E1E1E] text-[#757575] lg:hidden"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto px-5 py-4 space-y-5 ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        {/* Recent refinement changelog */}
        {lastRefinement && (
          <div className="p-3 rounded-lg bg-[#FF0000]/5 border border-[#FF0000]/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF3333]" />
              <span className="text-[10px] font-bold text-[#FF3333] uppercase tracking-wider">
                Recent Refinement
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#B3B3B3]">
              {lastRefinement.changes_summary?.filters_modified?.map((change, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#FF3333] shrink-0">+</span>
                  {humanizeChange(change)}
                </li>
              ))}
              {lastRefinement.changes_summary?.rubric_modified?.map((change, i) => (
                <li key={`r-${i}`} className="flex items-start gap-1.5">
                  <span className="text-[#FFB300] shrink-0">+</span>
                  {humanizeChange(change)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* OBJECTIVE FILTERS */}
        <section>
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#FF3333]" />
              <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                Objective
              </h3>
              {wasAiRefined && isFieldAiRefined('filter') && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF0000]/15 text-[#FF3333] border border-[#FF0000]/30">
                  ✦ AI refined
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#757575] mt-0.5 ml-5">Hard constraints — who gets considered</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="flex items-center gap-1.5 text-[#B3B3B3] font-medium mb-1.5">
                Required Skills
                <InfoTooltip text="Profiles must match these skills to pass the initial filter." />
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1E1E1E] text-[#F5F5F5] border border-[#404040]"
                  >
                    {skill}
                    {!isFrozen && (
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-[#E53935]">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isFrozen && (
                <form onSubmit={handleAddSkill} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] focus:outline-none focus:border-[#FF0000]"
                  />
                  <button type="submit" className="px-2 py-1.5 rounded-lg bg-[#1E1E1E] border border-[#404040]">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[#B3B3B3] font-medium mb-1">
                  Min YoE
                  {isFieldAiRefined('experience') && (
                    <span className="text-[9px] text-[#FF3333] font-bold">✦ AI</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isFrozen}
                  value={filters.min_years_experience ?? ''}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      min_years_experience: e.target.value === '' ? null : Number(e.target.value),
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] focus:outline-none focus:border-[#FF0000] disabled:opacity-50"
                  placeholder="e.g. 4"
                />
                {isFieldAiRefined('experience') && lastRefinement && (
                  <p className="text-[10px] text-[#FF3333] mt-1 leading-snug">
                    ↗ {lastRefinement.explanation_of_changes.slice(0, 80)}
                    {lastRefinement.explanation_of_changes.length > 80 ? '…' : ''}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[#B3B3B3] font-medium mb-1 block">Max YoE</label>
                <input
                  type="number"
                  min="0"
                  disabled={isFrozen}
                  value={filters.max_years_experience ?? ''}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      max_years_experience: e.target.value === '' ? null : Number(e.target.value),
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] focus:outline-none focus:border-[#FF0000] disabled:opacity-50"
                  placeholder="e.g. 7"
                />
              </div>
            </div>

            <div>
              <label className="text-[#B3B3B3] font-medium mb-1.5 block">Locations</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.locations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1E1E1E] border border-[#404040]"
                  >
                    {loc}
                    {!isFrozen && (
                      <button type="button" onClick={() => handleRemoveLocation(loc)}>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isFrozen && (
                <form onSubmit={handleAddLocation} className="flex gap-1.5">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add location..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] focus:outline-none focus:border-[#FF0000]"
                  />
                  <button type="submit" className="px-2 py-1.5 rounded-lg bg-[#1E1E1E] border border-[#404040]">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div>
              <label className="text-[#B3B3B3] font-medium mb-1.5 block">Company Background</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_COMPANY_TYPES.map((type) => {
                  const checked = filters.company_types.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isFrozen}
                      onClick={() => handleToggleCompanyType(type)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left capitalize transition cursor-pointer ${
                        checked
                          ? 'bg-[#FF0000]/10 border-[#FF0000]/40 text-[#FF3333]'
                          : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#B3B3B3] hover:border-[#404040]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          checked ? 'bg-[#FF0000] border-[#FF0000] text-white' : 'border-[#404040]'
                        }`}
                      >
                        {checked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FIT RUBRIC */}
        <section className="pt-4 border-t border-[#2A2A2A]">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#FFB300]" />
              <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                Fit Rubric
              </h3>
              {modifiedFilters.includes('rubric') && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFB300]/15 text-[#FFB300] border border-[#FFB300]/30">
                  ✦ AI refined
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#757575] mt-0.5 ml-5">What &ldquo;good&rdquo; looks like — ranking signal</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[#B3B3B3] font-medium mb-1 block">Role Essence</label>
              <textarea
                rows={2}
                disabled={isFrozen}
                value={rubric.role_summary}
                onChange={(e) => {
                  setRubric({ ...rubric, role_summary: e.target.value });
                  setIsDirty(true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] focus:outline-none focus:border-[#FF0000] disabled:opacity-75 resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[#B3B3B3] font-medium mb-1.5">
                Core Competencies
                <InfoTooltip text="Weighted criteria the LLM uses to score and rank candidates after filtering." />
              </label>
              <div className="space-y-2">
                {rubric.core_competencies.map((comp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#F5F5F5]">{comp.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                          comp.weight === 'critical'
                            ? 'bg-[#FF0000]/15 text-[#FF3333] border border-[#FF0000]/30'
                            : comp.weight === 'high'
                            ? 'bg-[#FFB300]/15 text-[#FFB300] border border-[#FFB300]/30'
                            : 'bg-[#1E1E1E] text-[#757575]'
                        }`}
                      >
                        {comp.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#757575] mt-1 leading-snug">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {rubric.positive_signals.length > 0 && (
              <div>
                <label className="text-[#00C853] font-medium mb-1 block">Green Flags</label>
                <ul className="pl-4 text-[11px] text-[#B3B3B3] list-disc space-y-0.5">
                  {rubric.positive_signals.map((sig, idx) => (
                    <li key={idx}>{sig}</li>
                  ))}
                </ul>
              </div>
            )}

            {rubric.negative_signals.length > 0 && (
              <div>
                <label className="text-[#E53935] font-medium mb-1 block">Anti-Patterns</label>
                <ul className="pl-4 text-[11px] text-[#B3B3B3] list-disc space-y-0.5">
                  {rubric.negative_signals.map((sig, idx) => (
                    <li key={idx}>{sig}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
