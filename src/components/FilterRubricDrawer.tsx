import React, { useState } from 'react';
import {
  Filter,
  Award,
  Check,
  Plus,
  X,
  RefreshCw,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CompanyType, ObjectiveFilters, SubjectiveRubric } from '@/lib/types';

interface FilterRubricDrawerProps {
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  onUpdateCriteria: (filters: ObjectiveFilters, rubric: SubjectiveRubric) => void;
  isUpdating?: boolean;
  modifiedFilters?: string[];
  isFrozen?: boolean;
}

const ALL_COMPANY_TYPES: CompanyType[] = ['startup', 'scaleup', 'enterprise', 'agency'];

export const FilterRubricDrawer: React.FC<FilterRubricDrawerProps> = ({
  filters: initialFilters,
  rubric: initialRubric,
  onUpdateCriteria,
  isUpdating = false,
  modifiedFilters = [],
  isFrozen = false,
}) => {
  const [filters, setFilters] = useState<ObjectiveFilters>(initialFilters);
  const [rubric, setRubric] = useState<SubjectiveRubric>(initialRubric);
  const [isDirty, setIsDirty] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync with prop updates from refinements
  React.useEffect(() => {
    setFilters(initialFilters);
    setRubric(initialRubric);
    setIsDirty(false);
  }, [initialFilters, initialRubric]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || filters.skills.includes(newSkill.trim())) return;
    const updated = { ...filters, skills: [...filters.skills, newSkill.trim()] };
    setFilters(updated);
    setIsDirty(true);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = {
      ...filters,
      skills: filters.skills.filter((s) => s !== skillToRemove),
    };
    setFilters(updated);
    setIsDirty(true);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || filters.locations.includes(newLocation.trim())) return;
    const updated = {
      ...filters,
      locations: [...filters.locations, newLocation.trim()],
    };
    setFilters(updated);
    setIsDirty(true);
    setNewLocation('');
  };

  const handleRemoveLocation = (locToRemove: string) => {
    const updated = {
      ...filters,
      locations: filters.locations.filter((l) => l !== locToRemove),
    };
    setFilters(updated);
    setIsDirty(true);
  };

  const handleToggleCompanyType = (type: CompanyType) => {
    const exists = filters.company_types.includes(type);
    const updatedTypes = exists
      ? filters.company_types.filter((t) => t !== type)
      : [...filters.company_types, type];
    const updated = { ...filters, company_types: updatedTypes };
    setFilters(updated);
    setIsDirty(true);
  };

  const handleApplyChanges = () => {
    onUpdateCriteria(filters, rubric);
    setIsDirty(false);
  };

  const isFilterModified = (key: string) => modifiedFilters.includes(key);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Sourcing Strategy
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isDirty && !isFrozen && (
            <button
              onClick={handleApplyChanges}
              disabled={isUpdating}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Apply & Re-rank</span>
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition lg:hidden"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={`space-y-6 pt-4 overflow-y-auto pr-1 ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        {/* OBJECTIVE FILTERS SECTION */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Objective Filters
            </h3>
            {isFilterModified('filters') && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                Updated
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Skills */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Required / Prioritized Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700/60"
                  >
                    <span>{skill}</span>
                    {!isFrozen && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400 transition"
                      >
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
                    placeholder="Add skill (e.g. AWS RDS)..."
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Years of Experience */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  disabled={isFrozen}
                  value={filters.min_years_experience ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    setFilters({ ...filters, min_years_experience: val });
                    setIsDirty(true);
                  }}
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  placeholder="e.g. 4"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Max Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  disabled={isFrozen}
                  value={filters.max_years_experience ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    setFilters({ ...filters, max_years_experience: val });
                    setIsDirty(true);
                  }}
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  placeholder="e.g. 7"
                />
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Target Locations
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {filters.locations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700/60"
                  >
                    <span>{loc}</span>
                    {!isFrozen && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="hover:text-red-400 transition"
                      >
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
                    placeholder="Add location (e.g. Bangalore)..."
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Company Types */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Target Company Backgrounds
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_COMPANY_TYPES.map((type) => {
                  const checked = filters.company_types.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isFrozen}
                      onClick={() => handleToggleCompanyType(type)}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-left capitalize transition cursor-pointer ${
                        checked
                          ? 'bg-indigo-950/60 border-indigo-700 text-indigo-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          checked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-700'
                        }`}
                      >
                        {checked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="text-xs">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SUBJECTIVE RUBRIC SECTION */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Subjective Fit Rubric
            </h3>
            {isFilterModified('rubric') && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                Refined
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Role Summary */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Role Mission / Essence
              </label>
              <textarea
                rows={2}
                disabled={isFrozen}
                value={rubric.role_summary}
                onChange={(e) => {
                  setRubric({ ...rubric, role_summary: e.target.value });
                  setIsDirty(true);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-75 resize-none"
              />
            </div>

            {/* Core Competencies */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Core Competencies & Weighting
              </label>
              <div className="space-y-2">
                {rubric.core_competencies.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{comp.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                          comp.weight === 'critical'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : comp.weight === 'high'
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {comp.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {comp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive Signals */}
            {rubric.positive_signals.length > 0 && (
              <div>
                <label className="block text-emerald-400 font-medium mb-1">
                  ✓ Positive Signals (Green Flags)
                </label>
                <ul className="space-y-1 pl-3 text-[11px] text-slate-400 list-disc">
                  {rubric.positive_signals.map((sig, idx) => (
                    <li key={idx} className="leading-snug">{sig}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Signals */}
            {rubric.negative_signals.length > 0 && (
              <div>
                <label className="block text-rose-400 font-medium mb-1">
                  ✕ Negative Signals (Anti-Patterns)
                </label>
                <ul className="space-y-1 pl-3 text-[11px] text-slate-400 list-disc">
                  {rubric.negative_signals.map((sig, idx) => (
                    <li key={idx} className="leading-snug">{sig}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
