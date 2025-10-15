import { CheckCircle } from 'lucide-react';
import type { Program, SettingsModel } from '../../types/models';

interface ActiveProgramSectionProps {
  programs: Program[];
  settings: SettingsModel | null;
  onSetActive: (programId: string) => void;
}

export function ActiveProgramSection({ programs, settings, onSetActive }: ActiveProgramSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4">Active Program</h2>
      {programs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm italic">No programs available. Create one below.</p>
      ) : (
        <div className="space-y-2">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => onSetActive(program.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all text-left shadow-sm hover:shadow-md"
            >
              <span className="font-bold text-gray-900 dark:text-gray-100">{program.name}</span>
              {settings?.activeProgramId === program.id && (
                <CheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
