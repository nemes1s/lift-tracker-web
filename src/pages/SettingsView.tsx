import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { WhatsNewModal } from '../components/WhatsNewModal';
import { db } from '../db/database';
import {
  generate5DaySplitData,
  generate3DaySplitData,
  generateMinimalEffort4DayData,
  generateUpperLower4DayData,
  generateProgramFromCSVData,
} from '../utils/programTemplates';
import { parseCSV, readCSVFile } from '../utils/csvParser';
import { exportProgramWithProgress, downloadCSV } from '../utils/csvExporter';
import { useAppStore } from '../store/appStore';
import { parseAllVersions, type VersionChanges } from '../utils/changelogParser';
import type { Program, SettingsModel } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { isPersisted, getStorageEstimate } from '../utils/persistence';
import { APP_VERSION } from '../version';
import { AppearanceSection } from '../components/SettingsView/AppearanceSection';
import { PWAInstallSection, DisclaimerSection, FormulaSection, TourSection, FeedbackSection, WhatsNewSection } from '../components/SettingsView/SimpleSection';
import { StorageInfoSection } from '../components/SettingsView/StorageInfoSection';
import { RestTimerSettingsSection } from '../components/SettingsView/RestTimerSettingsSection';
import { WorkoutBehaviorSection } from '../components/SettingsView/WorkoutBehaviorSection';
import { WeeklyGoalSection } from '../components/SettingsView/WeeklyGoalSection';
import { WeekStartDaySection } from '../components/SettingsView/WeekStartDaySection';
import { WeightUnitSection } from '../components/SettingsView/WeightUnitSection';
import { ActiveProgramSection } from '../components/SettingsView/ActiveProgramSection';
import { ProgramsManagementSection } from '../components/SettingsView/ProgramsManagementSection';
import { ProgramStatsExportSection } from '../components/SettingsView/ProgramStatsExportSection';
import { DeleteConfirmModals } from '../components/SettingsView/DeleteConfirmModals';
import { ExerciseMigrationSection } from '../components/SettingsView/ExerciseMigrationSection';
import { BackupSection } from '../components/SettingsView/BackupSection';

export function SettingsView() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [persisted, setPersisted] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingProgramName, setEditingProgramName] = useState('');
  const [exportingProgramId, setExportingProgramId] = useState<string | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [changelogData, setChangelogData] = useState<VersionChanges[]>([]);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [pendingCSVData, setPendingCSVData] = useState<any>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(12);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerRefresh, darkMode, toggleDarkMode, startTour } = useAppStore();

  useEffect(() => {
    loadData();
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const storage = await getStorageEstimate();
    setStorageInfo(storage);
    const isPers = await isPersisted();
    setPersisted(isPers);
  };

  const loadData = async () => {
    const progs = await db.programs.orderBy('createdAt').toArray();

    // Deduplicate programs by ID (keep the most recently created if duplicates exist)
    const uniquePrograms = new Map<string, typeof progs[0]>();
    for (const prog of progs.reverse()) {
      if (!uniquePrograms.has(prog.id)) {
        uniquePrograms.set(prog.id, prog);
      }
    }

    const dedupedProgs = Array.from(uniquePrograms.values()).reverse();
    setPrograms(dedupedProgs);

    let sett = await db.settings.toCollection().first();
    if (!sett) {
      sett = {
        id: uuidv4(),
        useEpley: true,
      };
      await db.settings.add(sett);
    }
    setSettings(sett);
  };

  const handleCreateProgram = (type: string) => {
    let programData;

    switch (type) {
      case '5day':
        programData = generate5DaySplitData();
        break;
      case '3day':
        programData = generate3DaySplitData();
        break;
      case 'minimal':
        programData = generateMinimalEffort4DayData();
        break;
      case 'upperlower':
        programData = generateUpperLower4DayData();
        break;
      default:
        return;
    }

    navigate('/program/preview', {
      state: {
        mode: 'preview',
        programData,
      },
    });
  };

  const handleSetActive = async (programId: string) => {
    if (!settings) return;

    await db.settings.update(settings.id, { activeProgramId: programId });
    await loadData();
    triggerRefresh();
  };

  const handleDeleteProgram = (programId: string) => {
    setDeletingProgramId(programId);
  };

  const confirmDeleteProgram = async () => {
    if (!deletingProgramId) return;

    await db.programs.delete(deletingProgramId);

    const templates = await db.workoutTemplates.where('programId').equals(deletingProgramId).toArray();
    for (const template of templates) {
      await db.exerciseTemplates.where('workoutTemplateId').equals(template.id).delete();
      await db.workoutTemplates.delete(template.id);
    }

    setDeletingProgramId(null);
    await loadData();
    triggerRefresh();
  };

  const handleDeleteAllPrograms = async () => {
    await db.programs.clear();
    await db.workoutTemplates.clear();
    await db.exerciseTemplates.clear();

    setShowDeleteConfirm(false);
    await loadData();
    triggerRefresh();
  };

  const handleUpdateProgramDate = async (programId: string, date: Date) => {
    await db.programs.update(programId, { startDate: date });
    await loadData();
  };

  const handleUpdateProgramWeeks = async (programId: string, weeks: number) => {
    await db.programs.update(programId, { totalWeeks: Math.max(weeks, 1) });
    await loadData();
  };

  const handleStartRename = (programId: string, currentName: string) => {
    setEditingProgramId(programId);
    setEditingProgramName(currentName);
  };

  const handleSaveRename = async () => {
    if (!editingProgramId || !editingProgramName.trim()) return;

    await db.programs.update(editingProgramId, { name: editingProgramName.trim() });
    setEditingProgramId(null);
    setEditingProgramName('');
    await loadData();
    triggerRefresh();
  };

  const handleCancelRename = () => {
    setEditingProgramId(null);
    setEditingProgramName('');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const content = await readCSVFile(file);
      const parseResult = parseCSV(content);

      if (!parseResult.success || !parseResult.data) {
        setImportMessage({
          type: 'error',
          text: parseResult.error || 'Failed to parse CSV file',
        });
        setIsImporting(false);
        return;
      }

      // Store the parsed CSV data and show duration selection modal
      setPendingCSVData(parseResult.data);
      setSelectedWeeks(parseResult.data.totalWeeks || 12);
      setShowDurationModal(true);
      setIsImporting(false);
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setIsImporting(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDurationConfirm = () => {
    if (!pendingCSVData) return;

    const programData = generateProgramFromCSVData(pendingCSVData, selectedWeeks);

    setShowDurationModal(false);
    setPendingCSVData(null);

    navigate('/program/preview', {
      state: {
        mode: 'preview',
        programData,
      },
    });
  };

  const handleDurationCancel = () => {
    setShowDurationModal(false);
    setPendingCSVData(null);
  };

  const handleExportProgram = async (programId: string, programName: string) => {
    setExportingProgramId(programId);

    try {
      const csvContent = await exportProgramWithProgress(programId);
      const sanitizedName = programName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedName}_export.csv`;

      downloadCSV(csvContent, filename);

      setImportMessage({
        type: 'success',
        text: `Successfully exported "${programName}"`,
      });

      setTimeout(() => setImportMessage(null), 3000);
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      setTimeout(() => setImportMessage(null), 5000);
    } finally {
      setExportingProgramId(null);
    }
  };

  const handleViewProgram = (programId: string) => {
    navigate('/program/preview', {
      state: {
        mode: 'view',
        programId,
      },
    });
  };

  const handleDisclaimerAccept = async (dontShowAgain: boolean) => {
    if (!settings) return;

    await db.settings.update(settings.id, {
      disclaimerAccepted: dontShowAgain,
      lastDisclaimerShown: new Date(),
    });
    setShowDisclaimerModal(false);
    await loadData();
  };

  const handleDisclaimerDismiss = async () => {
    if (!settings) return;

    await db.settings.update(settings.id, {
      lastDisclaimerShown: new Date(),
    });
    setShowDisclaimerModal(false);
  };

  const handleShowWhatsNew = async () => {
    try {
      const allVersions = await parseAllVersions();
      if (allVersions && allVersions.length > 0) {
        setChangelogData(allVersions);
        setShowWhatsNewModal(true);
      } else {
        console.warn('No changelog data found');
      }
    } catch (error) {
      console.error('Failed to load changelog:', error);
    }
  };

  const handleSettingToggle = async (field: keyof SettingsModel, value: boolean) => {
    if (!settings) return;
    await db.settings.update(settings.id, { [field]: value });
    await loadData();
  };

  const handleRestTimerDuration = async (duration: number) => {
    if (!settings) return;
    await db.settings.update(settings.id, { restTimerDuration: duration });
    await loadData();
  };

  const handleFormulaUpdate = async (useEpley: boolean) => {
    if (!settings) return;
    await db.settings.update(settings.id, { useEpley });
    await loadData();
  };

  const handleWeeklyGoalUpdate = async (goal: number) => {
    if (!settings) return;
    await db.settings.update(settings.id, { targetWorkoutsPerWeek: goal });
    await loadData();
    triggerRefresh();
  };

  const handleWeekStartDayChange = async (day: number) => {
    if (!settings) return;
    await db.settings.update(settings.id, { weekStartDay: day });
    await loadData();
    triggerRefresh();
  };

  const handleWeightUnitChange = async (unit: 'kg' | 'lbs') => {
    if (!settings) return;
    await db.settings.update(settings.id, { weightUnit: unit });
    await loadData();
    triggerRefresh();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize your experience</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Version <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{APP_VERSION}</span>
            </p>
          </div>
        </div>

        <AppearanceSection darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <WeekStartDaySection
          settings={settings}
          onWeekStartDayChange={handleWeekStartDayChange}
        />

        <WeightUnitSection
          settings={settings}
          onWeightUnitChange={handleWeightUnitChange}
        />

        <PWAInstallSection />

        <DisclaimerSection onShowDisclaimer={() => setShowDisclaimerModal(true)} />

        <TourSection onStartTour={startTour} />

        <FeedbackSection />

        <WhatsNewSection onShowWhatsNew={handleShowWhatsNew} />

        <StorageInfoSection persisted={persisted} storageInfo={storageInfo} />

        <FormulaSection useEpley={settings?.useEpley === true} onUpdate={handleFormulaUpdate} />

        <RestTimerSettingsSection
          settings={settings}
          onToggle={handleSettingToggle}
          onDurationChange={handleRestTimerDuration}
        />

        <WorkoutBehaviorSection
          settings={settings}
          onToggle={handleSettingToggle}
        />

        <WeeklyGoalSection
          settings={settings}
          onGoalChange={handleWeeklyGoalUpdate}
        />

        <ActiveProgramSection
          programs={programs}
          settings={settings}
          onSetActive={handleSetActive}
        />

        <ProgramsManagementSection
          programs={programs}
          editingProgramId={editingProgramId}
          editingProgramName={editingProgramName}
          exportingProgramId={exportingProgramId}
          importMessage={importMessage}
          isImporting={isImporting}
          fileInputRef={fileInputRef}
          onStartRename={handleStartRename}
          onSaveRename={handleSaveRename}
          onCancelRename={handleCancelRename}
          onEditingNameChange={setEditingProgramName}
          onDateChange={handleUpdateProgramDate}
          onWeeksChange={handleUpdateProgramWeeks}
          onView={handleViewProgram}
          onExport={handleExportProgram}
          onDelete={handleDeleteProgram}
          onImportClick={handleImportClick}
          onFileSelect={handleFileSelect}
          onCreateProgram={handleCreateProgram}
          onDeleteAll={() => setShowDeleteConfirm(true)}
        />

        <ProgramStatsExportSection programs={programs} />

        <BackupSection onImportComplete={loadData} />

        <ExerciseMigrationSection
          settings={settings}
          onMigrationComplete={loadData}
        />

        {/* Data Cleanup Section */}
        {programs.length > 0 && (
          <div className="card p-6 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Data Management</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify and manage duplicate programs
                </p>
              </div>
            </div>

            {(() => {
              // Find duplicate program names
              const programsByName = new Map<string, typeof programs>();
              programs.forEach(prog => {
                const key = prog.name.toLowerCase();
                if (!programsByName.has(key)) {
                  programsByName.set(key, []);
                }
                programsByName.get(key)!.push(prog);
              });

              const duplicates = Array.from(programsByName.values()).filter(progs => progs.length > 1);

              if (duplicates.length === 0) {
                return (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ✓ No duplicate programs found
                  </p>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-3">
                      Found {duplicates.length} program{duplicates.length !== 1 ? 's' : ''} with duplicate names:
                    </p>
                    {duplicates.map((dupeGroup) => (
                      <div key={dupeGroup[0].name} className="bg-white dark:bg-slate-700 rounded p-3 mb-2 last:mb-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">
                          {dupeGroup[0].name}
                        </p>
                        <div className="space-y-1">
                          {dupeGroup.map((prog) => (
                            <div key={prog.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600 dark:text-gray-400">
                                Created: {new Date(prog.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => setDeletingProgramId(prog.id)}
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
                </div>
              );
            })()}
          </div>
        )}

        <DeleteConfirmModals
          deletingProgramId={deletingProgramId}
          showDeleteConfirm={showDeleteConfirm}
          programs={programs}
          onCancelDelete={() => setDeletingProgramId(null)}
          onConfirmDelete={confirmDeleteProgram}
          onCancelDeleteAll={() => setShowDeleteConfirm(false)}
          onConfirmDeleteAll={handleDeleteAllPrograms}
        />

        {showDisclaimerModal && (
          <DisclaimerModal
            onAccept={handleDisclaimerAccept}
            onDismiss={handleDisclaimerDismiss}
          />
        )}

        {showWhatsNewModal && changelogData.length > 0 && (
          <WhatsNewModal
            changes={changelogData}
            onClose={() => setShowWhatsNewModal(false)}
          />
        )}

        {showDurationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Set Program Duration
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                How many weeks should this program run before completing and restarting?
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Duration (weeks)
                </label>
                <select
                  value={selectedWeeks}
                  onChange={(e) => setSelectedWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={4}>4 weeks</option>
                  <option value={8}>8 weeks</option>
                  <option value={12}>12 weeks</option>
                  <option value={16}>16 weeks</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDurationCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDurationConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
