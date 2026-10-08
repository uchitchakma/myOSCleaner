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
} from 'lucide-react';
import { CleanCategory, CleanResult } from '../types';
import { formatBytes, formatDate } from '../utils/format';

interface SystemJunkViewProps {
  categories: CleanCategory[];
  onCleanSelected: (paths: string[]) => Promise<CleanResult | null>;
  isCleaning: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const SystemJunkView: React.FC<SystemJunkViewProps> = ({
  categories,
  onCleanSelected,
  isCleaning,
  onRefresh,
  isRefreshing,
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

  // Calculate selected total bytes
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">System Caches & Temporary Junk</h3>
            <p className="text-xs text-slate-400">
              Selected <span className="font-semibold text-cyan-400">{formatBytes(selectedBytes)}</span> ({selectedPaths.size} items)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/5 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/5 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors"
            title="Re-scan system"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleClean}
            disabled={isCleaning || selectedPaths.size === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
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
              className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden transition-all"
            >
              {/* Category Header */}
              <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryAll(category);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : someSelected ? (
                      <div className="w-5 h-5 rounded bg-blue-500/30 border border-blue-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-sm" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div onClick={() => toggleCategoryExpand(category.id)} className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-white">{category.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      ({formatBytes(category.total_bytes)} • {category.items.length} items)
                    </span>
                  </div>
                </div>

                <div onClick={() => toggleCategoryExpand(category.id)} className="flex items-center gap-3">
                  {category.safety_level === 'safe' ? (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Safe
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
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
                <div className="px-4 pb-4 pt-1 divide-y divide-white/5 border-t border-white/5 bg-slate-950/40">
                  {category.items.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No items found in this category.</p>
                  ) : (
                    category.items.map((item) => {
                      const isChecked = selectedPaths.has(item.path);
                      return (
                        <div
                          key={item.id}
                          onClick={() => togglePath(item.path)}
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            {item.is_directory ? (
                              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <File className="w-4 h-4 text-cyan-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-200 truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{item.path}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              {formatDate(item.last_modified)}
                            </span>
                            <span className="font-semibold text-white font-mono min-w-[70px]">
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
