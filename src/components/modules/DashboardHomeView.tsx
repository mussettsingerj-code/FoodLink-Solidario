import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardHomeView: React.FC = () => {
  const {
    userProfile,
    products,
    offers,
    notifications,
    setActiveTab,
    setSelectedProduct,
    setActiveNegotiationOffer,
    formatCOP,
    t,
  } = useApp();

  const isSeller = userProfile.role === 'seller';

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
  const availableCatalogProducts = products.filter((p) => {
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
  const mySentOffers = offers.filter((o) => o.buyerId === userProfile.id);
  const acceptedOffersCount = mySentOffers.filter((o) => o.status === 'aceptada').length;
  const activeNegotiationsCount = mySentOffers.filter(
    (o) => o.status === 'pendiente' || o.status === 'contraoferta'
  ).length;

  const urgentProducts = availableCatalogProducts.slice(0, 3);
  const recentOffers = offers.slice(0, 3);
  const recentNotifications = notifications.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F291E] via-[#1B4332] to-emerald-900 text-white p-6 sm:p-8 overflow-hidden shadow-lg">
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              {isSeller ? (
                <>
                  <Store className="w-3.5 h-3.5" />
                  <span>{t('dashboard.sellerPanel')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t('dashboard.buyerPanel')}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {t('dashboard.greeting')}, {userProfile.organizationName || userProfile.name}
            </h2>
            <p className="text-emerald-100/85 text-sm sm:text-base leading-relaxed">
              {isSeller
                ? t('dashboard.sellerIntro')
                : t('dashboard.buyerIntro')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isSeller ? (
              <>
                <button
                  onClick={() => setActiveTab('publish')}
                  className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('dashboard.publishNew')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-publications')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>{t('dashboard.myLots')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('dashboard.exploreCatalog')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('negotiations')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
                >
                  <Inbox className="w-4 h-4" />
                  <span>{t('dashboard.myNegotiations')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards (Strictly separated by role, showing real counts starting at 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSeller ? (
          <>
            <div
              onClick={() => setActiveTab('my-publications')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.activePublications')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeProductsCount}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                {t('dashboard.activePublicationsSub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('my-publications')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.expiringSoon')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {expiringSoonCount}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                {t('dashboard.expiringSoonSub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('offers')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.pendingOffers')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {receivedPendingOffers.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">
                {t('dashboard.pendingOffersSub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('statistics')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.agreedDeliveries')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {completedSalesCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {t('dashboard.agreedDeliveriesSub')}
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              onClick={() => setActiveTab('explore')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.lotsAvailableToday')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {availableCatalogProducts.length}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                {t('dashboard.lotsAvailableTodaySub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('offers')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.mySentOffers')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {mySentOffers.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">
                {t('dashboard.mySentOffersSub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('negotiations')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.inNegotiation')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeNegotiationsCount}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                {t('dashboard.inNegotiationSub')}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('negotiations')}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.approvedPurchases')}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {acceptedOffersCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {t('dashboard.approvedPurchasesSub')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Offers & Negotiations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isSeller
                    ? t('dashboard.recentOffersSeller')
                    : t('dashboard.recentOffersBuyer')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.recentOffersSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('offers')}
                className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOffers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-4">
                <Inbox className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
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
                    onClick={() => setActiveNegotiationOffer(offer)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={offer.productImageUrl}
                        alt={offer.productName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {offer.productName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">{t('dashboard.proposedPrice')}</p>
                        <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400">
                          {formatCOP(offer.totalOfferedPrice)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1.5 rounded-lg">
                        {t('dashboard.openChat')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real Activity & Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('dashboard.recentNotifications')}
              </h3>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-600 cursor-pointer"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-4">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
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
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      notif.read
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                        : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60'
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
      </div>

      {/* Priority Rescue Section */}
      {urgentProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('dashboard.priorityLots')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.priorityLotsSub')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
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
                  onClick={() => setSelectedProduct(product)}
                  className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        -{discount}% {t('dashboard.discount')}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {product.locationCity}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.quantity} {product.unit} • {product.condition}
                    </p>
                    <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 mt-1">
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
        </div>
      )}
    </div>
  );
};
