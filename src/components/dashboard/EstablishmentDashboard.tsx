import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { DurationDays, FoodProduct, ProductStatus } from '../../types';
import { RenewalModal } from '../publishing/RenewalModal';
import { EmptyState } from '../common/EmptyState';
import {
  Plus,
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ShoppingBag,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const EstablishmentDashboard: React.FC = () => {
  const {
    products,
    offers,
    commissionRecords,
    currentUser,
    setIsPublishModalOpen,
    changeProductStatus,
    simulateExpirationForProduct,
    setSelectedOfferIdForNegotiation,
    toggle2FA,
    logout,
  } = useApp();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'mis_publicaciones' | 'metricas' | 'mis_comisiones' | 'seguridad'>('mis_publicaciones');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [productToRenew, setProductToRenew] = useState<FoodProduct | null>(null);

  const userId = currentUser?.id || '';
  const isAdmin = false;

  // Filter products for this establishment
  const myProducts = products.filter(
    (p) => p.sellerId === userId || isAdmin
  );

  const filteredProducts = myProducts.filter((p) => {
    if (statusFilter === 'todas') return true;
    return p.status === statusFilter;
  });

  // Calculate Metrics based strictly on real state data
  const activeCount = myProducts.filter((p) => p.status === 'activa' || p.status === 'proxima_a_finalizar').length;
  const finishedCount = myProducts.filter((p) => p.status === 'finalizada').length;
  const soldCount = myProducts.filter((p) => p.status === 'vendida').length;
  const offersReceived = offers.filter((o) => o.sellerId === userId).length;
  const offersAccepted = offers.filter((o) => o.sellerId === userId && o.status === 'aceptada').length;
  
  // Total money recovered estimate (strictly calculated from accepted offers)
  const moneyRecovered = offers
    .filter((o) => o.sellerId === userId && o.status === 'aceptada')
    .reduce((acc, o) => acc + o.totalOfferedPrice, 0);

  // Total spent in commissions
  const totalCommissions = commissionRecords.reduce((acc, c) => acc + c.commission, 0);

  // Food rescued estimate (kg)
  const kgRescued = myProducts.reduce((acc, p) => acc + (p.unit === 'kg' ? p.quantity : p.quantity * 5), 0);

  const successRate = myProducts.length > 0 ? Math.min(100, Math.round(((soldCount + offersAccepted) / myProducts.length) * 100)) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar */}
      <div className="bg-emerald-900 border border-emerald-800/50 rounded-2xl p-6 sm:p-7 text-emerald-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-300 text-xs font-semibold border border-emerald-700/50">
            <span>🏢 {t('nav.establishmentDashboard')}</span>
            <span>•</span>
            <span className="text-white font-medium">{currentUser?.organizationName || 'Establecimiento'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('dashboard.establishmentTitle', 'Gestión de Alimentos y Publicaciones')}
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('dashboard.establishmentSubtitle', 'Monitorea el ciclo de vida de tus lotes, optimiza duraciones según perecibilidad, revisa comisiones y negocia con fundaciones solidarias.')}
          </p>
        </div>

        <button
          type="button"
          id="btn-open-publish-from-dashboard"
          onClick={() => setIsPublishModalOpen(true)}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('landing.publishFoodBtn', 'Publicar Alimento')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.activeListings', 'Publicaciones Activas')}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{activeCount}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.inPublicCatalog', 'En catálogo público')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.offersReceived', 'Ofertas Recibidas')}
          </span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">{offersReceived}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{offersAccepted} {t('negotiation.acceptedStatus')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.moneyRecovered', 'Dinero Recuperado')}
          </span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block truncate">
            ${moneyRecovered.toLocaleString('es-CO')}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">COP {t('catalog.rescuePrices')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.totalCommissions', 'Total Comisiones')}
          </span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            ${totalCommissions.toLocaleString('es-CO')}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('dashboard.platformInvestment', 'Inversión en plataforma')}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('dashboard.successRate', 'Tasa de Éxito')}
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{successRate}%</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{kgRescued.toLocaleString()} kg</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mis_publicaciones')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'mis_publicaciones'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('dashboard.myListingsTab', 'Mis Publicaciones')} ({myProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metricas')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'metricas'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('dashboard.chartsTab', 'Gráficas y Rendimiento')}</span>
        </button>

        <button
          onClick={() => setActiveTab('mis_comisiones')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'mis_comisiones'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t('dashboard.commissionsTab', 'Mis Comisiones')}</span>
        </button>

        <button
          onClick={() => setActiveTab('seguridad')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'seguridad'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{t('dashboard.securityTab', 'Seguridad & Acceso (2FA)')}</span>
        </button>
      </div>

      {/* TAB 1: MIS PUBLICACIONES */}
      {activeTab === 'mis_publicaciones' && (
        <div className="space-y-4">
          
          {/* Status Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-850 p-2 rounded-xl border border-slate-200/80 dark:border-slate-750">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              {[
                { key: 'todas', label: t('catalog.urgencyAll') },
                { key: 'activa', label: '🟢 ' + t('dashboard.active') },
                { key: 'proxima_a_finalizar', label: '🟡 ' + t('dashboard.endingSoon', 'Próximas a finalizar') },
                { key: 'finalizada', label: '🔴 ' + t('product.finished') },
                { key: 'pausada', label: '⚪ ' + t('dashboard.paused', 'Pausadas') },
                { key: 'vendida', label: '🔵 ' + t('dashboard.sold', 'Vendidas') },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === filter.key
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-600'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-400 pr-2">
              {filteredProducts.length} {t('dashboard.listingsCount', 'publicación(es)')}
            </div>
          </div>

          {/* Publications List */}
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="0 ventas en este periodo"
              description="No hay transacciones registradas aún. Publica tu primer lote de alimentos para conectar con fundaciones solidarias y evitar el desperdicio."
              actionLabel={t('landing.publishFoodBtn', 'Publicar Alimento')}
              onAction={() => setIsPublishModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => {
                const now = Date.now();
                const expires = new Date(prod.expiresAt).getTime();
                const diffHours = Math.max(0, Math.round((expires - now) / (1000 * 3600)));
                const diffDays = Math.floor(diffHours / 24);
                const remainingHoursInDay = diffHours % 24;

                const isNearExpiring = diffHours > 0 && diffHours <= 24;
                const isFinished = diffHours <= 0 || prod.status === 'finalizada';

                return (
                  <div
                    key={prod.id}
                    id={`my-pub-${prod.id}`}
                    className={`p-5 bg-white dark:bg-slate-900 rounded-xl border ${
                      isNearExpiring
                        ? 'border-l-4 border-l-amber-400 border-slate-200 dark:border-slate-800'
                        : 'border-slate-200 dark:border-slate-800'
                    } shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4`}
                  >
                    <div className="flex gap-4 items-start">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {prod.category}
                          </span>
                          
                          {/* Status badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              prod.status === 'activa'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : prod.status === 'proxima_a_finalizar'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : prod.status === 'finalizada'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : prod.status === 'vendida'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {prod.status === 'activa' && '🟢 ' + t('dashboard.active')}
                            {prod.status === 'proxima_a_finalizar' && '🟡 ' + t('dashboard.endingSoon', 'Próxima a finalizar')}
                            {prod.status === 'finalizada' && '🔴 ' + t('product.finished')}
                            {prod.status === 'vendida' && '🔵 ' + t('dashboard.sold', 'Vendida')}
                            {prod.status === 'pausada' && '⚪ ' + t('dashboard.paused', 'Pausada')}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 truncate">{prod.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('publish.quantityLabel')}: <strong className="text-slate-800 dark:text-slate-200">{prod.quantity} {prod.unit}</strong> • {t('offer.suggestedPrice')}: <strong className="text-emerald-700 dark:text-emerald-400">${prod.requestedPrice.toLocaleString('es-CO')}</strong>
                        </p>

                        {/* Cuenta regresiva requerida */}
                        <div className="mt-2 text-xs">
                          {isFinished ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              🔴 {t('product.finished')}
                            </span>
                          ) : isNearExpiring ? (
                            <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              ⏱ {diffHours}h {t('product.remainingTime')}
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {diffDays}d, {remainingHoursInDay}h {t('product.remainingTime')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span>{t('renewal.currentDuration')}: <strong>{prod.durationDays}d</strong></span>
                        <span>•</span>
                        <span>{t('renewal.paidFee')}: <strong>${prod.commissionPaid.toLocaleString('es-CO')}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{prod.offersCount} {t('dashboard.offersReceived')}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Extender / Renovar Publicación */}
                        <button
                          type="button"
                          id={`btn-renew-${prod.id}`}
                          onClick={() => setProductToRenew(prod)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{t('renewal.modalTitle')}</span>
                        </button>

                        {/* Simular Expiración */}
                        {!isFinished && (
                          <button
                            type="button"
                            title="Simular término de tiempo contratado para probar renovación"
                            onClick={() => simulateExpirationForProduct(prod.id)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Simular fin
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MÉTRICAS Y GRÁFICAS */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          {myProducts.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <EmptyState
                icon={BarChart3}
                title="0 ventas en este periodo"
                description="No hay transacciones registradas aún. A medida que publiques lotes de alimentos y se concreten entregas con fundaciones, verás reflejado el volumen mensual y el retorno de inversión."
                actionLabel={t('landing.publishFoodBtn', 'Publicar Alimento')}
                onAction={() => setIsPublishModalOpen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfica 1: Publicaciones por Mes */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display text-base">
                    {t('dashboard.chartMonthlyTitle', 'Publicaciones Activas vs Completadas por Mes')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dashboard.chartMonthlySubtitle', 'Rendimiento mensual del establecimiento')}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  Año 2026
                </span>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {[
                  { month: 'Ene', pub: 14, sold: 12 },
                  { month: 'Feb', pub: 22, sold: 19 },
                  { month: 'Mar', pub: 28, sold: 25 },
                  { month: 'Abr', pub: 35, sold: 31 },
                  { month: 'May', pub: 42, sold: 38 },
                  { month: 'Jun', pub: 38, sold: 34 },
                  { month: 'Jul', pub: 45, sold: 40 },
                  { month: 'Ago', pub: 52, sold: 47 },
                  { month: 'Sep', pub: 29, sold: 26 },
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      <div
                        style={{ height: `${(item.pub / 60) * 100}%` }}
                        className="w-3 sm:w-4 bg-slate-200 dark:bg-slate-700 rounded-t-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        title={`Publicadas: ${item.pub}`}
                      ></div>
                      <div
                        style={{ height: `${(item.sold / 60) * 100}%` }}
                        className="w-3 sm:w-4 bg-emerald-600 rounded-t-xs hover:bg-emerald-700 transition-all"
                        title={`Vendidas: ${item.sold}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-600"></div>
                  <span>{t('dashboard.totalListings', 'Publicaciones totales')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-xs bg-emerald-600"></div>
                  <span>{t('dashboard.rescuedLots', 'Lotes rescatados / vendidos')}</span>
                </div>
              </div>
            </div>

            {/* Gráfica 2: ROI & Progress */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display text-base">
                    {t('dashboard.roiTitle', 'Retorno de Inversión (Comisiones vs Recuperado)')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dashboard.roiSubtitle', 'Por cada $1.000 COP en comisión recuperas ~$65.000 COP')}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ROI: 65x
                </span>
              </div>

              {/* Progress and metrics */}
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t('dashboard.perishablesRescuedOnTime', 'Alimentos perecederos rescatados a tiempo')}:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">92%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t('dashboard.commissionBudgetUsage', 'Comisiones pagadas vs límite mensual presupuestado')}:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">34% ($34.000 / $100.000 COP)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[34%]"></div>
                  </div>
                </div>

                {/* Impact Highlight Card */}
                <div className="p-5 bg-emerald-600 rounded-2xl text-white relative overflow-hidden shadow-xs">
                  <div className="relative z-10">
                    <h4 className="font-bold text-base mb-1 italic">{t('dashboard.lessWaste', 'Menos desperdicio')}</h4>
                    <p className="text-emerald-100 text-xs leading-relaxed opacity-95">
                      {t('dashboard.wasteSavedDesc', 'Gracias a las publicaciones de tu establecimiento, este mes se rescataron')} <strong>{kgRescued} kg</strong> {t('dashboard.co2AvoidedDesc', 'evitando')} <strong>1.84 {t('dashboard.tonsCO2', 'toneladas de CO₂e')}</strong>.
                    </p>
                    <div className="mt-3 pt-3 border-t border-emerald-500/50 flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-white"></div>
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-200"></div>
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-400"></div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-100">+3 {t('dashboard.partnerFoundations', 'Fundaciones aliadas beneficiadas')}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full pointer-events-none"></div>
                </div>
              </div>
            </div>

          </div>
          )}
        </div>
      )}

      {/* TAB 3: ESTADÍSTICAS DE COMISIONES */}
      {activeTab === 'mis_comisiones' && (
        <div className="space-y-6">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('dashboard.totalPaid', 'Total Pagado')}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                ${totalCommissions.toLocaleString('es-CO')} COP
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('dashboard.paidListings', 'Publicaciones Pagadas')}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                {commissionRecords.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('dashboard.averageListing', 'Promedio / Publicación')}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                ${Math.round(totalCommissions / (commissionRecords.length || 1)).toLocaleString('es-CO')} COP
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('dashboard.monthCommission', 'Comisión del Mes')}
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                ${commissionRecords.slice(0, 3).reduce((acc, c) => acc + c.commission, 0).toLocaleString('es-CO')} COP
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('dashboard.historicalCommission', 'Comisión Histórica')}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                ${totalCommissions.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Tabla de Comisiones */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base font-display">
                  {t('dashboard.commissionHistoryTitle', 'Historial de Pagos de Comisiones')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.commissionHistorySubtitle', 'Transacciones y facturación por vigencia contratada')}
                </p>
              </div>
            </div>

            {commissionRecords.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No hay transacciones registradas aún"
                description="0 ventas en este periodo. Las comisiones pagadas por la activación o renovación de publicaciones se registrarán aquí con sus respectivos soportes."
                actionLabel={t('landing.publishFoodBtn', 'Publicar Alimento')}
                onAction={() => setIsPublishModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">{t('publish.nameLabel')}</th>
                      <th className="py-3.5 px-4">{t('publish.durationLabel')}</th>
                      <th className="py-3.5 px-4">{t('renewal.paidFee')}</th>
                      <th className="py-3.5 px-4">{t('offer.proposedDate')}</th>
                      <th className="py-3.5 px-4">{t('offer.pickupMethod')}</th>
                      <th className="py-3.5 px-4">{t('product.condition')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {commissionRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{rec.productName}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{rec.durationDays} {t('landing.daysUnit', 'días')}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                          ${rec.commission.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{rec.date}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{rec.paymentMethod}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              rec.status === 'Activa'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : rec.status === 'Renovada'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: SEGURIDAD Y ACCESO */}
      {activeTab === 'seguridad' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                      {t('dashboard.securityTitle', 'Control de Acceso y Verificación en Dos Pasos (2FA)')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('dashboard.securitySubtitle', 'Protección de cuenta empresarial, sesiones HttpOnly y tokens CSRF activos.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    currentUser?.twoFactorEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentUser?.twoFactorEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>2FA: {currentUser?.twoFactorEnabled ? t('dashboard.activated', 'Activado') : t('dashboard.inactive', 'Inactivo')}</span>
                </span>
              </div>
            </div>

            {/* 2FA Toggle & Action Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                      {t('dashboard.twoFactorLabel', 'Autenticación de Dos Factores (MFA)')}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('dashboard.twoFactorDesc', 'Requiere un código de 6 dígitos generado o enviado a tu correo/aplicación en cada inicio de sesión.')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {t('product.condition')}: {currentUser?.twoFactorEnabled ? t('dashboard.enabledOTP', 'Habilitado con código OTP') : t('dashboard.disabled', 'Deshabilitado')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle2FA(!currentUser?.twoFactorEnabled)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      currentUser?.twoFactorEnabled
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {currentUser?.twoFactorEnabled ? t('dashboard.disable2FA', 'Desactivar 2FA') : t('dashboard.enable2FA', 'Activar 2FA Ahora')}
                  </button>
                </div>
              </div>

              {/* Protocol Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 space-y-2.5 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block mb-1">
                  {t('dashboard.serverSecurityParams', 'Parámetros de Seguridad del Servidor')}
                </span>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('dashboard.sessionStorageLabel', 'Almacenamiento de Sesión')}:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    HttpOnly, Secure, SameSite=Strict
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('dashboard.csrfProtectionLabel', 'Protección CSRF')}:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Header X-CSRF-Token validado
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('dashboard.idProviderLabel', 'Proveedor de Identidad')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {currentUser?.authProvider || 'Email & Password Local'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>{t('dashboard.tokenExpirationLabel', 'Caducidad de tokens')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    OTP 15 min / Sesión 24h
                  </span>
                </div>
              </div>
            </div>

            {/* Close Session Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('dashboard.logoutHint', 'Al cerrar sesión se destruyen las credenciales locales y la cookie HTTP de sesión.')}
              </span>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                {t('auth.logoutConfirmBtn', 'Cerrar Sesión')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      <RenewalModal
        product={productToRenew}
        onClose={() => setProductToRenew(null)}
      />

    </div>
  );
};
