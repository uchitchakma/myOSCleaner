pub mod cleaner;
pub mod scanner;
pub mod types;

pub mod commands {
    use crate::cleaner;
    use crate::scanner;
    use crate::types::*;
    use sysinfo::{Disks, System};
    use tauri::async_runtime::spawn_blocking;

    #[tauri::command]
    pub async fn get_system_overview() -> SystemOverview {
        spawn_blocking(|| {
            let mut sys = System::new_all();
            sys.refresh_all();
            sys.refresh_cpu_all();

            let hostname = System::host_name().unwrap_or_else(|| "Host".to_string());
            let os_name = System::name().unwrap_or_else(|| std::env::consts::OS.to_string());
            let os_version = System::os_version().unwrap_or_else(|| "Universal".to_string());
            let arch = System::cpu_arch();

            let cpus = sys.cpus();
            let cpu_brand = cpus.first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Multi-Core Processor".to_string());
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
                let raw_name = d.name().to_string_lossy().to_string();
                let total = d.total_space();
                let avail = d.available_space();

                // Skip internal system-sealed APFS snapshots / OS system mounts
                if mount.starts_with("/System/Volumes/") || mount.starts_with("/private/") || mount.starts_with("/dev") || mount.starts_with("/proc") || mount.starts_with("/sys") {
                    continue;
                }

                let is_root = mount == "/" || mount == "C:\\" || mount == "C:/";
                let is_removable = d.is_removable() || mount.starts_with("/Volumes/") || mount.starts_with("/media/") || mount.starts_with("/mnt/") || (!is_root && (mount.ends_with(":\\") || mount.ends_with(":/")));
                let is_internal = is_root || (!is_removable && !mount.starts_with("/Volumes/"));

                // Resolve friendly drive name
                let name = if is_root {
                    if cfg!(target_os = "macos") {
                        if !raw_name.is_empty() && raw_name != "/" { raw_name } else { "Macintosh HD".to_string() }
                    } else if cfg!(target_os = "windows") {
                        "Local Disk (C:)".to_string()
                    } else {
                        "Primary Storage".to_string()
                    }
                } else if mount.starts_with("/Volumes/") {
                    let vol_name = mount.trim_start_matches("/Volumes/").replace('_', " ");
                    if !vol_name.is_empty() { vol_name } else if !raw_name.is_empty() { raw_name } else { "External Storage".to_string() }
                } else if mount.starts_with("/media/") || mount.starts_with("/mnt/") {
                    let leaf = std::path::Path::new(&mount).file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
                    if !leaf.is_empty() { leaf } else if !raw_name.is_empty() { raw_name } else { "External Storage".to_string() }
                } else if !raw_name.is_empty() {
                    raw_name
                } else {
                    format!("Volume ({})", mount)
                };

                let disk_type = match d.kind() {
                    sysinfo::DiskKind::SSD => {
                        if is_internal { "Internal NVMe SSD".to_string() } else { "External SSD".to_string() }
                    }
                    sysinfo::DiskKind::HDD => {
                        if is_internal { "Internal HDD".to_string() } else { "External HDD".to_string() }
                    }
                    sysinfo::DiskKind::Unknown(_) => {
                        if is_internal {
                            "Internal Flash / SSD".to_string()
                        } else if is_removable {
                            "External Storage / SSD".to_string()
                        } else {
                            "Secondary Volume".to_string()
                        }
                    }
                };

                let key = format!("{}-{}-{}", name, mount, total);
                if seen_roots.insert(key) && total > 0 {
                    let used = total.saturating_sub(avail);
                    let pct = (used as f32 / total as f32) * 100.0;
                    disks.push(DiskItem {
                        name,
                        mount_point: mount,
                        total_bytes: total,
                        available_bytes: avail,
                        used_bytes: used,
                        usage_percent: pct,
                        file_system: d.file_system().to_string_lossy().to_string(),
                        is_removable,
                        disk_type,
                        is_internal,
                    });
                }
            }

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
                trash_size_bytes: 0,
                estimated_junk_bytes: 0,
            }
        }).await.unwrap_or_else(|_| SystemOverview {
            hostname: "Host".to_string(),
            os_name: "Universal".to_string(),
            os_version: "1.0".to_string(),
            arch: "x86_64".to_string(),
            cpu_brand: "CPU".to_string(),
            cpu_cores: 4,
            cpu_usage_percent: 0.0,
            total_memory_bytes: 0,
            used_memory_bytes: 0,
            free_memory_bytes: 0,
            memory_usage_percent: 0.0,
            total_swap_bytes: 0,
            used_swap_bytes: 0,
            uptime_seconds: 0,
            disks: Vec::new(),
            battery: None,
            trash_size_bytes: 0,
            estimated_junk_bytes: 0,
        })
    }

    #[tauri::command]
    pub async fn scan_all_junk() -> Vec<CleanCategory> {
        spawn_blocking(scanner::scan_system_junk).await.unwrap_or_default()
    }

    #[tauri::command]
    pub async fn clean_selected_items(paths: Vec<String>) -> CleanResult {
        spawn_blocking(move || cleaner::clean_paths(paths)).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn scan_trash_bin() -> Vec<CleanItem> {
        spawn_blocking(scanner::scan_trash_items).await.unwrap_or_default()
    }

    #[tauri::command]
    pub async fn empty_trash_bin_cmd() -> CleanResult {
        spawn_blocking(cleaner::empty_trash_bin).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn scan_large_files_cmd(min_size_mb: Option<u64>, target_path: Option<String>) -> Vec<LargeFileInfo> {
        spawn_blocking(move || scanner::scan_large_files(min_size_mb.unwrap_or(25), target_path)).await.unwrap_or_default()
    }

    #[tauri::command]
    pub async fn delete_files(paths: Vec<String>) -> CleanResult {
        spawn_blocking(move || cleaner::clean_paths(paths)).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn reveal_in_finder(path: String) -> Result<(), String> {
        spawn_blocking(move || cleaner::reveal_in_system_file_manager(&path)).await.map_err(|e| e.to_string())?
    }

    #[tauri::command]
    pub async fn scan_applications() -> Vec<AppInfo> {
        spawn_blocking(scanner::scan_installed_applications).await.unwrap_or_default()
    }

    #[tauri::command]
    pub async fn uninstall_application(executable_path: String, leftover_paths: Vec<String>) -> CleanResult {
        spawn_blocking(move || {
            let mut all_paths = leftover_paths;
            if !executable_path.is_empty() {
                all_paths.push(executable_path);
            }
            cleaner::clean_paths(all_paths)
        }).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn reset_application(leftover_paths: Vec<String>) -> CleanResult {
        spawn_blocking(move || cleaner::clean_paths(leftover_paths)).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn scan_developer_space() -> Vec<DeveloperProjectInfo> {
        spawn_blocking(scanner::scan_developer_projects).await.unwrap_or_default()
    }

    #[tauri::command]
    pub async fn clean_developer_projects(folder_paths: Vec<String>) -> CleanResult {
        spawn_blocking(move || cleaner::clean_paths(folder_paths)).await.unwrap_or_else(|_| CleanResult {
            success: false,
            freed_bytes: 0,
            deleted_count: 0,
            failed_count: 0,
            errors: vec!["Execution error".to_string()],
        })
    }

    #[tauri::command]
    pub async fn optimize_ram() -> RamBoostResult {
        spawn_blocking(cleaner::optimize_system_memory).await.unwrap_or_else(|_| RamBoostResult {
            initial_free_bytes: 0,
            final_free_bytes: 0,
            freed_bytes: 0,
            message: "RAM optimization completed".to_string(),
        })
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
        .expect("error while running myOSCleaner application");
}
