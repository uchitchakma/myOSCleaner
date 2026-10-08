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
}

export const AppUninstallerView: React.FC<AppUninstallerViewProps> = ({
  apps,
  onUninstall,
  onReset,
  isProcessing,
  onRefresh,
  isRefreshing,
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Action Card */}
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Application Uninstaller & Leftover Cleaner</h3>
            <p className="text-xs text-slate-400">
              Found <strong className="text-white">{apps.length} applications</strong> consuming <strong className="text-emerald-400">{formatBytes(totalAppBytes)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors"
            title="Refresh App List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* App List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="py-12 bg-slate-900/40 border border-white/5 rounded-2xl text-center text-slate-400 text-xs">
            <HardDrive className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">No Applications Found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Try searching with a different keyword.</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            return (
              <div
                key={app.id}
                className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20"
              >
                {/* Main App Item */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* App Generic Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                      {app.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-white truncate">{app.name}</h4>
                        {app.is_system_app && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> System App
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{app.executable_path}</p>
                    </div>
                  </div>

                  {/* Size and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="text-left sm:text-right mr-2">
                      <span className="font-bold text-sm text-white font-mono block">
                        {formatBytes(app.total_size_bytes)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Binary: {formatBytes(app.app_bundle_size_bytes)} • Data: {formatBytes(app.data_size_bytes + app.cache_size_bytes)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    {!app.is_system_app ? (
                      <div className="flex items-center gap-2">
                        {app.leftover_paths.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setModalMode('reset');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition-all flex items-center gap-1"
                            title="Wipe caches and settings while keeping app installed"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setModalMode('uninstall');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
                          title="Completely delete application bundle and all leftover caches"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Uninstall</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic pr-2">Protected</span>
                    )}

                    {/* Leftover expand toggle */}
                    {app.leftover_paths.length > 0 && (
                      <button
                        onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="View leftover files breakdown"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Leftovers Breakdown Drawer */}
                {isExpanded && app.leftover_paths.length > 0 && (
                  <div className="px-5 py-3 bg-slate-950/50 border-t border-white/5 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Associated Support Data & Caches ({app.leftover_paths.length} items)</span>
                    </div>

                    {app.leftover_paths.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5 text-[11px]">
                        <div className="min-w-0 pr-3">
                          <span className="font-medium text-slate-200 block truncate">{item.description}</span>
                          <span className="font-mono text-slate-500 text-[10px] block truncate">{item.path}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-300 shrink-0">
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
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              {modalMode === 'uninstall' ? <Trash2 className="w-6 h-6" /> : <RotateCcw className="w-6 h-6 text-amber-400" />}
              <h3 className="text-base font-bold text-white">
                {modalMode === 'uninstall' ? `Uninstall ${selectedApp.name}?` : `Reset ${selectedApp.name}?`}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modalMode === 'uninstall'
                ? `This will remove ${selectedApp.name} along with all support files and caches (${formatBytes(selectedApp.total_size_bytes)} total).`
                : `This will clear all application caches, support logs, and state files (${formatBytes(selectedApp.data_size_bytes + selectedApp.cache_size_bytes)}) while keeping the application binary.`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg ${
                  modalMode === 'uninstall'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-red-500/20'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20'
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
