import React from 'react';
import {
  Bell,
  PlusCircle,
  Store,
  ShoppingBag,
  Menu,
  CheckCircle2,
  MapPin,
  Sun,
  Moon,
  Monitor,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    unreadNotificationsCount,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
  } = useApp();

  const isSeller = userProfile.role === 'seller';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return language === 'en' ? 'General Dashboard' : 'Panel General';
      case 'explore':
        return t('nav.explore');
      case 'map':
        return t('nav.map');
      case 'publish':
        return t('nav.publish');
      case 'my-publications':
        return t('nav.myPublications');
      case 'offers':
        return isSeller ? t('nav.offers') : t('nav.myOffers');
      case 'negotiations':
        return t('nav.negotiations');
      case 'notifications':
        return t('nav.notifications');
      case 'statistics':
        return t('nav.statistics');
      case 'profile':
        return t('nav.profile');
      default:
        return 'FoodLink Solidario';
    }
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setThemeMode(next);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Current Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              {userProfile.organizationName || userProfile.name}
              {userProfile.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
              )}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {userProfile.city}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <button
          onClick={toggleLanguage}
          title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Theme Mode Switcher */}
        <button
          onClick={cycleTheme}
          title={`Tema actual: ${
            themeMode === 'light' ? 'Claro' : themeMode === 'dark' ? 'Oscuro' : 'Automático'
          }`}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
          {themeMode === 'system' && (
            <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="hidden xl:inline text-[11px]">
            {themeMode === 'light' ? 'Claro' : themeMode === 'dark' ? 'Oscuro' : 'Auto'}
          </span>
        </button>

        {/* Authenticated Role Badge */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isSeller
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          {isSeller ? (
            <>
              <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{language === 'en' ? 'Seller' : 'Vendedor'}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'Buyer' : 'Comprador'}</span>
            </>
          )}
        </div>

        {/* Quick Publish Action (Exclusively for Seller Role) */}
        {isSeller && activeTab !== 'publish' && (
          <button
            onClick={() => setActiveTab('publish')}
            className="flex items-center gap-1.5 bg-[#1B4332] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Publish Product' : 'Publicar Alimento'}
            </span>
            <span className="sm:hidden">{language === 'en' ? 'Publish' : 'Publicar'}</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={t('nav.notifications')}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar Shortcut */}
        <button
          onClick={() => setActiveTab('profile')}
          className="w-9 h-9 rounded-xl bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center shadow-xs hover:opacity-90 transition-opacity cursor-pointer overflow-hidden"
          title={t('nav.profile')}
        >
          {userProfile.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
          )}
        </button>
      </div>
    </header>
  );
};
