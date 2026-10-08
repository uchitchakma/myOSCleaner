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
  User,
  Building2,
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
      <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#C5453E]/10 text-[#C5453E] border border-[#C5453E]/20 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Preferences & System Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual themes, safety guards, and developer information</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Visual Theme</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'bg-[#C5453E]/15 border-[#C5453E] text-white shadow-md shadow-[#C5453E]/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-500">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Dark Mode</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">High contrast modern dark theme</div>
              </div>
              {theme === 'dark' && <CheckCircle className="w-4 h-4 text-[#C5453E] ml-auto" />}
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'bg-[#C5453E]/15 border-[#C5453E] text-slate-900 shadow-md shadow-[#C5453E]/10'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-xs text-slate-900 dark:text-white">Light Mode</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Clean bright appearance</div>
              </div>
              {theme === 'light' && <CheckCircle className="w-4 h-4 text-[#C5453E] ml-auto" />}
            </button>
          </div>
        </div>

        {/* Safety Confirmations Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Safety & Confirmation Guards</span>
          </h4>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Confirm Before Permanent Deletion</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Show a safety confirmation dialog before emptying trash or wiping large files
              </p>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeClean}
              onChange={(e) => setConfirmBeforeClean(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/20 text-[#C5453E] focus:ring-[#C5453E] cursor-pointer"
            />
          </div>
        </div>

        {/* Developer & Company Information Card */}
        <div className="bg-white dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#C5453E]" />
            <span>Author & Company Credits</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Developer Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center font-bold text-sm">
                  UC
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Uchit Chakma</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Lead Systems Engineer & Founder</p>
                </div>
              </div>
              <a
                href="https://uchitchakma.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#C5453E]/10 hover:bg-[#C5453E]/20 text-[#C5453E] text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Company Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">UCDREAMS TECHNOLOGIES LLP</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Innovative Software & Systems</p>
                </div>
              </div>
              <a
                href="https://ucdreams.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Open Source & Community Card */}
        <div className="bg-gradient-to-tr from-[#C5453E]/10 via-rose-500/10 to-orange-500/10 border border-[#C5453E]/20 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5453E]/20 flex items-center justify-center text-[#C5453E]">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">myOSCleaner is 100% Free & Open Source</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Built with Rust, Tauri 2, React & Tailwind CSS</p>
              </div>
            </div>

            <a
              href="https://github.com/uchitchakma/myOSCleaner"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#C5453E] hover:bg-[#b83b34] text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 shadow-md shadow-[#C5453E]/20"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#C5453E] fill-[#C5453E]" />
              <span>by</span>
              <a
                href="https://uchitchakma.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#C5453E] hover:underline font-semibold"
              >
                Uchit Chakma
              </a>
              <span>&</span>
              <a
                href="https://ucdreams.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                UCDREAMS TECHNOLOGIES LLP
              </a>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
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
