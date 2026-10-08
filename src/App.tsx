import React, { useEffect, useState } from 'react';
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

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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

  // Initial load
  const loadSystemData = async () => {
    setIsRefreshing(true);
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
    } catch (err) {
      console.error('Failed to load system data:', err);
      showToast('Error refreshing system data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    // Refresh interval for RAM & CPU
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

  // Handlers
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
        await loadSystemData();
        return result;
      } else {
        showToast('Cleaning completed with some permission warnings', 'error');
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
      await loadSystemData();
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
      await loadSystemData();
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
      await loadSystemData();
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
      await loadSystemData();
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
      await loadSystemData();
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
          onRefresh={loadSystemData}
          isRefreshing={isRefreshing}
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
              onRefresh={loadSystemData}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'trash-bins' && (
            <TrashBinsView
              trashItems={trashItems}
              onEmptyTrash={handleEmptyTrash}
              isEmptying={isCleaning}
              onRefresh={loadSystemData}
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
              onRefresh={loadSystemData}
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
              onRefresh={loadSystemData}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'developer' && (
            <DeveloperSpaceView
              projects={developerProjects}
              onCleanFolders={handleCleanDeveloperFolders}
              isCleaning={isCleaning}
              onRefresh={loadSystemData}
              isRefreshing={isRefreshing}
              onRevealInFinder={handleRevealInFinder}
            />
          )}

          {activeTab === 'ram-booster' && (
            <RamBoosterView
              systemOverview={systemOverview}
              onOptimizeRam={handleOptimizeRam}
              isOptimizing={isOptimizingRam}
              onRefresh={loadSystemData}
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
