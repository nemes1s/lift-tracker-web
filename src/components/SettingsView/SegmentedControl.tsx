interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

export function SegmentedControl<T extends string>({ value, onChange, options }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-lg border-2 border-gray-200 dark:border-slate-700 divide-x-2 divide-gray-200 dark:divide-slate-700 overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
