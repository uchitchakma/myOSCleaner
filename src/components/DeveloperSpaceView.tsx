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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Rust Cargo':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'Gradle / Java':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Python':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-[#C5453E]/10 text-[#C5453E] border-[#C5453E]/20';
    }
  };

  // If user hasn't scanned yet, show On-Demand Scan Hero
  if (!hasScanned && projects.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-[#C5453E]/10 border border-[#C5453E]/30 flex items-center justify-center text-[#C5453E] shadow-xl shadow-[#C5453E]/15">
          <Code2 className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan Developer Workspaces</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Reclaim tens of gigabytes from old build folders like <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">node_modules</code>, <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">target/</code>, and <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#C5453E]">.gradle/</code> across your coding projects.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-8 py-3.5 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#C5453E]/25 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Scanning Coding Workspaces...' : 'SCAN DEVELOPER WORKSPACES'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Source code & git repositories are 100% safe and never modified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#C5453E]/10 via-rose-500/10 to-orange-500/10 border border-[#C5453E]/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C5453E]/20 text-[#C5453E] border border-[#C5453E]/30 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Developer Workspace Saver</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Found <strong className="text-[#C5453E]">{projects.length} coding projects</strong> with <strong className="text-slate-900 dark:text-white">{formatBytes(totalCleanableBytes)}</strong> in build caches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
            title="Re-scan Workspace"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isCleaning || selectedFolders.size === 0}
            className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice & Quick Preset Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Source code and git histories are NEVER touched. Only rebuildable artifacts are wiped.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectOlderThan30Days}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#C5453E] text-[11px] font-semibold border border-[#C5453E]/20 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Select Inactive (&gt;30d)
          </button>
          <button
            onClick={selectAll}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="py-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
            <FolderCode className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Rebuildable Build Caches Found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Your project directories are clean!</p>
          </div>
        ) : (
          projects.map((proj) => {
            const allSelected = proj.cleanable_folders.every((f) => selectedFolders.has(f.path));
            const someSelected = proj.cleanable_folders.some((f) => selectedFolders.has(f.path));

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all hover:border-[#C5453E]/30 space-y-3 shadow-sm"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleProject(proj)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{proj.name}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getFrameworkBadgeColor(proj.framework)}`}>
                          {proj.framework}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          • Touched {formatTimeAgo(proj.last_modified_days_ago)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{proj.project_path}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block">
                        {formatBytes(proj.total_cleanable_bytes)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {proj.cleanable_folders.length} cleanable folder{proj.cleanable_folders.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => onRevealInFinder(proj.project_path)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Reveal project in Finder / Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cleanable Sub-folders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                  {proj.cleanable_folders.map((folder, idx) => {
                    const isChecked = selectedFolders.has(folder.path);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleFolder(folder.path)}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-[#C5453E]/10 border-[#C5453E]/30 text-[#C5453E] dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#C5453E] shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] truncate font-medium">{folder.folder_type}</span>
                        </div>
                        <span className="font-mono font-semibold text-[11px] shrink-0 text-slate-700 dark:text-slate-300">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClean}
                className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20"
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
