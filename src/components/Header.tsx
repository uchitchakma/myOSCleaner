import React from 'react';
import {
  RotateCw,
  Sun,
  Moon,
  Laptop,
  Zap,
} from 'lucide-react';
import { NavTab, SystemOverview } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  systemOverview: SystemOverview | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onQuickOptimizeRam: () => void;
  isOptimizingRam: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  systemOverview,
  onRefresh,
  isRefreshing,
  theme,
  setTheme,
  onQuickOptimizeRam,
  isOptimizingRam,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'smart-scan':
        return {
          title: 'Smart Scan',
          subtitle: 'Comprehensive 1-Click System Optimization & Deep Space Reclamation',
        };
      case 'system-junk':
        return {
          title: 'System & Application Junk',
          subtitle: 'Safely eliminate user caches, logs, browser history buffers, and crash dumps',
        };
      case 'trash-bins':
        return {
          title: 'Trash Bins & Discarded Files',
          subtitle: 'Clean macOS trash cans and external hard drive trashes safely',
        };
      case 'large-files':
        return {
          title: 'Large & Old Files Explorer',
          subtitle: 'Locate heavy files, old media, and obsolete installer disk images',
        };
      case 'uninstaller':
        return {
          title: 'Application Uninstaller & Leftover Cleaner',
          subtitle: 'Completely remove applications along with hidden system leftovers',
        };
      case 'developer':
        return {
          title: 'Developer Workspace Optimizer',
          subtitle: 'Reclaim gigabytes from abandoned node_modules, target, and gradle builds',
        };
      case 'ram-booster':
        return {
          title: 'Memory Booster & Hardware Diagnostics',
          subtitle: 'Real-time RAM analysis, memory purging, and CPU performance monitoring',
        };
      case 'settings':
        return {
          title: 'Application Preferences & Info',
          subtitle: 'Safety protections, open source license, and cross-platform settings',
        };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 dark:border-slate-800/80 bg-slate-900/40 backdrop-blur-md select-none transition-colors">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight font-sans flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 truncate max-w-lg">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* System Pill */}
        {systemOverview && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-white/5 text-xs text-slate-300">
            <Laptop className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-white">{systemOverview.os_name} {systemOverview.os_version}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{systemOverview.arch}</span>
          </div>
        )}

        {/* Quick RAM boost button */}
        <button
          onClick={onQuickOptimizeRam}
          disabled={isOptimizingRam}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          title="Flush Inactive Memory Pages"
        >
          <Zap className={`w-3.5 h-3.5 text-purple-400 ${isOptimizingRam ? 'animate-bounce' : ''}`} />
          <span>{isOptimizingRam ? 'Optimizing...' : 'Purge RAM'}</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh System Status"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};
