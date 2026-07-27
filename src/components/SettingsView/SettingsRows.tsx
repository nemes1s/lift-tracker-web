import type { ReactNode } from 'react';

export function SettingsRows({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-gray-100 dark:divide-slate-700">{children}</div>;
}
