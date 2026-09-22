import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { FoodCategory, FoodCondition, FoodProduct, FOOD_CATEGORIES, FOOD_CONDITIONS } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { ProductDetailModal } from './ProductDetailModal';
import { MakeOfferModal } from './MakeOfferModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
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
  } = useApp();
  const { t } = useI18n();

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedCity, setSelectedCity] = useState<string>('todas');
  const [selectedCondition, setSelectedCondition] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'urgency' | 'price_asc' | 'price_desc' | 'qty_desc' | 'recent'>('urgency');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [urgencyFilter, setUrgencyFilter] = useState<'todas' | 'urgente' | 'moderada'>('todas');
  
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
    const set = new Set(products.map((p) => p.locationCity));
    return ['todas', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude completely expired or already sold products from general active catalog
        if (p.status === 'vendida' || p.status === 'finalizada') return false;

        // Search match
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const match =
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.sellerName.toLowerCase().includes(term) ||
            p.locationCity.toLowerCase().includes(term);
          if (!match) return false;
        }

        // Category filter
        if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
          return false;
        }

        // City filter
        if (selectedCity !== 'todas' && p.locationCity !== selectedCity) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'todas' && p.condition !== selectedCondition) {
          return false;
        }

        // Price filter
        if (p.requestedPrice > maxPrice) {
          return false;
        }

        // Urgency filter (🔴 < 24h, 🟡 1-3 días, 🟢 > 3 días)
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchTerm, selectedCategory, selectedCity, selectedCondition, maxPrice, urgencyFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todas');
    setSelectedCity('todas');
    setSelectedCondition('todas');
    setMaxPrice(50000);
    setUrgencyFilter('todas');
    setSortBy('urgency');
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
            <span>🥗 {t('catalog.bannerTag')}</span>
            <span>•</span>
            <span className="text-slate-200">{t('catalog.rescuePrices')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('catalog.title')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {t('catalog.subtitle')}
          </p>

          {/* Large search input */}
          <div className="pt-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4.5" />
            <input
              type="text"
              id="catalog-search-input"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-900 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-emerald-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('todas')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'todas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('catalog.allCategories')} ({products.length})
        </button>
        {FOOD_CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters Bar & Sorting */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* City filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {c === 'todas' ? t('catalog.allCities') : c}
                </option>
              ))}
            </select>
          </div>

          {/* Condition filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400">{t('product.condition')}:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
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

          {/* Urgency Quick Toggle */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setUrgencyFilter('todas')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                urgencyFilter === 'todas'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('catalog.urgencyAll')}
            </button>
            <button
              onClick={() => setUrgencyFilter('urgente')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                urgencyFilter === 'urgente' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{t('catalog.urgencyCritical')}</span>
            </button>
            <button
              onClick={() => setUrgencyFilter('moderada')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                urgencyFilter === 'moderada' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{t('catalog.urgencyModerate')}</span>
            </button>
          </div>
        </div>

        {/* Sorting Options */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">{t('catalog.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg focus:outline-hidden cursor-pointer"
          >
            <option value="urgency" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('catalog.urgency')}</option>
            <option value="recent" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('catalog.recent')}</option>
            <option value="price_asc" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('catalog.priceLow')}</option>
            <option value="price_desc" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('catalog.priceHigh')}</option>
            <option value="qty_desc" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('catalog.quantityHigh')}</option>
          </select>

          {(searchTerm || selectedCategory !== 'todas' || selectedCity !== 'todas' || selectedCondition !== 'todas' || urgencyFilter !== 'todas') && (
            <button
              onClick={resetFilters}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold px-2 py-1 hover:underline ml-1 cursor-pointer"
            >
              {t('catalog.clearFilters')}
            </button>
          )}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>
          <strong className="text-slate-900 dark:text-slate-100 font-bold">{filteredProducts.length}</strong> {t('catalog.available', 'disp.')}
        </span>
        <span className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">🟢 &gt; 3 d</span>
          <span className="flex items-center gap-1">🟡 1-3 d</span>
          <span className="flex items-center gap-1">🔴 &lt; 24h</span>
        </span>
      </div>

      {/* Products Grid / Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
            {t('catalog.emptyTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t('catalog.emptyDesc')}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            {t('catalog.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />

      {/* Make Offer Modal */}
      <MakeOfferModal
        product={productForOffer}
        onClose={() => setProductForOffer(null)}
      />

    </div>
  );
};
