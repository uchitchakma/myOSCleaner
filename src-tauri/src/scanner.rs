use crate::types::*;
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

pub fn get_home_dir() -> PathBuf {
    #[allow(deprecated)]
    std::env::home_dir().unwrap_or_else(|| PathBuf::from("/"))
}

/// Fast bounded directory size calculator that limits depth and file counts
/// to prevent UI stalls on massive nested caches (e.g. node_modules, Xcode, Chrome caches).
pub fn get_dir_size_fast(path: &Path, max_depth: usize, max_entries: usize) -> u64 {
    if !path.exists() {
        return 0;
    }
    if path.is_file() {
        return fs::metadata(path).map(|m| m.len()).unwrap_or(0);
    }

    let mut total_size = 0u64;
    let mut entries_count = 0usize;

    for entry in WalkDir::new(path)
        .min_depth(1)
        .max_depth(max_depth)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if let Ok(m) = entry.metadata() {
            if m.is_file() {
                total_size += m.len();
            }
        }
        entries_count += 1;
        if entries_count >= max_entries {
            break;
        }
    }
    total_size
}

pub fn get_dir_size(path: &Path) -> u64 {
    get_dir_size_fast(path, 3, 2000)
}

pub fn get_file_modified_time(path: &Path) -> u64 {
    if let Ok(metadata) = fs::metadata(path) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(duration) = modified.duration_since(UNIX_EPOCH) {
                return duration.as_secs();
            }
        }
    }
    0
}

pub fn get_file_accessed_time(path: &Path) -> u64 {
    if let Ok(metadata) = fs::metadata(path) {
        if let Ok(accessed) = metadata.accessed() {
            if let Ok(duration) = accessed.duration_since(UNIX_EPOCH) {
                return duration.as_secs();
            }
        }
    }
    get_file_modified_time(path)
}

pub fn categorize_file_extension(ext: &str) -> &'static str {
    match ext.to_lowercase().as_str() {
        "zip" | "tar" | "gz" | "bz2" | "xz" | "7z" | "rar" | "tgz" => "archive",
        "dmg" | "iso" | "pkg" | "exe" | "msi" | "appimage" | "deb" | "rpm" => "installer",
        "mp4" | "mkv" | "mov" | "avi" | "wmv" | "flv" | "webm" | "m4v" => "video",
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "aiff" => "audio",
        "pdf" | "psd" | "ai" | "sketch" | "fig" | "docx" | "xlsx" | "pptx" | "csv" => "document",
        _ => "other",
    }
}

fn scan_user_and_system_caches(home: &Path) -> CleanCategory {
    let cache_dirs = vec![
        (home.join("Library/Caches"), "User Application Caches", "Safe cached data created by everyday applications to speed up access. Safe to wipe."),
        (home.join(".cache"), "User Temporary Dot Caches", "User cache directory for CLI utilities and background agents."),
        (PathBuf::from("/Library/Caches"), "System Caches", "System-level temporary cache files."),
    ];

    let mut all_items = Vec::new();
    for (base_dir, group_name, desc) in cache_dirs {
        if base_dir.exists() {
            if let Ok(entries) = fs::read_dir(&base_dir) {
                let valid_entries: Vec<_> = entries.flatten().collect();
                let sub_items: Vec<CleanItem> = valid_entries
                    .par_iter()
                    .filter_map(|entry| {
                        let path = entry.path();
                        let name = entry.file_name().to_string_lossy().to_string();
                        if name.starts_with('.') || name == "com.apple.coresymbolicationd" {
                            return None;
                        }
                        let size = get_dir_size_fast(&path, 3, 1500);
                        if size > 1024 * 512 { // > 512 KB
                            let mtime = get_file_modified_time(&path);
                            Some(CleanItem {
                                id: format!("cache-{}", path.to_string_lossy()),
                                path: path.to_string_lossy().to_string(),
                                name: format!("{}: {}", group_name, name),
                                size_bytes: size,
                                selected_by_default: true,
                                category: "system_caches".to_string(),
                                description: desc.to_string(),
                                last_modified: mtime,
                                is_directory: path.is_dir(),
                            })
                        } else {
                            None
                        }
                    })
                    .collect();
                all_items.extend(sub_items);
            }
        }
    }

    all_items.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    let total_bytes = all_items.iter().map(|i| i.size_bytes).sum();
    let count = all_items.len();
    CleanCategory {
        id: "system_caches".to_string(),
        name: "System & User Caches".to_string(),
        description: "Temporary data and cache buffers generated by your apps. Safely reclaim space without affecting user data.".to_string(),
        category_type: "system_caches".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "safe".to_string(),
        items: all_items,
    }
}

fn scan_application_logs(home: &Path) -> CleanCategory {
    let log_dirs = vec![
        (home.join("Library/Logs"), "Application Logs", "Historical activity logs from desktop software."),
        (home.join(".local/state/logs"), "CLI Logs", "Developer command line execution logs."),
        (PathBuf::from("/Library/Logs"), "System Service Logs", "Background daemon execution and status records."),
    ];

    let mut all_items = Vec::new();
    for (base_dir, group_name, desc) in log_dirs {
        if base_dir.exists() {
            if let Ok(entries) = fs::read_dir(&base_dir) {
                let valid_entries: Vec<_> = entries.flatten().collect();
                let sub_items: Vec<CleanItem> = valid_entries
                    .par_iter()
                    .filter_map(|entry| {
                        let path = entry.path();
                        let name = entry.file_name().to_string_lossy().to_string();
                        if name.starts_with('.') {
                            return None;
                        }
                        let size = get_dir_size_fast(&path, 2, 800);
                        if size > 1024 * 100 { // > 100 KB
                            let mtime = get_file_modified_time(&path);
                            Some(CleanItem {
                                id: format!("log-{}", path.to_string_lossy()),
                                path: path.to_string_lossy().to_string(),
                                name: format!("{}: {}", group_name, name),
                                size_bytes: size,
                                selected_by_default: true,
                                category: "app_logs".to_string(),
                                description: desc.to_string(),
                                last_modified: mtime,
                                is_directory: path.is_dir(),
                            })
                        } else {
                            None
                        }
                    })
                    .collect();
                all_items.extend(sub_items);
            }
        }
    }

    all_items.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    let total_bytes = all_items.iter().map(|i| i.size_bytes).sum();
    let count = all_items.len();
    CleanCategory {
        id: "app_logs".to_string(),
        name: "System & Application Logs".to_string(),
        description: "Old log files and debugging outputs generated over time that are no longer necessary.".to_string(),
        category_type: "app_logs".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "safe".to_string(),
        items: all_items,
    }
}

fn scan_browser_junk(home: &Path) -> CleanCategory {
    let browser_paths = vec![
        (home.join("Library/Caches/Google/Chrome"), "Google Chrome Cache", "Cached web pages, images, and script assets from Google Chrome."),
        (home.join("Library/Caches/com.apple.Safari"), "Apple Safari Cache", "Cached web pages, previews, and icons from Safari."),
        (home.join("Library/Containers/com.apple.Safari/Data/Library/Caches"), "Safari Container Cache", "Safari sandboxed web browsing cache."),
        (home.join("Library/Caches/Firefox"), "Mozilla Firefox Cache", "Temporary web data and offline site assets from Firefox."),
        (home.join("Library/Caches/BraveSoftware/Brave-Browser"), "Brave Browser Cache", "Browsing caches from Brave Browser."),
        (home.join("Library/Caches/Microsoft Edge"), "Microsoft Edge Cache", "Browsing caches from Microsoft Edge."),
        (home.join("Library/Caches/company.thebrowser.Browser"), "Arc Browser Cache", "Browsing caches from Arc Browser."),
        (home.join("Library/Caches/com.operasoftware.Opera"), "Opera Cache", "Browsing caches from Opera."),
    ];

    let items: Vec<CleanItem> = browser_paths
        .par_iter()
        .filter_map(|(path, name, desc)| {
            if path.exists() {
                let size = get_dir_size_fast(path, 3, 1500);
                if size > 1024 * 1024 { // > 1 MB
                    let mtime = get_file_modified_time(path);
                    Some(CleanItem {
                        id: format!("browser-{}", path.to_string_lossy()),
                        path: path.to_string_lossy().to_string(),
                        name: name.to_string(),
                        size_bytes: size,
                        selected_by_default: true,
                        category: "browser_junk".to_string(),
                        description: desc.to_string(),
                        last_modified: mtime,
                        is_directory: true,
                    })
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    let total_bytes = items.iter().map(|i| i.size_bytes).sum();
    let count = items.len();
    CleanCategory {
        id: "browser_junk".to_string(),
        name: "Browser Caches & Web Junk".to_string(),
        description: "Cached offline assets, temporary web downloads, and media buffers stored by your web browsers.".to_string(),
        category_type: "browser_junk".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "safe".to_string(),
        items,
    }
}

fn scan_developer_junk(home: &Path) -> CleanCategory {
    let dev_paths = vec![
        (home.join("Library/Developer/Xcode/DerivedData"), "Xcode DerivedData", "Intermediate build artifacts and index files created during Xcode builds."),
        (home.join("Library/Developer/Xcode/Archives"), "Xcode Build Archives", "Old application archive packages stored in Xcode."),
        (home.join("Library/Developer/Xcode/iOS DeviceLogs"), "Xcode Device Logs", "Diagnostic crash logs from attached iOS test devices."),
        (home.join(".gradle/caches"), "Gradle Build Cache", "Downloaded dependencies and compiled bytecode from Gradle/Android builds."),
        (home.join(".android/build-cache"), "Android SDK Build Cache", "Intermediate outputs from Android Studio / SDK builds."),
        (home.join(".npm/_cacache"), "NPM Global Package Cache", "Cached npm tarballs downloaded during npm install."),
        (home.join(".yarn/cache"), "Yarn Global Cache", "Cached package bundles downloaded by Yarn package manager."),
        (home.join(".bun/install/cache"), "Bun Package Cache", "Binary package cache generated by Bun package manager."),
        (home.join(".cargo/registry/cache"), "Cargo Registry Cache", "Downloaded crate archives stored in the local Rust cargo cache."),
        (home.join(".cargo/git/db"), "Cargo Git DB Cache", "Cloned git repositories cached by Cargo."),
        (home.join(".cache/pip"), "Python PIP Cache", "Cached wheel and egg downloads for Python pip packages."),
        (home.join("Library/Caches/CocoaPods"), "CocoaPods Cache", "Cached pods and repositories downloaded by CocoaPods."),
        (home.join(".cocoapods/repos"), "CocoaPods Spec Repos", "Cloned git specs for CocoaPods master repo."),
    ];

    let items: Vec<CleanItem> = dev_paths
        .par_iter()
        .filter_map(|(path, name, desc)| {
            if path.exists() {
                let size = get_dir_size_fast(path, 3, 2000);
                if size > 1024 * 1024 * 5 { // > 5 MB
                    let mtime = get_file_modified_time(path);
                    Some(CleanItem {
                        id: format!("dev-{}", path.to_string_lossy()),
                        path: path.to_string_lossy().to_string(),
                        name: name.to_string(),
                        size_bytes: size,
                        selected_by_default: true,
                        category: "developer_junk".to_string(),
                        description: desc.to_string(),
                        last_modified: mtime,
                        is_directory: true,
                    })
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    let total_bytes = items.iter().map(|i| i.size_bytes).sum();
    let count = items.len();
    CleanCategory {
        id: "developer_junk".to_string(),
        name: "Developer Build Caches".to_string(),
        description: "Xcode DerivedData, Gradle, NPM, Cargo, and Pip caches that can safely be wiped and rebuilt on demand.".to_string(),
        category_type: "developer_junk".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "safe".to_string(),
        items,
    }
}

fn scan_crash_reports(home: &Path) -> CleanCategory {
    let report_paths = vec![
        (home.join("Library/Logs/DiagnosticReports"), "User Diagnostic Reports", "Crash dumps and hang reports generated by the OS when applications freeze."),
        (PathBuf::from("/Library/Logs/DiagnosticReports"), "System Diagnostic Reports", "System-wide diagnostic reports and kernel panics."),
        (home.join("Library/Application Support/CrashReporter"), "Crash Reporter Logs", "Application crash reporter tracking data."),
    ];

    let items: Vec<CleanItem> = report_paths
        .par_iter()
        .filter_map(|(path, name, desc)| {
            if path.exists() {
                let size = get_dir_size_fast(path, 2, 500);
                if size > 1024 * 50 { // > 50 KB
                    let mtime = get_file_modified_time(path);
                    Some(CleanItem {
                        id: format!("crash-{}", path.to_string_lossy()),
                        path: path.to_string_lossy().to_string(),
                        name: name.to_string(),
                        size_bytes: size,
                        selected_by_default: true,
                        category: "crash_reports".to_string(),
                        description: desc.to_string(),
                        last_modified: mtime,
                        is_directory: path.is_dir(),
                    })
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    let total_bytes = items.iter().map(|i| i.size_bytes).sum();
    let count = items.len();
    CleanCategory {
        id: "crash_reports".to_string(),
        name: "Crash Dumps & Diagnostics".to_string(),
        description: "Diagnostic logs and crash traces generated during application failures.".to_string(),
        category_type: "crash_reports".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "safe".to_string(),
        items,
    }
}

fn scan_trash_category(home: &Path) -> CleanCategory {
    let mut items = Vec::new();
    let trash_dir = home.join(".Trash");
    if trash_dir.exists() {
        if let Ok(entries) = fs::read_dir(&trash_dir) {
            let valid_entries: Vec<_> = entries.flatten().collect();
            let sub_items: Vec<CleanItem> = valid_entries
                .par_iter()
                .map(|entry| {
                    let path = entry.path();
                    let name = entry.file_name().to_string_lossy().to_string();
                    let size = get_dir_size_fast(&path, 3, 1000);
                    let mtime = get_file_modified_time(&path);
                    CleanItem {
                        id: format!("trash-{}", path.to_string_lossy()),
                        path: path.to_string_lossy().to_string(),
                        name,
                        size_bytes: size,
                        selected_by_default: true,
                        category: "trash".to_string(),
                        description: "Item currently sitting in your Trash bin.".to_string(),
                        last_modified: mtime,
                        is_directory: path.is_dir(),
                    }
                })
                .collect();
            items.extend(sub_items);
        }
    }

    items.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    let total_bytes = items.iter().map(|i| i.size_bytes).sum();
    let count = items.len();
    CleanCategory {
        id: "trash".to_string(),
        name: "Trash Bins".to_string(),
        description: "Files and folders discarded to the Trash can that still consume physical disk storage.".to_string(),
        category_type: "trash".to_string(),
        total_bytes,
        item_count: count,
        safety_level: "review".to_string(),
        items,
    }
}

pub fn scan_system_junk() -> Vec<CleanCategory> {
    let home = get_home_dir();

    // Scan all 6 categories in parallel
    let (cat1, (cat2, (cat3, (cat4, (cat5, cat6))))) = rayon::join(
        || scan_user_and_system_caches(&home),
        || rayon::join(
            || scan_application_logs(&home),
            || rayon::join(
                || scan_browser_junk(&home),
                || rayon::join(
                    || scan_developer_junk(&home),
                    || rayon::join(
                        || scan_crash_reports(&home),
                        || scan_trash_category(&home),
                    ),
                ),
            ),
        ),
    );

    vec![cat1, cat2, cat3, cat4, cat5, cat6]
}

pub fn scan_trash_items() -> Vec<CleanItem> {
    let home = get_home_dir();
    let trash_dir = home.join(".Trash");
    let mut items = Vec::new();

    if trash_dir.exists() {
        if let Ok(entries) = fs::read_dir(&trash_dir) {
            let valid_entries: Vec<_> = entries.flatten().collect();
            items = valid_entries
                .par_iter()
                .map(|entry| {
                    let path = entry.path();
                    let name = entry.file_name().to_string_lossy().to_string();
                    let size = get_dir_size_fast(&path, 3, 1000);
                    let mtime = get_file_modified_time(&path);
                    CleanItem {
                        id: format!("trash-{}", path.to_string_lossy()),
                        path: path.to_string_lossy().to_string(),
                        name,
                        size_bytes: size,
                        selected_by_default: true,
                        category: "trash".to_string(),
                        description: "Discarded file in Trash".to_string(),
                        last_modified: mtime,
                        is_directory: path.is_dir(),
                    }
                })
                .collect();
        }
    }
    items.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    items
}

pub fn scan_large_files(min_size_mb: u64) -> Vec<LargeFileInfo> {
    let home = get_home_dir();
    let target_dirs = vec![
        home.join("Downloads"),
        home.join("Documents"),
        home.join("Desktop"),
        home.join("Movies"),
        home.join("Music"),
        home.join("Pictures"),
    ];

    let min_bytes = min_size_mb * 1024 * 1024;
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();

    let mut large_files: Vec<LargeFileInfo> = target_dirs
        .par_iter()
        .flat_map(|dir| {
            if !dir.exists() {
                return Vec::new();
            }

            let mut dir_files = Vec::new();
            for entry in WalkDir::new(dir)
                .max_depth(4)
                .follow_links(false)
                .into_iter()
                .filter_entry(|e| {
                    let name = e.file_name().to_string_lossy();
                    // Skip hidden folders, node_modules, git, and Library
                    if e.depth() > 0 && (name.starts_with('.') || name == "node_modules" || name == "Library" || name == "target" || name == "dist") {
                        return false;
                    }
                    true
                })
                .filter_map(|e| e.ok())
            {
                if entry.file_type().is_file() {
                    if let Ok(meta) = entry.metadata() {
                        let len = meta.len();
                        if len >= min_bytes {
                            let path = entry.path();
                            let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
                            let name = entry.file_name().to_string_lossy().to_string();
                            let mtime = get_file_modified_time(path);
                            let atime = get_file_accessed_time(path);
                            let age_days = if now > mtime { (now - mtime) / 86400 } else { 0 };

                            dir_files.push(LargeFileInfo {
                                path: path.to_string_lossy().to_string(),
                                name,
                                extension: ext.to_lowercase(),
                                size_bytes: len,
                                category: categorize_file_extension(ext).to_string(),
                                last_modified: mtime,
                                last_accessed: atime,
                                age_days,
                            });
                        }
                    }
                }
            }
            dir_files
        })
        .collect();

    large_files.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    large_files
}

pub fn scan_installed_applications() -> Vec<AppInfo> {
    let home = get_home_dir();
    let app_search_dirs = vec![
        PathBuf::from("/Applications"),
        home.join("Applications"),
    ];

    let mut all_app_paths = Vec::new();
    for search_dir in app_search_dirs {
        if search_dir.exists() {
            if let Ok(entries) = fs::read_dir(&search_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    let name = entry.file_name().to_string_lossy().to_string();
                    if name.ends_with(".app") {
                        all_app_paths.push((path, name));
                    }
                }
            }
        }
    }

    // Process all applications in parallel
    let mut apps: Vec<AppInfo> = all_app_paths
        .par_iter()
        .map(|(path, name)| {
            let clean_name = name.trim_end_matches(".app").to_string();
            let is_system = path.starts_with("/System/Applications") || clean_name == "Finder" || clean_name == "Safari";
            let bundle_size = get_dir_size_fast(path, 3, 1000);

            let mut leftovers = Vec::new();
            let mut data_size = 0u64;
            let mut cache_size = 0u64;
            let mut pref_size = 0u64;

            // 1. Application Support
            let app_support = home.join("Library/Application Support").join(&clean_name);
            if app_support.exists() {
                let s = get_dir_size_fast(&app_support, 3, 800);
                data_size += s;
                leftovers.push(AppLeftoverItem {
                    path: app_support.to_string_lossy().to_string(),
                    item_type: "support".to_string(),
                    size_bytes: s,
                    description: "Application user data & settings".to_string(),
                });
            }

            // 2. Application Caches
            let app_cache = home.join("Library/Caches").join(&clean_name);
            if app_cache.exists() {
                let s = get_dir_size_fast(&app_cache, 2, 500);
                cache_size += s;
                leftovers.push(AppLeftoverItem {
                    path: app_cache.to_string_lossy().to_string(),
                    item_type: "cache".to_string(),
                    size_bytes: s,
                    description: "Temporary app cache files".to_string(),
                });
            }

            // 3. Saved State
            let saved_state = home.join("Library/Saved Application State").join(format!("{}.savedState", clean_name));
            if saved_state.exists() {
                let s = get_dir_size_fast(&saved_state, 2, 200);
                pref_size += s;
                leftovers.push(AppLeftoverItem {
                    path: saved_state.to_string_lossy().to_string(),
                    item_type: "state".to_string(),
                    size_bytes: s,
                    description: "Saved window & session state".to_string(),
                });
            }

            let total_size = bundle_size + data_size + cache_size + pref_size;

            AppInfo {
                id: format!("app-{}", clean_name.to_lowercase().replace(' ', "-")),
                name: clean_name.clone(),
                bundle_id: format!("com.installed.{}", clean_name.to_lowercase().replace(' ', "")),
                version: "Installed".to_string(),
                executable_path: path.to_string_lossy().to_string(),
                icon_path: String::new(),
                total_size_bytes: total_size,
                app_bundle_size_bytes: bundle_size,
                data_size_bytes: data_size,
                cache_size_bytes: cache_size,
                preferences_size_bytes: pref_size,
                leftover_paths: leftovers,
                is_system_app: is_system,
            }
        })
        .collect();

    apps.sort_by(|a, b| b.total_size_bytes.cmp(&a.total_size_bytes));
    apps
}

pub fn scan_developer_projects() -> Vec<DeveloperProjectInfo> {
    let home = get_home_dir();
    let search_roots = vec![
        home.join("Documents"),
        home.join("Projects"),
        home.join("Desktop"),
        home.join("Coding"),
        home.join("dev"),
        home.join("src"),
    ];

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();

    let mut projects: Vec<DeveloperProjectInfo> = search_roots
        .par_iter()
        .flat_map(|root| {
            if !root.exists() {
                return Vec::new();
            }

            let mut root_projects = Vec::new();
            for entry in WalkDir::new(root)
                .max_depth(3)
                .follow_links(false)
                .into_iter()
                .filter_entry(|e| {
                    let name = e.file_name().to_string_lossy();
                    // DO NOT descend into heavy build/dependency folders
                    if e.depth() > 0 && (name.starts_with('.') || name == "node_modules" || name == "target" || name == "dist" || name == ".next" || name == "venv" || name == ".venv" || name == "Pods" || name == ".gradle" || name == "Library") {
                        return false;
                    }
                    true
                })
                .filter_map(|e| e.ok())
            {
                if entry.file_type().is_dir() {
                    let proj_path = entry.path();
                    let path_str = proj_path.to_string_lossy().to_string();

                    let has_package_json = proj_path.join("package.json").exists();
                    let has_cargo = proj_path.join("Cargo.toml").exists();
                    let has_gradle = proj_path.join("build.gradle").exists() || proj_path.join("build.gradle.kts").exists();
                    let has_python = proj_path.join("requirements.txt").exists() || proj_path.join("pyproject.toml").exists() || proj_path.join("setup.py").exists();

                    if has_package_json || has_cargo || has_gradle || has_python {
                        let mut cleanable = Vec::new();
                        let mut framework = "Generic Project";

                        if has_package_json {
                            framework = "Node.js / Web";
                            let nm = proj_path.join("node_modules");
                            if nm.exists() {
                                let s = get_dir_size_fast(&nm, 2, 1000);
                                if s > 1024 * 1024 {
                                    cleanable.push(CleanableFolderItem {
                                        path: nm.to_string_lossy().to_string(),
                                        folder_type: "node_modules".to_string(),
                                        size_bytes: s,
                                    });
                                }
                            }
                            let dist = proj_path.join("dist");
                            if dist.exists() {
                                let s = get_dir_size_fast(&dist, 2, 500);
                                if s > 1024 * 1024 {
                                    cleanable.push(CleanableFolderItem {
                                        path: dist.to_string_lossy().to_string(),
                                        folder_type: "dist".to_string(),
                                        size_bytes: s,
                                    });
                                }
                            }
                        }

                        if has_cargo {
                            framework = "Rust Cargo";
                            let target = proj_path.join("target");
                            if target.exists() {
                                let s = get_dir_size_fast(&target, 2, 1000);
                                if s > 1024 * 1024 {
                                    cleanable.push(CleanableFolderItem {
                                        path: target.to_string_lossy().to_string(),
                                        folder_type: "target".to_string(),
                                        size_bytes: s,
                                    });
                                }
                            }
                        }

                        if has_gradle {
                            framework = "Gradle / Java";
                            let build = proj_path.join("build");
                            if build.exists() {
                                let s = get_dir_size_fast(&build, 2, 500);
                                if s > 1024 * 1024 {
                                    cleanable.push(CleanableFolderItem {
                                        path: build.to_string_lossy().to_string(),
                                        folder_type: "build".to_string(),
                                        size_bytes: s,
                                    });
                                }
                            }
                            let gr = proj_path.join(".gradle");
                            if gr.exists() {
                                let s = get_dir_size_fast(&gr, 2, 500);
                                if s > 1024 * 1024 {
                                    cleanable.push(CleanableFolderItem {
                                        path: gr.to_string_lossy().to_string(),
                                        folder_type: ".gradle".to_string(),
                                        size_bytes: s,
                                    });
                                }
                            }
                        }

                        if has_python {
                            if framework == "Generic Project" {
                                framework = "Python";
                            }
                            for venv_name in &[".venv", "venv", "env", "__pycache__"] {
                                let venv = proj_path.join(venv_name);
                                if venv.exists() {
                                    let s = get_dir_size_fast(&venv, 2, 500);
                                    if s > 1024 * 1024 {
                                        cleanable.push(CleanableFolderItem {
                                            path: venv.to_string_lossy().to_string(),
                                            folder_type: venv_name.to_string(),
                                            size_bytes: s,
                                        });
                                    }
                                }
                            }
                        }

                        let total_clean: u64 = cleanable.iter().map(|c| c.size_bytes).sum();
                        if total_clean > 1024 * 1024 * 5 { // > 5 MB
                            let mtime = get_file_modified_time(proj_path);
                            let days_ago = if now > mtime { (now - mtime) / 86400 } else { 0 };
                            let name = proj_path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| "Project".to_string());

                            root_projects.push(DeveloperProjectInfo {
                                id: format!("dev-proj-{}", path_str.replace('/', "-")),
                                name,
                                project_path: path_str,
                                framework: framework.to_string(),
                                total_cleanable_bytes: total_clean,
                                last_modified_days_ago: days_ago,
                                cleanable_folders: cleanable,
                            });
                        }
                    }
                }
            }
            root_projects
        })
        .collect();

    projects.sort_by(|a, b| b.total_cleanable_bytes.cmp(&a.total_cleanable_bytes));
    projects
}
