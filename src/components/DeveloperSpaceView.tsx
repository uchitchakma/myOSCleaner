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
}

export const DeveloperSpaceView: React.FC<DeveloperSpaceViewProps> = ({
  projects,
  onCleanFolders,
  isCleaning,
  onRefresh,
  isRefreshing,
  onRevealInFinder,
}) => {
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Pre-select projects untouched for > 30 days
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

  // Calculate selected total bytes
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rust Cargo':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Gradle / Java':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Python':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-fuchsia-600/10 via-rose-600/10 to-purple-600/10 border border-fuchsia-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Developer Workspace Saver</h3>
            <p className="text-xs text-slate-300">
              Found <strong className="text-fuchsia-400">{projects.length} coding projects</strong> with <strong className="text-white">{formatBytes(totalCleanableBytes)}</strong> in build caches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors"
            title="Re-scan Workspace"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-fuchsia-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isCleaning || selectedFolders.size === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice & Quick Preset Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-white/10 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Source code and git histories are NEVER touched. Only rebuildable artifacts are wiped.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectOlderThan30Days}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-[11px] font-medium border border-fuchsia-500/20 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Select Inactive (&gt;30d)
          </button>
          <button
            onClick={selectAll}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="py-12 bg-slate-900/40 border border-white/5 rounded-2xl text-center text-slate-400 text-xs">
            <FolderCode className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">No Rebuildable Build Caches Found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Your project directories are clean!</p>
          </div>
        ) : (
          projects.map((proj) => {
            const allSelected = proj.cleanable_folders.every((f) => selectedFolders.has(f.path));
            const someSelected = proj.cleanable_folders.some((f) => selectedFolders.has(f.path));

            return (
              <div
                key={proj.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 transition-all hover:border-white/20 space-y-3"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleProject(proj)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-5 h-5 text-fuchsia-400" />
                      ) : someSelected ? (
                        <div className="w-5 h-5 rounded bg-fuchsia-500/30 border border-fuchsia-400 flex items-center justify-center">
                          <div className="w-2 h-2 bg-fuchsia-400 rounded-sm" />
                        </div>
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-white truncate">{proj.name}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getFrameworkBadgeColor(proj.framework)}`}>
                          {proj.framework}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • Touched {formatTimeAgo(proj.last_modified_days_ago)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{proj.project_path}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-sm text-white font-mono block">
                        {formatBytes(proj.total_cleanable_bytes)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {proj.cleanable_folders.length} cleanable folder{proj.cleanable_folders.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => onRevealInFinder(proj.project_path)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Reveal project in Finder / Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cleanable Sub-folders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-white/5">
                  {proj.cleanable_folders.map((folder, idx) => {
                    const isChecked = selectedFolders.has(folder.path);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleFolder(folder.path)}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-white'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] truncate font-medium">{folder.folder_type}</span>
                        </div>
                        <span className="font-mono font-semibold text-[11px] shrink-0 text-slate-300">
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
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-fuchsia-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Purge Developer Build Artifacts?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove <strong>{selectedFolders.size} build cache directories</strong> ({formatBytes(selectedBytes)}). You can easily recreate them anytime using your project’s package manager (e.g. `npm install` or `cargo build`).
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClean}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-500/20"
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
