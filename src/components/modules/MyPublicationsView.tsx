import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodProduct, FOOD_CONDITIONS, ProductCondition } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { ProductDetailModal } from '../catalog/ProductDetailModal';
import { EmptyState } from '../common/EmptyState';
import { RenewalModal } from '../publishing/RenewalModal';
import {
  Plus,
  Edit3,
  PauseCircle,
  PlayCircle,
  CheckSquare,
  FileSpreadsheet,
  BarChart3,
  RefreshCw,
  Clock,
  Package,
  X,
  Save,
} from 'lucide-react';

export const MyPublicationsView: React.FC = () => {
  const {
    products,
    currentUser,
    currentRole,
    updateProduct,
    changeProductStatus,
    setCurrentView,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    simulateExpirationForProduct,
    simulateCritical6hForProduct,
    loadDemoData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'todas' | 'activas' | 'proximas' | 'finalizadas'>('todas');
  const [editingProduct, setEditingProduct] = useState<FoodProduct | null>(null);
  const [productToRenew, setProductToRenew] = useState<FoodProduct | null>(null);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editCondition, setEditCondition] = useState<ProductCondition>('Maduración avanzada');
  const [editAddress, setEditAddress] = useState('');

  const userId = currentUser?.id || '';
  const isAdmin = currentRole === 'admin';

  // Si el usuario está en rol fundación, mostramos sus publicaciones o todas las de prueba para evaluación
  const myProducts = products.filter(
    (p) => p.sellerId === userId || isAdmin || currentRole === 'buyer_foundation' || currentRole === 'buyer'
  );

  const filteredProducts = myProducts.filter((p) => {
    const diffHours = Math.max(0, (new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 3600));
    const isEndingSoon = p.status === 'proxima_a_finalizar' || (p.status === 'activa' && diffHours > 0 && diffHours <= 24);
    const isFinished = p.status === 'finalizada' || p.status === 'vendida' || p.status === 'pausada' || diffHours <= 0;

    if (activeTab === 'activas') return p.status === 'activa' && diffHours > 24;
    if (activeTab === 'proximas') return isEndingSoon;
    if (activeTab === 'finalizadas') return isFinished;
    return true;
  });

  const handleOpenEdit = (prod: FoodProduct) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditQuantity(prod.quantity);
    setEditPrice(prod.requestedPrice);
    setEditCondition(prod.condition);
    setEditAddress(prod.locationAddress);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editName.trim() || editingProduct.name,
      quantity: Math.max(1, editQuantity),
      requestedPrice: Math.max(100, editPrice),
      condition: editCondition,
      locationAddress: editAddress.trim() || editingProduct.locationAddress,
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mis publicaciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra el estado, vigencia, ofertas recibidas y métricas de tus lotes publicados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('publish')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Publicar producto</span>
        </button>
      </div>

      {/* Pestañas de Estado */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'todas', label: 'Todas', count: myProducts.length },
            {
              id: 'activas',
              label: 'Activas',
              count: myProducts.filter(
                (p) =>
                  p.status === 'activa' &&
                  (new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 3600) > 24
              ).length,
            },
            {
              id: 'proximas',
              label: 'Próximas a vencer',
              count: myProducts.filter((p) => {
                const diffH = (new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 3600);
                return p.status === 'proxima_a_finalizar' || (p.status === 'activa' && diffH > 0 && diffH <= 24);
              }).length,
            },
            {
              id: 'finalizadas',
              label: 'Finalizadas / Pausadas',
              count: myProducts.filter(
                (p) =>
                  p.status === 'finalizada' ||
                  p.status === 'vendida' ||
                  p.status === 'pausada' ||
                  new Date(p.expiresAt).getTime() <= Date.now()
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Publicaciones o Estado Vacío */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={Package}
            title="No tienes publicaciones todavía."
            description="Publica un lote de alimentos disponibles para que fundaciones y organizaciones aliadas puedan realizar ofertas."
            actionLabel="+ Publicar producto"
            onAction={() => setCurrentView('publish')}
            secondaryLabel={products.length === 0 ? 'Cargar lotes de demostración' : undefined}
            onSecondaryAction={products.length === 0 ? loadDemoData : undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((prod) => {
            const now = Date.now();
            const expires = new Date(prod.expiresAt).getTime();
            const diffHours = Math.max(0, Math.round((expires - now) / (1000 * 3600)));
            const diffDays = Math.floor(diffHours / 24);
            const remainingHours = diffHours % 24;
            const isFinished = prod.status === 'finalizada' || diffHours <= 0;
            const isPaused = prod.status === 'pausada';

            let statusText = 'Activa';
            let statusColor = 'text-emerald-700 dark:text-emerald-400';

            if (isFinished) {
              statusText = 'Finalizada';
              statusColor = 'text-rose-600 dark:text-rose-400';
            } else if (isPaused) {
              statusText = 'Pausada';
              statusColor = 'text-slate-500 dark:text-slate-400';
            } else if (diffHours <= 6) {
              statusText = 'Urgente (< 6h para vencer)';
              statusColor = 'text-rose-600 dark:text-rose-400';
            } else if (diffHours <= 24 || prod.status === 'proxima_a_finalizar') {
              statusText = 'Próxima a vencer';
              statusColor = 'text-amber-600 dark:text-amber-400';
            }

            return (
              <div
                key={prod.id}
                id={`my-pub-${prod.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Información principal del lote */}
                <div
                  onClick={() => setSelectedProductIdForDetail(prod.id)}
                  className="flex items-start sm:items-center gap-4 min-w-0 cursor-pointer group"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-800">
                    <ProductImage
                      src={prod.imageUrl}
                      alt={prod.name}
                      category={prod.category}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className={`font-semibold ${statusColor}`}>{statusText}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400">{prod.category}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400">{prod.condition}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">
                      {prod.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-mono tabular-nums font-semibold">
                        {prod.quantity} {prod.unit}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                        ${prod.requestedPrice.toLocaleString('es-CO')} / {prod.unit}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {isFinished ? '0h restantes' : `${diffDays}d ${remainingHours}h restantes`}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span>Vence: {prod.expirationDate}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones del módulo Mis Publicaciones */}
                <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  {/* 1. Editar */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(prod)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* 2. Pausar / Reanudar */}
                  {!isFinished && (
                    <button
                      type="button"
                      onClick={() =>
                        changeProductStatus(prod.id, isPaused ? 'activa' : 'pausada')
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activar</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pausar</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* 3. Finalizar o Simular < 6h */}
                  {!isFinished && (
                    <>
                      <button
                        type="button"
                        onClick={() => simulateCritical6hForProduct(prod.id)}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/70 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 inline-flex items-center gap-1.5 cursor-pointer"
                        title="Simular que faltan menos de 6 horas para vencer y enviar alerta por correo"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Alerta &lt; 6h</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => simulateExpirationForProduct(prod.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Finalizar</span>
                      </button>
                    </>
                  )}

                  {/* 4. Ver ofertas */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('offers')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver ofertas ({prod.offersCount})</span>
                  </button>

                  {/* 5. Ver estadísticas */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('statistics')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Estadísticas</span>
                  </button>

                  {/* Renovar vigencia */}
                  <button
                    type="button"
                    id={`btn-renew-${prod.id}`}
                    onClick={() => setProductToRenew(prod)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renovar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Edición Rápida de Publicación */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Editar publicación
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cantidad ({editingProduct.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Precio unitario (COP)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Estado del lote
                </label>
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value as ProductCondition)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  {FOOD_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dirección de retiro
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Renovación */}
      <RenewalModal
        product={productToRenew}
        onClose={() => setProductToRenew(null)}
      />

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />
    </div>
  );
};
