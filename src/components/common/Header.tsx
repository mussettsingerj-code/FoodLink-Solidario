import React, { useState, useEffect, useRef } from 'react';
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
  User,
  Settings,
  LogOut,
  ChevronDown,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, SupportedLanguage } from '../../types';

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
    logout,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setLogoutError(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setLogoutError(null);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const result = await logout();
      if (!result.success) {
        setLogoutError(
          result.error ||
            (language === 'en'
              ? 'Could not sign out. Please try again.'
              : 'No se pudo cerrar la sesión. Por favor, intenta de nuevo.')
        );
        setIsLoggingOut(false);
      } else {
        setIsProfileMenuOpen(false);
        setIsLoggingOut(false);
      }
    } catch {
      setLogoutError(
        language === 'en'
          ? 'Unexpected error while signing out. Try again.'
          : 'Error inesperado al cerrar la sesión. Intenta nuevamente.'
      );
      setIsLoggingOut(false);
    }
  };

  const isSeller = userProfile.role === 'seller';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return t('nav.home');
      case 'explore':
      case 'catalog':
        return t('nav.explore');
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
        return t('app.name');
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Current Section Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label={language === 'en' ? 'Open menu' : 'Abrir menú'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-none truncate">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {userProfile.organizationName || userProfile.name}
              {userProfile.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 inline" />
              )}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-slate-400" />
              {userProfile.city}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions: Language, Theme, Role, Notifications, Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Permanent Language Toggle Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
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
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
          {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
          {themeMode === 'system' && (
            <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}
          <span className="hidden md:inline text-xs font-medium">
            {themeMode === 'light'
              ? t('profile.light')
              : themeMode === 'dark'
              ? t('profile.dark')
              : t('profile.system')}
          </span>
        </button>

        {/* Authenticated Role Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isSeller
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          {isSeller ? (
            <>
              <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('role.seller')}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('role.buyer')}</span>
            </>
          )}
        </div>

        {/* Quick Publish Action (Exclusively for Seller Role) */}
        {isSeller && activeTab !== 'publish' && (
          <button
            onClick={() => setActiveTab('publish')}
            className="flex items-center gap-1.5 bg-[#1B4332] hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">{t('nav.publish')}</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={t('nav.notifications')}
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & Interactive Dropdown Menu (Requirement 1 & 2) */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            id="user-profile-menu-button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
            aria-label="Abrir menú de usuario"
            className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-600/50 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-emerald-800/40 shrink-0">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 hidden sm:block ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Modal / Popover */}
          {isProfileMenuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-profile-menu-button"
              className="absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            >
              {/* User Identity Card */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden border border-emerald-800/40">
                    {userProfile.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                      {userProfile.name || 'Usuario FoodLink'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {userProfile.email}
                    </p>
                    {userProfile.organizationName && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">
                        {userProfile.organizationName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Rol activo:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      isSeller
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                    }`}
                  >
                    {isSeller ? (
                      <>
                        <Store className="w-3 h-3" />
                        <span>Vendedor</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3" />
                        <span>Comprador</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="space-y-1">
                {/* 1. Mi perfil */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Mi perfil
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Información personal y comercial
                    </p>
                  </div>
                </button>

                {/* 2. Configuración de cuenta */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Configuración de cuenta
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Seguridad, rol y preferencias
                    </p>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

              {/* Logout Failure Error Banner */}
              {logoutError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-tight">{logoutError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-1 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reintentar cerrar sesión
                  </button>
                </div>
              )}

              {/* 3. Cerrar sesión con estilo visual diferenciado */}
              <button
                type="button"
                role="menuitem"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 font-bold text-xs disabled:opacity-60 shadow-2xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </div>
                  <span>
                    {isLoggingOut ? 'Cerrando sesión en Firebase...' : 'Cerrar sesión'}
                  </span>
                </div>
                {!isLoggingOut && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                    Salir
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
