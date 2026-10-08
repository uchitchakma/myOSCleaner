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
      {/* Top Main Boost Card */}
      <div className="bg-gradient-to-r from-[#C5453E]/10 via-rose-500/10 to-orange-500/10 border border-[#C5453E]/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5453E]/10 blur-3xl -z-10 rounded-full" />

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
                className="stroke-slate-200 dark:stroke-slate-800"
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
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C5453E" />
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
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatBytes(ramFreeBytes)} Available
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Using {formatBytes(ramUsedBytes)} of {formatBytes(ramTotalBytes)} unified memory
            </p>

            {boostResult && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>{boostResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Big 1-Click Free RAM Button */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
          <button
            onClick={handleBoost}
            disabled={isOptimizing}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#C5453E]/30 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2.5"
          >
            <Zap className={`w-5 h-5 text-white ${isOptimizing ? 'animate-spin' : 'animate-bounce'}`} />
            <span>{isOptimizing ? 'Flushing Inactive Pages...' : 'FREE UP RAM NOW'}</span>
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5453E]" />
            Flushes background buffers and compacts memory
          </span>
        </div>
      </div>

      {/* Hardware Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Processor (CPU)</span>
            </div>
            <span className="font-mono font-bold text-sm text-blue-500">{cpuUsage.toFixed(1)}%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(cpuUsage, 100)}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Chip Model:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]">
                {systemOverview?.cpu_brand || 'Processor'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Core Count:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {systemOverview?.cpu_cores || 8} Active Cores
              </span>
            </div>
          </div>
        </div>

        {/* Swap / Virtual Memory Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Virtual Swap</span>
            </div>
            <span className="font-mono font-bold text-sm text-purple-500">
              {formatBytes(systemOverview?.used_swap_bytes || 0)}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full"
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
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {formatBytes(systemOverview?.total_swap_bytes || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>System Uptime:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5453E]" />
                {formatUptime(systemOverview?.uptime_seconds || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Volume Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#C5453E]/10 text-[#C5453E] border border-[#C5453E]/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Primary Drive</span>
            </div>
            <span className="font-mono font-bold text-sm text-[#C5453E]">
              {systemOverview?.disks?.[0]?.usage_percent.toFixed(0)}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C5453E] to-[#e58078] h-full rounded-full"
              style={{ width: `${systemOverview?.disks?.[0]?.usage_percent || 50}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Available Space:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {formatBytes(systemOverview?.disks?.[0]?.available_bytes || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Total Capacity:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {formatBytes(systemOverview?.disks?.[0]?.total_bytes || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
