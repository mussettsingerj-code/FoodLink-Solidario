import React from 'react';
import {
  Leaf,
  Sun,
  Moon,
  Monitor,
  ShoppingBag,
  Building2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingHeader: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
    setCurrentView,
    openAuthModal,
  } = useApp();

  const cycleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0 shrink"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#1B4332] to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform shrink-0">
            <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-300 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-black text-base sm:text-xl text-slate-900 dark:text-white tracking-tight leading-none block truncate">
              FoodLink <span className="text-emerald-700 dark:text-emerald-400">Solidario</span>
            </span>
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              Colombia • B2B
            </span>
          </div>
        </div>

        {/* Center Navigation Links (Hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg px-2 py-1"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.explore', 'Catálogo')}</span>
          </button>
        </nav>

        {/* Right Controls: Permanent Language, Theme & Auth Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Permanent Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-1.5 xs:px-2 sm:px-2.5 py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg transition-all cursor-pointer flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                language === 'es'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Cambiar a Español"
              aria-label="Cambiar a Español"
            >
              <span className="hidden xs:inline">🇨🇴</span>
              <span className="uppercase text-[10px] sm:text-xs font-extrabold">ES</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 xs:px-2 sm:px-2.5 py-1.5 min-h-[32px] sm:min-h-[36px] rounded-lg transition-all cursor-pointer flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to English"
              aria-label="Switch to English"
            >
              <span className="hidden xs:inline">🇺🇸</span>
              <span className="uppercase text-[10px] sm:text-xs font-extrabold">EN</span>
            </button>
          </div>

          {/* Permanent Theme Mode Switcher */}
          <button
            type="button"
            onClick={cycleTheme}
            title={
              language === 'en'
                ? `Theme: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System Auto'}`
                : `Tema: ${themeMode === 'light' ? 'Claro' : themeMode === 'dark' ? 'Oscuro' : 'Automático'}`
            }
            aria-label={language === 'en' ? 'Toggle theme' : 'Cambiar tema'}
            className="flex items-center justify-center gap-1.5 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {themeMode === 'system' && (
              <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="hidden sm:inline text-xs font-medium">
              {themeMode === 'light'
                ? t('profile.light', 'Claro')
                : themeMode === 'dark'
                ? t('profile.dark', 'Oscuro')
                : t('profile.system', 'Auto')}
            </span>
          </button>

          {/* Iniciar Sesión / Acceso */}
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-2 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('auth.loginBtn', 'Iniciar Sesión')}</span>
          </button>

          {/* Crear Cuenta / Acceso rápido Button */}
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-[#1B4332] hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer min-h-[36px] sm:min-h-[40px] focus-visible:ring-2 focus-visible:ring-emerald-600 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
            <span className="hidden xs:inline">{t('auth.registerTab', 'Crear Cuenta')}</span>
            <span className="xs:hidden">{t('auth.loginBtn', 'Entrar')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
