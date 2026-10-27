import React from 'react';
import {
  Sun,
  Moon,
  Monitor,
  ShoppingBag,
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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-white shadow-xs border border-emerald-500/20 dark:border-emerald-500/30 shrink-0 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.png"
              alt="FoodLink Solidario"
              className="w-full h-full object-contain select-none"
              draggable={false}
              loading="eager"
            />
          </div>
          <span className="font-display font-black text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight leading-none">
            FoodLink <span className="text-emerald-700 dark:text-emerald-400">Solidario</span>
          </span>
        </div>

        {/* Center Navigation Links (Hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            id="landing-header-btn-catalog"
            onClick={() => setCurrentView('catalog')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('landing.heroBtnCatalog', 'Explorar productos')}</span>
          </button>
        </nav>

        {/* Right Controls: Permanent Language, Theme & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Permanent Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                language === 'es'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Cambiar a Español"
            >
              <span>🇨🇴</span>
              <span className="uppercase text-[11px] sm:text-xs font-extrabold">ES</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to English"
            >
              <span>🇺🇸</span>
              <span className="uppercase text-[11px] sm:text-xs font-extrabold">EN</span>
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
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
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
            id="landing-header-btn-login"
            onClick={() => openAuthModal('login')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('auth.loginBtn', 'Iniciar Sesión')}</span>
          </button>

          {/* Crear Cuenta Button */}
          <button
            type="button"
            id="landing-header-btn-register"
            onClick={() => openAuthModal('register')}
            className="inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-300" />
            <span>{t('auth.registerTab', 'Crear Cuenta')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
