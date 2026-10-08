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
          subtitle: 'Clean system trash cans and external hard drive trashes safely',
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
          subtitle: 'Safety protections, developer portfolio, and cross-platform settings',
        };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header
      data-tauri-drag-region
      className="h-18 px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/75 dark:bg-[#0c111e]/75 backdrop-blur-2xl select-none transition-colors relative z-10 cursor-default"
    >
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

      <div data-tauri-drag-region className="flex-1 py-2">
        <h2 data-tauri-drag-region className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-sans flex items-center gap-2">
          {title}
        </h2>
        <p data-tauri-drag-region className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* System Pill */}
        {systemOverview && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-sm">
            <Laptop className="w-3.5 h-3.5 text-[#C5453E]" />
            <span className="font-bold text-slate-900 dark:text-white">{systemOverview.os_name} {systemOverview.os_version}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{systemOverview.arch}</span>
          </div>
        )}

        {/* Quick RAM boost button */}
        <button
          onClick={onQuickOptimizeRam}
          disabled={isOptimizingRam}
          className="btn-3d-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
          title="Flush Inactive Memory Pages"
        >
          <Zap className={`w-3.5 h-3.5 text-white ${isOptimizingRam ? 'animate-spin' : 'animate-bounce'}`} />
          <span>{isOptimizingRam ? 'Optimizing...' : 'Purge RAM'}</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn-3d-secondary p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
          title="Refresh System Status"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-3d-secondary p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>
    </header>
  );
};
export default Header;

