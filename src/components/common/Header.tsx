import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { Logo } from './Logo';
import {
  Search,
  Bell,
  Plus,
  Menu,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenMobileSidebar?: () => void;
}

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Inicio / Dashboard',
  catalog: 'Explorar productos',
  publish: 'Publicar producto',
  my_publications: 'Mis publicaciones',
  offers: 'Ofertas',
  negotiations: 'Negociaciones',
  statistics: 'Estadísticas e impacto',
  organizations: 'Empresas y organizaciones',
  notifications: 'Centro de notificaciones',
  profile: 'Perfil y configuración',
  landing: 'Presentación',
  login: 'Acceso a la plataforma',
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    currentView,
    setCurrentView,
    isAuthenticated,
    currentUser,
    theme,
    setTheme,
    unreadNotificationsCount,
    globalSearchQuery,
    setGlobalSearchQuery,
    setAuthModalTab,
  } = useApp();

  const { language, setLanguage } = useI18n();

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim() && currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  const toggleThemeMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Si el usuario está autenticado y dentro del área de trabajo SaaS
  if (isAuthenticated && currentView !== 'landing') {
    const activeSectionTitle = VIEW_LABELS[currentView] || 'Inicio';

    return (
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zona 1: Menú móvil + Ruta contextual (Breadcrumbs) */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              aria-label="Abrir menú de navegación"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hidden sm:inline cursor-pointer whitespace-nowrap"
            >
              Publik Solidario
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {activeSectionTitle}
            </span>
          </div>
        </div>

        {/* Zona 2: Buscador Global */}
        <form
          onSubmit={handleGlobalSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              if (currentView !== 'catalog' && e.target.value.trim().length > 1) {
                setCurrentView('catalog');
              }
            }}
            placeholder="Buscar productos, lotes, empresas o ciudades..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-emerald-600 transition-colors"
          />
        </form>

        {/* Zona 3: Acciones Rápidas y Cuenta */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="header-btn-publish"
            onClick={() => setCurrentView('publish')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publicar producto</span>
            <span className="sm:hidden">Publicar</span>
          </button>

          {/* Notificaciones */}
          <button
            type="button"
            onClick={() => setCurrentView('notifications')}
            title="Notificaciones"
            className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
              currentView === 'notifications'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono tabular-nums font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Tema Claro / Oscuro */}
          <button
            type="button"
            onClick={toggleThemeMode}
            title="Cambiar tema visual"
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Idioma ES / EN */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            title="Cambiar idioma"
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase cursor-pointer"
          >
            {language}
          </button>

          {/* Avatar Perfil */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              title="Perfil y configuración"
              className="pl-1.5 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden xl:inline max-w-[110px] truncate">
                {currentUser.name}
              </span>
            </button>
          )}
        </div>
      </header>
    );
  }

  // Vista pública / no autenticada (Cumple con el Contrato de Barra Superior en 3 zonas + barra inferior móvil)
  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        {/* Zona 1: Marca en una línea */}
        <div
          onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <Logo size="sm" showBackground={true} />
          <span className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            Publik Solidario
          </span>
        </div>

        {/* Zona 2: Enlaces limpios de navegación */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setCurrentView('login')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'login' ? 'text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'catalog' ? 'text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Explorar productos
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('organizations')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'organizations' ? 'text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Empresas y fundaciones
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'landing' ? 'text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-8' : ''
            }`}
          >
            Cómo funciona
          </button>
        </nav>

        {/* Zona 3: 1-2 Acciones Primarias */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleThemeMode}
            aria-label="Cambiar tema"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Ir al Dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setCurrentView('login');
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Crear cuenta
            </button>
          )}
        </div>
      </header>

      {/* Navegación rápida para móviles en vistas públicas */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around gap-1 text-xs">
        {[
          { id: 'login', label: 'Acceso' },
          { id: 'catalog', label: 'Explorar' },
          { id: 'organizations', label: 'Empresas' },
          { id: 'landing', label: 'Cómo funciona' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentView(item.id)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              currentView === item.id
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};
