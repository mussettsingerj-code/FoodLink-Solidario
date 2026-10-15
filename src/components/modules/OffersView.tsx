import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { ProductOffer } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { ProductDetailModal } from '../catalog/ProductDetailModal';
import { DeliveryCertificateModal } from '../common/DeliveryCertificateModal';
import { EmptyState } from '../common/EmptyState';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  MessageSquare,
  ShoppingBag,
  FileText,
  AlertTriangle,
  X,
  ChevronRight,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const OffersView: React.FC = () => {
  const {
    offers,
    respondToOffer,
    setCurrentView,
    setSelectedOfferIdForNegotiation,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
  } = useApp();
  const { t } = useI18n();

  const [statusFilter, setStatusFilter] = useState<
    'todas' | 'pendiente' | 'negociacion' | 'aceptada' | 'rechazada' | 'finalizada'
  >('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [offerForCertificate, setOfferForCertificate] = useState<ProductOffer | null>(null);

  // Modal confirmation for irreversible / important actions (Requirement: confirmación adicional antes de acciones irreversibles)
  const [confirmAction, setConfirmAction] = useState<{
    offerId: string;
    action: 'aceptada' | 'rechazada';
    productName: string;
  } | null>(null);

  const filteredOffers = offers.filter((offer) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        offer.productName.toLowerCase().includes(q) ||
        offer.buyerOrganization.toLowerCase().includes(q) ||
        offer.sellerName.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (statusFilter === 'pendiente') return offer.status === 'pendiente';
    if (statusFilter === 'negociacion') return offer.status === 'contraoferta';
    if (statusFilter === 'aceptada') return offer.status === 'aceptada';
    if (statusFilter === 'rechazada') return offer.status === 'rechazada';
    if (statusFilter === 'finalizada') return offer.status === 'aceptada' || offer.status === 'rechazada';

    return true;
  });

  const renderStatusLabel = (status: string) => {
    if (status === 'aceptada') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{t('offer.statusAccepted')}</span>
        </span>
      );
    }
    if (status === 'rechazada') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{t('offer.statusRejected')}</span>
        </span>
      );
    }
    if (status === 'contraoferta') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span>{t('offer.negotiationTab')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{t('offer.statusPending')}</span>
      </span>
    );
  };

  const handleExecuteConfirmedAction = () => {
    if (!confirmAction) return;
    respondToOffer(confirmAction.offerId, confirmAction.action);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-display">
            {t('offer.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t('offer.pageSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="btn-interaction px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-black rounded-2xl shadow-md shadow-emerald-950/20 inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.6]" />
          <span>{t('offer.exploreProducts')}</span>
        </button>
      </div>

      {/* Filtros por Estado y Buscador */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'todas', label: t('offer.allTab'), count: offers.length },
            { id: 'pendiente', label: t('offer.statusPending'), count: offers.filter((o) => o.status === 'pendiente').length },
            { id: 'negociacion', label: t('offer.negotiationTab'), count: offers.filter((o) => o.status === 'contraoferta').length },
            { id: 'aceptada', label: t('offer.statusAccepted'), count: offers.filter((o) => o.status === 'aceptada').length },
            { id: 'rechazada', label: t('offer.statusRejected'), count: offers.filter((o) => o.status === 'rechazada').length },
            {
              id: 'finalizada',
              label: t('offer.finishedTab'),
              count: offers.filter((o) => o.status === 'aceptada' || o.status === 'rechazada').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-emerald-950 shadow-xs font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="tabular-nums text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('offer.searchPlaceholder')}
            className="modern-input w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Ofertas o Estado Vacío */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center">
          <EmptyState
            icon={FileSpreadsheet}
            title="No se encontraron ofertas en este estado."
            description="Explora el catálogo de productos disponibles para realizar una oferta solidaria."
            actionLabel="Explorar productos"
            onAction={() => setCurrentView('catalog')}
          />
        </div>
      ) : (
        <>
          {/* Vista Móvil: Tarjetas de Oferta adaptadas */}
          <div className="md:hidden space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="interactive-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedProductIdForDetail(offer.productId)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                      <ProductImage src={offer.productImageUrl} alt={offer.productName} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {offer.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {offer.buyerOrganization} ↔ {offer.sellerName}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">{renderStatusLabel(offer.status)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cantidad</span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {offer.requestedQuantity} {offer.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="font-black tabular-nums text-emerald-700 dark:text-emerald-400">
                      ${offer.totalOfferedPrice.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Retiro</span>
                    <span className="tabular-nums text-slate-700 dark:text-slate-300">
                      {offer.proposedDate}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2 text-xs">
                  {offer.status === 'aceptada' && (
                    <button
                      type="button"
                      onClick={() => setOfferForCertificate(offer)}
                      className="btn-interaction px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('offer.btnDownloadAct')}</span>
                    </button>
                  )}
                  {offer.status !== 'aceptada' && offer.status !== 'rechazada' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({
                            offerId: offer.id,
                            action: 'aceptada',
                            productName: offer.productName,
                          })
                        }
                        className="btn-interaction px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-xs"
                      >
                        {t('offer.btnAccept')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({
                            offerId: offer.id,
                            action: 'rechazada',
                            productName: offer.productName,
                          })
                        }
                        className="btn-interaction px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
                      >
                        {t('offer.btnReject')}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfferIdForNegotiation(offer.id);
                      setCurrentView('negotiations');
                    }}
                    className="btn-interaction px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('offer.btnNegotiate')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio / Tablet: Tabla Moderna */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 px-5">{t('offer.colProduct')}</th>
                    <th className="py-4 px-5">{t('offer.colBuyerOrg')}</th>
                    <th className="py-4 px-5 text-right">{t('offer.colQuantity')}</th>
                    <th className="py-4 px-5 text-right">{t('offer.colTotal')}</th>
                    <th className="py-4 px-5">{t('offer.colDate')}</th>
                    <th className="py-4 px-5">{t('offer.colStatus')}</th>
                    <th className="py-4 px-5 text-right">{t('offer.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredOffers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div
                          onClick={() => setSelectedProductIdForDetail(offer.productId)}
                          className="flex items-center gap-3 min-w-[200px] cursor-pointer group"
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                            <ProductImage src={offer.productImageUrl} alt={offer.productName} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[220px] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              {offer.productName}
                            </p>
                            <p className="text-slate-400 truncate text-[11px]">
                              {offer.sellerName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                        {offer.buyerOrganization}
                      </td>

                      <td className="py-4 px-5 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {offer.requestedQuantity.toLocaleString('es-CO')} {offer.unit}
                      </td>

                      <td className="py-4 px-5 text-right font-black tabular-nums text-emerald-700 dark:text-emerald-400">
                        ${offer.totalOfferedPrice.toLocaleString('es-CO')} COP
                      </td>

                      <td className="py-4 px-5 text-slate-500 tabular-nums">
                        {offer.proposedDate}
                      </td>

                      <td className="py-4 px-5">{renderStatusLabel(offer.status)}</td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {offer.status === 'aceptada' && (
                            <button
                              type="button"
                              onClick={() => setOfferForCertificate(offer)}
                              className="btn-interaction px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t('offer.btnDownloadAct')}</span>
                            </button>
                          )}

                          {offer.status !== 'aceptada' && offer.status !== 'rechazada' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({
                                    offerId: offer.id,
                                    action: 'aceptada',
                                    productName: offer.productName,
                                  })
                                }
                                className="btn-interaction px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-xs"
                              >
                                {t('offer.btnAccept')}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({
                                    offerId: offer.id,
                                    action: 'rechazada',
                                    productName: offer.productName,
                                  })
                                }
                                className="btn-interaction px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
                              >
                                {t('offer.btnReject')}
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOfferIdForNegotiation(offer.id);
                              setCurrentView('negotiations');
                            }}
                            className="btn-interaction px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t('offer.btnNegotiate')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal for Accept/Reject */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    confirmAction.action === 'aceptada'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {confirmAction.action === 'aceptada' ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {confirmAction.action === 'aceptada'
                      ? '¿Aceptar esta oferta solidaria?'
                      : '¿Rechazar esta oferta?'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {confirmAction.productName}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {confirmAction.action === 'aceptada'
                  ? 'Al aceptar la oferta, se confirmará el acuerdo entre ambas partes y se habilitará la emisión del certificado de entrega solidaria.'
                  : 'Esta acción notificará al comprador que la propuesta no fue aceptada en los términos actuales.'}
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteConfirmedAction}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer ${
                    confirmAction.action === 'aceptada'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {confirmAction.action === 'aceptada' ? 'Confirmar Aceptación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />

      {/* Modal de Acta de Entrega */}
      {offerForCertificate && (
        <DeliveryCertificateModal
          offer={offerForCertificate}
          onClose={() => setOfferForCertificate(null)}
        />
      )}
    </div>
  );
};
