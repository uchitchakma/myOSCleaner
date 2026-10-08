pub mod cleaner;
pub mod scanner;
pub mod types;

pub mod commands {
    use crate::cleaner;
    use crate::scanner;
    use crate::types::*;
    use sysinfo::{Disks, System};

    #[tauri::command]
    pub fn get_system_overview() -> SystemOverview {
        let mut sys = System::new_all();
        sys.refresh_all();
        std::thread::sleep(std::time::Duration::from_millis(80));
        sys.refresh_cpu_all();

        let hostname = System::host_name().unwrap_or_else(|| "MacBook".to_string());
        let os_name = System::name().unwrap_or_else(|| std::env::consts::OS.to_string());
        let os_version = System::os_version().unwrap_or_else(|| "macOS".to_string());
        let arch = System::cpu_arch();

        let cpus = sys.cpus();
        let cpu_brand = cpus.first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Apple Silicon / Multi-Core".to_string());
        let cpu_cores = cpus.len();
        let cpu_usage_percent = sys.global_cpu_usage();

        let total_memory_bytes = sys.total_memory();
        let used_memory_bytes = sys.used_memory();
        let free_memory_bytes = sys.free_memory();
        let memory_usage_percent = if total_memory_bytes > 0 {
            (used_memory_bytes as f32 / total_memory_bytes as f32) * 100.0
        } else {
            0.0
        };

        let total_swap_bytes = sys.total_swap();
        let used_swap_bytes = sys.used_swap();
        let uptime_seconds = System::uptime();

        let disks_provider = Disks::new_with_refreshed_list();
        let mut disks = Vec::new();
        let mut seen_roots = std::collections::HashSet::new();

        for d in disks_provider.iter() {
            let mount = d.mount_point().to_string_lossy().to_string();
            let name = d.name().to_string_lossy().to_string();
            let total = d.total_space();
            let avail = d.available_space();

            if mount.starts_with("/System/Volumes/") || mount.starts_with("/private/") || mount.starts_with("/dev") {
                continue;
            }

            let key = format!("{}-{}-{}", name, mount, total);
            if seen_roots.insert(key) && total > 0 {
                let used = total.saturating_sub(avail);
                let pct = (used as f32 / total as f32) * 100.0;
                disks.push(DiskItem {
                    name: if name.is_empty() { "Macintosh HD".to_string() } else { name },
                    mount_point: mount,
                    total_bytes: total,
                    available_bytes: avail,
                    used_bytes: used,
                    usage_percent: pct,
                    file_system: d.file_system().to_string_lossy().to_string(),
                    is_removable: d.is_removable(),
                });
            }
        }

        let home = scanner::get_home_dir();
        let trash_size = scanner::get_dir_size(&home.join(".Trash"));
        let caches_size = scanner::get_dir_size(&home.join("Library/Caches"));
        let logs_size = scanner::get_dir_size(&home.join("Library/Logs"));
        let estimated_junk = trash_size + (caches_size / 2) + logs_size;

        SystemOverview {
            hostname,
            os_name,
            os_version,
            arch,
            cpu_brand,
            cpu_cores,
            cpu_usage_percent,
            total_memory_bytes,
            used_memory_bytes,
            free_memory_bytes,
            memory_usage_percent,
            total_swap_bytes,
            used_swap_bytes,
            uptime_seconds,
            disks,
            battery: None,
            trash_size_bytes: trash_size,
            estimated_junk_bytes: estimated_junk,
        }
    }

    #[tauri::command]
    pub fn scan_all_junk() -> Vec<CleanCategory> {
        scanner::scan_system_junk()
    }

    #[tauri::command]
    pub fn clean_selected_items(paths: Vec<String>) -> CleanResult {
        cleaner::clean_paths(paths)
    }

    #[tauri::command]
    pub fn scan_trash_bin() -> Vec<CleanItem> {
        scanner::scan_trash_items()
    }

    #[tauri::command]
    pub fn empty_trash_bin_cmd() -> CleanResult {
        cleaner::empty_trash_bin()
    }

    #[tauri::command]
    pub fn scan_large_files_cmd(min_size_mb: Option<u64>) -> Vec<LargeFileInfo> {
        scanner::scan_large_files(min_size_mb.unwrap_or(25))
    }

    #[tauri::command]
    pub fn delete_files(paths: Vec<String>) -> CleanResult {
        cleaner::clean_paths(paths)
    }

    #[tauri::command]
    pub fn reveal_in_finder(path: String) -> Result<(), String> {
        cleaner::reveal_in_system_file_manager(&path)
    }

    #[tauri::command]
    pub fn scan_applications() -> Vec<AppInfo> {
        scanner::scan_installed_applications()
    }

    #[tauri::command]
    pub fn uninstall_application(executable_path: String, leftover_paths: Vec<String>) -> CleanResult {
        let mut all_paths = leftover_paths;
        if !executable_path.is_empty() {
            all_paths.push(executable_path);
        }
        cleaner::clean_paths(all_paths)
    }

    #[tauri::command]
    pub fn reset_application(leftover_paths: Vec<String>) -> CleanResult {
        cleaner::clean_paths(leftover_paths)
    }

    #[tauri::command]
    pub fn scan_developer_space() -> Vec<DeveloperProjectInfo> {
        scanner::scan_developer_projects()
    }

    #[tauri::command]
    pub fn clean_developer_projects(folder_paths: Vec<String>) -> CleanResult {
        cleaner::clean_paths(folder_paths)
    }

    #[tauri::command]
    pub fn optimize_ram() -> RamBoostResult {
        cleaner::optimize_system_memory()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_system_overview,
            commands::scan_all_junk,
            commands::clean_selected_items,
            commands::scan_trash_bin,
            commands::empty_trash_bin_cmd,
            commands::scan_large_files_cmd,
            commands::delete_files,
            commands::reveal_in_finder,
            commands::scan_applications,
            commands::uninstall_application,
            commands::reset_application,
            commands::scan_developer_space,
            commands::clean_developer_projects,
            commands::optimize_ram
        ])
        .run(tauri::generate_context!())
        .expect("error while running myMacCleaner application");
}
