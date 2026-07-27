import type { Program, SettingsModel } from '../../types/models';
import { BackupSection } from './BackupSection';
import { ExerciseMigrationSection } from './ExerciseMigrationSection';
import { ProgramStatsExportSection } from './ProgramStatsExportSection';
import { SettingsRows } from './SettingsRows';

interface DataToolsSectionProps {
  programs: Program[];
  settings: SettingsModel | null;
  onImportComplete: () => void;
  onMigrationComplete: () => void;
  onDeleteProgram: (programId: string) => void;
}

export function DataToolsSection({
  programs,
  settings,
  onImportComplete,
  onMigrationComplete,
  onDeleteProgram,
}: DataToolsSectionProps) {
  const programsByName = new Map<string, Program[]>();
  programs.forEach((prog) => {
    const key = prog.name.toLowerCase();
    if (!programsByName.has(key)) {
      programsByName.set(key, []);
    }
    programsByName.get(key)!.push(prog);
  });
  const duplicates = Array.from(programsByName.values()).filter((group) => group.length > 1);

  return (
    <SettingsRows>
      <div className="py-4 first:pt-0 last:pb-0">
        <span className="font-bold text-gray-900 dark:text-gray-100 block mb-3">Export Training Stats</span>
        <ProgramStatsExportSection programs={programs} />
      </div>

      <BackupSection onImportComplete={onImportComplete} />

      <ExerciseMigrationSection settings={settings} onMigrationComplete={onMigrationComplete} />

      {programs.length > 0 && (
        <div className="py-4 first:pt-0 last:pb-0">
          <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Duplicate Programs</span>
          {duplicates.length === 0 ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">No duplicate programs found</span>
          ) : (
            <div className="space-y-3 mt-3">
              {duplicates.map((dupeGroup) => (
                <div key={dupeGroup[0].name} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">{dupeGroup[0].name}</p>
                  <div className="space-y-1">
                    {dupeGroup.map((prog) => (
                      <div key={prog.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Created: {new Date(prog.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => onDeleteProgram(prog.id)}
                          className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SettingsRows>
  );
}
