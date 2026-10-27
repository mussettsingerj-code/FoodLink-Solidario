import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Home,
  Search,
  PlusCircle,
  Package,
  Inbox,
  MessageSquare,
  Bell,
  BarChart3,
  User,
  LogOut,
  Leaf,
  Store,
  ShoppingBag,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    unreadNotificationsCount,
    offers,
    products,
    logout,
    t,
    language,
    setLanguage,
    themeMode,
    setThemeMode,
  } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const isSeller = userProfile.role === 'seller';

  const pendingOffersCount = offers.filter(
    (o) => o.status === 'pendiente' || o.status === 'contraoferta'
  ).length;
  const myActiveProductsCount = products.filter(
    (p) =>
      p.sellerId === userProfile.id &&
      (p.status === 'activa' || p.status === 'proxima_a_finalizar')
  ).length;

  const menuItems = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
      show: true,
    },
    {
      id: 'explore',
      label: t('nav.explore'),
      icon: Search,
      show: true,
    },
    {
      id: 'publish',
      label: t('nav.publish'),
      icon: PlusCircle,
      show: isSeller,
      highlight: true,
    },
    {
      id: 'my-publications',
      label: t('nav.myPublications'),
      icon: Package,
      show: isSeller,
      badge: myActiveProductsCount > 0 ? myActiveProductsCount : undefined,
    },
    {
      id: 'offers',
      label: isSeller ? t('nav.offers') : t('nav.myOffers'),
      icon: Inbox,
      show: true,
      badge: pendingOffersCount > 0 ? pendingOffersCount : undefined,
    },
    {
      id: 'negotiations',
      label: t('nav.negotiations'),
      icon: MessageSquare,
      show: true,
    },
    {
      id: 'notifications',
      label: t('nav.notifications'),
      icon: Bell,
      show: true,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'statistics',
      label: t('nav.statistics'),
      icon: BarChart3,
      show: isSeller,
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: User,
      show: true,
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B2117] text-slate-200 w-72 select-none border-r border-emerald-950/70 shadow-2xl relative overflow-hidden">
      {/* Subtle organic emerald gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-[#071710] pointer-events-none" />

      {/* Brand Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-emerald-900/50 flex items-center justify-between relative z-10">
        <div
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform duration-200">
            <Leaf className="w-5 h-5 text-emerald-950 stroke-[2.6]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white font-display">
                FoodLink
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Solidario
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium tracking-tight">
              {language === 'en' ? 'B2B Food Rescue Network' : 'Red de Rescate Alimentario'}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl text-emerald-400/80 hover:text-white hover:bg-emerald-900/40 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Role Status Card */}
      <div className="px-3.5 py-3.5 border-b border-emerald-900/40 bg-emerald-950/40 relative z-10">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/90">
            {language === 'en' ? 'Account Role' : 'Rol de Cuenta'}
          </span>
          <span className="text-[10px] font-bold text-emerald-300/80">
            {language === 'en' ? 'Active' : 'Sesión activa'}
          </span>
        </div>
        <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-emerald-900/30 border border-emerald-800/50 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isSeller ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
              }`}
            >
              {isSeller ? <Store className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-black text-white truncate">
                {isSeller ? t('role.seller') : t('role.buyer')}
              </p>
              <p className="text-[11px] text-emerald-200/80 truncate">
                {userProfile.organizationName || userProfile.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scroll relative z-10">
        {menuItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : item.highlight
                    ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/50 hover:text-white border border-emerald-700/30'
                    : 'text-emerald-100/75 hover:bg-emerald-900/30 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveTabIndicator"
                    className="absolute inset-0 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-950/50"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 duration-150 ${
                      isActive
                        ? 'text-emerald-950 stroke-[2.6]'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-emerald-300/70 group-hover:text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full tabular-nums transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-300'
                        : item.badgeColor || 'bg-emerald-800/80 text-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Bottom User & Logout */}
      <div className="p-4 border-t border-emerald-900/50 bg-[#071710]/70 space-y-2 relative z-10">
        <div
          onClick={() => handleSelectTab('profile')}
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-emerald-900/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
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
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {userProfile.name}
              </p>
              <p className="text-[10px] text-emerald-300/70 truncate">{userProfile.email}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400/60 group-hover:translate-x-0.5 group-hover:text-emerald-300 transition-all shrink-0" />
        </div>

        {/* Language & Theme Controls */}
        <div className="pt-2 pb-1 border-t border-emerald-900/40 flex items-center justify-between gap-2">
          {/* Language Switch */}
          <div className="flex items-center bg-emerald-950/60 p-0.5 rounded-xl border border-emerald-800/50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                language === 'es'
                  ? 'bg-emerald-500 text-emerald-950 font-black shadow-xs'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
              title="Español"
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                language === 'en'
                  ? 'bg-emerald-500 text-emerald-950 font-black shadow-xs'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Theme Mode Cycle */}
          <button
            type="button"
            onClick={() => {
              if (themeMode === 'light') setThemeMode('dark');
              else if (themeMode === 'dark') setThemeMode('system');
              else setThemeMode('light');
            }}
            title={
              language === 'en'
                ? `Theme: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System Auto'}`
                : `Tema: ${themeMode === 'light' ? 'Claro' : themeMode === 'dark' ? 'Oscuro' : 'Automático'}`
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-xs hover:bg-emerald-900/50 transition-colors cursor-pointer"
          >
            {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
            {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            {themeMode === 'system' && <Monitor className="w-3.5 h-3.5 text-emerald-300" />}
            <span className="text-[11px] capitalize font-medium">
              {themeMode === 'light'
                ? t('profile.light', 'Claro')
                : themeMode === 'dark'
                ? t('profile.dark', 'Oscuro')
                : t('profile.system', 'Auto')}
            </span>
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-200/80 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Sidebar with AnimatePresence */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.05 : 0.2 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={onCloseMobile}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                duration: shouldReduceMotion ? 0.05 : 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 flex h-full shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
