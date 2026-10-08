import React, { useState } from 'react';
import {
  HardDrive,
  Search,
  Trash2,
  RotateCcw,
  RefreshCw,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AppInfo, CleanResult } from '../types';
import { formatBytes } from '../utils/format';

interface AppUninstallerViewProps {
  apps: AppInfo[];
  onUninstall: (executablePath: string, leftoverPaths: string[]) => Promise<CleanResult | null>;
  onReset: (leftoverPaths: string[]) => Promise<CleanResult | null>;
  isProcessing: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  hasScanned: boolean;
}

export const AppUninstallerView: React.FC<AppUninstallerViewProps> = ({
  apps,
  onUninstall,
  onReset,
  isProcessing,
  onRefresh,
  isRefreshing,
  hasScanned,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [modalMode, setModalMode] = useState<'uninstall' | 'reset' | null>(null);

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.bundle_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAppBytes = apps.reduce((acc, app) => acc + app.total_size_bytes, 0);

  const handleConfirmAction = async () => {
    if (!selectedApp) return;
    const leftoverPaths = selectedApp.leftover_paths.map((l) => l.path);

    if (modalMode === 'uninstall') {
      await onUninstall(selectedApp.executable_path, leftoverPaths);
    } else if (modalMode === 'reset') {
      await onReset(leftoverPaths);
    }

    setModalMode(null);
    setSelectedApp(null);
  };

  // If user hasn't scanned yet, show On-Demand Scan Hero
  if (!hasScanned && apps.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] space-y-6 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/15">
          <HardDrive className="w-10 h-10" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan Installed Applications</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Discover all installed desktop apps along with their hidden leftovers, cache directories, and state files across your system.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-8 py-3.5 rounded-2xl bg-[#C5453E] hover:bg-[#b83b34] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#C5453E]/25 border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRefreshing ? 'Scanning Applications...' : 'SCAN APPLICATIONS'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Supports complete clean uninstallation & 1-click app data reset</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Action Card */}
      <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C5453E]/10 text-[#C5453E] border border-[#C5453E]/20 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Application Uninstaller & Leftovers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Found <strong className="text-slate-900 dark:text-white">{apps.length} applications</strong> consuming <strong className="text-[#C5453E]">{formatBytes(totalAppBytes)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
            title="Refresh App List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5453E]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search installed applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C5453E]/50 shadow-sm"
        />
      </div>

      {/* App List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="py-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
            <HardDrive className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Applications Found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Try searching with a different keyword.</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-[#C5453E]/30"
              >
                {/* Main App Item */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#C5453E] font-bold text-base shadow-sm shrink-0">
                      {app.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{app.name}</h4>
                        {app.is_system_app && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> System App
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">{app.executable_path}</p>
                    </div>
                  </div>

                  {/* Size and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="text-left sm:text-right mr-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block">
                        {formatBytes(app.total_size_bytes)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Binary: {formatBytes(app.app_bundle_size_bytes)} • Data: {formatBytes(app.data_size_bytes + app.cache_size_bytes)}
                      </span>
                    </div>

                    {!app.is_system_app ? (
                      <div className="flex items-center gap-2">
                        {app.leftover_paths.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setModalMode('reset');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-white/5 transition-all flex items-center gap-1"
                            title="Wipe caches and settings while keeping app installed"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setModalMode('uninstall');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
                          title="Completely delete application bundle and all leftover caches"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Uninstall</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic pr-2">Protected</span>
                    )}

                    {app.leftover_paths.length > 0 && (
                      <button
                        onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="View leftover files breakdown"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Leftovers Breakdown Drawer */}
                {isExpanded && app.leftover_paths.length > 0 && (
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      <Layers className="w-3.5 h-3.5 text-[#C5453E]" />
                      <span>Associated Support Data & Caches ({app.leftover_paths.length} items)</span>
                    </div>

                    {app.leftover_paths.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white dark:bg-white/5 text-[11px] border border-slate-100 dark:border-transparent">
                        <div className="min-w-0 pr-3">
                          <span className="font-medium text-slate-700 dark:text-slate-200 block truncate">{item.description}</span>
                          <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px] block truncate">{item.path}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-300 shrink-0">
                          {formatBytes(item.size_bytes)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {modalMode && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#C5453E]">
              {modalMode === 'uninstall' ? <Trash2 className="w-6 h-6" /> : <RotateCcw className="w-6 h-6 text-amber-500" />}
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {modalMode === 'uninstall' ? `Uninstall ${selectedApp.name}?` : `Reset ${selectedApp.name}?`}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {modalMode === 'uninstall'
                ? `This will remove ${selectedApp.name} along with all support files and caches (${formatBytes(selectedApp.total_size_bytes)} total).`
                : `This will clear all application caches, support logs, and state files (${formatBytes(selectedApp.data_size_bytes + selectedApp.cache_size_bytes)}) while keeping the application binary.`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg ${
                  modalMode === 'uninstall'
                    ? 'bg-[#C5453E] hover:bg-[#b83b34] shadow-[#C5453E]/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                {modalMode === 'uninstall' ? 'Confirm Uninstall' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
