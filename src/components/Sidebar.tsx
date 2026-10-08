import React from 'react';
import {
  Sparkles,
  Trash2,
  HardDrive,
  Layers,
  Cpu,
  Code2,
  Settings,
  FolderArchive,
  ShieldCheck,
} from 'lucide-react';
import { NavTab, SystemOverview } from '../types';
import { formatBytes } from '../utils/format';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  systemOverview: SystemOverview | null;
  junkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemOverview,
  junkCount,
}) => {
  const navItems = [
    {
      id: 'smart-scan' as NavTab,
      label: 'Smart Scan',
      icon: Sparkles,
      badge: junkCount > 0 ? `${junkCount}` : undefined,
      color: 'from-[#C5453E] to-[#9b2c27]',
      description: '1-Click Complete System Cleanup',
    },
    {
      id: 'system-junk' as NavTab,
      label: 'System Junk',
      icon: Layers,
      color: 'from-[#C5453E] to-[#e58078]',
      description: 'Caches, Logs & Web Buffers',
    },
    {
      id: 'trash-bins' as NavTab,
      label: 'Trash Bins',
      icon: Trash2,
      badge: systemOverview?.trash_size_bytes ? formatBytes(systemOverview.trash_size_bytes) : undefined,
      color: 'from-amber-500 to-orange-600',
      description: 'Empty Bin & External Drives',
    },
    {
      id: 'large-files' as NavTab,
      label: 'Large & Old Files',
      icon: FolderArchive,
      color: 'from-purple-500 to-pink-500',
      description: 'Recover Heavy Disk Space',
    },
    {
      id: 'uninstaller' as NavTab,
      label: 'App Uninstaller',
      icon: HardDrive,
      color: 'from-emerald-500 to-teal-600',
      description: 'Clean Apps & Leftover Files',
    },
    {
      id: 'developer' as NavTab,
      label: 'Developer Space',
      icon: Code2,
      color: 'from-fuchsia-500 to-rose-600',
      description: 'node_modules & Build Caches',
    },
    {
      id: 'ram-booster' as NavTab,
      label: 'RAM & Performance',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-600',
      description: 'Memory Boost & CPU Stats',
    },
  ];

  const disk = systemOverview?.disks?.[0];
  const ramUsagePct = systemOverview?.memory_usage_percent || 0;

  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-white dark:bg-[#0d121f] border-r border-slate-200 dark:border-white/10 select-none p-3 transition-colors">
      <div>
        {/* App Title Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C5453E] via-[#d6514a] to-[#9b2c27] shadow-lg shadow-[#C5453E]/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                myOSCleaner
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Universal Space Optimizer</p>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            CLEANUP MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#C5453E] text-white shadow-md shadow-[#C5453E]/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`p-1.5 rounded-lg transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`relative z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Cards & Settings */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10">
        {/* Real-time Storage & RAM Mini Monitor */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 border border-slate-200 dark:border-white/5 space-y-2 text-[11px]">
          {/* Storage */}
          <div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <HardDrive className="w-3 h-3 text-[#C5453E]" /> Disk Free
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {disk ? formatBytes(disk.available_bytes) : '...'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#C5453E] to-[#e58078] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(disk?.usage_percent || 50, 100)}%` }}
              />
            </div>
          </div>

          {/* RAM */}
          <div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Cpu className="w-3 h-3 text-purple-500" /> RAM Used
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {ramUsagePct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ramUsagePct > 80
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : 'bg-gradient-to-r from-purple-400 to-pink-500'
                }`}
                style={{ width: `${Math.min(ramUsagePct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Safety & Settings button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Shield Active</span>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#C5453E]/20 text-[#C5453E] border border-[#C5453E]/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
