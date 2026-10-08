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
      iconGradient: 'from-[#ff635b] via-[#C5453E] to-[#93201b]',
      glowShadow: 'shadow-[0_4px_14px_rgba(197,69,62,0.45)]',
      badge: junkCount > 0 ? `${junkCount}` : undefined,
      description: '1-Click Complete System Cleanup',
    },
    {
      id: 'system-junk' as NavTab,
      label: 'System Junk',
      icon: Layers,
      iconGradient: 'from-blue-400 via-indigo-500 to-indigo-700',
      glowShadow: 'shadow-[0_4px_14px_rgba(99,102,241,0.45)]',
      description: 'Caches, Logs & Web Buffers',
    },
    {
      id: 'trash-bins' as NavTab,
      label: 'Trash Bins',
      icon: Trash2,
      iconGradient: 'from-amber-400 via-orange-500 to-rose-600',
      glowShadow: 'shadow-[0_4px_14px_rgba(245,158,11,0.45)]',
      badge: systemOverview?.trash_size_bytes ? formatBytes(systemOverview.trash_size_bytes) : undefined,
      description: 'Empty Bin & External Drives',
    },
    {
      id: 'large-files' as NavTab,
      label: 'Large & Old Files',
      icon: FolderArchive,
      iconGradient: 'from-purple-400 via-purple-600 to-indigo-700',
      glowShadow: 'shadow-[0_4px_14px_rgba(168,85,247,0.45)]',
      description: 'Recover Heavy Disk Space',
    },
    {
      id: 'uninstaller' as NavTab,
      label: 'App Uninstaller',
      icon: HardDrive,
      iconGradient: 'from-emerald-400 via-teal-500 to-teal-700',
      glowShadow: 'shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      description: 'Clean Apps & Leftover Files',
    },
    {
      id: 'developer' as NavTab,
      label: 'Developer Space',
      icon: Code2,
      iconGradient: 'from-fuchsia-400 via-pink-500 to-rose-700',
      glowShadow: 'shadow-[0_4px_14px_rgba(236,72,153,0.45)]',
      description: 'node_modules & Build Caches',
    },
    {
      id: 'ram-booster' as NavTab,
      label: 'RAM & Performance',
      icon: Cpu,
      iconGradient: 'from-cyan-400 via-sky-500 to-blue-700',
      glowShadow: 'shadow-[0_4px_14px_rgba(6,182,212,0.45)]',
      description: 'Memory Boost & CPU Stats',
    },
  ];

  const [selectedDiskIdx, setSelectedDiskIdx] = React.useState(0);
  const disks = systemOverview?.disks || [];
  const disk = disks.length > 0 ? disks[selectedDiskIdx % disks.length] : null;
  const ramUsagePct = systemOverview?.memory_usage_percent || 0;

  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-white/80 dark:bg-[#0c111e]/85 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 select-none p-3.5 pt-3.5 transition-colors shadow-lg z-20">
      <div>
        {/* macOS Traffic Lights */}
        <div data-tauri-drag-region className="flex items-center gap-2 px-1.5 py-1 mb-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs" />
        </div>

        {/* 3D App Title Header with Drag Region */}
        <div
          data-tauri-drag-region
          className="flex items-center gap-3 px-2 py-1.5 mb-2 group cursor-default"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl shadow-[0_8px_20px_rgba(197,69,62,0.35)] transition-transform duration-300 group-hover:scale-105">
            <img
              src="/app-icon.png"
              alt="myOSCleaner App Icon"
              className="w-10 h-10 object-contain drop-shadow-md rounded-2xl pointer-events-none"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                myOSCleaner
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Universal Space Optimizer</p>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-1 pt-1">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            CLEANUP MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive
                    ? 'btn-3d-primary shadow-[0_8px_20px_rgba(197,69,62,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  {/* 3D Glossy Glassmorphic Icon Squircle Badge */}
                  <div
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center p-[1px] transition-all duration-300 group-hover:scale-110 shrink-0 overflow-hidden border border-white/30 dark:border-white/20 bg-gradient-to-b ${item.iconGradient} ${item.glowShadow} ${
                      isActive
                        ? 'ring-2 ring-white/70 shadow-[0_0_16px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.35)]'
                        : 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.35)]'
                    }`}
                  >
                    {/* Top Specular Glossy Reflex / Highlight Arc */}
                    <div className="absolute inset-x-1 top-0.5 h-3 rounded-t-lg bg-gradient-to-b from-white/65 via-white/20 to-transparent pointer-events-none" />

                    {/* Bottom Caustic Rim Accent */}
                    <div className="absolute inset-x-1 bottom-0.5 h-1 rounded-b-lg bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />

                    {/* Crisp Drop-Shadowed Icon */}
                    <Icon className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] relative z-10" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
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
        <div className="glass-panel rounded-2xl p-3 space-y-2.5 text-[11px] shadow-sm">
          {/* Storage */}
          <div
            onClick={() => {
              if (disks.length > 1) {
                setSelectedDiskIdx((prev) => (prev + 1) % disks.length);
              }
            }}
            className={disks.length > 1 ? 'cursor-pointer group' : ''}
            title={disks.length > 1 ? `Click to switch disk (${selectedDiskIdx + 1}/${disks.length}): ${disk?.name}` : undefined}
          >
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold truncate max-w-[130px]">
                <HardDrive className={`w-3 h-3 ${disk?.is_internal ? 'text-[#C5453E]' : 'text-indigo-500'}`} />
                <span className="truncate">{disk?.name || 'Disk Free'}</span>
                {disks.length > 1 && (
                  <span className="text-[9px] font-black px-1 rounded bg-[#C5453E]/15 text-[#C5453E]">
                    {selectedDiskIdx + 1}/{disks.length}
                  </span>
                )}
              </span>
              <span className="text-slate-900 dark:text-white font-bold font-mono text-[10px]">
                {disk ? formatBytes(disk.available_bytes) : '...'}
              </span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 h-2 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-300/40 dark:border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,69,62,0.4)] ${
                  disk?.is_internal
                    ? 'bg-gradient-to-r from-[#C5453E] to-[#e58078]'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${Math.min(disk?.usage_percent || 50, 100)}%` }}
              />
            </div>
          </div>

          {/* RAM */}
          <div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Cpu className="w-3 h-3 text-purple-500" /> RAM Used
              </span>
              <span className="text-slate-900 dark:text-white font-bold font-mono">
                {ramUsagePct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 h-2 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-300/40 dark:border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ramUsagePct > 80
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                    : 'bg-gradient-to-r from-purple-400 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                }`}
                style={{ width: `${Math.min(ramUsagePct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Safety & Settings button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Shield Active</span>
          </div>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'btn-3d-primary text-white shadow-sm'
                : 'btn-3d-secondary text-slate-600 dark:text-slate-400'
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
export default Sidebar;

