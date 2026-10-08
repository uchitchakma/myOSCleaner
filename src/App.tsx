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
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

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

  // Scanning & cleaning states
  const [scannedTabs, setScannedTabs] = useState<Set<string>>(new Set());
  const [scanningTabs, setScanningTabs] = useState<Set<string>>(new Set());
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isOptimizingRam, setIsOptimizingRam] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Instant System Overview (Hardware stats < 5ms)
  const initOverview = async () => {
    try {
      const overview = await tauri.fetchSystemOverview();
      setSystemOverview(overview);
    } catch (err) {
      console.error('Failed to load system overview:', err);
    }
  };

  const [largeFilesDrive, setLargeFilesDrive] = useState<string | undefined>(undefined);

  // 2. Fast Non-Blocking On-Demand Scan per Tab
  const scanTab = useCallback(async (tab: NavTab, customDrive?: string) => {
    // 1. Immediately activate scanning state so Progress Hub renders at 0ms
    setScanningTabs((prev) => new Set(prev).add(tab));
    
    // Give React 1 tick to paint the Glass Progress Hub immediately
    await new Promise((r) => setTimeout(r, 40));

    const startTime = Date.now();
    let scanPromise: Promise<any>;

    if (tab === 'system-junk' || tab === 'smart-scan') {
      scanPromise = tauri.fetchSystemJunk().then(setJunkCategories);
    } else if (tab === 'trash-bins') {
      scanPromise = tauri.fetchTrashBin().then(setTrashItems);
    } else if (tab === 'large-files') {
      const drive = customDrive !== undefined ? customDrive : largeFilesDrive;
      scanPromise = tauri.fetchLargeFiles(25, drive).then(setLargeFiles);
    } else if (tab === 'uninstaller') {
      scanPromise = tauri.fetchInstalledApplications().then(setInstalledApps);
    } else if (tab === 'developer') {
      scanPromise = tauri.fetchDeveloperProjects().then(setDeveloperProjects);
    } else {
      scanPromise = Promise.resolve();
    }

    try {
      await scanPromise;
      // Guarantee smooth visual progress animation for at least 700ms
      const elapsed = Date.now() - startTime;
      if (elapsed < 750) {
        await new Promise((r) => setTimeout(r, 750 - elapsed));
      }
      setScannedTabs((prev) => new Set(prev).add(tab));
    } catch (err) {
      console.error(`Error scanning tab ${tab}:`, err);
      showToast(`Failed to scan ${tab}`, 'error');
    } finally {
      setScanningTabs((prev) => {
        const next = new Set(prev);
        next.delete(tab);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    initOverview();

    // Fast RAM & CPU hardware monitor refresh interval
    const interval = setInterval(async () => {
      try {
        const overview = await tauri.fetchSystemOverview();
        setSystemOverview(overview);
      } catch (e) {
        console.error(e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Full Global Refresh
  const handleFullRefresh = async () => {
    setIsRefreshingOverview(true);
    try {
      const overview = await tauri.fetchSystemOverview();
      setSystemOverview(overview);
      if (scannedTabs.has(activeTab)) {
        await scanTab(activeTab);
      }
      showToast('System status refreshed', 'info');
    } catch (err) {
      console.error(err);
      showToast('Refresh error', 'error');
    } finally {
      setIsRefreshingOverview(false);
    }
  };

  // Smart Scan (Scans all modules in parallel on-demand)
  const handleStartSmartScan = async () => {
    setIsScanningAll(true);
    const startTime = Date.now();
    try {
      const [overview, junk, trash, files, apps, dev] = await Promise.all([
        tauri.fetchSystemOverview(),
        tauri.fetchSystemJunk(),
        tauri.fetchTrashBin(),
        tauri.fetchLargeFiles(25),
        tauri.fetchInstalledApplications(),
        tauri.fetchDeveloperProjects(),
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < 850) {
        await new Promise((r) => setTimeout(r, 850 - elapsed));
      }

      setSystemOverview(overview);
      setJunkCategories(junk);
      setTrashItems(trash);
      setLargeFiles(files);
      setInstalledApps(apps);
      setDeveloperProjects(dev);
      setScannedTabs(new Set(['smart-scan', 'system-junk', 'trash-bins', 'large-files', 'uninstaller', 'developer']));
      showToast('Smart Scan Complete!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Smart Scan encountered an issue', 'error');
    } finally {
      setIsScanningAll(false);
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
        setScannedTabs((prev) => new Set(prev).add('system-junk'));
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
      setScannedTabs((prev) => new Set(prev).add('trash-bins'));
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
      setScannedTabs((prev) => new Set(prev).add('large-files'));
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
      setScannedTabs((prev) => new Set(prev).add('uninstaller'));
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
      setScannedTabs((prev) => new Set(prev).add('uninstaller'));
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
      setScannedTabs((prev) => new Set(prev).add('developer'));
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
    <div className={`h-screen w-screen flex bg-[#f4f6f9] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-hidden font-sans ${theme}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemOverview={systemOverview}
        junkCount={totalJunkCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f6f9] dark:bg-[#090d16] transition-colors">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          systemOverview={systemOverview}
          onRefresh={handleFullRefresh}
          isRefreshing={isRefreshingOverview}
          theme={theme}
          setTheme={setTheme}
          onQuickOptimizeRam={handleOptimizeRam}
          isOptimizingRam={isOptimizingRam}
        />

        {/* Dynamic Tab Views */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {activeTab === 'smart-scan' && (
            <SmartScanView
              systemOverview={systemOverview}
              junkCategories={junkCategories}
              onStartScan={handleStartSmartScan}
              isScanning={isScanningAll}
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
              onRefresh={() => scanTab('system-junk')}
              isRefreshing={scanningTabs.has('system-junk')}
              hasScanned={scannedTabs.has('system-junk')}
            />
          )}

          {activeTab === 'trash-bins' && (
            <TrashBinsView
              trashItems={trashItems}
              onEmptyTrash={handleEmptyTrash}
              isEmptying={isCleaning}
              onRefresh={() => scanTab('trash-bins')}
              isRefreshing={scanningTabs.has('trash-bins')}
              onRevealInFinder={handleRevealInFinder}
              onDeleteSingle={(path) => handleCleanJunkPaths([path])}
              hasScanned={scannedTabs.has('trash-bins')}
            />
          )}

          {activeTab === 'large-files' && (
            <LargeFilesView
              files={largeFiles}
              onDeleteFiles={handleDeleteLargeFiles}
              isDeleting={isCleaning}
              onRefresh={(targetDrive) => scanTab('large-files', targetDrive)}
              isRefreshing={scanningTabs.has('large-files')}
              onRevealInFinder={handleRevealInFinder}
              hasScanned={scannedTabs.has('large-files')}
              disks={systemOverview?.disks || []}
              selectedDrive={largeFilesDrive}
              onSelectDrive={(drive) => {
                setLargeFilesDrive(drive);
                scanTab('large-files', drive);
              }}
            />
          )}

          {activeTab === 'uninstaller' && (
            <AppUninstallerView
              apps={installedApps}
              onUninstall={handleUninstallApp}
              onReset={handleResetApp}
              isProcessing={isCleaning}
              onRefresh={() => scanTab('uninstaller')}
              isRefreshing={scanningTabs.has('uninstaller')}
              hasScanned={scannedTabs.has('uninstaller')}
            />
          )}

          {activeTab === 'developer' && (
            <DeveloperSpaceView
              projects={developerProjects}
              onCleanFolders={handleCleanDeveloperFolders}
              isCleaning={isCleaning}
              onRefresh={() => scanTab('developer')}
              isRefreshing={scanningTabs.has('developer')}
              onRevealInFinder={handleRevealInFinder}
              hasScanned={scannedTabs.has('developer')}
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
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-white/15 text-white shadow-2xl flex items-center gap-3 text-xs backdrop-blur-lg">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-[#C5453E]" />}
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

