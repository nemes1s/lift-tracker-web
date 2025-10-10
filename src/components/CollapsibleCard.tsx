import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

export function CollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary-600">{icon}</div>}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {badge !== undefined && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
              {badge}
            </span>
          )}
        </div>
        <div className="text-gray-500">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t-2 border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
