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
  HardDrive,
} from 'lucide-react';
import { LargeFileInfo, CleanResult, DiskItem } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/format';
import { GlassScanningHub } from './GlassScanningHub';

interface LargeFilesViewProps {
  files: LargeFileInfo[];
  onDeleteFiles: (paths: string[]) => Promise<CleanResult | null>;
  isDeleting: boolean;
  onRefresh: (targetDrive?: string) => Promise<void>;
  isRefreshing: boolean;
  onRevealInFinder: (path: string) => Promise<void>;
  hasScanned: boolean;
  disks?: DiskItem[];
  selectedDrive?: string;
  onSelectDrive?: (driveMount: string | undefined) => void;
}

export const LargeFilesView: React.FC<LargeFilesViewProps> = ({
  files,
  onDeleteFiles,
  isDeleting,
  onRefresh,
  isRefreshing,
  onRevealInFinder,
  hasScanned,
  disks = [],
  selectedDrive,
  onSelectDrive,
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

  // 1. While active scanning, show 3D Glass Progress Hub
  if (isRefreshing) {
    return (
      <GlassScanningHub
        title="Scanning Large & Old Files"
        subtitle="Analyzing disk directories for files exceeding 25MB, media archives, and installers..."
        category="large-files"
      />
    );
  }

  // 2. If user hasn't scanned yet, show On-Demand Scan 3D Glass Hero
  if (!hasScanned && files.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
          <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl -z-10" />

          {/* 3D Glossy Icon Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-purple-400 via-purple-500 to-indigo-600 p-[1px] shadow-[0_12px_28px_rgba(168,85,247,0.4)] ring-1 ring-white/30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-b from-white/25 via-transparent to-black/20 flex items-center justify-center">
              <FolderArchive className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute inset-x-2 top-1 h-3 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Scan Large & Old Files
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Locate heavy files, long-forgotten archives, obsolete DMG installers, and large videos taking up space on your internal disk or external SSD/HDD.
            </p>
          </div>

          {/* Drive Selector Pills in Hero */}
          {disks.length > 1 && (
            <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => onSelectDrive?.(undefined)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !selectedDrive ? 'btn-3d-primary shadow-sm' : 'btn-3d-secondary'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>All Connected Storage</span>
              </button>
              {disks.map((d) => (
                <button
                  key={d.mount_point}
                  onClick={() => onSelectDrive?.(d.mount_point)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedDrive === d.mount_point ? 'btn-3d-primary shadow-sm' : 'btn-3d-secondary'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{d.name}</span>
                  <span className="text-[10px] opacity-75">({d.disk_type || (d.is_internal ? 'Internal' : 'External')})</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onRefresh(selectedDrive)}
            className="btn-3d-primary w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>SCAN {selectedDrive ? 'SELECTED DRIVE' : 'ALL STORAGE DRIVES'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Filter by size, file format, or age with instant Finder preview</span>
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-purple-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 p-[1px]">
            <FolderArchive className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Large & Old Files Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selected <span className="font-bold text-[#C5453E]">{formatBytes(selectedBytes)}</span> ({selectedPaths.size} files)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={selectAll}
            className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Select Filtered
          </button>
          <button
            onClick={deselectAll}
            className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => onRefresh(selectedDrive)}
            className="btn-3d-secondary p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            title="Re-scan Large Files"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isDeleting || selectedPaths.size === 0}
            className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-3xl space-y-3.5 shadow-sm">
        {/* Drive Target Selector Bar */}
        {disks.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-white/5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-extrabold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <HardDrive className="w-3.5 h-3.5" /> Target Storage:
            </span>
            <button
              onClick={() => {
                onSelectDrive?.(undefined);
                onRefresh(undefined);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 text-xs ${
                !selectedDrive ? 'btn-3d-primary shadow-sm' : 'btn-3d-secondary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Drives ({disks.length})</span>
            </button>
            {disks.map((d) => {
              const isSelected = selectedDrive === d.mount_point;
              return (
                <button
                  key={d.mount_point}
                  onClick={() => {
                    onSelectDrive?.(d.mount_point);
                    onRefresh(d.mount_point);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 text-xs ${
                    isSelected ? 'btn-3d-primary shadow-sm' : 'btn-3d-secondary'
                  }`}
                >
                  <HardDrive
                    className={`w-3.5 h-3.5 ${
                      isSelected
                        ? 'text-white'
                        : d.is_internal
                        ? 'text-[#C5453E]'
                        : 'text-indigo-500'
                    }`}
                  />
                  <span>{d.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({formatBytes(d.available_bytes)} free)
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name or path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5453E]/50 shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Size Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1 flex items-center gap-1">
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
                className={`px-3 py-1 rounded-xl transition-all font-semibold ${
                  sizeFilter === tab.id
                    ? 'btn-3d-primary text-xs shadow-md'
                    : 'btn-3d-secondary text-xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1">Type:</span>
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
                className={`px-3 py-1 rounded-xl transition-all font-semibold ${
                  typeFilter === tab.id
                    ? 'btn-3d-primary text-xs shadow-md'
                    : 'btn-3d-secondary text-xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Age Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1 flex items-center gap-1">
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
                className={`px-3 py-1 rounded-xl transition-all font-semibold ${
                  ageFilter === tab.id
                    ? 'btn-3d-primary text-xs shadow-md'
                    : 'btn-3d-secondary text-xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Large Files Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="p-3.5 bg-slate-100/60 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
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
              <p className="font-bold text-slate-700 dark:text-slate-300">No Large Files Matching Filters</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting size or category filter thresholds.</p>
            </div>
          ) : (
            filteredFiles.map((file) => {
              const isChecked = selectedPaths.has(file.path);
              return (
                <div
                  key={file.path}
                  onClick={() => togglePath(file.path)}
                  className="p-3.5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#C5453E] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                    <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{file.path}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      {formatTimeAgo(file.age_days)}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono min-w-[70px] text-right">
                      {formatBytes(file.size_bytes)}
                    </span>
                    <button
                      onClick={() => onRevealInFinder(file.path)}
                      className="btn-3d-secondary p-1.5 rounded-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
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
                className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
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
export default LargeFilesView;

