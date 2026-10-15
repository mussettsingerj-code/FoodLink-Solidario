import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Package,
  Clock,
  Inbox,
  CheckCircle2,
  PlusCircle,
  Search,
  ArrowRight,
  AlertTriangle,
  Store,
  ShoppingBag,
  Sparkles,
  CalendarClock,
  Bell,
  TrendingUp,
  BarChart2,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber } from '../common/AnimatedNumber';

export const DashboardHomeView: React.FC = () => {
  const {
    userProfile,
    products,
    offers,
    notifications,
    setActiveTab,
    setSelectedProductIdForDetail,
    setSelectedOfferIdForNegotiation,
    formatCOP,
    t,
  } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const isSeller = userProfile.role === 'seller';
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Seller metrics (strictly scoped to the authenticated seller's own products and offers)
  const myProducts = products.filter((p) => p.sellerId === userProfile.id);
  const activeProductsCount = myProducts.filter((p) => p.status === 'activa').length;
  const expiringSoonCount = myProducts.filter((p) => p.status === 'proxima_a_finalizar').length;
  const receivedPendingOffers = offers.filter(
    (o) =>
      o.sellerId === userProfile.id &&
      (o.status === 'pendiente' || o.status === 'contraoferta')
  );
  const completedSalesCount =
    myProducts.filter((p) => p.status === 'vendida').length +
    offers.filter((o) => o.sellerId === userProfile.id && o.status === 'aceptada').length;

  // Buyer metrics (strictly real data for the authenticated buyer)
  const availableCatalogProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'activa' && p.status !== 'proxima_a_finalizar') return false;
      const expTime = p.expirationDate
        ? new Date(`${p.expirationDate}T23:59:59`).getTime()
        : p.expiresAt
        ? new Date(p.expiresAt).getTime()
        : NaN;
      if (!isNaN(expTime) && expTime < Date.now()) {
        return false;
      }
      return true;
    });
  }, [products]);

  const mySentOffers = offers.filter((o) => o.buyerId === userProfile.id);
  const acceptedOffersCount = mySentOffers.filter((o) => o.status === 'aceptada').length;
  const activeNegotiationsCount = mySentOffers.filter(
    (o) => o.status === 'pendiente' || o.status === 'contraoferta'
  ).length;

  // Real category breakdown for available catalog products
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const relevantProducts = isSeller ? myProducts : availableCatalogProducts;
    relevantProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    const total = relevantProducts.length || 1;
    return Object.entries(counts)
      .map(([cat, count]) => ({
        category: cat,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [isSeller, myProducts, availableCatalogProducts]);

  const urgentProducts = availableCatalogProducts.slice(0, 3);
  const recentOffers = offers.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8"
    >
      {/* 1. Welcome Hero Banner with Depth and Controls */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl bg-gradient-to-br from-[#0B2117] via-[#123826] to-[#081811] text-white p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl border border-emerald-900/60"
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-2xs">
              {isSeller ? (
                <>
                  <Store className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('dashboard.sellerPanel')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('dashboard.buyerPanel')}</span>
                </>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display">
              {t('dashboard.greeting')},{' '}
              <span className="text-emerald-300">
                {userProfile.organizationName || userProfile.name}
              </span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-normal">
              {isSeller ? t('dashboard.sellerIntro') : t('dashboard.buyerIntro')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isSeller ? (
              <>
                <button
                  type="button"
                  id="dashboard-btn-publish"
                  onClick={() => setActiveTab('publish')}
                  className="btn-interaction flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.8]" />
                  <span>{t('dashboard.publishNew')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('my-publications')}
                  className="btn-interaction flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-3.5 rounded-2xl text-xs sm:text-sm backdrop-blur-md cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>{t('dashboard.myLots')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  id="dashboard-btn-explore"
                  onClick={() => setActiveTab('explore')}
                  className="btn-interaction flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.8]" />
                  <span>{t('dashboard.exploreCatalog')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('negotiations')}
                  className="btn-interaction flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-3.5 rounded-2xl text-xs sm:text-sm backdrop-blur-md cursor-pointer"
                >
                  <Inbox className="w-4 h-4" />
                  <span>{t('dashboard.myNegotiations')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. KPI Summary Cards with Animated Number Counters */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {isSeller ? (
          <>
            {/* Seller KPI 1: Publicaciones Activas */}
            <div
              onClick={() => setActiveTab('my-publications')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.activePublications')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <Package className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={activeProductsCount} />
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.activePublicationsSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Seller KPI 2: Próximas a vencer */}
            <div
              onClick={() => setActiveTab('my-publications')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.expiringSoon')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={expiringSoonCount} />
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.expiringSoonSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Seller KPI 3: Ofertas Pendientes */}
            <div
              onClick={() => setActiveTab('offers')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.pendingOffers')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <Inbox className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={receivedPendingOffers.length} />
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.pendingOffersSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Seller KPI 4: Entregas Acordadas */}
            <div
              onClick={() => setActiveTab('statistics')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.agreedDeliveries')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={completedSalesCount} />
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.agreedDeliveriesSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Buyer KPI 1: Lotes Disponibles Hoy */}
            <div
              onClick={() => setActiveTab('explore')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.lotsAvailableToday')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={availableCatalogProducts.length} />
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.lotsAvailableTodaySub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Buyer KPI 2: Ofertas Enviadas */}
            <div
              onClick={() => setActiveTab('offers')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.mySentOffers')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <Inbox className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={mySentOffers.length} />
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.mySentOffersSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Buyer KPI 3: En Negociación */}
            <div
              onClick={() => setActiveTab('negotiations')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.inNegotiation')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <CalendarClock className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={activeNegotiationsCount} />
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.inNegotiationSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            {/* Buyer KPI 4: Compras Aprobadas */}
            <div
              onClick={() => setActiveTab('negotiations')}
              className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.approvedPurchases')}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={acceptedOffersCount} />
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-between">
                  <span>{t('dashboard.approvedPurchasesSub')}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* 3. Interactive Category & Urgency Visualizer */}
      {categoryStats.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {isSeller
                    ? 'Distribución de tus Lotes Publicados'
                    : 'Disponibilidad de Alimentos por Categoría'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explora las categorías con mayor oferta activa en la red de FoodLink Solidario.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Ver en catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((item, idx) => {
              const colorPalette = [
                'bg-emerald-500',
                'bg-teal-500',
                'bg-amber-500',
                'bg-indigo-500',
                'bg-rose-500',
              ];
              const barColor = colorPalette[idx % colorPalette.length];

              return (
                <div
                  key={item.category}
                  className="space-y-1.5 group cursor-pointer"
                  onClick={() => setActiveTab('explore')}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                      <span>{item.category}</span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.count} lote{item.count !== 1 ? 's' : ''} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 4. Main Two-Column Grid: Offers & Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Offers & Negotiations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {isSeller
                    ? t('dashboard.recentOffersSeller')
                    : t('dashboard.recentOffersBuyer')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.recentOffersSub')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('offers')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOffers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-4">
                <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t('dashboard.noOffersTitle')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {isSeller
                    ? t('dashboard.noOffersDescSeller')
                    : t('dashboard.noOffersDescBuyer')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOfferIdForNegotiation(offer.id)}
                    className="group interactive-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 bg-white dark:bg-slate-900/60 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={offer.productImageUrl}
                        alt={offer.productName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {offer.productName}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              offer.status === 'pendiente'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : offer.status === 'aceptada'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : offer.status === 'contraoferta'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {isSeller
                            ? `${t('dashboard.buyerLabel')}: ${offer.buyerOrganization}`
                            : `${t('dashboard.sellerLabel')}: ${offer.sellerName}`}{' '}
                          •{' '}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {offer.requestedQuantity} {offer.unit}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {t('dashboard.proposedPrice')}
                        </p>
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {formatCOP(offer.totalOfferedPrice)} COP
                        </p>
                      </div>
                      <span className="btn-interaction text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">
                        {t('dashboard.openChat')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t('dashboard.recentNotifications')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-4">
                <Bell className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('dashboard.noNotifications')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('dashboard.noNotificationsSub')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => setActiveTab('notifications')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-emerald-400/80 ${
                      notif.read
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
                      {notif.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 5. Priority Rescue / Urgent Products Section */}
      {urgentProducts.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {t('dashboard.priorityLots')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.priorityLotsSub')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              {t('dashboard.fullExplorer')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentProducts.map((product) => {
              const discount = Math.round(
                ((product.originalPrice - product.requestedPrice) / product.originalPrice) * 100
              );
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProductIdForDetail(product.id);
                    setActiveTab('explore');
                  }}
                  className="group interactive-card rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center bg-white dark:bg-slate-900"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                        -{discount}% {t('dashboard.discount')}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {product.locationCity}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {product.quantity} {product.unit} • {product.condition}
                    </p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                      {formatCOP(product.requestedPrice)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        / {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
