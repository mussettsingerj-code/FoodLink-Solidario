import React from 'react';
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
  MapPin,
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
  } = useApp();

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
      id: 'map',
      label: t('nav.map'),
      icon: MapPin,
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
    <div className="flex flex-col h-full bg-[#0F291E] text-slate-200 w-72 select-none border-r border-emerald-950/60">
      {/* Brand Header */}
      <div className="p-6 pb-5 border-b border-emerald-900/60 flex items-center justify-between">
        <div
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">FoodLink</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-300 border border-emerald-700/50">
                Solidario
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/70 font-medium">
              {language === 'en' ? 'B2B Food Rescue Network' : 'Red de Rescate Alimentario'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Role Status Card */}
      <div className="px-4 py-4 border-b border-emerald-900/50 bg-emerald-950/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
            {language === 'en' ? 'Account Role' : 'Rol de Cuenta'}
          </span>
        </div>
        <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSeller ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isSeller ? <Store className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {isSeller ? t('role.seller') : t('role.buyer')}
              </p>
              <p className="text-[11px] text-emerald-300/80 truncate">
                {userProfile.organizationName || userProfile.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                    : item.highlight
                    ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 border border-emerald-700/40'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-slate-950 stroke-[2.5]'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-emerald-300/70'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-emerald-400'
                        : item.badgeColor || 'bg-emerald-800 text-emerald-200'
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
      <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40 space-y-2">
        <div
          onClick={() => handleSelectTab('profile')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-900/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
              <p className="text-xs font-bold text-white truncate">{userProfile.name}</p>
              <p className="text-[10px] text-emerald-300/70 truncate">{userProfile.email}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400/60 shrink-0" />
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300/80 hover:text-white hover:bg-red-950/50 border border-transparent hover:border-red-800/40 transition-colors cursor-pointer"
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

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
