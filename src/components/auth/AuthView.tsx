import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { AuthModal } from './AuthModal';
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  HeartHandshake,
  Store,
  Building2,
  ShieldAlert,
  ArrowRight,
  ShoppingBag,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_USERS } from '../../data/initialData';

export const AuthView: React.FC = () => {
  const {
    setCurrentView,
    authModalTab,
    setAuthModalTab,
    login,
    showToast,
  } = useApp();
  const { t } = useI18n();

  // Quick 1-click test login for convenience
  const handleQuickLogin = (mockIndex: number) => {
    const mockUser = MOCK_USERS[mockIndex];
    if (mockUser) {
      login(mockUser);
      showToast(`Acceso directo como ${mockUser.name} (${mockUser.role})`, 'success');
    }
  };

  return (
    <div className="py-4 sm:py-8 space-y-10 animate-in fade-in duration-300">
      {/* Top Banner / Welcome context */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Acceso al Ecosistema Solidario</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white">
          Bienvenido a <span className="text-emerald-600 dark:text-emerald-400">FoodLink Solidario</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Inicia sesión con tu cuenta o regístrate para publicar alimentos, solicitar donaciones o adquirir excedentes con impacto social comprobado.
        </p>
      </div>

      {/* Main Grid: Info + Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto px-2 sm:px-4">
        {/* Left column: Key platform benefits & fast test accounts */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24 order-2 lg:order-1">
          {/* Solidary Value Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>¿Por qué registrarte en FoodLink?</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Establecimientos y Panaderías</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-relaxed">
                    Publica excedentes aptos para consumo en minutos, reduce mermas y obtén beneficios tributarios por donación certificada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:sky-emerald-900/40">
                <HeartHandshake className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Fundaciones y Comedores</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-relaxed">
                    Recibe donaciones gratuitas o compra lotes con hasta 70% de descuento con trazabilidad y retiro coordinado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Firebase Authentication Integrado</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-relaxed">
                    Seguridad oficial de Google con verificación por correo electrónico y recuperación de claves con tokens cifrados.
                  </p>
                </div>
              </div>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">+1.8k</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">kg Rescatados</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">100%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Trazabilidad</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">40+</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Comunidades</span>
              </div>
            </div>
          </div>

          {/* Fast Demo Testing Bar */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accesos rápidos de prueba</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                1 Clic
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Quieres probar la plataforma al instante? Haz clic en cualquiera de estos perfiles demostrativos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin(0)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-between">
                  <span>Panadería</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-300 truncate">Establecimiento</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(1)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-sky-300 flex items-center justify-between">
                  <span>Fundación</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-300 truncate">Comprador Solidario</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(2)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-purple-300 flex items-center justify-between">
                  <span>Admin</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-slate-300 truncate">Gestión Central</div>
              </button>
            </div>
          </div>

          {/* Secondary exploration links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setCurrentView('catalog')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver catálogo público de ofertas</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Conocer más sobre el proyecto</span>
            </button>
          </div>
        </div>

        {/* Right column: The Iniciar Sesión / Registrarse Panel */}
        <div className="lg:col-span-6 w-full order-1 lg:order-2">
          <AuthModal
            embedded={true}
            isOpen={true}
            defaultTab={authModalTab}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
