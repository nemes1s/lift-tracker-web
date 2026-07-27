import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface SettingsGroupProps {
  icon: LucideIcon;
  title: string;
  description: string;
  defaultOpen?: boolean;
  /**
   * When true, the header and children share a single card (children must be plain
   * rows, not their own `.card`). When false, the header is its own card and the
   * children keep their individual cards, stacked below when expanded.
   */
  merged?: boolean;
  children: ReactNode;
}

export function SettingsGroup({
  icon: Icon,
  title,
  description,
  defaultOpen = false,
  merged = false,
  children,
}: SettingsGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const header = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-3 text-left"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider truncate">
            {title}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronDown
        className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ease-out shrink-0 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );

  const collapsible = (content: ReactNode, innerClassName: string) => (
    <div
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      inert={!open}
    >
      <div className="overflow-hidden">
        <div className={innerClassName}>{content}</div>
      </div>
    </div>
  );

  if (merged) {
    return (
      <section className="card p-6 bg-white dark:bg-slate-800">
        {header}
        {collapsible(children, 'pt-4 mt-4 border-t border-gray-100 dark:border-slate-700')}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="card p-6 bg-white dark:bg-slate-800">{header}</div>
      {collapsible(children, 'space-y-6 pt-1 pb-2')}
    </section>
  );
}
