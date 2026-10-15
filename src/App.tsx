import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider } from './i18n/I18nContext';
import { LandingPage } from './components/landing/LandingPage';
import { LandingHeader } from './components/landing/LandingHeader';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardHomeView } from './components/modules/DashboardHomeView';
import { FoodCatalog } from './components/catalog/FoodCatalog';
import { PublishProductView } from './components/modules/PublishProductView';
import { MyPublicationsView } from './components/modules/MyPublicationsView';
import { OffersView } from './components/modules/OffersView';
import { NegotiationsView } from './components/modules/NegotiationsView';
import { NotificationsView } from './components/modules/NotificationsView';
import { StatisticsView } from './components/modules/StatisticsView';
import { ProfileSettingsView } from './components/modules/ProfileSettingsView';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { MakeOfferModal } from './components/catalog/MakeOfferModal';
import { PublishFoodModal } from './components/publishing/PublishFoodModal';
import { NegotiationChatModal } from './components/negotiation/NegotiationChatModal';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthModal } from './components/auth/AuthModal';
import { LoginView } from './components/auth/LoginView';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBeFNrci5vszqWYISuOfXzSViUWR-FBCxs';

const MainLayout: React.FC = () => {
  const {
    showLanding,
    isAuthenticated,
    isAuthReady,
    activeTab,
    userProfile,
    selectedOfferIdForNegotiation,
    setSelectedOfferIdForNegotiation,
    isPublishModalOpen,
    setIsPublishModalOpen,
  } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (showLanding && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
        <LandingHeader />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div key={activeTab === 'catalog' || activeTab === 'explore' ? 'catalog' : 'landing'} className="animate-fade-in">
            {activeTab === 'catalog' || activeTab === 'explore' ? (
              <FoodCatalog />
            ) : (
              <LandingPage />
            )}
          </div>
        </main>
        <Footer />
        <ProductDetailModal />
        <MakeOfferModal />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isExploringCatalog = activeTab === 'explore' || activeTab === 'catalog';

    if (isExploringCatalog) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
          <LandingHeader />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <FoodCatalog />
          </main>
          <Footer />
          <ProductDetailModal />
          <MakeOfferModal />
          <AuthModal />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
        <main className="flex-1">
          <LoginView />
        </main>
        <Footer />
        <ProductDetailModal />
        <MakeOfferModal />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  const isSeller = userProfile.role === 'seller';

  const renderModule = () => {
    switch (activeTab) {
      case 'home':
      case 'dashboard':
        return <DashboardHomeView />;
      case 'explore':
      case 'catalog':
        return <FoodCatalog />;
      case 'publish':
        return isSeller ? <PublishProductView /> : <DashboardHomeView />;
      case 'my-publications':
        return isSeller ? <MyPublicationsView /> : <DashboardHomeView />;
      case 'offers':
        return <OffersView />;
      case 'negotiations':
        return <NegotiationsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'statistics':
        return isSeller ? <StatisticsView /> : <DashboardHomeView />;
      case 'profile':
        return <ProfileSettingsView />;
      default:
        return <DashboardHomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1">
          <div key={activeTab} className="animate-fade-in">
            {renderModule()}
          </div>
        </main>

        <Footer />
      </div>

      {/* Modals */}
      <ProductDetailModal />
      <MakeOfferModal />
      {isSeller && (
        <PublishFoodModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}
      <NegotiationChatModal
        offerId={selectedOfferIdForNegotiation}
        onClose={() => setSelectedOfferIdForNegotiation(null)}
      />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <I18nProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </I18nProvider>
    </APIProvider>
  );
}

export default App;
