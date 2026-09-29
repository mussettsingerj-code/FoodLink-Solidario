import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Package,
  FileSpreadsheet,
  MessageSquare,
  BarChart3,
  Building2,
  Bell,
  UserCog,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { RoleType } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  group: 'principal' | 'operaciones' | 'ecosistema' | 'cuenta';
  accent?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    currentRole,
    switchRole,
    logout,
    products,
    offers,
    unreadNotificationsCount,
  } = useApp();

  const userId = currentUser?.id || '';
  const isAdmin = currentRole === 'admin';

  const activeCatalogCount = products.filter(
    (p) => p.status === 'activa' || p.status === 'proxima_a_finalizar'
  ).length;

  const myPublicationsCount = products.filter(
    (p) => p.sellerId === userId || isAdmin
  ).length;

  const pendingOffersCount = offers.filter((o) => {
    const isParticipant = o.sellerId === userId || o.buyerId === userId || isAdmin;
    return isParticipant && (o.status === 'pendiente' || o.status === 'contraoferta');
  }).length;

  const activeNegotiationsCount = offers.filter((o) => {
    return o.sellerId === userId || o.buyerId === userId || isAdmin;
  }).length;

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      group: 'principal',
    },
    {
      id: 'catalog',
      label: 'Explorar productos',
      icon: ShoppingBag,
      badge: activeCatalogCount > 0 ? activeCatalogCount : undefined,
      group: 'principal',
    },
    {
      id: 'publish',
      label: 'Publicar producto',
      icon: PlusCircle,
      group: 'principal',
      accent: true,
    },
    {
      id: 'my_publications',
      label: 'Mis publicaciones',
      icon: Package,
      badge: myPublicationsCount > 0 ? myPublicationsCount : undefined,
      group: 'operaciones',
    },
    {
      id: 'offers',
      label: 'Ofertas',
      icon: FileSpreadsheet,
      badge: pendingOffersCount > 0 ? pendingOffersCount : undefined,
      group: 'operaciones',
    },
    {
      id: 'negotiations',
      label: 'Negociaciones',
      icon: MessageSquare,
      badge: activeNegotiationsCount > 0 ? activeNegotiationsCount : undefined,
      group: 'operaciones',
    },
    {
      id: 'statistics',
      label: 'Estadísticas',
      icon: BarChart3,
      group: 'ecosistema',
    },
    {
      id: 'organizations',
      label: 'Empresas y organizaciones',
      icon: Building2,
      group: 'ecosistema',
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      group: 'cuenta',
    },
    {
      id: 'profile',
      label: 'Perfil y configuración',
      icon: UserCog,
      group: 'cuenta',
    },
  ];

  const handleNavigate = (viewId: string) => {
    setCurrentView(viewId);
    onCloseMobile();
  };

  const renderGroup = (
    groupKey: NavItemConfig['group'],
    groupTitle: string
  ) => {
    const items = navItems.filter((item) => item.group === groupKey);
    return (
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-tight mb-1.5">
          {groupTitle}
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (currentView === 'login' && item.id === 'dashboard');

          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-600'
                  : item.accent
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.accent
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Cabecera de Marca */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div
          onClick={() => handleNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer min-w-0"
        >
          <Logo size="sm" showBackground={true} />
          <div className="min-w-0">
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white tracking-tight block truncate">
              Publik Solidario
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Cerrar menú lateral"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Menú de Navegación por Módulos */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scroll">
        {renderGroup('principal', 'Plataforma')}
        {renderGroup('operaciones', 'Gestión y Operaciones')}
        {renderGroup('ecosistema', 'Impacto y Red')}
        {renderGroup('cuenta', 'Cuenta')}
      </div>

      {/* Selector de Rol de Evaluación + Perfil */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        {/* Selector rápido de modo para pruebas */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-1.5 px-1">
            Vista activa del perfil
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-[11px] font-medium">
            {(
              [
                { id: 'establishment', label: 'Empresa' },
                { id: 'buyer_foundation', label: 'Fundación' },
                { id: 'admin', label: 'Admin' },
              ] as { id: RoleType; label: string }[]
            ).map((roleOption) => {
              const active =
                currentRole === roleOption.id ||
                (currentRole === 'buyer' && roleOption.id === 'buyer_foundation');
              return (
                <button
                  key={roleOption.id}
                  type="button"
                  onClick={() => switchRole(roleOption.id)}
                  className={`py-1 px-1.5 rounded-md transition-colors text-center truncate cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {roleOption.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen de usuario y botón de salir */}
        {currentUser && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div
              onClick={() => handleNavigate('profile')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600">
                    {currentUser.name}
                  </span>
                  {currentUser.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  {currentUser.organizationName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Fijo en Escritorio */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Drawer Adaptado en Móvil / Tablet */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex flex-col h-full max-w-xs w-64">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Barra Inferior Compacta en Móviles (cumple <15% de altura móvil) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { id: 'catalog', label: 'Explorar', icon: ShoppingBag },
          { id: 'publish', label: 'Publicar', icon: PlusCircle },
          { id: 'offers', label: 'Ofertas', icon: FileSpreadsheet, badge: pendingOffersCount },
          { id: 'negotiations', label: 'Chats', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
};
