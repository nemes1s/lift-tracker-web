import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2, CheckCircle, Database, Shield, Upload, Pencil, Check, X, Download, AlertTriangle, Eye, Timer } from 'lucide-react';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { db } from '../db/database';
import { currentWeek } from '../utils/programLogic';
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
import { InstallButton } from '../components/InstallPrompt';
import { isPersisted, getStorageEstimate } from '../utils/persistence';
import { playTimerNotification, initAudioContext } from '../utils/audio';

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
  const { triggerRefresh } = useAppStore();

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
      // Create default settings
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

    // Navigate to preview screen
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

    // Delete associated data
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
      // Read file content
      const content = await readCSVFile(file);

      // Parse CSV
      const parseResult = parseCSV(content);

      if (!parseResult.success || !parseResult.data) {
        setImportMessage({
          type: 'error',
          text: parseResult.error || 'Failed to parse CSV file',
        });
        setIsImporting(false);
        return;
      }

      // Generate program data without saving
      const programData = generateProgramFromCSVData(parseResult.data);

      // Navigate to preview screen
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportProgram = async (programId: string, programName: string) => {
    setExportingProgramId(programId);

    try {
      // Export program with progress data
      const csvContent = await exportProgramWithProgress(programId);

      // Generate filename
      const sanitizedName = programName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedName}_export.csv`;

      // Download CSV
      downloadCSV(csvContent, filename);

      setImportMessage({
        type: 'success',
        text: `Successfully exported "${programName}"`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setImportMessage(null), 3000);
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      // Clear message after 5 seconds
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                Settings
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Customize your experience</p>
            </div>
          </div>
        </div>

        {/* PWA Install */}
        <div className="card p-6 bg-white">
          <h2 className="font-bold text-gray-900 text-lg mb-3">Install App</h2>
          <p className="text-sm text-gray-700 mb-4">
            Install LiftTracker as an app for offline access, faster loading, and a better experience.
          </p>
          <InstallButton />
        </div>

        {/* Disclaimer */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="font-bold text-gray-900 text-lg">Disclaimer</h2>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            View important health and safety information about using this fitness tracking app.
          </p>
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-amber-200 hover:border-amber-300"
          >
            <AlertTriangle className="w-5 h-5" />
            View Disclaimer
          </button>
        </div>

        {/* Storage Info */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-primary-600" />
            <h2 className="font-bold text-gray-900 text-lg">Storage</h2>
          </div>

          <div className="space-y-4">
            {/* Persistence Status */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className={`w-6 h-6 ${persisted ? 'text-green-600' : 'text-orange-600'}`} />
                <span className="font-bold text-gray-900">Persistent Storage</span>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${persisted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {persisted ? '✓ Enabled' : 'Not Enabled'}
              </span>
            </div>

            {!persisted && (
              <p className="text-xs text-gray-700 px-3 bg-orange-50 py-2 rounded-lg border border-orange-100">
                Storage may be cleared when device runs low on space. Install the app for guaranteed persistence.
              </p>
            )}

            {/* Storage Usage */}
            {storageInfo && (
              <div className="space-y-3 bg-white/80 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-semibold">Used</span>
                  <span className="font-bold text-gray-900">
                    {storageInfo.usageInMB} MB / {storageInfo.quotaInMB} MB
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-primary-600 h-full transition-all duration-500 shadow-glow"
                    style={{ width: `${storageInfo.percentUsed}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {storageInfo.percentUsed}% of available storage used
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formula Selection */}
        <div className="card p-6 bg-white">
          <h2 className="font-bold text-gray-900 text-lg mb-4">1RM Formula</h2>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                checked={settings?.useEpley === true}
                onChange={() => settings && db.settings.update(settings.id, { useEpley: true })}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-bold text-gray-900">Epley</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                checked={settings?.useEpley === false}
                onChange={() => settings && db.settings.update(settings.id, { useEpley: false })}
                className="w-5 h-5 text-primary-600"
              />
              <span className="font-bold text-gray-900">Brzycki</span>
            </label>
          </div>
        </div>

        {/* Rest Timer Settings */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-6 h-6 text-primary-600" />
            <h2 className="font-bold text-gray-900 text-lg">Rest Timer</h2>
          </div>

          <div className="space-y-4">
            {/* Enable Rest Timer */}
            <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 block">Enable Rest Timer</span>
                <span className="text-sm text-gray-600">Show timer between sets</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.restTimerEnabled !== false}
                  onChange={(e) => handleRestTimerToggle('restTimerEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Auto-start Timer */}
            <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 block">Auto-start Timer</span>
                <span className="text-sm text-gray-600">Start automatically after logging a set</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.restTimerAutoStart !== false}
                  onChange={(e) => handleRestTimerToggle('restTimerAutoStart', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Sound Notification */}
            <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 block">Sound Notification</span>
                <span className="text-sm text-gray-600">Play sound when timer completes</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.restTimerSound !== false}
                  onChange={(e) => handleRestTimerToggle('restTimerSound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Test Sound Button */}
            <button
              onClick={() => {
                initAudioContext();
                playTimerNotification(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-blue-200"
            >
              <Timer className="w-5 h-5" />
              <span>Test Sound</span>
            </button>

            {/* Default Rest Duration */}
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
              <label className="block mb-3">
                <span className="font-bold text-gray-900 block mb-1">Default Rest Duration</span>
                <span className="text-sm text-gray-600">Time in seconds (30-300)</span>
              </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={settings?.restTimerDuration ?? 90}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 30 && val <= 300) {
                        handleRestTimerDuration(val);
                      }
                    }}
                    className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg font-bold text-gray-900 text-center"
                  />
                  <span className="text-sm text-gray-600 font-medium">sec</span>
                </div>
                </div>
              <div className="flex items-center gap-4 ">
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="15"
                  value={settings?.restTimerDuration ?? 90}
                  onChange={(e) => handleRestTimerDuration(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />

              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>30s</span>
                <span>5 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Program */}
        <div className="card p-6 bg-white">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Active Program</h2>
          {programs.length === 0 ? (
            <p className="text-gray-600 text-sm italic">No programs available. Create one below.</p>
          ) : (
            <div className="space-y-2">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => handleSetActive(program.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-primary-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all text-left shadow-sm hover:shadow-md"
                >
                  <span className="font-bold text-gray-900">{program.name}</span>
                  {settings?.activeProgramId === program.id && (
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Programs */}
        <div className="card p-6 bg-white">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Programs</h2>

          {programs.length === 0 ? (
            <p className="text-gray-600 text-sm mb-4 italic">No programs yet - create one below</p>
          ) : (
            <div className="space-y-4 mb-6">
              {programs.map((program) => {
                const week = currentWeek(program.startDate, program.totalWeeks);

                return (
                  <div key={program.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editingProgramId === program.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingProgramName}
                              onChange={(e) => setEditingProgramName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename();
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                              className="input-field flex-1"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveRename}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-all"
                              title="Save"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-2 rounded-lg transition-all"
                              title="Cancel"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{program.name}</h3>
                            <button
                              onClick={() => handleStartRename(program.id, program.name)}
                              className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg transition-all"
                              title="Rename program"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          Week <span className="text-primary-600">{week}</span> of <span className="text-primary-600">{program.totalWeeks}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Start Date</label>
                        <input
                          type="date"
                          value={
                            program.startDate
                              ? new Date(program.startDate).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            handleUpdateProgramDate(program.id, new Date(e.target.value))
                          }
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">Total Weeks</label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={program.totalWeeks}
                          onChange={(e) =>
                            handleUpdateProgramWeeks(program.id, parseInt(e.target.value))
                          }
                          className="input-field"
                        />
                      </div>

                      <div className="bg-white/60 rounded-xl p-3">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-primary-600 transition-all duration-500 shadow-glow"
                            style={{
                              width: `${(week / Math.max(program.totalWeeks, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-2 justify-between ">
                        <button
                          onClick={() => handleViewProgram(program.id)}
                          className="text-primary-600 cursor-pointer hover:text-primary-700 hover:bg-primary-50 p-2 rounded-lg transition-all"
                          title="View program details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExportProgram(program.id, program.name)}
                          disabled={exportingProgramId === program.id}
                          className="text-primary-600 cursor-pointer hover:text-primary-700 hover:bg-primary-50 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Export program as CSV"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Delete program"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create New Programs */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Create New Program</p>

            {/* Import status message */}
            {importMessage && (
              <div
                className={`p-4 rounded-xl font-bold text-sm ${
                  importMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}
              >
                {importMessage.text}
              </div>
            )}

            {/* Import from CSV button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full flex items-center gap-3 px-5 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-green-200"
            >
              <Upload className="w-5 h-5" />
              <span>{isImporting ? 'Importing...' : 'Import from CSV'}</span>
            </button>

            <div className="border-t-2 border-gray-200 my-4"></div>

            <button
              onClick={() => handleCreateProgram('5day')}
              className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>5-Day Split</span>
            </button>

            <button
              onClick={() => handleCreateProgram('3day')}
              className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>3-Day Split</span>
            </button>

            <button
              onClick={() => handleCreateProgram('minimal')}
              className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Minimal Effort (4-Day)</span>
            </button>

            <button
              onClick={() => handleCreateProgram('upperlower')}
              className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Upper/Lower (4-Day)</span>
            </button>

            <div className="border-t-2 border-gray-200 my-4"></div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-red-200 hover:border-red-300"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete All Programs</span>
            </button>
          </div>
        </div>

        {/* Delete Single Program Confirmation Modal */}
        {deletingProgramId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="card p-6 max-w-sm w-full bg-white animate-slideUp">
              <h3 className="text-xl font-bold text-red-700 mb-3">
                Delete Program?
              </h3>
              <p className="text-gray-700 mb-6 font-medium">
                This will delete "{programs.find(p => p.id === deletingProgramId)?.name}" and all its templates. Your workout history will be preserved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingProgramId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProgram}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Programs Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="card p-6 max-w-sm w-full bg-white animate-slideUp">
              <h3 className="text-xl font-bold text-red-700 mb-3">
                Delete All Programs?
              </h3>
              <p className="text-gray-700 mb-6 font-medium">
                This will delete all programs and their templates. Your workout history will be
                preserved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllPrograms}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer Modal */}
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
