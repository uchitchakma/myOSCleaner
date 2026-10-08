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

  // If user hasn't scanned yet, show On-Demand Scan Hero
  if (!hasScanned && trashItems.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/15">
          <Trash2 className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan Trash Bins</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Inspect all discarded files in your main trash and external volumes before permanently wiping them to recover physical storage.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-8 py-3.5 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#C5453E]/25 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Scanning Trash...' : 'SCAN TRASH BINS'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Includes external drive trash cans & selective file restoration</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trash Overview Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-[#C5453E]/10 via-amber-500/10 to-orange-500/10 border border-[#C5453E]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C5453E] to-amber-600 flex items-center justify-center shadow-lg shadow-[#C5453E]/20 text-white shrink-0">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5453E]">
                Discarded Storage
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatBytes(totalTrashBytes)} in Trash
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {trashItems.length} discarded items awaiting permanent deletion
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isEmptying || trashItems.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Empty Entire Trash</span>
          </button>
        </div>

        {/* Quick Tips */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 shadow-sm">
          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-[#C5453E] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Why Empty Trash?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Files moved to Trash continue taking physical disk blocks until permanently purged.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
            Cross-platform multi-drive support
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discarded files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5453E]/50"
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
          title="Refresh Trash List"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
        </button>
      </div>

      {/* Discarded Files Table */}
      <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
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
              <p className="font-semibold text-slate-700 dark:text-slate-300">Trash Bin is Empty</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No discarded items found on your system.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
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

                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {formatDate(item.last_modified)}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono min-w-[70px] text-right">
                    {formatBytes(item.size_bytes)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRevealInFinder(item.path)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Reveal in Finder / Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSingle(item.path)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 dark:text-red-400 border border-red-500/20 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEmpty}
                className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20"
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
