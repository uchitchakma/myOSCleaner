import React, { useState } from 'react';
import {
  Code2,
  Trash2,
  RefreshCw,
  FolderCode,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { DeveloperProjectInfo, CleanResult } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/format';
import { GlassScanningHub } from './GlassScanningHub';

interface DeveloperSpaceViewProps {
  projects: DeveloperProjectInfo[];
  onCleanFolders: (folderPaths: string[]) => Promise<CleanResult | null>;
  isCleaning: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onRevealInFinder: (path: string) => Promise<void>;
  hasScanned: boolean;
}

export const DeveloperSpaceView: React.FC<DeveloperSpaceViewProps> = ({
  projects,
  onCleanFolders,
  isCleaning,
  onRefresh,
  isRefreshing,
  onRevealInFinder,
  hasScanned,
}) => {
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    projects.forEach((proj) => {
      if (proj.last_modified_days_ago >= 30) {
        proj.cleanable_folders.forEach((f) => initial.add(f.path));
      }
    });
    return initial;
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalCleanableBytes = projects.reduce((acc, p) => acc + p.total_cleanable_bytes, 0);

  const toggleFolder = (path: string) => {
    const next = new Set(selectedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedFolders(next);
  };

  const toggleProject = (project: DeveloperProjectInfo) => {
    const allSelected = project.cleanable_folders.every((f) => selectedFolders.has(f.path));
    const next = new Set(selectedFolders);
    project.cleanable_folders.forEach((f) => {
      if (allSelected) next.delete(f.path);
      else next.add(f.path);
    });
    setSelectedFolders(next);
  };

  const selectOlderThan30Days = () => {
    const next = new Set<string>();
    projects.forEach((p) => {
      if (p.last_modified_days_ago >= 30) {
        p.cleanable_folders.forEach((f) => next.add(f.path));
      }
    });
    setSelectedFolders(next);
  };

  const selectAll = () => {
    const next = new Set<string>();
    projects.forEach((p) => p.cleanable_folders.forEach((f) => next.add(f.path)));
    setSelectedFolders(next);
  };

  const deselectAll = () => {
    setSelectedFolders(new Set());
  };

  let selectedBytes = 0;
  projects.forEach((p) => {
    p.cleanable_folders.forEach((f) => {
      if (selectedFolders.has(f.path)) {
        selectedBytes += f.size_bytes;
      }
    });
  });

  const handleConfirmClean = async () => {
    setShowConfirmModal(false);
    if (selectedFolders.size === 0) return;
    await onCleanFolders(Array.from(selectedFolders));
    setSelectedFolders(new Set());
  };

  const getFrameworkBadgeColor = (framework: string) => {
    switch (framework) {
      case 'Node.js / Web':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Rust Cargo':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'Gradle / Java':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Python':
        return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-[#C5453E]/15 text-[#C5453E] border-[#C5453E]/30';
    }
  };

  // 1. While active scanning, show 3D Glass Progress Hub
  if (isRefreshing) {
    return (
      <GlassScanningHub
        title="Scanning Developer Workspaces"
        subtitle="Auditing coding directories for node_modules, Rust target builds, Gradle caches, and virtualenvs..."
        category="developer"
      />
    );
  }

  // 2. If user hasn't scanned yet, show On-Demand Scan 3D Glass Hero
  if (!hasScanned && projects.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
          <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-fuchsia-500/20 blur-2xl -z-10" />

          {/* 3D Glossy Icon Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-[#db554e] via-[#C5453E] to-rose-700 p-[1px] shadow-[0_12px_28px_rgba(197,69,62,0.45)] ring-1 ring-white/30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/25 via-transparent to-black/20 flex items-center justify-center">
              <Code2 className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Scan Developer Workspaces
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reclaim tens of gigabytes from old build folders like <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">node_modules</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">target/</code>, and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">.gradle/</code> across your coding projects.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="btn-3d-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>SCAN DEVELOPER WORKSPACES</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Source code & git repositories are 100% safe and never modified</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#db554e] to-rose-700 flex items-center justify-center text-white shadow-md shadow-[#C5453E]/25 p-[1px]">
            <Code2 className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Developer Workspace Saver</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Found <strong className="text-[#C5453E]">{projects.length} coding projects</strong> with <strong className="text-slate-900 dark:text-white">{formatBytes(totalCleanableBytes)}</strong> in build caches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="btn-3d-secondary p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            title="Re-scan Workspace"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isCleaning || selectedFolders.size === 0}
            className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice & Quick Preset Buttons */}
      <div className="glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Source code and git histories are NEVER touched. Only rebuildable artifacts are wiped.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectOlderThan30Days}
            className="btn-3d-secondary px-3 py-1.5 rounded-xl text-[#C5453E] text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5453E]" />
            <span>Select Inactive (&gt;30d)</span>
          </button>
          <button
            onClick={selectAll}
            className="btn-3d-secondary px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="btn-3d-secondary px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="py-12 glass-panel rounded-3xl text-center text-slate-400 text-xs shadow-sm">
            <FolderCode className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No Rebuildable Build Caches Found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Your project directories are clean!</p>
          </div>
        ) : (
          projects.map((proj) => {
            const allSelected = proj.cleanable_folders.every((f) => selectedFolders.has(f.path));
            const someSelected = proj.cleanable_folders.some((f) => selectedFolders.has(f.path));

            return (
              <div
                key={proj.id}
                className="glass-panel rounded-3xl p-5 sm:p-6 transition-all hover:border-[#C5453E]/40 space-y-4 shadow-sm"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleProject(proj)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#C5453E]" />
                      ) : someSelected ? (
                        <div className="w-5 h-5 rounded bg-[#C5453E]/30 border border-[#C5453E] flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#C5453E] rounded-sm" />
                        </div>
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{proj.name}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getFrameworkBadgeColor(proj.framework)}`}>
                          {proj.framework}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          • Touched {formatTimeAgo(proj.last_modified_days_ago)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{proj.project_path}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-mono block">
                        {formatBytes(proj.total_cleanable_bytes)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {proj.cleanable_folders.length} cleanable folder{proj.cleanable_folders.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => onRevealInFinder(proj.project_path)}
                      className="btn-3d-secondary p-2 rounded-xl cursor-pointer"
                      title="Reveal project in Finder / Explorer"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cleanable Sub-folders (Spaced & Padded Flex Wrap) */}
                <div className="flex flex-wrap items-center gap-3 pt-3.5 border-t border-slate-200/60 dark:border-white/5">
                  {proj.cleanable_folders.map((folder, idx) => {
                    const isChecked = selectedFolders.has(folder.path);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleFolder(folder.path)}
                        className={`px-4 py-2.5 rounded-2xl inline-flex items-center justify-between gap-3.5 text-xs cursor-pointer border transition-all duration-200 shadow-2xs ${
                          isChecked
                            ? 'bg-[#C5453E]/10 dark:bg-[#C5453E]/20 border-[#C5453E]/40 text-[#C5453E] dark:text-rose-300 ring-1 ring-[#C5453E]/20'
                            : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#C5453E]/30 hover:bg-white dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#C5453E] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{folder.folder_type}</span>
                        </div>
                        <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#C5453E]">
                          {formatBytes(folder.size_bytes)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#C5453E]">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Purge Developer Build Artifacts?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will remove <strong>{selectedFolders.size} build cache directories</strong> ({formatBytes(selectedBytes)}). You can easily recreate them anytime using your project’s package manager (e.g. `npm install` or `cargo build`).
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClean}
                className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Purge Folders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DeveloperSpaceView;

