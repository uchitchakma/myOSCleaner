import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Layers,
  Trash2,
  FolderArchive,
  HardDrive,
  Code2,
  Search,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

interface GlassScanningHubProps {
  title: string;
  subtitle: string;
  category: 'system-junk' | 'trash-bins' | 'large-files' | 'uninstaller' | 'developer' | 'smart-scan';
  onComplete?: () => void;
}

const CATEGORY_PATHS: Record<string, string[]> = {
  'system-junk': [
    '~/Library/Caches/com.apple.Safari/Cache.db',
    '~/Library/Caches/Google/Chrome/Default/Cache',
    '~/Library/Caches/com.spotify.client/Data',
    '~/Library/Logs/DiagnosticReports/system_crash.log',
    '~/Library/Application Support/CrashReporter',
    '~/Library/Caches/com.microsoft.VSCode/Cache',
    '~/Library/Caches/com.apple.appstore',
    '/private/var/log/asl/system.log',
    '~/Library/Caches/com.docker.docker',
    '~/Library/Caches/com.brave.Browser',
  ],
  'trash-bins': [
    '~/.Trash/Project_Draft_2025.zip',
    '~/.Trash/Screenshots_Archive.dmg',
    '~/.Trash/Obsolete_Downloads_Oct',
    '/Volumes/ExternalSSD/.Trashes/501/Backup_Nov',
    '~/.Trash/Xcode_Simulator_Logs.tar.gz',
  ],
  'large-files': [
    '~/Downloads/macOS_Sonoma_Installer.dmg (12.4 GB)',
    '~/Movies/4K_Production_Render_v2.mp4 (4.8 GB)',
    '~/Documents/VirtualMachines/Ubuntu22_Disk.vmdk (8.1 GB)',
    '~/Downloads/Xcode_16_Beta.xip (14.2 GB)',
    '~/Music/Studio_Projects/Master_Session.wav (1.2 GB)',
    '~/Desktop/Archive_Dataset_2024.tar (6.5 GB)',
  ],
  'uninstaller': [
    '/Applications/Figma.app • Locating caches & app support...',
    '/Applications/Slack.app • Locating local database...',
    '/Applications/Docker.app • Scanning container storage...',
    '/Applications/Zoom.us.app • Indexing crash traces...',
    '/Applications/Postman.app • Auditing local storage...',
    '/Applications/Discord.app • Checking update buffers...',
  ],
  'developer': [
    '~/Projects/web-platform/node_modules (1.4 GB)',
    '~/Projects/rust-backend/target/debug/build (3.8 GB)',
    '~/AndroidStudioProjects/app/.gradle/caches (2.1 GB)',
    '~/PythonProjects/ml-model/.venv/lib (940 MB)',
    '~/Projects/ios-app/DerivedData/Build/Products (4.2 GB)',
    '~/.cargo/registry/cache (1.8 GB)',
  ],
  'smart-scan': [
    'Analyzing Hardware Metrics & Unified RAM...',
    'Scanning ~/Library/Caches for Application junk...',
    'Inspecting System & Volume Trash Bins...',
    'Locating Heavy >25MB Files and Old DMG Installers...',
    'Auditing Applications and Leftover Libraries...',
    'Optimizing node_modules and Rust target builds...',
  ],
};

const CATEGORY_ICONS: Record<string, any> = {
  'system-junk': Layers,
  'trash-bins': Trash2,
  'large-files': FolderArchive,
  'uninstaller': HardDrive,
  'developer': Code2,
  'smart-scan': Sparkles,
};

export const GlassScanningHub: React.FC<GlassScanningHubProps> = ({
  title,
  subtitle,
  category,
}) => {
  const [progress, setProgress] = useState(15);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [itemsFoundCount, setItemsFoundCount] = useState(38);

  const paths = CATEGORY_PATHS[category] || CATEGORY_PATHS['system-junk'];
  const Icon = CATEGORY_ICONS[category] || Sparkles;

  useEffect(() => {
    // Fast & smooth 3D progress bar liquid fill
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev;
        const remaining = 97 - prev;
        const step = Math.max(1, Math.ceil(remaining / 5));
        return Math.min(97, prev + step);
      });
    }, 70);

    // High-speed file path streaming ticker
    const pathInterval = setInterval(() => {
      setCurrentPathIndex((prev) => (prev + 1) % paths.length);
      setItemsFoundCount((prev) => prev + Math.floor(Math.random() * 8 + 4));
    }, 130);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pathInterval);
    };
  }, [paths.length]);

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] animate-fadeIn">
      {/* Seamless Floating Scanning Hub (No Boxed Container Background) */}
      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-7 relative">
        {/* Ambient Neon Backlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#C5453E]/15 blur-3xl -z-10 pointer-events-none" />

        {/* Top 3D Scanner Orb */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing orbital rings */}
            <div className="absolute w-28 h-28 rounded-full border border-[#C5453E]/30 dark:border-[#C5453E]/40 animate-ping opacity-30" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#C5453E]/50 animate-spin" style={{ animationDuration: '8s' }} />

            {/* 3D Glossy Icon Badge */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#e55c54] via-[#C5453E] to-[#922621] p-[1.5px] shadow-[0_12px_28px_rgba(197,69,62,0.45)] ring-1 ring-white/40">
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-white/30 via-transparent to-black/20 flex items-center justify-center relative overflow-hidden">
                <Icon className="w-9 h-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-pulse" />
                {/* Top specular cap */}
                <div className="absolute inset-x-1.5 top-0.5 h-3 rounded-full bg-gradient-to-b from-white/70 to-transparent opacity-90" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C5453E]/10 dark:bg-[#C5453E]/20 border border-[#C5453E]/30 text-[#C5453E] text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
              <Search className="w-3 h-3 animate-bounce" />
              <span>Scanning in Progress</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-0.5">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 3D Liquid Glossy Progress Bar */}
        <div className="w-full space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5453E]" />
              Deep Disk Analysis
            </span>
            <span className="text-base font-black text-[#C5453E] font-mono tracking-tight">
              {progress}%
            </span>
          </div>

          {/* Recessed Track with Inset Shadow */}
          <div className="relative w-full h-3.5 rounded-full bg-slate-200/90 dark:bg-slate-900/90 p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] border border-slate-300/70 dark:border-white/10 overflow-hidden">
            {/* 3D Liquid Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C5453E] via-[#e56058] to-[#C5453E] relative transition-all duration-200 ease-out shadow-[0_0_15px_rgba(197,69,62,0.6)]"
              style={{ width: `${progress}%` }}
            >
              {/* Gloss Highlight on the top half of the bar */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full pointer-events-none" />

              {/* Shimmer Light Sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Live Scanned File Path Stream Terminal Pill */}
        <div className="w-full p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 flex items-center gap-3 backdrop-blur-md shadow-sm">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#C5453E] shadow-xs shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Currently Inspecting
            </p>
            <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate animate-fadeIn">
              {paths[currentPathIndex]}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold font-mono shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{itemsFoundCount} items</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GlassScanningHub;
