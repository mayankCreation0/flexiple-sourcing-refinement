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

const FilterRubricDrawerInner: React.FC<FilterRubricDrawerProps> = ({
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
    <div
      className="cyber-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-cyan)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={16} color="#FF00FF" />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            Strategy Matrix
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isDirty && !isFrozen && (
            <button
              onClick={handleApplyChanges}
              disabled={isUpdating}
              className="btn-cyber-solid"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.65rem', background: '#FF00FF', borderColor: '#FF00FF' }}
            >
              <RefreshCw size={11} style={{ animation: isUpdating ? 'tribal-spin 1s linear infinite' : 'none' }} />
              SYNC
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            className="lg:hidden"
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      <div
        style={{
          display: isCollapsed ? 'none' : 'block',
          paddingTop: '1rem',
          overflowY: 'auto',
          flex: 1,
        }}
        className="lg:block"
      >
        {/* ── OBJECTIVE FILTERS ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Filter size={14} color="#00FFFF" />
            <h3 className="section-label" style={{ margin: 0, fontSize: '0.7rem' }}>Parameters</h3>
            {isFilterModified('filters') && <span className="pill-cyan" style={{ fontSize: '0.5rem', padding: '0.1rem 0.4rem' }}>MODIFIED</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                Required Skills
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: 6 }}>
                {filters.skills.map((skill) => (
                  <span key={skill} className="pill-cyan" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {skill}
                    {!isFrozen && (
                      <button onClick={() => handleRemoveSkill(skill)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isFrozen && (
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill..."
                    className="cyber-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  />
                  <button type="submit" className="btn-cyber" style={{ padding: '0 0.75rem', minWidth: 'auto' }}>
                    <Plus size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>Min YoE</label>
                <input
                  type="number" min="0" max="20" disabled={isFrozen}
                  value={filters.min_years_experience ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    setFilters({ ...filters, min_years_experience: val });
                    setIsDirty(true);
                  }}
                  className="cyber-input" style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>Max YoE</label>
                <input
                  type="number" min="0" max="30" disabled={isFrozen}
                  value={filters.max_years_experience ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    setFilters({ ...filters, max_years_experience: val });
                    setIsDirty(true);
                  }}
                  className="cyber-input" style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                />
              </div>
            </div>

            {/* Locations */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                Locations
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: 6 }}>
                {filters.locations.map((loc) => (
                  <span key={loc} className="pill-cyan" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {loc}
                    {!isFrozen && (
                      <button onClick={() => handleRemoveLocation(loc)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isFrozen && (
                <form onSubmit={handleAddLocation} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add location..."
                    className="cyber-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  />
                  <button type="submit" className="btn-cyber" style={{ padding: '0 0.75rem', minWidth: 'auto' }}>
                    <Plus size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Company Types */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                Background
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {ALL_COMPANY_TYPES.map((type) => {
                  const checked = filters.company_types.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isFrozen}
                      onClick={() => handleToggleCompanyType(type)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem',
                        background: checked ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                        border: `1px solid ${checked ? '#00FFFF' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: isFrozen ? 'default' : 'pointer',
                        color: checked ? '#00FFFF' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: 12, height: 12, border: `1px solid ${checked ? '#00FFFF' : 'var(--text-muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {checked && <Check size={10} color="#00FFFF" />}
                      </div>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── SUBJECTIVE RUBRIC ── */}
        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Award size={14} color="#FF00FF" />
            <h3 className="section-label" style={{ margin: 0, fontSize: '0.7rem', color: '#FF00FF' }}>Evaluation Rubric</h3>
            {isFilterModified('rubric') && <span className="pill-magenta" style={{ fontSize: '0.5rem', padding: '0.1rem 0.4rem' }}>RECALIBRATED</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Role Summary */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                Role Essence
              </label>
              <textarea
                rows={3}
                disabled={isFrozen}
                value={rubric.role_summary}
                onChange={(e) => {
                  setRubric({ ...rubric, role_summary: e.target.value });
                  setIsDirty(true);
                }}
                className="cyber-input"
                style={{ padding: '0.75rem', fontSize: '0.75rem' }}
              />
            </div>

            {/* Core Competencies */}
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                Core Competencies
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rubric.core_competencies.map((comp, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,0,255,0.03)',
                      border: '1px solid rgba(255,0,255,0.15)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '0.1rem 0.4rem', borderRadius: 2,
                          background: comp.weight === 'critical' ? 'rgba(255,69,0,0.1)' : comp.weight === 'high' ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                          color: comp.weight === 'critical' ? '#FF4500' : comp.weight === 'high' ? '#00FFFF' : 'var(--text-secondary)',
                          border: `1px solid ${comp.weight === 'critical' ? '#FF4500' : comp.weight === 'high' ? '#00FFFF' : 'var(--text-muted)'}`,
                        }}
                      >
                        {comp.weight.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {comp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive Signals */}
            {rubric.positive_signals.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: '#29AB87', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                  [+] Green Flags
                </label>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {rubric.positive_signals.map((sig, idx) => (
                    <li key={idx}>{sig}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Signals */}
            {rubric.negative_signals.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: '#FF4500', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>
                  [-] Anti-Patterns
                </label>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {rubric.negative_signals.map((sig, idx) => (
                    <li key={idx}>{sig}</li>
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

export const FilterRubricDrawer: React.FC<FilterRubricDrawerProps> = (props) => {
  const syncKey = `${JSON.stringify(props.filters)}::${JSON.stringify(props.rubric)}`;
  return <FilterRubricDrawerInner key={syncKey} {...props} />;
};
