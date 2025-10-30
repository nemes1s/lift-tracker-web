import { Outlet, Link, useLocation } from 'react-router-dom';
import { Flame, Calendar, TrendingUp, Settings } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-slate-700/50 shadow-2xl safe-area-pb">
        <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
          <NavItem to="/" icon={Flame} label="Today" isActive={isActive('/')} tourKey="nav-today" />
          <NavItem to="/calendar" icon={Calendar} label="Calendar" isActive={isActive('/calendar')} tourKey="nav-calendar" />
          <NavItem to="/progress" icon={TrendingUp} label="Progress" isActive={isActive('/progress')} tourKey="nav-progress" />
          <NavItem to="/settings" icon={Settings} label="Settings" isActive={isActive('/settings')} tourKey="nav-settings" />
        </div>
      </nav>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  tourKey?: string;
}

function NavItem({ to, icon: Icon, label, isActive, tourKey }: NavItemProps) {
  return (
    <Link
      to={to}
      data-tour={tourKey}
      className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      {isActive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 dark:bg-primary-400 rounded-b-full" />
      )}
      <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
        <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
      </div>
      <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </Link>
  );
}
