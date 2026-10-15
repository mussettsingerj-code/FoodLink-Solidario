import React, { useState, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { FoodProduct, FOOD_CATEGORIES, FOOD_CONDITIONS } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductDetailModal } from './ProductDetailModal';
import { MakeOfferModal } from './MakeOfferModal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  MapPin,
  ArrowUpDown,
  ShoppingBag,
  Plus,
  RotateCcw,
  Sparkles,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const FoodCatalog: React.FC = () => {
  const {
    products,
    setSelectedProductIdForDetail,
    selectedProductIdForDetail,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
    setAuthModalMessage,
    showToast,
    setCurrentView,
    globalSearchQuery,
    setGlobalSearchQuery,
    userProfile,
    t,
  } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const isSeller = isAuthenticated && userProfile.role === 'seller';

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 180);
    return () => clearTimeout(timer);
  }, []);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedCity, setSelectedCity] = useState<string>('todas');
  const [selectedCondition, setSelectedCondition] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'urgency' | 'price_asc' | 'price_desc' | 'qty_desc' | 'recent'>('urgency');
  const [urgencyFilter, setUrgencyFilter] = useState<'todas' | 'urgente' | 'moderada'>('todas');

  useEffect(() => {
    if (globalSearchQuery !== undefined && globalSearchQuery !== searchTerm) {
      setSearchTerm(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Quick offer modal
  const [productForOffer, setProductForOffer] = useState<FoodProduct | null>(null);

  const handleMakeOffer = (p: FoodProduct) => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setAuthModalMessage('Debes iniciar sesión para hacer una oferta solidaria por este lote.');
      setIsAuthModalOpen(true);
      showToast('Inicia sesión para negociar este lote de alimentos', 'info');
      return;
    }
    setProductForOffer(p);
  };

  // Available cities in data
  const cities = useMemo(() => {
    const set = new Set(products.map((p) => p.locationCity).filter(Boolean));
    return ['todas', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status === 'vendida' || p.status === 'finalizada' || p.status === 'pausada') return false;

        // Ocultar lotes vencidos automáticamente
        const expTime = p.expirationDate
          ? new Date(`${p.expirationDate}T23:59:59`).getTime()
          : p.expiresAt
          ? new Date(p.expiresAt).getTime()
          : NaN;
        if (!isNaN(expTime) && expTime < Date.now()) {
          return false;
        }

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const match =
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            (p.brand && p.brand.toLowerCase().includes(term)) ||
            (p.sellerName && p.sellerName.toLowerCase().includes(term)) ||
            (p.locationCity && p.locationCity.toLowerCase().includes(term)) ||
            (p.condition && p.condition.toLowerCase().includes(term));
          if (!match) return false;
        }

        if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
          return false;
        }

        if (selectedCity !== 'todas' && p.locationCity !== selectedCity) {
          return false;
        }

        if (selectedCondition !== 'todas' && p.condition !== selectedCondition) {
          return false;
        }

        if (urgencyFilter !== 'todas') {
          const diffHours = Math.max(0, (new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 3600));
          if (urgencyFilter === 'urgente' && diffHours > 24) return false;
          if (urgencyFilter === 'moderada' && (diffHours <= 24 || diffHours > 72)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        }
        if (sortBy === 'price_asc') {
          return a.requestedPrice - b.requestedPrice;
        }
        if (sortBy === 'price_desc') {
          return b.requestedPrice - a.requestedPrice;
        }
        if (sortBy === 'qty_desc') {
          return b.quantity - a.quantity;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [products, searchTerm, selectedCategory, selectedCity, selectedCondition, urgencyFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setGlobalSearchQuery('');
    setSelectedCategory('todas');
    setSelectedCity('todas');
    setSelectedCondition('todas');
    setUrgencyFilter('todas');
    setSortBy('urgency');
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedCategory !== 'todas' ||
    selectedCity !== 'todas' ||
    selectedCondition !== 'todas' ||
    urgencyFilter !== 'todas';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Encabezado del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('catalog.verifiedSurplus', 'Excedentes Verificados')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-display">
            {t('catalog.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t('catalog.subtitle')}
          </p>
        </div>

        {isSeller && (
          <button
            type="button"
            id="catalog-btn-publish"
            onClick={() => setCurrentView('publish')}
            className="btn-interaction px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-black rounded-2xl shadow-md shadow-emerald-950/20 inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>{t('catalog.publishProduct')}</span>
          </button>
        )}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Buscador de texto con botón de borrado rápido */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="catalog-search-input"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setGlobalSearchQuery(e.target.value);
              }}
              className="modern-input w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setGlobalSearchQuery('');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro Ubicación */}
          <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filtrar por ciudad"
              className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {c === 'todas' ? t('catalog.allCities') : c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado del Producto */}
          <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              aria-label="Filtrar por estado del producto"
              className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
            >
              <option value="todas" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {t('catalog.allConditions')}
              </option>
              {FOOD_CONDITIONS.map((cond) => (
                <option key={cond} value={cond} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div className="md:col-span-2 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Ordenar productos"
              className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
            >
              <option value="urgency" className="bg-white dark:bg-slate-800">{t('catalog.sortUrgent')}</option>
              <option value="recent" className="bg-white dark:bg-slate-800">{t('catalog.sortRecent')}</option>
              <option value="qty_desc" className="bg-white dark:bg-slate-800">{t('catalog.sortQtyHigh')}</option>
              <option value="price_asc" className="bg-white dark:bg-slate-800">{t('catalog.sortPriceLow')}</option>
              <option value="price_desc" className="bg-white dark:bg-slate-800">{t('catalog.sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Categorías y Urgencia */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'todas'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('common.all')} ({products.filter((p) => p.status === 'activa' || p.status === 'proxima_a_finalizar').length})
            </button>
            {FOOD_CATEGORIES.map((cat) => {
              const count = products.filter(
                (p) => (p.status === 'activa' || p.status === 'proxima_a_finalizar') && p.category === cat
              ).length;
              if (count === 0 && selectedCategory !== cat) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setUrgencyFilter('todas')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  urgencyFilter === 'todas'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('catalog.urgencyAll')}
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('urgente')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  urgencyFilter === 'urgente'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('catalog.urgencyCritical')}
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('moderada')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  urgencyFilter === 'moderada'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('catalog.urgencyModerate')}
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn-interaction px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('catalog.clearFilters')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          <strong className="text-slate-900 dark:text-slate-100 tabular-nums text-sm font-black">
            {filteredProducts.length}
          </strong>{' '}
          {t('catalog.available')}
        </span>
      </div>

      {/* Grilla de Productos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-250 dark:border-slate-800 p-10 sm:p-14 text-center">
          <EmptyState
            icon={ShoppingBag}
            title={t('catalog.emptyTitle')}
            description={t('catalog.emptyDesc')}
            actionLabel={hasActiveFilters ? t('catalog.clearFilters') : isSeller ? t('catalog.publishProduct') : undefined}
            onAction={hasActiveFilters ? resetFilters : isSeller ? () => setCurrentView('publish') : undefined}
          />
        </div>
      ) : (
        <motion.div
          key={`${selectedCategory}-${selectedCity}-${selectedCondition}-${urgencyFilter}-${sortBy}-${searchTerm}`}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.04,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <ProductCard
                product={product}
                onSelect={(p) => setSelectedProductIdForDetail(p.id)}
                onMakeOffer={handleMakeOffer}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de Detalles del Producto */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />

      {/* Modal para Realizar Oferta */}
      <MakeOfferModal
        product={productForOffer}
        onClose={() => setProductForOffer(null)}
      />
    </div>
  );
};
