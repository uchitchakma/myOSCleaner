use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemOverview {
    pub hostname: String,
    pub os_name: String,
    pub os_version: String,
    pub arch: String,
    pub cpu_brand: String,
    pub cpu_cores: usize,
    pub cpu_usage_percent: f32,
    pub total_memory_bytes: u64,
    pub used_memory_bytes: u64,
    pub free_memory_bytes: u64,
    pub memory_usage_percent: f32,
    pub total_swap_bytes: u64,
    pub used_swap_bytes: u64,
    pub uptime_seconds: u64,
    pub disks: Vec<DiskItem>,
    pub battery: Option<BatteryStatus>,
    pub trash_size_bytes: u64,
    pub estimated_junk_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskItem {
    pub name: String,
    pub mount_point: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percent: f32,
    pub file_system: String,
    pub is_removable: bool,
    #[serde(default)]
    pub disk_type: String,
    #[serde(default)]
    pub is_internal: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryStatus {
    pub percentage: u8,
    pub state: String,
    pub time_remaining: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category_type: String, // "system_caches", "app_logs", "browser_junk", "developer_junk", "trash", "crash_reports"
    pub total_bytes: u64,
    pub item_count: usize,
    pub safety_level: String, // "safe", "review", "caution"
    pub items: Vec<CleanItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanItem {
    pub id: String,
    pub path: String,
    pub name: String,
    pub size_bytes: u64,
    pub selected_by_default: bool,
    pub category: String,
    pub description: String,
    pub last_modified: u64, // unix timestamp
    pub is_directory: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanResult {
    pub success: bool,
    pub freed_bytes: u64,
    pub deleted_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LargeFileInfo {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size_bytes: u64,
    pub category: String, // "archive", "video", "audio", "document", "installer", "disk_image", "other"
    pub last_modified: u64,
    pub last_accessed: u64,
    pub age_days: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppInfo {
    pub id: String,
    pub name: String,
    pub bundle_id: String,
    pub version: String,
    pub executable_path: String,
    pub icon_path: String,
    pub total_size_bytes: u64,
    pub app_bundle_size_bytes: u64,
    pub data_size_bytes: u64,
    pub cache_size_bytes: u64,
    pub preferences_size_bytes: u64,
    pub leftover_paths: Vec<AppLeftoverItem>,
    pub is_system_app: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppLeftoverItem {
    pub path: String,
    pub item_type: String, // "bundle", "support", "cache", "preference", "state", "container"
    pub size_bytes: u64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeveloperProjectInfo {
    pub id: String,
    pub name: String,
    pub project_path: String,
    pub framework: String, // "Node.js", "Rust", "Gradle / Android", "Python", "Xcode", "Go"
    pub total_cleanable_bytes: u64,
    pub last_modified_days_ago: u64,
    pub cleanable_folders: Vec<CleanableFolderItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanableFolderItem {
    pub path: String,
    pub folder_type: String, // "node_modules", "target", ".gradle", "DerivedData", ".venv", "build", "dist"
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RamBoostResult {
    pub initial_free_bytes: u64,
    pub final_free_bytes: u64,
    pub freed_bytes: u64,
    pub message: String,
}
