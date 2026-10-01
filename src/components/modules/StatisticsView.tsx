import React from 'react';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  PackageCheck,
  Award,
  BarChart3,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatisticsView: React.FC = () => {
  const {
    products,
    offers,
    commissions,
    formatCOP,
    userProfile,
    isAuthenticated,
    setActiveTab,
  } = useApp();

  // Security guard: Exclusively for authenticated sellers (Requirement 3 & 9)
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return null;
  }

  // Strictly calculate real metrics from the authenticated seller's own data (Requirement 8)
  const myProducts = products.filter((p) => p.sellerId === userProfile.id);
  const myOffers = offers.filter((o) => o.sellerId === userProfile.id);
  const myAcceptedOffers = myOffers.filter((o) => o.status === 'aceptada');

  const totalPublished = myProducts.length;
  const completedSales =
    myProducts.filter((p) => p.status === 'vendida').length + myAcceptedOffers.length;
  const totalRevenue = myAcceptedOffers.reduce((acc, o) => acc + o.totalOfferedPrice, 0);
  const totalCommissionsPaid = commissions.reduce((acc, c) => acc + c.commission, 0);
  const totalKgRescued = myAcceptedOffers.reduce((acc, o) => acc + o.requestedQuantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Analítica de Vendedor
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Estadísticas Comerciales y de Impacto Ambiental
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitorea tus lotes publicados, ingresos recuperados y alimentos rescatados.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Certificado Ley 1990 Activo</span>
        </div>
      </div>

      {/* Top 4 KPI Cards (100% Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Alimentos Rescatados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalKgRescued.toLocaleString('es-CO')}{' '}
            <span className="text-base font-semibold text-slate-500">unid/kg</span>
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            Basado en tus operaciones aceptadas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Valor Recuperado</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCOP(totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Ingresos por lotes comercializados</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Lotes Publicados</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalPublished}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            {completedSales} operaciones cerradas con éxito
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400">Inversión en Tarifas</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCOP(totalCommissionsPaid)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Comisiones por tiempo de exposición</p>
        </div>
      </div>

      {/* Empty State or Real Breakdown */}
      {totalPublished === 0 && myOffers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Aún no hay datos estadísticos registrados en tu cuenta
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-md mx-auto">
            Tus métricas comerciales y de impacto ambiental se calcularán en tiempo real a medida
            que publiques lotes de alimentos y cierres negociaciones.
          </p>
          <button
            onClick={() => setActiveTab('publish')}
            className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar mi primer lote</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
            Desglose de Tus Lotes Publicados
          </h3>
          <div className="space-y-3">
            {myProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{prod.name}</p>
                  <p className="text-xs text-slate-500">
                    {prod.category} • {prod.quantity} {prod.unit} • Estado: {prod.status}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Valor solicitado</p>
                  <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formatCOP(prod.requestedPrice * prod.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
