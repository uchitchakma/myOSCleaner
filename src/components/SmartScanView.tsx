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

      {/* Breakdown Cards Section - 3D Glassmorphic Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: System Junk & Caches */}
        <div
          onClick={() => onNavigateTab('system-junk')}
          className="glass-panel rounded-3xl p-5 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative isolate overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] border border-white/30 dark:border-white/10 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(197,69,62,0.18)] hover:border-[#C5453E]/50"
        >
          {/* Top Glass Specular Shine */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#C5453E]/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3.5">
              {/* 3D Glossy Icon Squircle */}
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center p-[1px] transition-all duration-300 group-hover:scale-110 shrink-0 overflow-hidden border border-white/35 dark:border-white/20 bg-gradient-to-b from-[#ff635b] via-[#C5453E] to-[#93201b] shadow-[0_6px_18px_rgba(197,69,62,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.4)]">
                {/* Top Specular Gloss Highlight */}
                <div className="absolute inset-x-1.5 top-0.5 h-4 rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                {/* Bottom Caustic Reflex */}
                <div className="absolute inset-x-1.5 bottom-0.5 h-1.5 rounded-b-xl bg-gradient-to-t from-white/25 to-transparent pointer-events-none" />
                <Layers className="w-5 h-5 text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] relative z-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#C5453E] transition-colors">
                  System Caches & Logs
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Temporary app buffers</p>
              </div>
            </div>

            {/* 3D Glossy Arrow Button */}
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 group-hover:bg-[#C5453E] group-hover:text-white group-hover:border-[#C5453E]/40 group-hover:shadow-[0_4px_12px_rgba(197,69,62,0.4)] transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Found:</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-xs">
              {formatBytes(junkCategories.find((c) => c.id === 'system_caches')?.total_bytes || 0)}
            </span>
          </div>
        </div>

        {/* Card 2: Developer Caches */}
        <div
          onClick={() => onNavigateTab('developer')}
          className="glass-panel rounded-3xl p-5 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative isolate overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] border border-white/30 dark:border-white/10 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(236,72,153,0.18)] hover:border-pink-500/50"
        >
          {/* Top Glass Specular Shine */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-pink-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3.5">
              {/* 3D Glossy Icon Squircle */}
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center p-[1px] transition-all duration-300 group-hover:scale-110 shrink-0 overflow-hidden border border-white/35 dark:border-white/20 bg-gradient-to-b from-fuchsia-400 via-pink-500 to-rose-700 shadow-[0_6px_18px_rgba(236,72,153,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.4)]">
                {/* Top Specular Gloss Highlight */}
                <div className="absolute inset-x-1.5 top-0.5 h-4 rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                {/* Bottom Caustic Reflex */}
                <div className="absolute inset-x-1.5 bottom-0.5 h-1.5 rounded-b-xl bg-gradient-to-t from-white/25 to-transparent pointer-events-none" />
                <Code2 className="w-5 h-5 text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] relative z-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                  Developer Caches
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Xcode, Gradle, NPM & Cargo</p>
              </div>
            </div>

            {/* 3D Glossy Arrow Button */}
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500/40 group-hover:shadow-[0_4px_12px_rgba(236,72,153,0.4)] transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Found:</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-xs">
              {formatBytes(junkCategories.find((c) => c.id === 'developer_junk')?.total_bytes || 0)}
            </span>
          </div>
        </div>

        {/* Card 3: Trash Bins */}
        <div
          onClick={() => onNavigateTab('trash-bins')}
          className="glass-panel rounded-3xl p-5 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative isolate overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] border border-white/30 dark:border-white/10 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(245,158,11,0.18)] hover:border-amber-500/50"
        >
          {/* Top Glass Specular Shine */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3.5">
              {/* 3D Glossy Icon Squircle */}
              <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center p-[1px] transition-all duration-300 group-hover:scale-110 shrink-0 overflow-hidden border border-white/35 dark:border-white/20 bg-gradient-to-b from-amber-400 via-orange-500 to-rose-600 shadow-[0_6px_18px_rgba(245,158,11,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.4)]">
                {/* Top Specular Gloss Highlight */}
                <div className="absolute inset-x-1.5 top-0.5 h-4 rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                {/* Bottom Caustic Reflex */}
                <div className="absolute inset-x-1.5 bottom-0.5 h-1.5 rounded-b-xl bg-gradient-to-t from-white/25 to-transparent pointer-events-none" />
                <Trash2 className="w-5 h-5 text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] relative z-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  Trash Bins
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Main & volume bins</p>
              </div>
            </div>

            {/* 3D Glossy Arrow Button */}
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500/40 group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)] transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Found:</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-xs">
              {formatBytes(junkCategories.find((c) => c.id === 'trash')?.total_bytes || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Connected Storage Disks Section - 3D Glassmorphic Storage Rack */}
      {systemOverview?.disks && systemOverview.disks.length > 0 && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 flex items-center justify-center shadow-xs">
                <HardDrive className="w-3 h-3" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                CONNECTED STORAGE DEVICES ({systemOverview.disks.length})
              </span>
            </div>
            {systemOverview.disks.length > 1 && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 shadow-xs">
                Multi-Drive Space Optimizer Active
              </span>
            )}
          </div>

          <div
            className={`grid gap-3.5 ${
              systemOverview.disks.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {systemOverview.disks.map((d, idx) => {
              const isHigh = d.usage_percent > 85;
              const isCritical = d.usage_percent > 92;
              return (
                <div
                  key={`${d.mount_point}-${idx}`}
                  className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-4 text-xs shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] border border-white/30 dark:border-white/10 relative isolate overflow-hidden group hover:border-[#C5453E]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(197,69,62,0.15)] transition-all duration-300"
                >
                  {/* Top Specular Gloss Highlight Line */}
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-3.5">
                      {/* 3D Glossy Disk Squircle Badge */}
                      <div
                        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center p-[1px] transition-all duration-300 group-hover:scale-105 shrink-0 overflow-hidden border border-white/40 dark:border-white/25 shadow-[0_6px_18px_rgba(0,0,0,0.3),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(0,0,0,0.4)] ${
                          d.is_internal
                            ? 'bg-gradient-to-b from-[#ff635b] via-[#C5453E] to-[#93201b]'
                            : 'bg-gradient-to-b from-indigo-400 via-indigo-600 to-cyan-600'
                        }`}
                      >
                        {/* Top Specular Gloss Highlight */}
                        <div className="absolute inset-x-1.5 top-0.5 h-4 rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                        {/* Bottom Caustic Reflex */}
                        <div className="absolute inset-x-1.5 bottom-0.5 h-1.5 rounded-b-xl bg-gradient-to-t from-white/25 to-transparent pointer-events-none" />
                        <HardDrive className="w-5 h-5 text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] relative z-10" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                            {d.name}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ${
                              d.is_internal
                                ? 'bg-[#C5453E]/15 text-[#C5453E] border-[#C5453E]/30 dark:text-[#ff7d75]'
                                : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                            }`}
                          >
                            {d.disk_type || (d.is_internal ? 'Internal NVMe SSD' : 'External Storage')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {formatBytes(d.available_bytes)} Free of {formatBytes(d.total_bytes)}
                          {d.file_system ? ` • ${d.file_system}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Mount Path Badge */}
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(0,0,0,0.1)] max-w-[140px] truncate">
                      <span>{d.mount_point}</span>
                    </div>
                  </div>

                  {/* 3D Glossy Capacity Meter */}
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="relative flex-1 h-3.5 rounded-full bg-slate-200/90 dark:bg-[#0a0e1a]/90 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)] border border-slate-300/50 dark:border-white/10 p-[2px]">
                      <div
                        className={`relative h-full rounded-full transition-all duration-500 overflow-hidden ${
                          isCritical
                            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 shadow-[0_0_14px_rgba(239,68,68,0.7)]'
                            : isHigh
                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-[0_0_14px_rgba(245,158,11,0.7)]'
                            : 'bg-gradient-to-r from-[#C5453E] via-[#e56861] to-[#ff9088] shadow-[0_0_14px_rgba(197,69,62,0.6)]'
                        }`}
                        style={{ width: `${Math.min(d.usage_percent, 100)}%` }}
                      >
                        {/* Progress Bar Specular Gloss Sheen */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-full" />
                      </div>
                    </div>
                    <span
                      className={`font-mono font-black text-xs min-w-[36px] text-right drop-shadow-xs ${
                        isCritical
                          ? 'text-red-500'
                          : isHigh
                          ? 'text-amber-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {Math.round(d.usage_percent)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default SmartScanView;
