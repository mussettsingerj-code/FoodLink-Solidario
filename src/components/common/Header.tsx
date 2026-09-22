import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { RoleType, ThemeMode } from '../../types';
import {
  Leaf,
  Plus,
  Bell,
  User,
  ShoppingBag,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  Shield,
  KeyRound,
  QrCode,
} from 'lucide-react';
import { ShareQrModal } from './ShareQrModal';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const {
    currentView,
    setCurrentView,
    currentRole,
    switchRole,
    currentUser,
    isAuthenticated,
    logout,
    toggle2FA,
    navigateWithGuard,
    notifications,
    setIsPublishModalOpen,
    setSelectedOfferIdForNegotiation,
    theme,
    setTheme,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  const { language, setLanguage, t } = useI18n();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleChange = (role: RoleType) => {
    switchRole(role);
    setIsMobileMenuOpen(false);
    if (currentView === 'dashboard') {
      setCurrentView('dashboard');
    }
  };

  const handleDashboardClick = () => {
    navigateWithGuard('dashboard');
  };

  const handlePublishClick = () => {
    if (!isAuthenticated) {
      navigateWithGuard('dashboard');
      return;
    }
    if (currentRole !== 'establishment' && currentRole !== 'admin') {
      switchRole('establishment');
    }
    setIsPublishModalOpen(true);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Slogan */}
          <div
            onClick={() => setCurrentView('landing')}
            className="cursor-pointer group flex items-center gap-3 py-1"
          >
            <div className="flex items-center justify-center bg-white rounded-xl p-1 shadow-2xs border border-slate-250 dark:border-slate-700">
              <img
                src="/logo.png"
                alt="FoodLink Solidario"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100/70 dark:border-emerald-800/60'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('nav.home')}
            </button>

            <button
              id="nav-btn-catalog"
              onClick={() => setCurrentView('catalog')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'catalog'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100/70 dark:border-emerald-800/60'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.catalog')}</span>
            </button>

            <button
              id="nav-btn-dashboard"
              onClick={handleDashboardClick}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100/70 dark:border-emerald-800/60'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.dashboard')}</span>
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ml-1">
                  Candado
                </span>
              )}
            </button>
          </nav>

          {/* Desktop Right Controls (Theme, Language, Role, User, Publish) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language Selector (ES | EN text segmented control, no flags) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'es'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                aria-label="Cambiar a Español"
              >
                ES
              </button>
              <span className="text-slate-300 dark:text-slate-600 px-0.5">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Theme Selector (Light / Dark / System) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title={`Tema: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}`}
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {theme === 'system' && <Monitor className="w-4 h-4 text-emerald-500" />}
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${
                      theme === 'light' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {t('nav.light')}
                    </span>
                    {theme === 'light' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${
                      theme === 'dark' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      {t('nav.dark')}
                    </span>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('system');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${
                      theme === 'system' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                      {t('nav.system')}
                    </span>
                    {theme === 'system' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* QR Code Share Quick Button */}
            <button
              type="button"
              id="header-btn-qr"
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={t('qr.title', 'Compartir Código QR')}
              aria-label="Compartir Código QR"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 z-50 text-xs">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{t('nav.notifications')}</span>
                    <span className="text-[11px] text-slate-400">{notifications.length}</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scroll divide-y divide-slate-100 dark:divide-slate-700/60">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.relatedOfferId) {
                            setSelectedOfferIdForNegotiation(n.relatedOfferId);
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Publish Food Button */}
            <button
              type="button"
              id="header-btn-publish"
              onClick={handlePublishClick}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('nav.publish')}</span>
            </button>

            {/* Auth State Button / Profile Menu */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate text-slate-800 dark:text-slate-200">
                    {currentUser.name?.split(' ')[0] || 'Usuario'}
                  </span>
                </button>

                {/* Profile & Security Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs space-y-3">
                    {/* User summary */}
                    <div className="border-b border-slate-100 dark:border-slate-700 pb-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {currentUser.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {currentRole === 'establishment' ? 'Establecimiento' : currentRole === 'buyer_foundation' ? 'Fundación' : 'Admin'}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">
                        {currentUser.email}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] truncate">
                        {currentUser.organizationName}
                      </p>
                    </div>

                    {/* Role quick switch (for evaluation) */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('nav.switchRole')}:
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => handleRoleChange('establishment')}
                          className={`py-1 text-[11px] font-bold rounded text-center cursor-pointer transition-colors ${
                            currentRole === 'establishment'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          Comercio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleChange('buyer_foundation')}
                          className={`py-1 text-[11px] font-bold rounded text-center cursor-pointer transition-colors ${
                            currentRole === 'buyer_foundation'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          Fundación
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleChange('admin')}
                          className={`py-1 text-[11px] font-bold rounded text-center cursor-pointer transition-colors ${
                            currentRole === 'admin'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    {/* 2FA Status Toggle */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                            Verificación 2FA
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {currentUser.twoFactorEnabled ? 'Activa (OTP)' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle2FA(!currentUser.twoFactorEnabled)}
                        className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors ${
                          currentUser.twoFactorEnabled
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {currentUser.twoFactorEnabled ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>

                    {/* Logout Button (Strict POST CSRF invalidation) */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-900/50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs cursor-pointer"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Fast Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Language switch compact */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {language.toUpperCase()}
            </button>

            {/* Theme toggle mobile */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 dark:text-slate-300 cursor-pointer"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 text-sm font-semibold">
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView('landing');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => {
                setCurrentView('catalog');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.catalog')}</span>
            </button>
            <button
              onClick={() => {
                handleDashboardClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>{t('nav.dashboard')}</span>
            </button>
          </div>

            {/* Auth in Mobile */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsQrModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('qr.title', 'Compartir Código QR')}</span>
              </button>

              {isAuthenticated && currentUser ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Conectado como <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-lg flex items-center justify-center gap-2 text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold text-center"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('register');
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center"
                  >
                    {t('nav.register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Share QR Modal */}
      <ShareQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </header>
  );
};
