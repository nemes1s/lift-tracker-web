import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react';
import { db } from '../../db/database';
import type { ExerciseData } from '../../pages/ProgramBuilderView';
import { v4 as uuidv4 } from 'uuid';
import { AddExerciseForm } from './AddExerciseForm';

interface ExerciseListProps {
  exercises: ExerciseData[];
  onUpdateExercises: (exercises: ExerciseData[]) => void;
}

export function ExerciseList({ exercises, onUpdateExercises }: ExerciseListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ sets: 3, reps: '8-10', notes: '' });
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);

  // Load exercise names from database for autocomplete
  useEffect(() => {
    const loadExerciseNames = async () => {
      const templates = await db.exerciseTemplates.toArray();
      const instances = await db.exerciseInstances.toArray();

      const names = new Set<string>();
      templates.forEach(t => names.add(t.name));
      instances.forEach(i => names.add(i.name));

      setExerciseNames(Array.from(names).sort());
    };

    loadExerciseNames();
  }, []);

  const handleAddExercise = (name: string, sets: number, reps: string, notes?: string) => {
    const newExercise: ExerciseData = {
      id: uuidv4(),
      name,
      targetSets: sets,
      targetReps: reps,
      notes,
    };

    onUpdateExercises([...exercises, newExercise]);
    setShowAddForm(false);
  };

  const handleRemoveExercise = (id: string) => {
    onUpdateExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleStartEdit = (exercise: ExerciseData) => {
    setEditingExerciseId(exercise.id);
    setEditForm({
      sets: exercise.targetSets,
      reps: exercise.targetReps,
      notes: exercise.notes || '',
    });
  };

  const handleSaveEdit = (id: string) => {
    onUpdateExercises(
      exercises.map(ex =>
        ex.id === id
          ? { ...ex, targetSets: editForm.sets, targetReps: editForm.reps, notes: editForm.notes || undefined }
          : ex
      )
    );
    setEditingExerciseId(null);
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    onUpdateExercises(newExercises);
  };

  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    onUpdateExercises(newExercises);
  };

  return (
    <div className="space-y-3">
      {/* Exercise List */}
      {exercises.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
          No exercises yet
        </p>
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise, index) => {
            const isEditing = editingExerciseId === exercise.id;

            return (
              <div
                key={exercise.id}
                className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
              >
                {/* Drag Handle & Order Controls */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                    >
                      <span className="text-xs">▲</span>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === exercises.length - 1}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                    >
                      <span className="text-xs">▼</span>
                    </button>
                  </div>
                </div>

                {/* Exercise Details */}
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {exercise.name}
                  </p>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400">Sets</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editForm.sets}
                            onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) || 1 })}
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 dark:text-gray-400">Reps</label>
                          <input
                            type="text"
                            value={editForm.reps}
                            onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                            placeholder="e.g., 8-10"
                            className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Notes (optional)</label>
                        <input
                          type="text"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="e.g., Focus on form"
                          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-1">
                        {exercise.targetSets} × {exercise.targetReps}
                      </p>
                      {exercise.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(exercise.id)}
                        className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(exercise)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Exercise Form */}
      {showAddForm ? (
        <AddExerciseForm
          exerciseNames={exerciseNames}
          onAdd={handleAddExercise}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg transition-all font-bold border-2 border-dashed border-primary-300 dark:border-primary-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exercise</span>
        </button>
      )}
    </div>
  );
}
