export interface SystemOverview {
  hostname: string;
  os_name: string;
  os_version: string;
  arch: string;
  cpu_brand: string;
  cpu_cores: number;
  cpu_usage_percent: number;
  total_memory_bytes: number;
  used_memory_bytes: number;
  free_memory_bytes: number;
  memory_usage_percent: number;
  total_swap_bytes: number;
  used_swap_bytes: number;
  uptime_seconds: number;
  disks: DiskItem[];
  battery: BatteryStatus | null;
  trash_size_bytes: number;
  estimated_junk_bytes: number;
}

export interface DiskItem {
  name: string;
  mount_point: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  usage_percent: number;
  file_system: string;
  is_removable: boolean;
  disk_type?: string;
  is_internal?: boolean;
}

export interface BatteryStatus {
  percentage: number;
  state: string;
  time_remaining: string;
}

export interface CleanCategory {
  id: string;
  name: string;
  description: string;
  category_type: string;
  total_bytes: number;
  item_count: number;
  safety_level: 'safe' | 'review' | 'caution';
  items: CleanItem[];
}

export interface CleanItem {
  id: string;
  path: string;
  name: string;
  size_bytes: number;
  selected_by_default: boolean;
  category: string;
  description: string;
  last_modified: number;
  is_directory: boolean;
}

export interface CleanResult {
  success: boolean;
  freed_bytes: number;
  deleted_count: number;
  failed_count: number;
  errors: string[];
}

export interface LargeFileInfo {
  path: string;
  name: string;
  extension: string;
  size_bytes: number;
  category: 'archive' | 'video' | 'audio' | 'document' | 'installer' | 'disk_image' | 'other';
  last_modified: number;
  last_accessed: number;
  age_days: number;
}

export interface AppInfo {
  id: string;
  name: string;
  bundle_id: string;
  version: string;
  executable_path: string;
  icon_path: string;
  total_size_bytes: number;
  app_bundle_size_bytes: number;
  data_size_bytes: number;
  cache_size_bytes: number;
  preferences_size_bytes: number;
  leftover_paths: AppLeftoverItem[];
  is_system_app: boolean;
}

export interface AppLeftoverItem {
  path: string;
  item_type: 'bundle' | 'support' | 'cache' | 'preference' | 'state' | 'container';
  size_bytes: number;
  description: string;
}

export interface DeveloperProjectInfo {
  id: string;
  name: string;
  project_path: string;
  framework: string;
  total_cleanable_bytes: number;
  last_modified_days_ago: number;
  cleanable_folders: CleanableFolderItem[];
}

export interface CleanableFolderItem {
  path: string;
  folder_type: string;
  size_bytes: number;
}

export interface RamBoostResult {
  initial_free_bytes: number;
  final_free_bytes: number;
  freed_bytes: number;
  message: string;
}

export type NavTab = 
  | 'smart-scan'
  | 'system-junk'
  | 'trash-bins'
  | 'large-files'
  | 'uninstaller'
  | 'developer'
  | 'ram-booster'
  | 'settings';
