import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../catalog/ProductCard';
import { ProductDetailModal } from '../catalog/ProductDetailModal';
import { EmptyState } from '../common/EmptyState';
import {
  Plus,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  MessageSquare,
  Leaf,
  Package,
  MapPin,
} from 'lucide-react';

export const DashboardHomeView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    products,
    offers,
    notifications,
    setCurrentView,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    setSelectedOfferIdForNegotiation,
    loadDemoData,
  } = useApp();

  const userId = currentUser?.id || '';
  const isAdmin = currentRole === 'admin';
  const isEstablishment = currentRole === 'establishment';

  // Métricas principales calculadas en tiempo real
  const availableProducts = products.filter(
    (p) => p.status === 'activa' || p.status === 'proxima_a_finalizar'
  );

  const myActivePublications = products.filter(
    (p) =>
      (p.sellerId === userId || isAdmin || !isEstablishment) &&
      (p.status === 'activa' || p.status === 'proxima_a_finalizar')
  );

  const relevantOffers = offers.filter(
    (o) => o.sellerId === userId || o.buyerId === userId || isAdmin
  );

  const completedOperations = offers.filter((o) => o.status === 'aceptada');

  const totalKgRecovered =
    completedOperations.reduce((acc, o) => acc + o.requestedQuantity, 0) +
    products
      .filter((p) => p.status === 'vendida')
      .reduce((acc, p) => acc + p.quantity, 0);

  const estimatedRations = totalKgRecovered * 4;
  const co2SavedKg = Math.round(totalKgRecovered * 2.5);

  // Productos destacados (máximo 3 para evitar saturar el dashboard)
  const featuredProducts = availableProducts.slice(0, 3);

  // Actividad reciente combinada (ofertas y notificaciones recientes)
  const recentOffers = relevantOffers.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 1. Saludo y Acción Principal */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {currentUser?.organizationName || 'Publik Solidario'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentUser?.city || 'Colombia'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Hola, {currentUser?.name || 'Usuario Solidario'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Resumen general de inventario disponible, ofertas en curso e impacto generado en la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView('organizations')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mapa interactivo</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explorar catálogo</span>
          </button>

          <button
            type="button"
            id="btn-open-publish-from-dashboard"
            onClick={() => setCurrentView('publish')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publicar producto</span>
          </button>
        </div>
      </div>

      {/* 2. Indicadores Principales (5 métricas clave, limpias y tabulares) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setCurrentView('catalog')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Productos disponibles
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1.5 block">
            {availableProducts.length}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            En catálogo activo
          </span>
        </div>

        <div
          onClick={() => setCurrentView('my_publications')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Publicaciones activas
          </span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums mt-1.5 block">
            {myActivePublications.length}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            Vigentes para rescate
          </span>
        </div>

        <div
          onClick={() => setCurrentView('offers')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Ofertas recibidas
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1.5 block">
            {relevantOffers.length}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 block">
            {relevantOffers.filter((o) => o.status === 'pendiente' || o.status === 'contraoferta').length} en gestión
          </span>
        </div>

        <div
          onClick={() => setCurrentView('offers')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Operaciones realizadas
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1.5 block">
            {completedOperations.length}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            Acuerdos concretados
          </span>
        </div>

        <div
          onClick={() => setCurrentView('statistics')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer col-span-2 sm:col-span-1"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Impacto generado
          </span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums mt-1.5 block">
            {totalKgRecovered.toLocaleString('es-CO')} kg
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            Alimento recuperado
          </span>
        </div>
      </div>

      {/* 3. Contenido Principal: Productos Destacados (Izquierda) + Impacto y Actividad (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Productos Destacados (8 columnas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Productos destacados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lotes prioritarios disponibles para oferta inmediata
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('catalog')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos ({availableProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <EmptyState
                icon={Package}
                title="No tienes publicaciones todavía."
                description="Comienza publicando un lote de alimentos disponibles o carga datos de demostración para visualizar productos destacados."
                actionLabel="+ Publicar producto"
                onAction={() => setCurrentView('publish')}
                secondaryLabel="Cargar lotes de ejemplo"
                onSecondaryAction={loadDemoData}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProductIdForDetail(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Resumen de Impacto + Actividad Reciente (4 columnas) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resumen de Impacto */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4" />
                <span>Resumen de impacto</span>
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('statistics')}
                className="text-xs text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Ver analítica
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Raciones servidas</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white mt-0.5 block">
                  {estimatedRations.toLocaleString('es-CO')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Emisiones evitadas</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5 block">
                  {co2SavedKg.toLocaleString('es-CO')} kg CO₂
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cada operación completada evita pérdidas en supermercados y fortalece la seguridad alimentaria de fundaciones aliadas.
            </p>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Actividad reciente
              </h3>
              <button
                type="button"
                onClick={() => setCurrentView('notifications')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Ver todo
              </button>
            </div>

            {recentOffers.length === 0 && notifications.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                Aún no hay actividad reciente registrada.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOffers.map((off) => (
                  <div
                    key={off.id}
                    onClick={() => {
                      setSelectedOfferIdForNegotiation(off.id);
                      setCurrentView('negotiations');
                    }}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">
                        {off.productName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {off.buyerOrganization} · {off.requestedQuantity} {off.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 block">
                        ${off.totalOfferedPrice.toLocaleString('es-CO')}
                      </span>
                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                        {off.status === 'aceptada' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aceptada</span>
                          </>
                        ) : off.status === 'contraoferta' ? (
                          <>
                            <MessageSquare className="w-3 h-3 text-amber-600" />
                            <span>En negociación</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />
    </div>
  );
};
