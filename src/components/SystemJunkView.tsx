import React, { useState } from 'react';
import {
  Layers,
  CheckSquare,
  Square,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { CleanCategory, CleanResult } from '../types';
import { formatBytes, formatDate } from '../utils/format';
import { GlassScanningHub } from './GlassScanningHub';

interface SystemJunkViewProps {
  categories: CleanCategory[];
  onCleanSelected: (paths: string[]) => Promise<CleanResult | null>;
  isCleaning: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  hasScanned: boolean;
}

export const SystemJunkView: React.FC<SystemJunkViewProps> = ({
  categories,
  onCleanSelected,
  isCleaning,
  onRefresh,
  isRefreshing,
  hasScanned,
}) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.selected_by_default) {
          initial.add(item.path);
        }
      });
    });
    return initial;
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const toggleCategoryExpand = (id: string) => {
    const next = new Set(expandedCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCategories(next);
  };

  const togglePath = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedPaths(next);
  };

  const toggleCategoryAll = (category: CleanCategory) => {
    const allSelected = category.items.every((i) => selectedPaths.has(i.path));
    const next = new Set(selectedPaths);
    category.items.forEach((i) => {
      if (allSelected) next.delete(i.path);
      else next.add(i.path);
    });
    setSelectedPaths(next);
  };

  const selectAll = () => {
    const next = new Set<string>();
    categories.forEach((c) => c.items.forEach((i) => next.add(i.path)));
    setSelectedPaths(next);
  };

  const deselectAll = () => {
    setSelectedPaths(new Set());
  };

  let selectedBytes = 0;
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      if (selectedPaths.has(item.path)) {
        selectedBytes += item.size_bytes;
      }
    });
  });

  const handleClean = async () => {
    if (selectedPaths.size === 0) return;
    await onCleanSelected(Array.from(selectedPaths));
  };

  // 1. While active scanning, show 3D Glass Progress Hub
  if (isRefreshing) {
    return (
      <GlassScanningHub
        title="Scanning System Junk & Caches"
        subtitle="Analyzing user cache folders, application crash logs, system buffers, and temporary data..."
        category="system-junk"
      />
    );
  }

  // 2. If user hasn't scanned yet, show On-Demand Scan 3D Glass Hero
  if (!hasScanned && categories.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        {/* 3D Glass Hero Card */}
        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
          <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-[#C5453E]/20 blur-2xl -z-10" />

          {/* 3D Glossy Icon Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-[#db554e] via-[#C5453E] to-[#9b2c27] p-[1px] shadow-[0_12px_28px_rgba(197,69,62,0.45)] ring-1 ring-white/30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/25 via-transparent to-black/20 flex items-center justify-center">
              <Layers className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Scan System & App Junk
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Quickly analyze user caches, application logs, browser temp files, and crash traces. Reclaim physical disk space safely without touching personal documents.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="btn-3d-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>SCAN SYSTEM JUNK</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Safe deletion only • Automatically selects non-critical temporary files</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Action Bar */}
      <div className="glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
        
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#db554e] to-[#C5453E] flex items-center justify-center text-white shadow-md shadow-[#C5453E]/30 p-[1px]">
            <Layers className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">System Caches & Temporary Junk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selected <span className="font-bold text-[#C5453E]">{formatBytes(selectedBytes)}</span> ({selectedPaths.size} items)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={selectAll}
            className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear Selection
          </button>
          <button
            onClick={onRefresh}
            className="btn-3d-secondary p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            title="Re-scan system"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={handleClean}
            disabled={isCleaning || selectedPaths.size === 0}
            className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="glass-panel flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs text-[#C5453E] dark:text-[#f7cfcc] border border-[#C5453E]/20">
        <ShieldCheck className="w-4 h-4 text-[#C5453E] shrink-0" />
        <span>
          <strong>Safe Cleanup:</strong> All categories below contain generated caches and non-essential logs. Applications will recreate cache entries as needed.
        </span>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const allSelected = category.items.length > 0 && category.items.every((i) => selectedPaths.has(i.path));
          const someSelected = category.items.some((i) => selectedPaths.has(i.path));

          return (
            <div
              key={category.id}
              className="glass-panel rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategoryExpand(category.id)}
                className="p-4 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryAll(category);
                    }}
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

                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{category.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      ({formatBytes(category.total_bytes)} • {category.items.length} items)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {category.safety_level === 'safe' ? (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Safe
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Review
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Items List */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-black/20">
                  {category.items.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No items found in this category.</p>
                  ) : (
                    category.items.map((item) => {
                      const isChecked = selectedPaths.has(item.path);
                      return (
                        <div
                          key={item.id}
                          onClick={() => togglePath(item.path)}
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-white/60 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#C5453E] shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                            )}
                            {item.is_directory ? (
                              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <File className="w-4 h-4 text-[#C5453E] shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{item.path}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              {formatDate(item.last_modified)}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono min-w-[70px]">
                              {formatBytes(item.size_bytes)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SystemJunkView;

