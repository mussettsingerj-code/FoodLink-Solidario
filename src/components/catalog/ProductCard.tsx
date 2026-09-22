import React from 'react';
import { FoodProduct } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { Clock, MapPin, Heart, ArrowUpRight, ShieldCheck, Tag } from 'lucide-react';

interface ProductCardProps {
  product: FoodProduct;
  onSelect: (product: FoodProduct) => void;
  onMakeOffer?: (product: FoodProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onMakeOffer }) => {
  const { isFavorite, toggleFavorite, currentRole } = useApp();
  const { t } = useI18n();

  const favorite = isFavorite(product.id);

  // Calculate remaining time
  const now = Date.now();
  const expires = new Date(product.expiresAt).getTime();
  const diffHours = Math.max(0, Math.round((expires - now) / (1000 * 3600)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHoursInDay = diffHours % 24;

  let urgencyIcon = '🟢';
  let urgencyText = `${diffDays}d ${remainingHoursInDay}h ${t('product.remainingTime', 'restantes')}`;

  if (diffHours <= 0) {
    urgencyIcon = '⚪';
    urgencyText = t('product.finished', 'Finalizada');
  } else if (diffHours < 24) {
    urgencyIcon = '🔴';
    urgencyText = `< 24h (${diffHours}h)`;
  } else if (diffDays <= 3) {
    urgencyIcon = '🟡';
    urgencyText = `${diffDays} ${t('product.remainingDays', 'días restantes')}`;
  } else {
    urgencyIcon = '🟢';
    urgencyText = `${diffDays} ${t('product.daysMore', 'días más')}`;
  }

  // Discount percentage
  const discount = product.originalPrice > 0
    ? Math.round(((product.originalPrice - product.requestedPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Urgency Indicator (🟢 🟡 🔴) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-xs bg-slate-900/85 text-white border border-slate-700">
          <span>{urgencyIcon}</span>
          <span>{urgencyText}</span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`p-2 rounded-full shadow-sm backdrop-blur-md transition-all cursor-pointer absolute top-2.5 right-2.5 ${
            favorite ? 'bg-rose-500 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-rose-500'
          }`}
          title={favorite ? t('product.favoriteRemove', 'Quitar de favoritos') : t('product.favoriteAdd', 'Guardar en favoritos')}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 bg-amber-500 text-slate-950 text-xs font-bold rounded shadow-xs flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>-{discount}% {t('product.discount', 'DTO')}</span>
          </div>
        )}

        {/* Condition Tag */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded shadow-xs border border-slate-200 dark:border-slate-700">
          {product.condition}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide text-[10px]">
              {product.category}
            </span>
            <span className="truncate max-w-[120px] text-slate-400 dark:text-slate-500 text-[11px]">{product.brand}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Location & Quantity */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-300">{product.locationCity}</span>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              {product.quantity} {product.unit} {t('catalog.available', 'disp.')}
            </span>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
          <div>
            {product.originalPrice > product.requestedPrice && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through block">
                ${product.originalPrice.toLocaleString('es-CO')} / {product.unit}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ${product.requestedPrice.toLocaleString('es-CO')}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/{product.unit}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id={`btn-view-${product.id}`}
              onClick={() => onSelect(product)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-all flex items-center gap-1 cursor-pointer border border-emerald-200/50 dark:border-emerald-800/60"
            >
              <span>{t('catalog.viewDetails', 'Ver detalle')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
