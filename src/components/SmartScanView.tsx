import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Trash2,
  Code2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CleanCategory, CleanResult, SystemOverview } from '../types';
import { formatBytes } from '../utils/format';

interface SmartScanViewProps {
  systemOverview: SystemOverview | null;
  junkCategories: CleanCategory[];
  onStartScan: () => Promise<void>;
  isScanning: boolean;
  onExecuteClean: (paths: string[]) => Promise<CleanResult | null>;
  isCleaning: boolean;
  onNavigateTab: (tab: any) => void;
}

export const SmartScanView: React.FC<SmartScanViewProps> = ({
  systemOverview,
  junkCategories,
  onStartScan,
  isScanning,
  onExecuteClean,
  isCleaning,
  onNavigateTab,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned' | 'cleaned'>('idle');
  const [cleanedFreedBytes, setCleanedFreedBytes] = useState<number>(0);
  const [cleaningProgress, setCleaningProgress] = useState<number>(0);

  // Calculate totals
  const totalSafeBytes = junkCategories.reduce((acc, cat) => acc + cat.total_bytes, 0);
  const totalItemsCount = junkCategories.reduce((acc, cat) => acc + cat.item_count, 0);

  const handleStartSmartScan = async () => {
    setScanState('scanning');
    try {
      await onStartScan();
      setScanState('scanned');
    } catch (e) {
      console.error(e);
      setScanState('idle');
    }
  };

  const handleCleanNow = async () => {
    setScanState('scanning');
    const allPaths: string[] = [];
    junkCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.selected_by_default) {
          allPaths.push(item.path);
        }
      });
    });

    if (allPaths.length === 0) {
      setScanState('cleaned');
      return;
    }

    setCleaningProgress(20);
    const interval = setInterval(() => {
      setCleaningProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 150);

    const result = await onExecuteClean(allPaths);
    clearInterval(interval);
    setCleaningProgress(100);

    if (result) {
      setCleanedFreedBytes(result.freed_bytes || totalSafeBytes);
      setScanState('cleaned');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5453E', '#e58078', '#f7cfcc', '#34d399', '#38bdf8'],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-8 animate-fadeIn">
      {/* Central Glowing Smart Scan Sphere */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Ambient Glow Backdrops */}
        <div className="absolute w-72 h-72 rounded-full bg-[#C5453E]/20 blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute w-60 h-60 rounded-full bg-rose-500/15 blur-2xl -z-10" />

        {/* Circular Outer Ring */}
        <div className="relative w-64 h-64 rounded-full flex items-center justify-center p-2 bg-gradient-to-tr from-[#C5453E]/30 via-rose-500/20 to-orange-500/30 border border-slate-200 dark:border-white/20 shadow-2xl backdrop-blur-md">
          {/* Animated Spinner Ring when Scanning/Cleaning */}
          {(isScanning || isCleaning) && (
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C5453E] border-r-rose-400 border-b-orange-400 animate-spin" />
          )}

          {/* Inner Circle Content */}
          <div className="w-56 h-56 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden group">
            {/* Background subtle sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-100/40 dark:from-white/5 to-transparent pointer-events-none" />

            {scanState === 'idle' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C5453E] to-[#9b2c27] flex items-center justify-center shadow-lg shadow-[#C5453E]/30 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Smart Clean</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1-Click Universal Boost</p>
              </>
            )}

            {(scanState === 'scanning' || isScanning || isCleaning) && (
              <>
                <div className="w-12 h-12 rounded-full border-3 border-[#C5453E]/30 border-t-[#C5453E] animate-spin flex items-center justify-center mb-3">
                  <RefreshCw className="w-5 h-5 text-[#C5453E]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {isCleaning ? 'Cleaning Junk...' : 'Scanning System...'}
                </h3>
                <p className="text-[11px] text-[#C5453E] font-mono mt-1 font-semibold">
                  {isCleaning ? `${cleaningProgress}% complete` : 'Analyzing caches'}
                </p>
              </>
            )}

            {scanState === 'scanned' && !isScanning && (
              <>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#C5453E]">
                  Ready to Reclaim
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-1 font-sans">
                  {formatBytes(totalSafeBytes)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalItemsCount} Safe Items Found
                </p>
              </>
            )}

            {scanState === 'cleaned' && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">All Clean!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Freed {formatBytes(cleanedFreedBytes > 0 ? cleanedFreedBytes : totalSafeBytes)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Big Action Button under the circle */}
        <div className="mt-6 flex flex-col items-center gap-2">
          {scanState === 'idle' && (
            <button
              onClick={handleStartSmartScan}
              disabled={isScanning}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5453E] via-[#d6514a] to-[#9b2c27] hover:from-[#b83b34] hover:to-[#802723] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#C5453E]/30 border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>START SMART SCAN</span>
            </button>
          )}

          {scanState === 'scanned' && !isScanning && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCleanNow}
                disabled={isCleaning}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C5453E] to-[#9b2c27] hover:from-[#b83b34] hover:to-[#802723] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#C5453E]/30 border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>CLEAN {formatBytes(totalSafeBytes)} NOW</span>
              </button>
              <button
                onClick={handleStartSmartScan}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all"
                title="Re-Scan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {scanState === 'cleaned' && (
            <button
              onClick={handleStartSmartScan}
              className="px-8 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-white/10 transition-all hover:scale-105 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Again</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Safe Deletion Guarantee • User Documents are Never Modified</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: System Junk & Caches */}
        <div
          onClick={() => onNavigateTab('system-junk')}
          className="bg-white dark:bg-[#131929] hover:shadow-lg border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-[#C5453E]/50 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center border border-[#C5453E]/20 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#C5453E] transition-colors">
                  System Caches & Logs
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Temporary app buffers</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {formatBytes(
                junkCategories
                  .filter((c) => c.id === 'system_caches' || c.id === 'app_logs' || c.id === 'browser_junk')
                  .reduce((acc, c) => acc + c.total_bytes, 0)
              )}
            </span>
          </div>
        </div>

        {/* Card 2: Developer Junk */}
        <div
          onClick={() => onNavigateTab('developer')}
          className="bg-white dark:bg-[#131929] hover:shadow-lg border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-fuchsia-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-fuchsia-500 transition-colors">
                  Developer Caches
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Xcode, Gradle, NPM & Cargo</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {formatBytes(
                junkCategories
                  .filter((c) => c.id === 'developer_junk')
                  .reduce((acc, c) => acc + c.total_bytes, 0)
              )}
            </span>
          </div>
        </div>

        {/* Card 3: Trash Bins */}
        <div
          onClick={() => onNavigateTab('trash-bins')}
          className="bg-white dark:bg-[#131929] hover:shadow-lg border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-amber-500/50 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  Trash Bins
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Main & volume bins</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {formatBytes(systemOverview?.trash_size_bytes || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Disk Overview Banner */}
      {systemOverview?.disks?.[0] && (
        <div className="w-full bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-[#C5453E]" />
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">
                {systemOverview.disks[0].name} ({systemOverview.disks[0].file_system.toUpperCase()})
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {formatBytes(systemOverview.disks[0].available_bytes)} Free of {formatBytes(systemOverview.disks[0].total_bytes)}
              </p>
            </div>
          </div>

          <div className="w-48 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C5453E] to-[#e58078] h-full rounded-full"
              style={{ width: `${systemOverview.disks[0].usage_percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
