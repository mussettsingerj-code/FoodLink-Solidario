import React, { useState } from 'react';
import {
  Package,
  Clock,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Eye,
  Inbox,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DurationDays, ProductStatus } from '../../types';
import { COMMISSION_PRICING } from '../../data/initialData';

export const MyPublicationsView: React.FC = () => {
  const {
    products,
    updateProductStatus,
    republishProduct,
    setActiveTab,
    setSelectedProduct,
    formatCOP,
    commissions,
    userProfile,
    isAuthenticated,
    t,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [renewModalProductId, setRenewModalProductId] = useState<string | null>(null);
  const [renewDays, setRenewDays] = useState<DurationDays>(3);

  // Security guard: Only authenticated sellers can view/manage publications (Requirement 9)
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return null;
  }

  // Strictly show only the authenticated seller's own publications (Requirement 8)
  const myProducts = products.filter((p) => p.sellerId === userProfile.id);

  const filteredProducts = myProducts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {t('myPublications.active')}
          </span>
        );
      case 'proxima_a_finalizar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> {t('myPublications.expiringSoon')}
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            {t('myPublications.finished')}
          </span>
        );
      case 'pausada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
            {t('myPublications.paused')}
          </span>
        );
      case 'vendida':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3" /> {t('myPublications.sold')}
          </span>
        );
    }
  };

  const handleConfirmRenew = () => {
    if (!renewModalProductId) return;
    republishProduct(renewModalProductId, renewDays);
    setRenewModalProductId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('myPublications.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('myPublications.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('publish')}
          className="flex items-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('myPublications.publishNew')}</span>
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: t('myPublications.all') },
          { id: 'activa', label: t('myPublications.active') },
          { id: 'proxima_a_finalizar', label: t('myPublications.expiringSoon') },
          { id: 'finalizada', label: t('myPublications.finished') },
          { id: 'pausada', label: t('myPublications.paused') },
          { id: 'vendida', label: t('myPublications.sold') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('myPublications.noProductsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 max-w-md mx-auto">
              {t('myPublications.noProductsDesc')}
            </p>
            <button
              onClick={() => setActiveTab('publish')}
              className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('myPublications.publishFirst')}</span>
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full sm:w-24 h-36 sm:h-24 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-700"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(product.status)}
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-xs text-slate-400">• {product.condition}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {product.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <span>
                      {t('catalog.available')}:{' '}
                      <strong>
                        {product.quantity} {product.unit}
                      </strong>
                    </span>
                    <span>
                      {t('product.requestedPrice')}:{' '}
                      <strong className="text-emerald-800 dark:text-emerald-400">
                        {formatCOP(product.requestedPrice)}/{product.unit}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('product.expiration')}:{' '}
                      {product.expirationDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      {product.durationDays} {t('product.remainingDays')} ({formatCOP(product.commissionPaid)})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Inbox className="w-3.5 h-3.5 text-blue-600" />
                      <strong>{product.offersCount}</strong> {t('myPublications.offers')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {product.viewsCount} {t('myPublications.views')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('catalog.viewDetail')}
                </button>

                {(product.status === 'activa' || product.status === 'proxima_a_finalizar') && (
                  <>
                    <button
                      onClick={() => updateProductStatus(product.id, 'pausada')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" /> {t('myPublications.pause')}
                    </button>
                    <button
                      onClick={() => updateProductStatus(product.id, 'vendida')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('myPublications.markSold')}
                    </button>
                  </>
                )}

                {product.status === 'pausada' && (
                  <button
                    onClick={() => updateProductStatus(product.id, 'activa')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> {t('myPublications.reactivate')}
                  </button>
                )}

                {(product.status === 'finalizada' ||
                  product.status === 'proxima_a_finalizar') && (
                  <button
                    onClick={() => setRenewModalProductId(product.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-emerald-900 shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> {t('myPublications.renew')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Commission Billing History Table */}
      {commissions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Historial de Comisiones por Tiempo de Exposición
              </h3>
              <p className="text-xs text-slate-500">
                Registro de pagos realizados por publicación y renovación de lotes
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                  <th className="py-3 px-3">Referencia</th>
                  <th className="py-3 px-3">Lote / Producto</th>
                  <th className="py-3 px-3">Duración</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Método</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Comisión Pagada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {commissions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-500">
                      {rec.transactionRef}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {rec.productName}
                    </td>
                    <td className="py-3 px-3">{rec.durationDays} días</td>
                    <td className="py-3 px-3">{rec.date}</td>
                    <td className="py-3 px-3">{rec.paymentMethod}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Activa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Renovada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-800 dark:text-emerald-400">
                      {formatCOP(rec.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewModalProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t('myPublications.renewTitle')}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {t('myPublications.renewTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('myPublications.renewDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {([1, 2, 3, 5, 7, 14] as DurationDays[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRenewDays(d)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    renewDays === d
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-950 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-bold">{d} {t('product.remainingDays')}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    {formatCOP(COMMISSION_PRICING[d])}
                  </p>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {t('myPublications.durationDays')} ({renewDays})
              </span>
              <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-400">
                {formatCOP(COMMISSION_PRICING[renewDays])}
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRenewModalProductId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmRenew}
                className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
              >
                {t('myPublications.confirmRenew')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
