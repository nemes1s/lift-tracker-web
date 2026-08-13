import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { getAllDefinitionNames } from '../../utils/exerciseLibrary';
import type { SettingsModel } from '../../types/models';
import type { MigrationMatch } from '../../utils/exerciseMigration';
import { previewMigration, applyMigration } from '../../utils/exerciseMigration';

interface Props {
  settings: SettingsModel | null;
  onMigrationComplete: () => void;
}

type Confidence = 'high' | 'medium';

export function ExerciseMigrationSection({ settings, onMigrationComplete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [matches, setMatches] = useState<MigrationMatch[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map());
  const [expanded, setExpanded] = useState<Record<Confidence, boolean>>({ high: true, medium: false });
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const isDone = settings?.exerciseMigrationComplete === true;

  const handleOpen = async () => {
    setLoading(true);
    setShowModal(true);
    setSuccessCount(null);
    setOverrides(new Map());
    try {
      const preview = await previewMigration();
      setMatches(preview);
      // Pre-select high confidence matches
      const initial = new Set(preview.filter(m => m.confidence === 'high').map(m => m.original));
      setSelected(initial);
    } finally {
      setLoading(false);
    }
  };

  const setOverride = (original: string, canonical: string) => {
    setOverrides(prev => {
      const next = new Map(prev);
      next.set(original, canonical);
      return next;
    });
  };

  const toggle = (original: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(original)) next.delete(original);
      else next.add(original);
      return next;
    });
  };

  const toggleGroup = (confidence: Confidence) => {
    const group = matches.filter(m => m.confidence === confidence);
    const allSelected = group.every(m => selected.has(m.original));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) {
        group.forEach(m => next.delete(m.original));
      } else {
        group.forEach(m => next.add(m.original));
      }
      return next;
    });
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const renames = new Map<string, string>();
      for (const match of matches) {
        if (selected.has(match.original)) {
          renames.set(match.original, overrides.get(match.original) ?? match.canonical);
        }
      }
      await applyMigration(renames);
      setSuccessCount(renames.size);
      setShowModal(false);
      onMigrationComplete();
    } finally {
      setApplying(false);
    }
  };

  const highMatches = matches.filter(m => m.confidence === 'high');
  const mediumMatches = matches.filter(m => m.confidence === 'medium');
  const noMatches = matches.filter(m => m.confidence === 'none');

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Exercise Library</span>
            {isDone && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                Done
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Map your exercises to 580+ canonical names for muscle-group tracking
          </span>
          {successCount !== null && (
            <span className="block text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              {successCount === 0
                ? 'No exercises renamed.'
                : `${successCount} exercise name${successCount !== 1 ? 's' : ''} updated successfully.`}
            </span>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isDone ? 'Re-run' : 'Preview & Migrate'}
        </button>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85dvh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Exercise Name Migration</h2>
              {!loading && matches.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {highMatches.length} high confidence, {mediumMatches.length} possible match
                  {mediumMatches.length !== 1 ? 'es' : ''}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium">All exercises already match the library</p>
                  <p className="text-sm mt-1">Nothing to rename.</p>
                </div>
              ) : (
                <>
                  {/* Warning */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                    This permanently renames selected exercises in your history, templates, and personal records.
                  </div>

                  {/* High confidence group */}
                  {highMatches.length > 0 && (
                    <MatchGroup
                      label="High confidence"
                      labelColor="emerald"
                      matches={highMatches}
                      selected={selected}
                      overrides={overrides}
                      expanded={expanded.high}
                      onToggleExpand={() => setExpanded(e => ({ ...e, high: !e.high }))}
                      onToggle={toggle}
                      onToggleAll={() => toggleGroup('high')}
                      onOverride={setOverride}
                    />
                  )}

                  {/* Medium confidence group */}
                  {mediumMatches.length > 0 && (
                    <MatchGroup
                      label="Possible match"
                      labelColor="amber"
                      matches={mediumMatches}
                      selected={selected}
                      overrides={overrides}
                      expanded={expanded.medium}
                      onToggleExpand={() => setExpanded(e => ({ ...e, medium: !e.medium }))}
                      onToggle={toggle}
                      onToggleAll={() => toggleGroup('medium')}
                      onOverride={setOverride}
                    />
                  )}

                  {/* No match info */}
                  {noMatches.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {noMatches.length} exercise{noMatches.length !== 1 ? 's' : ''} had no close match and will keep their current name.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={applying}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || loading || selected.size === 0}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                {applying ? 'Applying…' : `Apply ${selected.size} rename${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface MatchGroupProps {
  label: string;
  labelColor: 'emerald' | 'amber';
  matches: MigrationMatch[];
  selected: Set<string>;
  overrides: Map<string, string>;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggle: (original: string) => void;
  onToggleAll: () => void;
  onOverride: (original: string, canonical: string) => void;
}

function MatchGroup({
  label,
  labelColor,
  matches,
  selected,
  overrides,
  expanded,
  onToggleExpand,
  onToggle,
  onToggleAll,
  onOverride,
}: MatchGroupProps) {
  const allSelected = matches.every(m => selected.has(m.original));
  const colorClass =
    labelColor === 'emerald'
      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
      : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>{label}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{matches.length} exercises</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleAll(); }}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </button>

      {expanded && (
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {matches.map(match => (
            <MatchRow
              key={match.original}
              match={match}
              isSelected={selected.has(match.original)}
              override={overrides.get(match.original)}
              onToggle={() => onToggle(match.original)}
              onOverride={onOverride}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MatchRowProps {
  match: MigrationMatch;
  isSelected: boolean;
  override: string | undefined;
  onToggle: () => void;
  onOverride: (original: string, canonical: string) => void;
}

const allLibraryNames = getAllDefinitionNames();

function MatchRow({ match, isSelected, override, onToggle, onOverride }: MatchRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const effectiveCanonical = override ?? match.canonical;
  const topOptions = [match.canonical, ...match.alternatives];

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allLibraryNames
      .filter(n => n.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const handlePick = (option: string) => {
    onOverride(match.original, option);
    setPickerOpen(false);
    setQuery('');
  };

  const handleTogglePicker = () => {
    setPickerOpen(o => !o);
    setQuery('');
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
        />
        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{match.original}</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs">→</span>
          <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{effectiveCanonical}</span>
          <button
            onClick={handleTogglePicker}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-2"
          >
            change
          </button>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {Math.round(match.score * 100)}%
        </span>
      </div>

      {pickerOpen && (
        <div className="mt-2 ml-7 space-y-2">
          {/* Top fuzzy matches as chips */}
          <div className="flex flex-wrap gap-1.5">
            {topOptions.map(option => (
              <button
                key={option}
                onClick={() => handlePick(option)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  option === effectiveCanonical
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Full library search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search all 580+ exercises…"
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden">
              {searchResults.map(option => (
                <button
                  key={option}
                  onClick={() => handlePick(option)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors border-b last:border-b-0 border-gray-100 dark:border-slate-700 ${
                    option === effectiveCanonical
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
