import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  workoutDates: Set<string>; // Set of date strings in YYYY-MM-DD format
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

export function CalendarGrid({
  currentDate,
  onDateChange,
  workoutDates,
  selectedDate,
  onDateClick,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Generate calendar grid
  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days in month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateChange(newDate);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const hasWorkout = (day: number): boolean => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return workoutDates.has(dateKey);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card p-5 bg-white">
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(year, month, day);
          const today = isToday(day);
          const selected = isSelected(day);
          const workout = hasWorkout(day);

          return (
            <button
              key={day}
              onClick={() => onDateClick(date)}
              className={`
                aspect-square rounded-xl font-semibold text-sm
                transition-all duration-200 relative
                ${selected
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : today
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
                ${workout ? 'ring-2 ring-green-500 ring-offset-1' : ''}
              `}
            >
              <span className="block">{day}</span>
              {workout && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    selected ? 'bg-white' : 'bg-green-500'
                  }`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary-100 border-2 border-primary-200" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-white ring-2 ring-green-500" />
          <span>Has workout</span>
        </div>
      </div>
    </div>
  );
}
