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
      color: 'from-blue-500 to-indigo-600',
      description: '1-Click Complete System Cleanup',
    },
    {
      id: 'system-junk' as NavTab,
      label: 'System Junk',
      icon: Layers,
      color: 'from-sky-500 to-cyan-500',
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
      color: 'from-violet-500 to-purple-600',
      description: 'Memory Boost & CPU Stats',
    },
  ];

  const disk = systemOverview?.disks?.[0];
  const ramUsagePct = systemOverview?.memory_usage_percent || 0;

  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-xl border-r border-white/10 dark:border-slate-800 text-slate-300 select-none p-3 transition-colors">
      <div>
        {/* App Title Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-white font-sans">myOSCleaner</h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Universal Space Optimizer</p>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    ? 'bg-gradient-to-r text-white shadow-md shadow-blue-600/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-20 border border-white/20`} />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`p-1.5 rounded-lg transition-transform group-hover:scale-105 ${
                      isActive
                        ? `bg-gradient-to-tr ${item.color} text-white shadow-sm`
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-white'
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
                        : 'bg-slate-800 text-slate-300'
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
      <div className="space-y-3 pt-3 border-t border-white/10 dark:border-slate-800">
        {/* Real-time Storage & RAM Mini Monitor */}
        <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 space-y-2 text-[11px]">
          {/* Storage */}
          <div>
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <HardDrive className="w-3 h-3 text-cyan-400" /> Disk Free
              </span>
              <span className="text-white font-semibold">
                {disk ? formatBytes(disk.available_bytes) : '...'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(disk?.usage_percent || 50, 100)}%` }}
              />
            </div>
          </div>

          {/* RAM */}
          <div>
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Cpu className="w-3 h-3 text-purple-400" /> RAM Used
              </span>
              <span className="text-white font-semibold">
                {ramUsagePct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Shield Active</span>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
