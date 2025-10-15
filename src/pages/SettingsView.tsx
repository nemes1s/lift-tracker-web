import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { DisclaimerModal } from '../components/DisclaimerModal';
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
import type { Program, SettingsModel } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { isPersisted, getStorageEstimate } from '../utils/persistence';
import { APP_VERSION } from '../version';
import { AppearanceSection } from '../components/SettingsView/AppearanceSection';
import { PWAInstallSection, DisclaimerSection, FormulaSection } from '../components/SettingsView/SimpleSection';
import { StorageInfoSection } from '../components/SettingsView/StorageInfoSection';
import { RestTimerSettingsSection } from '../components/SettingsView/RestTimerSettingsSection';
import { ActiveProgramSection } from '../components/SettingsView/ActiveProgramSection';
import { ProgramsManagementSection } from '../components/SettingsView/ProgramsManagementSection';
import { DeleteConfirmModals } from '../components/SettingsView/DeleteConfirmModals';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerRefresh, darkMode, toggleDarkMode } = useAppStore();

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
    setPrograms(progs);

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

      const programData = generateProgramFromCSVData(parseResult.data);

      navigate('/program/preview', {
        state: {
          mode: 'preview',
          programData,
        },
      });
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

  const handleRestTimerToggle = async (field: keyof SettingsModel, value: boolean) => {
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

        <PWAInstallSection />

        <DisclaimerSection onShowDisclaimer={() => setShowDisclaimerModal(true)} />

        <StorageInfoSection persisted={persisted} storageInfo={storageInfo} />

        <FormulaSection useEpley={settings?.useEpley === true} onUpdate={handleFormulaUpdate} />

        <RestTimerSettingsSection
          settings={settings}
          onToggle={handleRestTimerToggle}
          onDurationChange={handleRestTimerDuration}
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
      </div>
    </div>
  );
}
