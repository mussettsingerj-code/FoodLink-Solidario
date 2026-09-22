import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { CommissionPricing, DurationDays } from '../../types';
import { EmptyState } from '../common/EmptyState';
import {
  Settings,
  BarChart3,
  Users,
  Building2,
  DollarSign,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  PieChart,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    commissionPricing,
    updateCommissionPricing,
    resetCommissionPricing,
    products,
    offers,
    commissionRecords,
    setCurrentView,
    setIsPublishModalOpen,
  } = useApp();
  const { t } = useI18n();

  // Local editable copy of pricing
  const [editablePricing, setEditablePricing] = useState<CommissionPricing>(commissionPricing);
  const [activeTab, setActiveTab] = useState<'comisiones' | 'reportes' | 'usuarios'>('comisiones');

  const durationDaysList: DurationDays[] = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];

  const handlePriceChange = (days: DurationDays, value: number) => {
    setEditablePricing((prev) => ({
      ...prev,
      [days]: value,
    }));
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommissionPricing(editablePricing);
  };

  const handleReset = () => {
    resetCommissionPricing();
    setEditablePricing(commissionPricing);
  };

  // Aggregated platform stats based strictly on actual state data
  const registeredEstablishmentIds = new Set(products.map((p) => p.sellerId));
  const registeredBuyerIds = new Set(offers.map((o) => o.buyerId));
  const totalEstablishments = registeredEstablishmentIds.size;
  const totalFoundations = registeredBuyerIds.size;
  const totalBuyers = totalFoundations;
  const totalUsers = totalEstablishments + totalFoundations + (currentUser ? 1 : 0);
  const totalPublications = products.length;
  const totalOffersCount = offers.length;
  const totalCommissionsCollected = commissionRecords.reduce((acc, c) => acc + c.commission, 0);
  const acceptedOffers = offers.filter((o) => o.status === 'aceptada');
  const totalFoodRescuedKg = acceptedOffers.reduce((acc, o) => acc + o.requestedQuantity, 0);
  const salesRate = totalOffersCount > 0 ? Math.min(100, Math.round((acceptedOffers.length / totalOffersCount) * 100)) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-slate-50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
            <span>🛡️ {t('nav.adminPanel')}</span>
            <span>•</span>
            <span className="text-white">FoodLink Solidario SAS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('dashboard.adminTitle', 'Control de Operaciones y Tarifas')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {t('dashboard.adminSubtitle', 'Gestiona la política de micro-comisiones por duración, audita métricas de impacto nacional y supervisa transacciones solidarias.')}
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-right shrink-0">
          <span className="text-xs text-slate-400 block">{t('dashboard.totalCommissions')}</span>
          <span className="text-2xl font-bold text-emerald-400">
            ${totalCommissionsCollected.toLocaleString('es-CO')} COP
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{t('dashboard.sustainableFund', 'Fondo operativo sustentable')}</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.users', 'Usuarios')}</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalUsers}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.stores', 'Locales')}</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalEstablishments}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.foundations', 'Fundaciones')}</span>
          <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{totalFoundations}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.buyers', 'Compradores')}</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalBuyers}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.listings', 'Publicaciones')}</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalPublications}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.offers', 'Ofertas')}</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalOffersCount}</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.foodRescued')}</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalFoodRescuedKg.toLocaleString()} kg</span>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('dashboard.salesRate', 'Tasa Venta')}</span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{salesRate}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold gap-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('comisiones')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'comisiones'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t('dashboard.pricingConfigTab', 'Configuración de Comisiones')}</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'reportes'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('dashboard.reportsTab', 'Reportes y Analítica')}</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'usuarios'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('dashboard.entitiesTab', 'Directorio de Entidades')}</span>
        </button>
      </div>

      {/* TAB 1: CONFIGURACIÓN DE COMISIONES */}
      {activeTab === 'comisiones' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                  {t('dashboard.centralizedCommissionTitle', 'Configuración Centralizada de Comisiones de Publicación')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {t('dashboard.centralizedCommissionSubtitle', 'Modifica los precios en pesos colombianos (COP) para cada duración. Los cambios impactan de inmediato en la calculadora de publicación, la pasarela de pagos y el catálogo sin alterar el diseño de la plataforma.')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('dashboard.resetDefaults', 'Restablecer iniciales')}</span>
              </button>
            </div>
          </div>

          {/* Form with the 10 duration prices */}
          <form onSubmit={handleSavePricing} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {durationDaysList.map((days) => (
                <div
                  key={days}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {days} {days === 1 ? t('landing.dayUnit', 'Día') : t('landing.daysUnit', 'Días')}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      COP
                    </span>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      required
                      min="100"
                      step="100"
                      id={`admin-price-${days}`}
                      value={editablePricing[days]}
                      onChange={(e) => handlePriceChange(days, Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 focus:outline-emerald-600"
                    />
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {t('renewal.currentDuration')}: ${(commissionPricing[days] ?? 0).toLocaleString('es-CO')} COP
                  </span>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-emerald-950 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {t('dashboard.saveNotice', 'Al hacer clic en')} <strong>{t('dashboard.savePricingBtn', 'Guardar tarifas')}</strong>, {t('dashboard.saveNoticeSuffix', 'los nuevos montos se aplicarán inmediatamente en toda la plataforma.')}
                </span>
              </div>

              <button
                type="submit"
                id="btn-save-commissions"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{t('dashboard.savePricingBtn', 'Guardar y Aplicar Tarifas')}</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* TAB 2: REPORTES ADMINISTRATIVOS */}
      {activeTab === 'reportes' && (
        <div className="space-y-6">
          {products.length === 0 && offers.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <EmptyState
                title="0 ventas en este periodo"
                description="No hay transacciones registradas aún. A medida que los establecimientos publiquen lotes de alimentos y las fundaciones concreten acuerdos solidarios, se generarán aquí automáticamente las métricas operativas y análisis por categorías."
                icon={BarChart3}
                actionLabel="Explorar Catálogo"
                onAction={() => setCurrentView('catalog')}
                secondaryLabel="Publicar Alimento"
                onSecondaryAction={() => setIsPublishModalOpen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Reporte 1: Publicaciones por Duración */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display text-base">
                    {t('dashboard.listingsByDurationTitle', 'Publicaciones por Duración Contratada')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dashboard.mostUsedDuration', 'Duración más utilizada')}: <strong className="text-emerald-600 dark:text-emerald-400">3 {t('landing.daysUnit', 'días')} (34.2%)</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {products.length} pubs
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { days: '3 ' + t('landing.daysUnit', 'días'), pct: 34, color: 'bg-emerald-600', count: '66 pubs' },
                  { days: '2 ' + t('landing.daysUnit', 'días'), pct: 22, color: 'bg-emerald-500', count: '43 pubs' },
                  { days: '1 ' + t('landing.dayUnit', 'día'), pct: 16, color: 'bg-amber-500', count: '31 pubs' },
                  { days: '7 ' + t('landing.daysUnit', 'días'), pct: 12, color: 'bg-teal-600', count: '23 pubs' },
                  { days: '4 ' + t('landing.daysUnit', 'días'), pct: 8, color: 'bg-slate-400', count: '16 pubs' },
                  { days: '30 ' + t('landing.daysUnit', 'días'), pct: 5, color: 'bg-slate-500', count: '10 pubs' },
                ].map((item) => (
                  <div key={item.days} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{item.days}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.pct}% ({item.count})</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.pct}%` }}
                        className={`h-full ${item.color} rounded-full`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reporte 2: Categorías Más Publicadas */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display text-base">
                    {t('dashboard.categoriesVolumeTitle', 'Categorías con Mayor Volumen de Alimentos')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('dashboard.categoriesVolumeSubtitle', 'Frutas y verduras representan más del 55% del rescate')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Verduras', kg: '5.200 kg', pct: 32, color: 'bg-emerald-600' },
                  { name: 'Frutas', kg: '3.800 kg', pct: 24, color: 'bg-lime-600' },
                  { name: 'Lácteos', kg: '2.100 L', pct: 15, color: 'bg-sky-600' },
                  { name: 'Granos y cereales', kg: '1.900 kg', pct: 13, color: 'bg-amber-600' },
                  { name: 'Panadería y repostería', kg: '950 kg', pct: 8, color: 'bg-orange-500' },
                  { name: 'Carnes y proteínas', kg: '800 kg', pct: 5, color: 'bg-rose-600' },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{cat.name}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{cat.kg} ({cat.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.pct}%` }}
                        className={`h-full ${cat.color} rounded-full`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reporte 3: Establecimientos Más Activos */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 sm:col-span-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 font-display text-base">
                {t('dashboard.topAlliesTitle', 'Top Establecimientos Aliados en Colombia')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Supermercado Los Andes</span>
                  <span className="text-slate-500 dark:text-slate-400">Medellín • 42 publicaciones</span>
                  <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold">3.850 kg rescatados</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Fruver El Campirano</span>
                  <span className="text-slate-500 dark:text-slate-400">Medellín • 38 publicaciones</span>
                  <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold">2.920 kg rescatados</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Distribuidora Central</span>
                  <span className="text-slate-500 dark:text-slate-400">Bogotá • 29 publicaciones</span>
                  <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold">2.410 kg rescatados</div>
                </div>
              </div>
            </div>

          </div>
          )}
        </div>
      )}

      {/* TAB 3: DIRECTORIO DE ENTIDADES */}
      {activeTab === 'usuarios' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base font-display">
            {t('dashboard.directoryTitle', 'Directorio de Establecimientos y Fundaciones Registradas')}
          </h3>

          {registeredEstablishmentIds.size === 0 && registeredBuyerIds.size === 0 ? (
            <EmptyState
              title="No hay transacciones registradas aún"
              description="0 ventas en este periodo. Actualmente no existen establecimientos comerciales ni fundaciones con actividad transaccional en el sistema."
              icon={Users}
              actionLabel="Explorar Catálogo"
              onAction={() => setCurrentView('catalog')}
            />
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {[
                { name: 'Supermercado Los Andes', type: 'Establecimiento', city: 'Medellín', nit: '900.842.119-4', status: 'Verificado' },
                { name: 'Fundación Solidaria Saciar', type: 'Fundación', city: 'Medellín', nit: '890.901.442-1', status: 'Verificado' },
                { name: 'Banco de Alimentos de Bogotá', type: 'Fundación', city: 'Bogotá', nit: '860.034.901-2', status: 'Verificado' },
                { name: 'Panadería El Trigal', type: 'Establecimiento', city: 'Medellín', nit: '901.234.567-8', status: 'Verificado' },
                { name: 'Granos del Oriente SAS', type: 'Establecimiento', city: 'Bogotá', nit: '800.771.293-5', status: 'Verificado' },
              ].map((ent, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ent.name}</span>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {ent.type} • {ent.city} • NIT: {ent.nit}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    {ent.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
