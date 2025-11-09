import { Calendar, Hash, Type } from 'lucide-react';

interface ProgramInfoSectionProps {
  programName: string;
  totalWeeks: number;
  startDate: Date;
  onProgramNameChange: (name: string) => void;
  onTotalWeeksChange: (weeks: number) => void;
  onStartDateChange: (date: Date) => void;
}

export function ProgramInfoSection({
  programName,
  totalWeeks,
  startDate,
  onProgramNameChange,
  onTotalWeeksChange,
  onStartDateChange,
}: ProgramInfoSectionProps) {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onStartDateChange(newDate);
    }
  };

  const handleWeeksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weeks = parseInt(e.target.value);
    if (!isNaN(weeks) && weeks >= 1 && weeks <= 52) {
      onTotalWeeksChange(weeks);
    }
  };

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4">
        Program Details
      </h2>

      <div className="space-y-4">
        {/* Program Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <Type className="w-4 h-4" />
            Program Name
          </label>
          <input
            type="text"
            value={programName}
            onChange={(e) => onProgramNameChange(e.target.value)}
            placeholder="e.g., My Custom Split"
            className="input-field w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Start Date & Total Weeks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={handleDateChange}
              className="input-field w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Hash className="w-4 h-4" />
              Total Weeks
            </label>
            <input
              type="number"
              value={totalWeeks}
              onChange={handleWeeksChange}
              min="1"
              max="52"
              className="input-field w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          You can add phase variations (weeks 5-8, 9-12) later after creating the program
        </p>
      </div>
    </div>
  );
}
