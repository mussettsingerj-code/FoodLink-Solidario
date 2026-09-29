import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

export const OffersView: React.FC = () => {
  const {
    offers,
    respondToOffer,
    setCurrentView,
    setSelectedOfferIdForNegotiation,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    loadDemoData,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<
    'todas' | 'pendiente' | 'negociacion' | 'aceptada' | 'rechazada' | 'finalizada'
  >('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [offerForCertificate, setOfferForCertificate] = useState<ProductOffer | null>(null);

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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Aceptada</span>
        </span>
      );
    }
    if (status === 'rechazada') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Rechazada</span>
        </span>
      );
    }
    if (status === 'contraoferta') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span>En negociación</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Pendiente</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Ofertas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seguimiento centralizado de ofertas recibidas y enviadas por lotes de alimentos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explorar productos</span>
        </button>
      </div>

      {/* Filtros por Estado y Buscador */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'Todas', count: offers.length },
            { id: 'pendiente', label: 'Pendiente', count: offers.filter((o) => o.status === 'pendiente').length },
            { id: 'negociacion', label: 'En negociación', count: offers.filter((o) => o.status === 'contraoferta').length },
            { id: 'aceptada', label: 'Aceptada', count: offers.filter((o) => o.status === 'aceptada').length },
            { id: 'rechazada', label: 'Rechazada', count: offers.filter((o) => o.status === 'rechazada').length },
            {
              id: 'finalizada',
              label: 'Finalizada',
              count: offers.filter((o) => o.status === 'aceptada' || o.status === 'rechazada').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por producto u organización..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Tabla de Ofertas o Estado Vacío */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={FileSpreadsheet}
            title="No se encontraron ofertas en este estado."
            description="Explora el catálogo de productos disponibles para realizar una oferta solidaria o carga datos de demostración."
            actionLabel="Explorar productos"
            onAction={() => setCurrentView('catalog')}
            secondaryLabel={offers.length === 0 ? 'Cargar ofertas de ejemplo' : undefined}
            onSecondaryAction={offers.length === 0 ? loadDemoData : undefined}
          />
        </div>
      ) : (
        <>
          {/* Vista Móvil: Tarjetas de Oferta sin scroll horizontal */}
          <div className="md:hidden space-y-3">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedProductIdForDetail(offer.productId)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                      <ProductImage src={offer.productImageUrl} alt={offer.productName} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600">
                        {offer.productName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {offer.buyerOrganization}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">{renderStatusLabel(offer.status)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cantidad</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {offer.requestedQuantity} {offer.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Valor total</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                      ${offer.totalOfferedPrice.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Fecha retiro</span>
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {offer.proposedDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2 text-xs">
                  {offer.status === 'aceptada' && (
                    <button
                      type="button"
                      onClick={() => setOfferForCertificate(offer)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generar acta de entrega</span>
                    </button>
                  )}
                  {offer.status !== 'aceptada' && offer.status !== 'rechazada' && (
                    <>
                      <button
                        type="button"
                        onClick={() => respondToOffer(offer.id, 'aceptada')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => respondToOffer(offer.id, 'rechazada')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfferIdForNegotiation(offer.id);
                      setCurrentView('negotiations');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Negociar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio / Tablet: Tabla Completa */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Organización ofertante</th>
                    <th className="py-3.5 px-4 text-right">Cantidad</th>
                    <th className="py-3.5 px-4 text-right">Valor total</th>
                    <th className="py-3.5 px-4">Fecha retiro</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredOffers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Producto */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedProductIdForDetail(offer.productId)}
                          className="flex items-center gap-3 min-w-[200px] cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                            <ProductImage src={offer.productImageUrl} alt={offer.productName} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px] group-hover:text-emerald-600 transition-colors">
                              {offer.productName}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 truncate">
                              {offer.sellerName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Organización que realiza la oferta */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {offer.buyerOrganization}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {offer.buyerName} · {offer.pickupMethod}
                        </p>
                      </td>

                      {/* 3. Cantidad */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {offer.requestedQuantity} {offer.unit}
                      </td>

                      {/* 4. Valor */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 block">
                          ${offer.totalOfferedPrice.toLocaleString('es-CO')} COP
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-slate-400">
                          ${offer.offeredPricePerUnit.toLocaleString('es-CO')} / {offer.unit}
                        </span>
                      </td>

                      {/* 5. Fecha */}
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {offer.proposedDate}
                      </td>

                      {/* 6. Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusLabel(offer.status)}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {offer.status === 'aceptada' && (
                            <button
                              type="button"
                              onClick={() => setOfferForCertificate(offer)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Generar acta de entrega</span>
                            </button>
                          )}
                          {offer.status !== 'aceptada' && offer.status !== 'rechazada' && (
                            <>
                              <button
                                type="button"
                                onClick={() => respondToOffer(offer.id, 'aceptada')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
                              >
                                Aceptar
                              </button>
                              <button
                                type="button"
                                onClick={() => respondToOffer(offer.id, 'rechazada')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOfferIdForNegotiation(offer.id);
                              setCurrentView('negotiations');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Negociar</span>
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

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />

      {/* Modal de Acta de Entrega en PDF (Exclusivo para operaciones Aceptadas) */}
      <DeliveryCertificateModal
        offer={offerForCertificate}
        onClose={() => setOfferForCertificate(null)}
      />
    </div>
  );
};
