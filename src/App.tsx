import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { FoodCatalog } from './components/catalog/FoodCatalog';
import { EstablishmentDashboard } from './components/dashboard/EstablishmentDashboard';
import { BuyerDashboard } from './components/dashboard/BuyerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PublishFoodModal } from './components/publishing/PublishFoodModal';
import { NegotiationChatModal } from './components/negotiation/NegotiationChatModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthView } from './components/auth/AuthView';

const MainLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentRole,
    isAuthenticated,
    isPublishModalOpen,
    setIsPublishModalOpen,
    selectedOfferIdForNegotiation,
    setSelectedOfferIdForNegotiation,
    isAuthModalOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    setAuthModalMessage,
    setRedirectTo,
  } = useApp();

  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-300">
      {/* Global Header with i18n, Theme, Role switch and Auth */}
      <Header
        onOpenAuth={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {!isAuthenticated ? (
          currentView === 'catalog' ? (
            <FoodCatalog />
          ) : currentView === 'landing' ? (
            <LandingPage />
          ) : (
            <AuthView />
          )
        ) : (
          <>
            {currentView === 'landing' && <LandingPage />}
            {currentView === 'catalog' && <FoodCatalog />}
            {currentView === 'dashboard' && (
              <>
                {currentRole === 'establishment' && <EstablishmentDashboard />}
                {(currentRole === 'buyer' || currentRole === 'buyer_foundation') && <BuyerDashboard />}
                {currentRole === 'admin' && <AdminDashboard />}
              </>
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Wizard for Publishing Food (Establishment - Authenticated only) */}
      {isAuthenticated && (
        <PublishFoodModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {/* Negotiation & Chat Modal (Authenticated only) */}
      {isAuthenticated && (
        <NegotiationChatModal
          offerId={selectedOfferIdForNegotiation}
          onClose={() => setSelectedOfferIdForNegotiation(null)}
        />
      )}

      {/* Auth & Password Recovery Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Floating System Toasts */}
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
