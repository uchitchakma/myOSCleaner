import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SmartScanView } from './components/SmartScanView';
import { SystemJunkView } from './components/SystemJunkView';
import { TrashBinsView } from './components/TrashBinsView';
import { LargeFilesView } from './components/LargeFilesView';
import { AppUninstallerView } from './components/AppUninstallerView';
import { DeveloperSpaceView } from './components/DeveloperSpaceView';
import { RamBoosterView } from './components/RamBoosterView';
import { SettingsView } from './components/SettingsView';
import {
  NavTab,
  SystemOverview,
  CleanCategory,
  CleanItem,
  LargeFileInfo,
  AppInfo,
  DeveloperProjectInfo,
  CleanResult,
} from './types';
import * as tauri from './services/tauriService';
import { formatBytes } from './utils/format';
import { CheckCircle2, AlertTriangle, Info, X, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('smart-scan');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [confirmBeforeClean, setConfirmBeforeClean] = useState(true);

  // Core system data
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [junkCategories, setJunkCategories] = useState<CleanCategory[]>([]);
  const [trashItems, setTrashItems] = useState<CleanItem[]>([]);
  const [largeFiles, setLargeFiles] = useState<LargeFileInfo[]>([]);
  const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
  const [developerProjects, setDeveloperProjects] = useState<DeveloperProjectInfo[]>([]);

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isOptimizingRam, setIsOptimizingRam] = useState(false);

  // Tab loaded cache
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['smart-scan']));

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Instant Initial Load (Only Overview in <20ms)
  const initOverview = async () => {
    try {
      const overview = await tauri.fetchSystemOverview();
      setSystemOverview(overview);
    } catch (err) {
      console.error('Failed to load system overview:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  // 2. Load tab data on demand
  const loadTabData = useCallback(async (tab: NavTab) => {
    try {
      if (tab === 'system-junk' || tab === 'smart-scan') {
        const junk = await tauri.fetchSystemJunk();
        setJunkCategories(junk);
      }
      if (tab === 'trash-bins') {
        const trash = await tauri.fetchTrashBin();
        setTrashItems(trash);
      }
      if (tab === 'large-files') {
        const files = await tauri.fetchLargeFiles(25);
        setLargeFiles(files);
      }
      if (tab === 'uninstaller') {
        const apps = await tauri.fetchInstalledApplications();
        setInstalledApps(apps);
      }
      if (tab === 'developer') {
        const dev = await tauri.fetchDeveloperProjects();
        setDeveloperProjects(dev);
      }
      setLoadedTabs((prev) => new Set(prev).add(tab));
    } catch (err) {
      console.error(`Error loading data for ${tab}:`, err);
    }
  }, []);

  useEffect(() => {
    initOverview();
    // Pre-fetch trash & junk in background after initial render
    setTimeout(() => {
      loadTabData('system-junk');
      loadTabData('trash-bins');
    }, 100);

    // RAM & CPU refresh interval
    const interval = setInterval(async () => {
      try {
        const overview = await tauri.fetchSystemOverview();
        setSystemOverview(overview);
      } catch (e) {
        console.error(e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [loadTabData]);

  // When active tab changes, load if not loaded yet
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      loadTabData(activeTab);
    }
  }, [activeTab, loadedTabs, loadTabData]);

  // Full Refresh
  const handleFullRefresh = async () => {
    setIsRefreshing(true);
    try {
      const overview = await tauri.fetchSystemOverview();
      setSystemOverview(overview);
      await loadTabData(activeTab);
      showToast('System data refreshed', 'info');
    } catch (err) {
      console.error(err);
      showToast('Refresh error', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Smart Scan (Scans everything in parallel)
  const handleStartSmartScan = async () => {
    setIsScanning(true);
    try {
      const [overview, junk, trash, files, apps, dev] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchSystemJunk(),
        tauri.fetchTrashBin(),
        tauri.fetchLargeFiles(25),
        tauri.fetchInstalledApplications(),
        tauri.fetchDeveloperProjects(),
      ]);

      setSystemOverview(overview);
      setJunkCategories(junk);
      setTrashItems(trash);
      setLargeFiles(files);
      setInstalledApps(apps);
      setDeveloperProjects(dev);
      setLoadedTabs(new Set(['smart-scan', 'system-junk', 'trash-bins', 'large-files', 'uninstaller', 'developer']));
      showToast('Smart Scan Complete!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Scan encountered an error', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanJunkPaths = async (paths: string[]): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const result = await tauri.executeCleanItems(paths);
      if (result.success || result.deleted_count > 0) {
        showToast(`Successfully reclaimed ${formatBytes(result.freed_bytes)}!`, 'success');
        const [overview, junk] = await Promise.all([
          tauri.fetchSystemOverview(),
          tauri.fetchSystemJunk(),
        ]);
        setSystemOverview(overview);
        setJunkCategories(junk);
        return result;
      } else {
        showToast('Clean completed with warnings', 'error');
      }
      return result;
    } catch (err) {
      console.error(err);
      showToast('Failed to clean items', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleEmptyTrash = async (): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const res = await tauri.executeEmptyTrash();
      showToast(`Emptied Trash bin (${formatBytes(res.freed_bytes)} reclaimed)`, 'success');
      const [overview, trash] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchTrashBin(),
      ]);
      setSystemOverview(overview);
      setTrashItems(trash);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to empty trash', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDeleteLargeFiles = async (paths: string[]): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const res = await tauri.executeDeleteFiles(paths);
      showToast(`Deleted ${res.deleted_count} files (${formatBytes(res.freed_bytes)} freed)`, 'success');
      const [overview, files] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchLargeFiles(25),
      ]);
      setSystemOverview(overview);
      setLargeFiles(files);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to delete files', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleUninstallApp = async (executablePath: string, leftoverPaths: string[]): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const res = await tauri.executeUninstallApp(executablePath, leftoverPaths);
      showToast(`Successfully uninstalled app (${formatBytes(res.freed_bytes)} freed)`, 'success');
      const [overview, apps] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchInstalledApplications(),
      ]);
      setSystemOverview(overview);
      setInstalledApps(apps);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to uninstall app', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleResetApp = async (leftoverPaths: string[]): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const res = await tauri.executeResetApp(leftoverPaths);
      showToast(`Application reset to initial state (${formatBytes(res.freed_bytes)} freed)`, 'success');
      const [overview, apps] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchInstalledApplications(),
      ]);
      setSystemOverview(overview);
      setInstalledApps(apps);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to reset app', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanDeveloperFolders = async (folderPaths: string[]): Promise<CleanResult | null> => {
    setIsCleaning(true);
    try {
      const res = await tauri.executeCleanDeveloperFolders(folderPaths);
      showToast(`Reclaimed ${formatBytes(res.freed_bytes)} from developer caches!`, 'success');
      const [overview, dev] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchDeveloperProjects(),
      ]);
      setSystemOverview(overview);
      setDeveloperProjects(dev);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to clean developer folders', 'error');
      return null;
    } finally {
      setIsCleaning(false);
    }
  };

  const handleOptimizeRam = async () => {
    setIsOptimizingRam(true);
    try {
      const res = await tauri.executeOptimizeRam();
      showToast(`RAM Optimized! Freed ${formatBytes(res.freed_bytes)}`, 'success');
      const overview = await tauri.fetchSystemOverview();
      setSystemOverview(overview);
      return res;
    } catch (err) {
      console.error(err);
      showToast('Failed to optimize RAM', 'error');
      return null;
    } finally {
      setIsOptimizingRam(false);
    }
  };

  const handleRevealInFinder = async (path: string) => {
    try {
      await tauri.revealFileInFinder(path);
    } catch (err) {
      console.error(err);
      showToast('Could not open path in file manager', 'error');
    }
  };

  const totalJunkCount = junkCategories.reduce((acc, cat) => acc + cat.item_count, 0) + trashItems.length;

  return (
    <div className={`h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans ${theme}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemOverview={systemOverview}
        junkCount={totalJunkCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 dark:bg-slate-950 transition-colors">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          systemOverview={systemOverview}
          onRefresh={handleFullRefresh}
          isRefreshing={isRefreshing}
          theme={theme}
          setTheme={setTheme}
          onQuickOptimizeRam={handleOptimizeRam}
          isOptimizingRam={isOptimizingRam}
        />

        {/* Dynamic Tab Views */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs font-medium">Initializing myOSCleaner...</p>
            </div>
          ) : (
            <>
              {activeTab === 'smart-scan' && (
                <SmartScanView
                  systemOverview={systemOverview}
                  junkCategories={junkCategories}
                  onStartScan={handleStartSmartScan}
                  isScanning={isScanning}
                  onExecuteClean={handleCleanJunkPaths}
                  isCleaning={isCleaning}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'system-junk' && (
                <SystemJunkView
                  categories={junkCategories}
                  onCleanSelected={handleCleanJunkPaths}
                  isCleaning={isCleaning}
                  onRefresh={() => loadTabData('system-junk')}
                  isRefreshing={isRefreshing}
                />
              )}

              {activeTab === 'trash-bins' && (
                <TrashBinsView
                  trashItems={trashItems}
                  onEmptyTrash={handleEmptyTrash}
                  isEmptying={isCleaning}
                  onRefresh={() => loadTabData('trash-bins')}
                  isRefreshing={isRefreshing}
                  onRevealInFinder={handleRevealInFinder}
                  onDeleteSingle={(path) => handleCleanJunkPaths([path])}
                />
              )}

              {activeTab === 'large-files' && (
                <LargeFilesView
                  files={largeFiles}
                  onDeleteFiles={handleDeleteLargeFiles}
                  isDeleting={isCleaning}
                  onRefresh={() => loadTabData('large-files')}
                  isRefreshing={isRefreshing}
                  onRevealInFinder={handleRevealInFinder}
                />
              )}

              {activeTab === 'uninstaller' && (
                <AppUninstallerView
                  apps={installedApps}
                  onUninstall={handleUninstallApp}
                  onReset={handleResetApp}
                  isProcessing={isCleaning}
                  onRefresh={() => loadTabData('uninstaller')}
                  isRefreshing={isRefreshing}
                />
              )}

              {activeTab === 'developer' && (
                <DeveloperSpaceView
                  projects={developerProjects}
                  onCleanFolders={handleCleanDeveloperFolders}
                  isCleaning={isCleaning}
                  onRefresh={() => loadTabData('developer')}
                  isRefreshing={isRefreshing}
                  onRevealInFinder={handleRevealInFinder}
                />
              )}

              {activeTab === 'ram-booster' && (
                <RamBoosterView
                  systemOverview={systemOverview}
                  onOptimizeRam={handleOptimizeRam}
                  isOptimizing={isOptimizingRam}
                  onRefresh={handleFullRefresh}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  theme={theme}
                  setTheme={setTheme}
                  confirmBeforeClean={confirmBeforeClean}
                  setConfirmBeforeClean={setConfirmBeforeClean}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white shadow-2xl flex items-center gap-3 text-xs backdrop-blur-lg">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
