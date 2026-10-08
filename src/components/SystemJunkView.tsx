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

  // If user hasn't scanned yet, show On-Demand Scan Hero
  if (!hasScanned && categories.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-[#C5453E]/10 border border-[#C5453E]/30 flex items-center justify-center text-[#C5453E] shadow-xl shadow-[#C5453E]/15">
          <Layers className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan System & App Junk</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Quickly analyze user caches, application logs, browser temp files, and crash traces. Reclaim physical disk space safely without touching personal documents.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-8 py-3.5 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#C5453E]/25 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Scanning System Junk...' : 'SCAN SYSTEM JUNK'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Safe deletion only • Automatically selects non-critical temporary files</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#C5453E]/10 text-[#C5453E] border border-[#C5453E]/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">System Caches & Temporary Junk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selected <span className="font-semibold text-[#C5453E]">{formatBytes(selectedBytes)}</span> ({selectedPaths.size} items)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
            title="Re-scan system"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
          </button>
          <button
            onClick={handleClean}
            disabled={isCleaning || selectedPaths.size === 0}
            className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5453E]/10 border border-[#C5453E]/20 text-xs text-[#C5453E] dark:text-[#f7cfcc]">
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
              className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Category Header */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer select-none">
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

                  <div onClick={() => toggleCategoryExpand(category.id)} className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{category.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      ({formatBytes(category.total_bytes)} • {category.items.length} items)
                    </span>
                  </div>
                </div>

                <div onClick={() => toggleCategoryExpand(category.id)} className="flex items-center gap-3">
                  {category.safety_level === 'safe' ? (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Safe
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
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
                <div className="px-4 pb-4 pt-1 divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
                  {category.items.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No items found in this category.</p>
                  ) : (
                    category.items.map((item) => {
                      const isChecked = selectedPaths.has(item.path);
                      return (
                        <div
                          key={item.id}
                          onClick={() => togglePath(item.path)}
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-white dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-xs"
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
                              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{item.path}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              {formatDate(item.last_modified)}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white font-mono min-w-[70px]">
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
