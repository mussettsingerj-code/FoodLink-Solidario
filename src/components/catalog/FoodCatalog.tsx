import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodProduct, FOOD_CATEGORIES, FOOD_CONDITIONS } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  MapPin,
  ArrowUpDown,
  ShoppingBag,
  Plus,
  RotateCcw,
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
    setMakingOfferProduct,
    t,
  } = useApp();

  const isSeller = isAuthenticated && userProfile.role === 'seller';

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
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

  const handleMakeOffer = (p: FoodProduct) => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setAuthModalMessage('Debes iniciar sesión para hacer una oferta solidaria por este lote.');
      setIsAuthModalOpen(true);
      showToast('Inicia sesión para negociar este lote de alimentos', 'info');
      return;
    }
    setMakingOfferProduct(p);
  };

  // Available cities in data
  const cities = useMemo(() => {
    const set = new Set(products.map((p) => p.locationCity));
    return ['todas', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status === 'vendida' || p.status === 'finalizada' || p.status === 'pausada') return false;

        // Regla: La publicación debe estar activa mientras siga siendo válida; dejar de mostrar al vencer
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
            p.brand.toLowerCase().includes(term) ||
            p.sellerName.toLowerCase().includes(term) ||
            p.locationCity.toLowerCase().includes(term) ||
            p.condition.toLowerCase().includes(term);
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
    <div className="space-y-6">
      {/* Encabezado de Sección */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('catalog.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('catalog.subtitle')}
          </p>
        </div>

        {isSeller && (
          <button
            type="button"
            onClick={() => setCurrentView('publish')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('catalog.publishProduct')}</span>
          </button>
        )}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Buscador */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalog-search-input"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setGlobalSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-emerald-600 transition-colors"
            />
          </div>

          {/* Filtro Ubicación */}
          <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filtrar por ciudad"
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {c === 'todas' ? t('catalog.allCities') : c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado del Producto */}
          <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              aria-label="Filtrar por estado del producto"
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
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
          <div className="md:col-span-2 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Ordenar productos"
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer truncate"
            >
              <option value="urgency" className="bg-white dark:bg-slate-800">{t('catalog.sortUrgent')}</option>
              <option value="recent" className="bg-white dark:bg-slate-800">{t('catalog.sortRecent')}</option>
              <option value="qty_desc" className="bg-white dark:bg-slate-800">{t('catalog.sortQtyHigh')}</option>
              <option value="price_asc" className="bg-white dark:bg-slate-800">{t('catalog.sortPriceLow')}</option>
              <option value="price_desc" className="bg-white dark:bg-slate-800">{t('catalog.sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Categorías y Urgencia (controles interactivos segmentados) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'todas'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setUrgencyFilter('todas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  urgencyFilter === 'todas'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('catalog.urgencyAll')}
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('urgente')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  urgencyFilter === 'urgente'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('catalog.urgencyCritical')}
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('moderada')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  urgencyFilter === 'moderada'
                    ? 'bg-emerald-600 text-white'
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
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
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
          <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{filteredProducts.length}</strong> {t('catalog.available')}
        </span>
      </div>

      {/* Grilla de Productos / Estados */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={ShoppingBag}
            title={t('catalog.emptyTitle')}
            description={t('catalog.emptyDesc')}
            actionLabel={hasActiveFilters ? t('catalog.clearFilters') : isSeller ? t('catalog.publishProduct') : undefined}
            onAction={hasActiveFilters ? resetFilters : isSeller ? () => setCurrentView('publish') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProductIdForDetail(p.id)}
              onMakeOffer={handleMakeOffer}
            />
          ))}
        </div>
      )}
    </div>
  );
};
