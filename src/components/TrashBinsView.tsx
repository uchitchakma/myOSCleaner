import React, { useState } from 'react';
import {
  Trash2,
  Folder,
  File,
  RefreshCw,
  Search,
  FolderOpen,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CleanItem, CleanResult } from '../types';
import { formatBytes, formatDate } from '../utils/format';
import { GlassScanningHub } from './GlassScanningHub';

interface TrashBinsViewProps {
  trashItems: CleanItem[];
  onEmptyTrash: () => Promise<CleanResult | null>;
  isEmptying: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onRevealInFinder: (path: string) => Promise<void>;
  onDeleteSingle: (path: string) => Promise<CleanResult | null>;
  hasScanned: boolean;
}

export const TrashBinsView: React.FC<TrashBinsViewProps> = ({
  trashItems,
  onEmptyTrash,
  isEmptying,
  onRefresh,
  isRefreshing,
  onRevealInFinder,
  onDeleteSingle,
  hasScanned,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalTrashBytes = trashItems.reduce((acc, item) => acc + item.size_bytes, 0);

  const filteredItems = trashItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmEmpty = async () => {
    setShowConfirmModal(false);
    await onEmptyTrash();
  };

  // 1. While active scanning, show 3D Glass Progress Hub
  if (isRefreshing) {
    return (
      <GlassScanningHub
        title="Scanning System Trash Bins"
        subtitle="Inspecting user trash folders, external drive trash cans, and recoverable files..."
        category="trash-bins"
      />
    );
  }

  // 2. If user hasn't scanned yet, show On-Demand Scan 3D Glass Hero
  if (!hasScanned && trashItems.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 flex flex-col items-center text-center space-y-5 relative isolate overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none rounded-3xl" />

          {/* 3D Glossy Icon Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 p-[1px] shadow-[0_12px_28px_rgba(245,158,11,0.4)] ring-1 ring-white/30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/25 via-transparent to-black/20 flex items-center justify-center">
              <Trash2 className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Scan Trash Bins
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Inspect all discarded files in your main trash and external volumes before permanently wiping them to recover physical storage.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="btn-3d-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>SCAN TRASH BINS</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Includes external drive trash cans & selective file restoration</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trash Overview Card */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative isolate overflow-hidden">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#db554e] via-[#C5453E] to-amber-600 flex items-center justify-center shadow-lg shadow-[#C5453E]/25 text-white shrink-0 p-[1px] ring-1 ring-white/30">
              <Trash2 className="w-8 h-8 drop-shadow-sm" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5453E]">
                Discarded Storage
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatBytes(totalTrashBytes)} in Trash
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {trashItems.length} discarded items awaiting permanent deletion
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isEmptying || trashItems.length === 0}
            className="btn-3d-primary w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Empty Entire Trash</span>
          </button>
        </div>

        {/* Quick Tips */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-[#C5453E] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Why Empty Trash?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Files moved to Trash continue taking physical storage blocks until permanently purged.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-white/5">
            Cross-platform multi-drive volume support
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel flex items-center justify-between gap-4 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discarded files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5453E]/50 shadow-inner"
          />
        </div>

        <button
          onClick={onRefresh}
          className="btn-3d-secondary p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
          title="Refresh Trash List"
        >
          <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Discarded Files Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-100/60 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>File / Folder Name</span>
          <div className="flex items-center gap-12 pr-4">
            <span className="hidden sm:inline">Discarded Date</span>
            <span>Size</span>
            <span>Actions</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[460px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Trash2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Trash Bin is Empty</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No discarded items found on your system.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
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

                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {formatDate(item.last_modified)}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono min-w-[70px] text-right">
                    {formatBytes(item.size_bytes)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRevealInFinder(item.path)}
                      className="btn-3d-secondary p-1.5 rounded-lg cursor-pointer"
                      title="Reveal in Finder / Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSingle(item.path)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                      title="Permanently Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#C5453E]">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Empty Entire Trash Bin?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will permanently remove <strong>{trashItems.length} items</strong> ({formatBytes(totalTrashBytes)}) from your Trash. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEmpty}
                className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Permanently Empty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TrashBinsView;

