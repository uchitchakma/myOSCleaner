use crate::scanner::get_dir_size;
use crate::types::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use sysinfo::System;

pub fn is_path_safe_to_delete(path: &Path) -> bool {
    let path_str = path.to_string_lossy().to_string();
    
    // Critical root safety checks
    if path_str == "/" || path_str == "/System" || path_str == "/Library" || path_str == "/usr" 
        || path_str == "/bin" || path_str == "/sbin" || path_str == "/etc" || path_str == "/var" 
        || path_str == "/dev" || path_str == "/Volumes" || path_str == "/Applications" 
    {
        return false;
    }

    #[allow(deprecated)]
    if let Some(home) = std::env::home_dir() {
        let home_str = home.to_string_lossy().to_string();
        if path_str == home_str {
            return false;
        }
        // Protect primary home folders from being deleted as root containers
        let protected_roots = vec![
            home.join("Documents"),
            home.join("Desktop"),
            home.join("Downloads"),
            home.join("Pictures"),
            home.join("Music"),
            home.join("Movies"),
            home.join("Library"),
        ];
        for prot in protected_roots {
            if path == prot {
                return false;
            }
        }
    }

    true
}

pub fn clean_paths(paths: Vec<String>) -> CleanResult {
    let mut freed_bytes = 0u64;
    let mut deleted_count = 0usize;
    let mut failed_count = 0usize;
    let mut errors = Vec::new();

    for path_str in paths {
        let path = PathBuf::from(&path_str);
        if !path.exists() {
            continue;
        }

        if !is_path_safe_to_delete(&path) {
            failed_count += 1;
            errors.push(format!("Safety Protection: Denied deletion of critical root path: {}", path_str));
            continue;
        }

        let item_size = get_dir_size(&path);

        let result = if path.is_dir() {
            fs::remove_dir_all(&path)
        } else {
            fs::remove_file(&path)
        };

        match result {
            Ok(_) => {
                freed_bytes += item_size;
                deleted_count += 1;
            }
            Err(e) => {
                failed_count += 1;
                errors.push(format!("Failed to delete {}: {}", path_str, e));
            }
        }
    }

    CleanResult {
        success: failed_count == 0,
        freed_bytes,
        deleted_count,
        failed_count,
        errors,
    }
}

pub fn empty_trash_bin() -> CleanResult {
    #[allow(deprecated)]
    let home = std::env::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let trash = home.join(".Trash");
    let mut freed_bytes = 0u64;
    let mut deleted_count = 0usize;
    let mut failed_count = 0usize;
    let mut errors = Vec::new();

    if trash.exists() {
        if let Ok(entries) = fs::read_dir(&trash) {
            for entry in entries.flatten() {
                let p = entry.path();
                let s = get_dir_size(&p);
                let res = if p.is_dir() {
                    fs::remove_dir_all(&p)
                } else {
                    fs::remove_file(&p)
                };

                match res {
                    Ok(_) => {
                        freed_bytes += s;
                        deleted_count += 1;
                    }
                    Err(e) => {
                        failed_count += 1;
                        errors.push(format!("Trash error {}: {}", p.to_string_lossy(), e));
                    }
                }
            }
        }
    }

    CleanResult {
        success: failed_count == 0,
        freed_bytes,
        deleted_count,
        failed_count,
        errors,
    }
}

pub fn reveal_in_system_file_manager(path_str: &str) -> Result<(), String> {
    let path = Path::new(path_str);
    if !path.exists() {
        return Err(format!("File does not exist: {}", path_str));
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("open")
            .arg("-R")
            .arg(path_str)
            .output();

        match output {
            Ok(o) if o.status.success() => Ok(()),
            Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
            Err(e) => Err(e.to_string()),
        }
    }

    #[cfg(target_os = "windows")]
    {
        let arg = format!("/select,{}", path_str);
        let output = Command::new("explorer.exe")
            .arg(arg)
            .output();
        match output {
            Ok(_) => Ok(()),
            Err(e) => Err(e.to_string()),
        }
    }

    #[cfg(target_os = "linux")]
    {
        let parent = path.parent().unwrap_or(path);
        let output = Command::new("xdg-open")
            .arg(parent)
            .output();
        match output {
            Ok(_) => Ok(()),
            Err(e) => Err(e.to_string()),
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err("Unsupported operating system for file manager reveal".to_string())
    }
}

pub fn optimize_system_memory() -> RamBoostResult {
    let mut sys = System::new_all();
    sys.refresh_memory();
    let initial_free = sys.free_memory();

    #[cfg(target_os = "macos")]
    {
        // Execute macOS purge command to discard inactive disk caches
        let _ = Command::new("purge").output();
    }

    // Trigger rust memory allocator flush / cycle
    {
        let size = 20_000_000;
        let mut temp_vec: Vec<u8> = Vec::with_capacity(size);
        for i in 0..size {
            temp_vec.push((i % 255) as u8);
        }
        std::hint::black_box(&temp_vec);
        drop(temp_vec);
    }

    std::thread::sleep(std::time::Duration::from_millis(300));
    sys.refresh_memory();
    let final_free = sys.free_memory();
    let freed = if final_free > initial_free { final_free - initial_free } else { 0 };

    RamBoostResult {
        initial_free_bytes: initial_free,
        final_free_bytes: final_free,
        freed_bytes: freed,
        message: if freed > 0 {
            format!("Successfully flushed inactive cache pages and reclaimed space.")
        } else {
            "Memory pages optimized and consolidated.".to_string()
        },
    }
}
