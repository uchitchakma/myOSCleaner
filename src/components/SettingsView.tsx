import React from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  ShieldCheck,
  GitBranch,
  Heart,
  Globe,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  confirmBeforeClean: boolean;
  setConfirmBeforeClean: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  setTheme,
  confirmBeforeClean,
  setConfirmBeforeClean,
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Preferences & Application Settings</h3>
          <p className="text-xs text-slate-400">Configure visual themes, safety guards, and system protections</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Appearance Card */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Visual Theme</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-white">Dark Mode</div>
                <div className="text-[11px] text-slate-400">High contrast modern dark theme</div>
              </div>
              {theme === 'dark' && <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />}
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-white">Light Mode</div>
                <div className="text-[11px] text-slate-400">Clean bright appearance</div>
              </div>
              {theme === 'light' && <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />}
            </button>
          </div>
        </div>

        {/* Safety Confirmations Card */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety & Confirmation Guards</span>
          </h4>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Confirm Before Permanent Deletion</p>
              <p className="text-[11px] text-slate-400">
                Show a safety confirmation dialog before emptying trash or wiping large files
              </p>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeClean}
              onChange={(e) => setConfirmBeforeClean(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Open Source & Community Card */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <GitBranch className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">myOSCleaner is 100% Free & Open Source</h4>
                <p className="text-xs text-slate-400">Built with Rust, Tauri 2, React & Tailwind CSS</p>
              </div>
            </div>

            <a
              href="https://github.com/uchitchakma/myOSCleaner"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Created with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>by</span>
              <a
                href="https://uchitchakma.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline font-semibold"
              >
                Uchit Chakma
              </a>
              <span>& UCDREAMS TECHNOLOGIES LLP</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Cross-Platform Engine
              </span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
