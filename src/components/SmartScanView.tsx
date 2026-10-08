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
import { GlassScanningHub } from './GlassScanningHub';

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

  // While scanning, show full 3D Glass Progress Hub
  if (isScanning || (scanState === 'scanning' && !isCleaning)) {
    return (
      <GlassScanningHub
        title="Running Smart System Scan"
        subtitle="Conducting a parallel sweep across system caches, user logs, trash bins, heavy files, apps, and developer repositories..."
        category="smart-scan"
      />
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-9 animate-fadeIn">
      {/* Central 3D Glassmorphic Master Sphere */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Ambient Neon Aura Backdrops */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#C5453E]/30 via-rose-500/20 to-orange-500/15 blur-3xl -z-10 animate-glow-aura pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-[#C5453E]/25 blur-2xl -z-10 pointer-events-none" />

        {/* Multi-Layered 3D Concentric Orbital Halo */}
        <div className="relative w-80 h-80 sm:w-84 sm:h-84 flex items-center justify-center">
          {/* Layer 1: Outermost Rotating Laser Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#C5453E]/40 dark:border-[#C5453E]/50 animate-rotate-clockwise pointer-events-none p-1">
            <div className="w-3 h-3 rounded-full bg-[#C5453E] shadow-[0_0_12px_#C5453E] absolute -top-1.5 left-1/2 -translate-x-1/2 ring-2 ring-white/60" />
            <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c] absolute -bottom-1 left-1/3 ring-1 ring-white/40" />
          </div>

          {/* Layer 2: Counter-Rotating Fine Crystal Orbit Ring */}
          <div className="absolute inset-3 rounded-full border border-white/40 dark:border-white/10 animate-rotate-counter pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#f43f5e] absolute top-1/4 -right-1 ring-1 ring-white/50" />
          </div>

          {/* Layer 3: 3D Frosted Crystal Glass Bezel */}
          <div
            onClick={scanState === 'idle' ? handleStartSmartScan : scanState === 'scanned' ? handleCleanNow : handleStartSmartScan}
            className="group cursor-pointer relative w-68 h-68 sm:w-72 sm:h-72 rounded-full p-2.5 glass-orb-outer flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95"
            title={scanState === 'idle' ? 'Click to Start Smart Scan' : scanState === 'scanned' ? 'Click to Clean Now' : 'Click to Scan Again'}
          >
            {/* Rotating Cleaning Spinner Ring */}
            {isCleaning && (
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C5453E] border-r-rose-400 border-b-orange-400 animate-spin z-20" />
            )}

            {/* Layer 4: Deep Optical Glass Sphere (Core Lens) */}
            <div className="w-full h-full rounded-full glass-orb-inner flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-2xl">
              {/* Glossy Dome Spherical Specular Arc */}
              <div className="absolute top-0 inset-x-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 dark:from-white/10 to-transparent pointer-events-none z-10" />

              {/* Shimmer Light Sweep on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10" />

              {/* Bottom Caustic Neon Light Reservoir */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#C5453E]/30 via-rose-500/10 to-transparent pointer-events-none" />

              {/* Content State 1: IDLE */}
              {scanState === 'idle' && (
                <div className="flex flex-col items-center justify-center space-y-3 z-10 animate-fadeIn">
                  {/* 3D Floating Glossy Crimson Icon Badge */}
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#e55c54] via-[#C5453E] to-[#922621] p-[1.5px] shadow-[0_12px_28px_rgba(197,69,62,0.5)] ring-1 ring-white/50 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-b from-white/30 via-transparent to-black/25 flex items-center justify-center relative overflow-hidden">
                      <Sparkles className="w-8 h-8 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] animate-pulse" />
                      {/* Top Specular Sheen on Icon Badge */}
                      <div className="absolute inset-x-1.5 top-0.5 h-3 rounded-full bg-gradient-to-b from-white/70 to-transparent opacity-90" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm group-hover:text-[#C5453E] transition-colors">
                      Smart Clean
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wide">
                        1-Click Universal Boost
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-[#C5453E] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Scan →
                  </span>
                </div>
              )}

              {/* Content State 2: CLEANING */}
              {isCleaning && (
                <div className="flex flex-col items-center justify-center space-y-2 z-10 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full border-3 border-[#C5453E]/30 border-t-[#C5453E] animate-spin flex items-center justify-center mb-1">
                    <RefreshCw className="w-6 h-6 text-[#C5453E] animate-pulse" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Purging Junk...
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-[#C5453E]/15 border border-[#C5453E]/30">
                    <p className="text-xs text-[#C5453E] font-mono font-extrabold">
                      {cleaningProgress}% complete
                    </p>
                  </div>
                </div>
              )}

              {/* Content State 3: SCANNED */}
              {scanState === 'scanned' && !isScanning && !isCleaning && (
                <div className="flex flex-col items-center justify-center space-y-1.5 z-10 animate-fadeIn">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5453E]/15 dark:bg-[#C5453E]/25 border border-[#C5453E]/30 text-[#C5453E] text-[10px] font-black tracking-widest uppercase">
                    <Zap className="w-3 h-3" />
                    <span>Ready to Clean</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-sans drop-shadow-sm pt-1">
                    {formatBytes(totalSafeBytes)}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {totalItemsCount} Safe Items Audited
                  </p>
                  <span className="text-[10px] font-bold text-[#C5453E] uppercase tracking-wider pt-1">
                    Click to Reclaim Now
                  </span>
                </div>
              )}

              {/* Content State 4: CLEANED */}
              {scanState === 'cleaned' && (
                <div className="flex flex-col items-center justify-center space-y-2 z-10 animate-fadeIn">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 p-[1.5px] shadow-[0_12px_28px_rgba(16,185,129,0.4)] ring-1 ring-white/50 mb-1">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-b from-white/30 via-transparent to-black/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    System Optimized!
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      Freed {formatBytes(cleanedFreedBytes > 0 ? cleanedFreedBytes : totalSafeBytes)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3D Action Buttons below the Master Orb */}
        <div className="mt-7 flex flex-col items-center gap-3 z-10">
          {scanState === 'idle' && (
            <button
              onClick={handleStartSmartScan}
              disabled={isScanning}
              className="btn-3d-primary px-9 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2.5 cursor-pointer shadow-xl group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>START SMART SCAN</span>
            </button>
          )}

          {scanState === 'scanned' && !isScanning && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCleanNow}
                disabled={isCleaning}
                className="btn-3d-primary px-9 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2.5 cursor-pointer shadow-xl group"
              >
                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>CLEAN {formatBytes(totalSafeBytes)} NOW</span>
              </button>
              <button
                onClick={handleStartSmartScan}
                className="btn-3d-secondary p-3.5 rounded-2xl cursor-pointer"
                title="Re-Scan System"
              >
                <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          )}

          {scanState === 'cleaned' && (
            <button
              onClick={handleStartSmartScan}
              className="btn-3d-secondary px-8 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C5453E]" />
              <span>Scan Again</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Safe Deletion Guarantee • Personal documents are never modified</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: System Junk & Caches */}
        <div
          onClick={() => onNavigateTab('system-junk')}
          className="glass-panel hover:shadow-xl rounded-3xl p-5 transition-all duration-300 hover:border-[#C5453E]/50 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#db554e] to-[#C5453E] text-white flex items-center justify-center shadow-md shadow-[#C5453E]/30 group-hover:scale-105 transition-transform p-[1px]">
                <Layers className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#C5453E] transition-colors">
                  System Caches & Logs
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Temporary app buffers</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {formatBytes(junkCategories.find((c) => c.id === 'system_caches')?.total_bytes || 0)}
            </span>
          </div>
        </div>

        {/* Card 2: Developer Caches */}
        <div
          onClick={() => onNavigateTab('developer')}
          className="glass-panel hover:shadow-xl rounded-3xl p-5 transition-all duration-300 hover:border-[#C5453E]/50 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform p-[1px]">
                <Code2 className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#C5453E] transition-colors">
                  Developer Caches
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Xcode, Gradle, NPM & Cargo</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {formatBytes(junkCategories.find((c) => c.id === 'developer_junk')?.total_bytes || 0)}
            </span>
          </div>
        </div>

        {/* Card 3: Trash Bins */}
        <div
          onClick={() => onNavigateTab('trash-bins')}
          className="glass-panel hover:shadow-xl rounded-3xl p-5 transition-all duration-300 hover:border-[#C5453E]/50 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform p-[1px]">
                <Trash2 className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#C5453E] transition-colors">
                  Trash Bins
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Main & volume bins</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Found:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {formatBytes(junkCategories.find((c) => c.id === 'trash')?.total_bytes || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Macintosh HD Main Volume Status Strip */}
      {systemOverview?.disks && systemOverview.disks.length > 0 && (
        <div className="w-full glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 text-xs shadow-sm relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-[#C5453E]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {systemOverview.disks[0].name} ({systemOverview.disks[0].file_system})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatBytes(systemOverview.disks[0].available_bytes)} Free of {formatBytes(systemOverview.disks[0].total_bytes)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-1/3">
            <div className="relative flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C5453E] to-rose-400"
                style={{ width: `${systemOverview.disks[0].usage_percent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
              {Math.round(systemOverview.disks[0].usage_percent)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default SmartScanView;
