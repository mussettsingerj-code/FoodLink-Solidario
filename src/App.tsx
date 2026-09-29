import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider } from './i18n/I18nContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { FoodCatalog } from './components/catalog/FoodCatalog';
import { LoginView } from './components/auth/LoginView';
import { PublishFoodModal } from './components/publishing/PublishFoodModal';
import { NegotiationChatModal } from './components/negotiation/NegotiationChatModal';
import { AuthModal } from './components/auth/AuthModal';

// Módulos de la nueva arquitectura SaaS de Publik Solidario
import { DashboardHomeView } from './components/modules/DashboardHomeView';
import { PublishProductView } from './components/modules/PublishProductView';
import { MyPublicationsView } from './components/modules/MyPublicationsView';
import { OffersView } from './components/modules/OffersView';
import { NegotiationsView } from './components/modules/NegotiationsView';
import { StatisticsView } from './components/modules/StatisticsView';
import { OrganizationsView } from './components/modules/OrganizationsView';
import { NotificationsView } from './components/modules/NotificationsView';
import { ProfileSettingsView } from './components/modules/ProfileSettingsView';

const MainLayout: React.FC = () => {
  const {
    currentView,
    isAuthenticated,
    isPublishModalOpen,
    setIsPublishModalOpen,
    selectedOfferIdForNegotiation,
    setSelectedOfferIdForNegotiation,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const isSaaSWorkspace = isAuthenticated && currentView !== 'landing';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      {isSaaSWorkspace ? (
        <div className="flex flex-1 min-h-screen">
          {/* Navegación Lateral en Escritorio + Drawer y Barra en Móvil */}
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Columna Derecha de Área de Trabajo */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              onOpenAuth={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
              {(currentView === 'dashboard' || currentView === 'login') && <DashboardHomeView />}
              {currentView === 'catalog' && <FoodCatalog />}
              {currentView === 'publish' && <PublishProductView />}
              {currentView === 'my_publications' && <MyPublicationsView />}
              {currentView === 'offers' && <OffersView />}
              {currentView === 'negotiations' && <NegotiationsView />}
              {currentView === 'statistics' && <StatisticsView />}
              {currentView === 'organizations' && <OrganizationsView />}
              {currentView === 'notifications' && <NotificationsView />}
              {currentView === 'profile' && <ProfileSettingsView />}
            </main>
          </div>
        </div>
      ) : (
        <>
          <Header
            onOpenAuth={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            {currentView === 'landing' && <LandingPage />}
            {currentView === 'catalog' && <FoodCatalog />}
            {currentView === 'organizations' && <OrganizationsView />}
            {currentView !== 'landing' &&
              currentView !== 'catalog' &&
              currentView !== 'organizations' && <LoginView />}
          </main>

          <Footer />
        </>
      )}

      {/* Modal rápido de publicación (cuando se invoca por estado de modal) */}
      {isAuthenticated && (
        <PublishFoodModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {/* Modal flotante de chat de negociación (cuando no se está en la vista dedicada de negociaciones) */}
      {isAuthenticated && currentView !== 'negotiations' && (
        <NegotiationChatModal
          offerId={selectedOfferIdForNegotiation}
          onClose={() => setSelectedOfferIdForNegotiation(null)}
        />
      )}

      {/* Modal de autenticación y recuperación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notificaciones flotantes Toast */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </I18nProvider>
  );
}
