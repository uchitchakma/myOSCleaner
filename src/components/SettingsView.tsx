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
      <div className="glass-panel p-5 rounded-3xl flex items-center gap-3.5 shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#db554e] via-[#C5453E] to-[#9b2c27] text-white shadow-md shadow-[#C5453E]/25 flex items-center justify-center shrink-0 p-[1px] ring-1 ring-white/30">
          <SettingsIcon className="w-6 h-6 drop-shadow-sm" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Preferences & System Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual themes, safety guards, and developer information</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Appearance Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Visual Theme</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'btn-3d-primary shadow-lg shadow-[#C5453E]/25 border-transparent'
                  : 'btn-3d-secondary'
              }`}
            >
              <div className="p-2 rounded-xl bg-white/20 text-indigo-400 shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">Dark Mode</div>
                <div className="text-[11px] opacity-80">High contrast modern dark theme</div>
              </div>
              {theme === 'dark' && <CheckCircle className="w-4 h-4 ml-auto text-white" />}
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'btn-3d-primary shadow-lg shadow-[#C5453E]/25 border-transparent'
                  : 'btn-3d-secondary'
              }`}
            >
              <div className="p-2 rounded-xl bg-white/20 text-amber-400 shadow-inner">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs">Light Mode</div>
                <div className="text-[11px] opacity-80">Clean bright appearance</div>
              </div>
              {theme === 'light' && <CheckCircle className="w-4 h-4 ml-auto text-white" />}
            </button>
          </div>
        </div>

        {/* Safety Confirmations Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Safety & Confirmation Guards</span>
          </h4>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/60 dark:bg-black/20 border border-slate-200/60 dark:border-white/5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Confirm Before Permanent Deletion</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Show a safety confirmation dialog before emptying trash or wiping large files
              </p>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeClean}
              onChange={(e) => setConfirmBeforeClean(e.target.checked)}
              className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-white/20 text-[#C5453E] focus:ring-[#C5453E] cursor-pointer"
            />
          </div>
        </div>

        {/* Developer & Company Information Card */}
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#C5453E]" />
            <span>Author & Company Credits</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Developer Card */}
            <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#db554e] to-[#C5453E] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#C5453E]/20">
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
                className="btn-3d-secondary px-3 py-1.5 rounded-xl text-[#C5453E] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Company Card */}
            <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
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
                className="btn-3d-secondary px-3 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Open Source & Community Card */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-sm border border-[#C5453E]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#C5453E]/10 blur-3xl -z-10 pointer-events-none rounded-full" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#db554e] to-[#C5453E] text-white flex items-center justify-center shadow-md shadow-[#C5453E]/25">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">myOSCleaner is 100% Free & Open Source</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Built with Rust, Tauri 2, React & Tailwind CSS</p>
              </div>
            </div>

            <a
              href="https://github.com/uchitchakma/myOSCleaner"
              target="_blank"
              rel="noreferrer"
              className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-3.5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#C5453E] fill-[#C5453E]" />
              <span>by</span>
              <a
                href="https://uchitchakma.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#C5453E] hover:underline font-bold"
              >
                Uchit Chakma
              </a>
              <span>&</span>
              <a
                href="https://ucdreams.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                UCDREAMS TECHNOLOGIES LLP
              </a>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Cross-Platform Engine
              </span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsView;

