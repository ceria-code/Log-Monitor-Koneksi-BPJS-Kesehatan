import React from 'react';
import { 
  Activity, 
  Moon, 
  Sun, 
  Eye, 
  Globe, 
  User, 
  HelpCircle, 
  Bell, 
  Cloud, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { SupportedLanguage, UserSession } from '../types/bpjs';
import { TRANSLATIONS } from '../services/i18n';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  seniorMode: boolean;
  setSeniorMode: (val: boolean) => void;
  fontScale: 'normal' | 'large' | 'extra';
  setFontScale: (scale: 'normal' | 'large' | 'extra') => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  user: UserSession;
  onOpenLogin: () => void;
  onOpenTour: () => void;
  onOpenBackup: () => void;
  onOpenTasks: () => void;
  urgentTaskCount: number;
  unreadNotifs: number;
  onOpenNotifs: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  seniorMode,
  setSeniorMode,
  fontScale,
  setFontScale,
  lang,
  setLang,
  user,
  onOpenLogin,
  onOpenTour,
  onOpenBackup,
  onOpenTasks,
  urgentTaskCount,
  unreadNotifs,
  onOpenNotifs,
  isOnline
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className={`w-full border-b transition-colors ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    } ${seniorMode ? 'ring-2 ring-emerald-500' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-lg sm:text-xl text-emerald-600 dark:text-emerald-400">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Pemantauan Pakdhe
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl line-clamp-1">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls & Quick Access Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">

            {/* Senior Mode Toggle (Ramah Lansia) */}
            <button
              id="btn-senior-mode-toggle"
              type="button"
              onClick={() => {
                const next = !seniorMode;
                setSeniorMode(next);
                if (next && fontScale === 'normal') setFontScale('large');
              }}
              title={t.seniorModeDesc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                seniorMode
                  ? 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400'
                  : darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{seniorMode ? t.seniorModeOn : t.seniorMode}</span>
            </button>

            {/* Font Scale Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFontScale('normal')}
                title={t.fontSizeNormal}
                className={`px-2 py-1 rounded transition-colors ${
                  fontScale === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontScale('large')}
                title={t.fontSizeLarge}
                className={`px-2 py-1 rounded transition-colors ${
                  fontScale === 'large'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontScale('extra')}
                title={t.fontSizeExtra}
                className={`px-2 py-1 rounded transition-colors ${
                  fontScale === 'extra'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                A++
              </button>
            </div>

            {/* Language Selector (ID / EN / JW) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              {(['id', 'en', 'jw'] as SupportedLanguage[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-1.5 py-1 rounded uppercase text-[11px] font-bold transition-colors ${
                    lang === l
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Urgent Tasks Quick Trigger */}
            <button
              id="btn-urgent-tasks"
              type="button"
              onClick={onOpenTasks}
              title="Tugas & Pengingat"
              className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {urgentTaskCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {urgentTaskCount}
                </span>
              )}
            </button>

            {/* Encrypted Cloud Backup Trigger */}
            <button
              id="btn-cloud-backup"
              type="button"
              onClick={onOpenBackup}
              title={t.backupTab}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Cloud className="w-4 h-4" />
            </button>

            {/* Interactive User Tour */}
            <button
              id="btn-interactive-guide"
              type="button"
              onClick={onOpenTour}
              title={t.guideTab}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? t.lightMode : t.darkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile / Login Session */}
            <button
              id="btn-user-profile"
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-900 dark:text-slate-100 border border-emerald-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{user.name}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
