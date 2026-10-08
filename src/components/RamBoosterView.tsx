import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  HardDrive,
  Clock,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemOverview, RamBoostResult } from '../types';
import { formatBytes } from '../utils/format';

interface RamBoosterViewProps {
  systemOverview: SystemOverview | null;
  onOptimizeRam: () => Promise<RamBoostResult | null>;
  isOptimizing: boolean;
  onRefresh: () => Promise<void>;
}

export const RamBoosterView: React.FC<RamBoosterViewProps> = ({
  systemOverview,
  onOptimizeRam,
  isOptimizing,
  onRefresh,
}) => {
  const [boostResult, setBoostResult] = useState<RamBoostResult | null>(null);

  const ramUsedBytes = systemOverview?.used_memory_bytes || 0;
  const ramTotalBytes = systemOverview?.total_memory_bytes || 1;
  const ramFreeBytes = systemOverview?.free_memory_bytes || 0;
  const ramUsagePct = systemOverview?.memory_usage_percent || 0;
  const cpuUsage = systemOverview?.cpu_usage_percent || 0;

  const handleBoost = async () => {
    const res = await onOptimizeRam();
    if (res) {
      setBoostResult(res);
      await onRefresh();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#C5453E', '#e58078', '#f7cfcc', '#a855f7'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} minutes`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Main Boost 3D Glass Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative isolate overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5453E]/10 via-transparent to-transparent pointer-events-none rounded-3xl" />

        {/* Left Side: RAM Usage Donut Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Animated Gauge Ring */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                className="stroke-slate-200/80 dark:stroke-slate-800"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress */}
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="url(#brandGrad)"
                strokeWidth="12"
                strokeDasharray="301.59"
                strokeDashoffset={301.59 - (301.59 * ramUsagePct) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(197,69,62,0.5)]"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#db554e" />
                  <stop offset="50%" stopColor="#C5453E" />
                  <stop offset="100%" stopColor="#e58078" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Percentage */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {ramUsagePct.toFixed(0)}%
              </span>
              <span className="text-[10px] uppercase font-bold text-[#C5453E]">RAM USED</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5453E]">
              System Memory Status
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatBytes(ramFreeBytes)} Available
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Using {formatBytes(ramUsedBytes)} of {formatBytes(ramTotalBytes)} unified memory
            </p>

            {boostResult && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{boostResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Big 1-Click Free RAM 3D Button */}
        <div className="flex flex-col items-center sm:items-end gap-2.5 w-full md:w-auto">
          <button
            onClick={handleBoost}
            disabled={isOptimizing}
            className="btn-3d-primary w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wider uppercase shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-5 h-5 text-white ${isOptimizing ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{isOptimizing ? 'Flushing Inactive Pages...' : 'FREE UP RAM NOW'}</span>
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-[#C5453E]" />
            Flushes background buffers and compacts memory
          </span>
        </div>
      </div>

      {/* Hardware Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Processor (CPU)</span>
            </div>
            <span className="font-mono font-black text-sm text-blue-500">{cpuUsage.toFixed(1)}%</span>
          </div>

          <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-300/40 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              style={{ width: `${Math.min(cpuUsage, 100)}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Chip Model:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[160px]">
                {systemOverview?.cpu_brand || 'Processor'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Core Count:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {systemOverview?.cpu_cores || 8} Active Cores
              </span>
            </div>
          </div>
        </div>

        {/* Swap / Virtual Memory Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">Virtual Swap</span>
            </div>
            <span className="font-mono font-black text-sm text-purple-500">
              {formatBytes(systemOverview?.used_swap_bytes || 0)}
            </span>
          </div>

          <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-300/40 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              style={{
                width: `${
                  systemOverview?.total_swap_bytes
                    ? ((systemOverview.used_swap_bytes / systemOverview.total_swap_bytes) * 100).toFixed(0)
                    : 10
                }%`,
              }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Allocated Swap:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {formatBytes(systemOverview?.total_swap_bytes || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>System Uptime:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5453E]" />
                {formatUptime(systemOverview?.uptime_seconds || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Volume Cards (Internal & External SSD/HDD) */}
        {systemOverview?.disks && systemOverview.disks.length > 0 ? (
          systemOverview.disks.map((disk, idx) => (
            <div
              key={`${disk.mount_point}-${idx}`}
              className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden group hover:border-[#C5453E]/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border ${
                      disk.is_internal
                        ? 'bg-[#C5453E]/15 text-[#C5453E] border-[#C5453E]/30'
                        : 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
                    }`}
                  >
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {disk.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${
                          disk.is_internal
                            ? 'bg-[#C5453E]/10 text-[#C5453E] border-[#C5453E]/25'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25'
                        }`}
                      >
                        {disk.disk_type || (disk.is_internal ? 'Internal SSD' : 'External Drive')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {disk.mount_point} {disk.file_system ? `• ${disk.file_system}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-[#C5453E]">
                  {disk.usage_percent.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-slate-200/80 dark:bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-[1px] shadow-inner border border-slate-300/40 dark:border-white/5">
                <div
                  className={`h-full rounded-full shadow-[0_0_8px_rgba(197,69,62,0.5)] ${
                    disk.is_internal
                      ? 'bg-gradient-to-r from-[#C5453E] to-[#e58078]'
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(disk.usage_percent, 100)}%` }}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Available Space:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
                    {formatBytes(disk.available_bytes)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Total Capacity:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono">
                    {formatBytes(disk.total_bytes)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-3xl p-5 space-y-2 text-xs text-slate-500">
            <span>No active disks detected.</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default RamBoosterView;

