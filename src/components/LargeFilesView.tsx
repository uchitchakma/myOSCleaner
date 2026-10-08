import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  CheckSquare,
  Square,
  Trash2,
  FolderOpen,
  RefreshCw,
  Video,
  Music,
  FileText,
  Disc,
  Clock,
  Filter,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { LargeFileInfo, CleanResult } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/format';

interface LargeFilesViewProps {
  files: LargeFileInfo[];
  onDeleteFiles: (paths: string[]) => Promise<CleanResult | null>;
  isDeleting: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onRevealInFinder: (path: string) => Promise<void>;
  hasScanned: boolean;
}

export const LargeFilesView: React.FC<LargeFilesViewProps> = ({
  files,
  onDeleteFiles,
  isDeleting,
  onRefresh,
  isRefreshing,
  onRevealInFinder,
  hasScanned,
}) => {
  const [sizeFilter, setSizeFilter] = useState<'all' | 'huge' | 'large' | 'medium'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | '1year' | '6months' | '1month'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter items
  const filteredFiles = files.filter((file) => {
    if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase()) && !file.path.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (sizeFilter === 'huge' && file.size_bytes < 1024 * 1024 * 1024) return false;
    if (sizeFilter === 'large' && (file.size_bytes < 500 * 1024 * 1024 || file.size_bytes >= 1024 * 1024 * 1024)) return false;
    if (sizeFilter === 'medium' && (file.size_bytes < 100 * 1024 * 1024 || file.size_bytes >= 500 * 1024 * 1024)) return false;

    if (typeFilter !== 'all' && file.category !== typeFilter) return false;

    if (ageFilter === '1year' && file.age_days < 365) return false;
    if (ageFilter === '6months' && file.age_days < 180) return false;
    if (ageFilter === '1month' && file.age_days < 30) return false;

    return true;
  });

  const togglePath = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedPaths(next);
  };

  const selectAll = () => {
    const next = new Set<string>();
    filteredFiles.forEach((f) => next.add(f.path));
    setSelectedPaths(next);
  };

  const deselectAll = () => {
    setSelectedPaths(new Set());
  };

  let selectedBytes = 0;
  files.forEach((f) => {
    if (selectedPaths.has(f.path)) {
      selectedBytes += f.size_bytes;
    }
  });

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (selectedPaths.size === 0) return;
    await onDeleteFiles(Array.from(selectedPaths));
    setSelectedPaths(new Set());
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return <Video className="w-4 h-4 text-pink-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-500" />;
      case 'installer':
      case 'disk_image':
        return <Disc className="w-4 h-4 text-amber-500" />;
      case 'archive':
        return <FolderArchive className="w-4 h-4 text-[#C5453E]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  // If user hasn't scanned yet, show On-Demand Scan Hero
  if (!hasScanned && files.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-xl shadow-purple-500/15">
          <FolderArchive className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan Large & Old Files</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Locate heavy files, long-forgotten archives, obsolete DMG installers, and large videos taking up space on your disk.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-8 py-3.5 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#C5453E]/25 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Scanning Disk for Large Files...' : 'SCAN LARGE & OLD FILES'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Filter by size, file format, or age with instant Finder preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Large & Old Files Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selected <span className="font-semibold text-[#C5453E]">{formatBytes(selectedBytes)}</span> ({selectedPaths.size} files)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5 transition-colors"
          >
            Select Filtered
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
            title="Re-scan Large Files"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isDeleting || selectedPaths.size === 0}
            className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl space-y-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name or path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5453E]/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Size Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Size:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'huge', label: '> 1 GB' },
              { id: 'large', label: '500MB - 1GB' },
              { id: 'medium', label: '100MB - 500MB' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSizeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  sizeFilter === tab.id
                    ? 'bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'archive', label: 'Archives' },
              { id: 'installer', label: 'Installers / DMGs' },
              { id: 'video', label: 'Videos' },
              { id: 'document', label: 'Docs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  typeFilter === tab.id
                    ? 'bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Age Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Age:
            </span>
            {[
              { id: 'all', label: 'Any' },
              { id: '1year', label: '> 1 Year' },
              { id: '6months', label: '> 6 Mo' },
              { id: '1month', label: '> 1 Mo' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAgeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  ageFilter === tab.id
                    ? 'bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Large Files Table */}
      <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>File Name & Location</span>
          <div className="flex items-center gap-10 pr-4">
            <span className="hidden md:inline">Last Modified</span>
            <span>Size</span>
            <span>Actions</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[460px] overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <FolderArchive className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Large Files Matching Filters</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting size or category filter thresholds.</p>
            </div>
          ) : (
            filteredFiles.map((file) => {
              const isChecked = selectedPaths.has(file.path);
              return (
                <div
                  key={file.path}
                  onClick={() => togglePath(file.path)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#C5453E] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{file.path}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      {formatTimeAgo(file.age_days)}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono min-w-[70px] text-right">
                      {formatBytes(file.size_bytes)}
                    </span>
                    <button
                      onClick={() => onRevealInFinder(file.path)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Reveal in Finder / Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#C5453E]">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Permanently Delete Selected Files?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are about to permanently delete <strong>{selectedPaths.size} large files</strong> totaling <strong>{formatBytes(selectedBytes)}</strong>.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-bold shadow-lg shadow-[#C5453E]/20"
              >
                Delete Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
