import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { ProductCard } from '../catalog/ProductCard';
import { EmptyState } from '../common/EmptyState';
import {
  Heart,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const {
    currentUser,
    offers,
    products,
    favorites,
    setCurrentView,
    setSelectedProductIdForDetail,
    setSelectedOfferIdForNegotiation,
  } = useApp();
  const { t } = useI18n();

  const userId = currentUser?.id || '';
  const isAdmin = false;

  // Filter offers made by this foundation / buyer
  const myOffers = offers.filter(
    (o) => o.buyerId === userId || isAdmin
  );

  // Filter favorite products
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // Impact metrics for foundation (strictly based on actual accepted offers)
  const totalKgRescued = myOffers
    .filter((o) => o.status === 'aceptada')
    .reduce((acc, o) => acc + o.requestedQuantity, 0);

  const totalBeneficiaries = totalKgRescued * 4; // roughly 4 rations per kg

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-emerald-900 border border-emerald-800/50 rounded-2xl p-6 sm:p-7 text-emerald-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-300 text-xs font-semibold border border-emerald-700/50">
            <span>🤝 {t('nav.buyerDashboard')}</span>
            <span>•</span>
            <span className="text-white font-medium">{currentUser?.organizationName || 'Fundación Solidaria'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('dashboard.buyerTitle', 'Gestión de Rescate y Ofertas Solidarias')}
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('dashboard.buyerSubtitle', 'Adquiere excedentes alimentarios de calidad a precios de rescate sin comisiones de publicación. Cada kilogramo adquirido alimenta a quienes más lo necesitan.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('landing.exploreBtn', 'Explorar Catálogo')}</span>
        </button>
      </div>

      {/* Impact Counters for Foundation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.offersSent', 'Ofertas Enviadas')}
          </span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">{myOffers.length}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.activeProposals', 'Propuestas de adquisición')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.offersAccepted', 'Ofertas Concretadas')}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {myOffers.filter((o) => o.status === 'aceptada').length}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{t('dashboard.confirmedRescues', 'Rescates confirmados')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.foodRescued', 'Alimento Rescatado')}
          </span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {totalKgRescued.toLocaleString()} kg
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.nutritionGuaranteed', 'Nutrición garantizada')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.estimatedRations', 'Raciones Estimadas')}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {totalBeneficiaries.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.communityImpact', 'Impacto en comedores')}</span>
        </div>
      </div>

      {/* Active Negotiations & Offers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              {t('dashboard.activeNegotiationsTitle', 'Mis Ofertas y Negociaciones en Curso')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.activeNegotiationsSubtitle', 'Chatea directamente con supermercados y tiendas para acordar precios y recogida')}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
            {myOffers.length} {t('dashboard.active', 'activas')}
          </span>
        </div>

        {myOffers.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No hay transacciones registradas aún"
            description="0 adquisiciones en este periodo. Explora el catálogo de alimentos y envía propuestas a precio de rescate para abastecer tu fundación sin pagar comisiones de publicación."
            actionLabel={t('landing.exploreBtn', 'Explorar Catálogo')}
            onAction={() => setCurrentView('catalog')}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myOffers.map((off) => (
              <div
                key={off.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={off.productImageUrl}
                    alt={off.productName}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{off.productName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('offer.seller')}: <strong className="text-slate-700 dark:text-slate-300">{off.sellerName}</strong> • {off.requestedQuantity} {off.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {t('offer.totalCalculated')}: ${off.totalOfferedPrice.toLocaleString('es-CO')} COP
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">(${off.offeredPricePerUnit.toLocaleString('es-CO')} c/u)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      off.status === 'aceptada'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : off.status === 'contraoferta'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        : off.status === 'rechazada'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {off.status === 'aceptada' && `✅ ${t('negotiation.acceptedStatus')}`}
                    {off.status === 'contraoferta' && `🔄 ${t('negotiation.counterofferStatus')}`}
                    {off.status === 'pendiente' && `⏳ ${t('negotiation.pendingStatus')}`}
                    {off.status === 'rechazada' && `❌ ${t('negotiation.rejectedStatus')}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedOfferIdForNegotiation(off.id)}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-slate-700/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('negotiation.chatAction')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Favorites */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              {t('product.favoritesTitle', 'Alimentos Guardados en Favoritos')}
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {favoriteProducts.length} {t('product.productsCount', 'producto(s)')}
          </span>
        </div>

        {favoriteProducts.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t('emptyState.noFavorites', 'Sin alimentos en favoritos')}
            description={t('emptyState.noFavoritesDesc', 'Guarda alimentos de tu interés con el icono de corazón para hacerles seguimiento.')}
            actionLabel={t('landing.exploreBtn', 'Explorar Catálogo')}
            onAction={() => setCurrentView('catalog')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => setSelectedProductIdForDetail(prod.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
