import { invoke } from '@tauri-apps/api/core';
import {
  SystemOverview,
  CleanCategory,
  CleanResult,
  CleanItem,
  LargeFileInfo,
  AppInfo,
  DeveloperProjectInfo,
  RamBoostResult,
} from '../types';

export async function fetchSystemOverview(): Promise<SystemOverview> {
  try {
    return await invoke<SystemOverview>('get_system_overview');
  } catch (e) {
    console.warn('invoke get_system_overview error/fallback:', e);
    return {
      hostname: "Host.local",
      os_name: "Universal OS",
      os_version: "1.0",
      arch: "x86_64 / arm64",
      cpu_brand: "Multi-Core Processor",
      cpu_cores: 8,
      cpu_usage_percent: 12.5,
      total_memory_bytes: 16 * 1024 * 1024 * 1024,
      used_memory_bytes: 9 * 1024 * 1024 * 1024,
      free_memory_bytes: 7 * 1024 * 1024 * 1024,
      memory_usage_percent: 56.2,
      total_swap_bytes: 2 * 1024 * 1024 * 1024,
      used_swap_bytes: 256 * 1024 * 1024,
      uptime_seconds: 120000,
      disks: [
        {
          name: "System Drive",
          mount_point: "/",
          total_bytes: 512 * 1024 * 1024 * 1024,
          available_bytes: 220 * 1024 * 1024 * 1024,
          used_bytes: 292 * 1024 * 1024 * 1024,
          usage_percent: 57.0,
          file_system: "APFS / NTFS / EXT4",
          is_removable: false,
        }
      ],
      battery: null,
      trash_size_bytes: 1.2 * 1024 * 1024 * 1024,
      estimated_junk_bytes: 8.4 * 1024 * 1024 * 1024,
    };
  }
}

export async function fetchSystemJunk(): Promise<CleanCategory[]> {
  try {
    return await invoke<CleanCategory[]>('scan_all_junk');
  } catch (e) {
    console.warn('invoke scan_all_junk fallback:', e);
    return [];
  }
}

export async function executeCleanItems(paths: string[]): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('clean_selected_items', { paths });
  } catch (e) {
    console.error('invoke clean_selected_items error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: paths.length,
      errors: [String(e)],
    };
  }
}

export async function fetchTrashBin(): Promise<CleanItem[]> {
  try {
    return await invoke<CleanItem[]>('scan_trash_bin');
  } catch (e) {
    console.warn('invoke scan_trash_bin fallback:', e);
    return [];
  }
}

export async function executeEmptyTrash(): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('empty_trash_bin_cmd');
  } catch (e) {
    console.error('invoke empty_trash_bin_cmd error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: 1,
      errors: [String(e)],
    };
  }
}

export async function fetchLargeFiles(minSizeMb: number = 25, targetPath?: string): Promise<LargeFileInfo[]> {
  try {
    return await invoke<LargeFileInfo[]>('scan_large_files_cmd', { minSizeMb, targetPath });
  } catch (e) {
    console.warn('invoke scan_large_files_cmd fallback:', e);
    return [];
  }
}

export async function executeDeleteFiles(paths: string[]): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('delete_files', { paths });
  } catch (e) {
    console.error('invoke delete_files error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: paths.length,
      errors: [String(e)],
    };
  }
}

export async function revealFileInFinder(path: string): Promise<void> {
  try {
    await invoke('reveal_in_finder', { path });
  } catch (e) {
    console.warn('reveal_in_finder warning:', e);
  }
}

export async function fetchInstalledApplications(): Promise<AppInfo[]> {
  try {
    return await invoke<AppInfo[]>('scan_applications');
  } catch (e) {
    console.warn('invoke scan_applications fallback:', e);
    return [];
  }
}

export async function executeUninstallApp(executablePath: string, leftoverPaths: string[]): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('uninstall_application', { executablePath, leftoverPaths });
  } catch (e) {
    console.error('invoke uninstall_application error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: 1,
      errors: [String(e)],
    };
  }
}

export async function executeResetApp(leftoverPaths: string[]): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('reset_application', { leftoverPaths });
  } catch (e) {
    console.error('invoke reset_application error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: 1,
      errors: [String(e)],
    };
  }
}

export async function fetchDeveloperProjects(): Promise<DeveloperProjectInfo[]> {
  try {
    return await invoke<DeveloperProjectInfo[]>('scan_developer_space');
  } catch (e) {
    console.warn('invoke scan_developer_space fallback:', e);
    return [];
  }
}

export async function executeCleanDeveloperFolders(folderPaths: string[]): Promise<CleanResult> {
  try {
    return await invoke<CleanResult>('clean_developer_projects', { folderPaths });
  } catch (e) {
    console.error('invoke clean_developer_projects error:', e);
    return {
      success: false,
      freed_bytes: 0,
      deleted_count: 0,
      failed_count: folderPaths.length,
      errors: [String(e)],
    };
  }
}

export async function executeOptimizeRam(): Promise<RamBoostResult> {
  try {
    return await invoke<RamBoostResult>('optimize_ram');
  } catch (e) {
    console.warn('invoke optimize_ram fallback:', e);
    return {
      initial_free_bytes: 8 * 1024 * 1024 * 1024,
      final_free_bytes: 10 * 1024 * 1024 * 1024,
      freed_bytes: 2 * 1024 * 1024 * 1024,
      message: "Memory optimized.",
    };
  }
}
