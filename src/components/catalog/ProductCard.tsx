import React from 'react';
import { FoodProduct } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { Clock, Building2, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface ProductCardProps {
  product: FoodProduct;
  onSelect: (product: FoodProduct) => void;
  onMakeOffer?: (product: FoodProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { t, language } = useI18n();

  // Calculate remaining time
  const now = Date.now();
  const expires = new Date(product.expiresAt).getTime();
  const diffHours = Math.max(0, Math.round((expires - now) / (1000 * 3600)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHoursInDay = diffHours % 24;

  let remainingLabel = language === 'en'
    ? `${diffDays}d ${remainingHoursInDay}h left`
    : `${diffDays}d ${remainingHoursInDay}h restantes`;
  let urgencyColorClass = 'text-slate-600 dark:text-slate-300';

  if (diffHours <= 0 || product.status === 'finalizada') {
    remainingLabel = language === 'en' ? 'Finished' : 'Finalizada';
    urgencyColorClass = 'text-rose-600 dark:text-rose-400';
  } else if (diffHours < 24) {
    remainingLabel = language === 'en' ? `${diffHours}h left` : `${diffHours}h restantes`;
    urgencyColorClass = 'text-amber-600 dark:text-amber-400';
  } else if (diffDays <= 3) {
    remainingLabel = language === 'en'
      ? `${diffDays}d ${remainingHoursInDay}h left`
      : `${diffDays}d ${remainingHoursInDay}h restantes`;
    urgencyColorClass = 'text-slate-700 dark:text-slate-200';
  }

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* 1. Imagen */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
        />
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* 2. Categoría · 3. Tiempo restante (unboxed metadata) */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {product.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-medium tabular-nums shrink-0 ${urgencyColorClass}`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{remainingLabel}</span>
            </span>
          </div>

          {/* 4. Nombre */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {/* 5. Cantidad · 6. Estado */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 pt-0.5 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {product.quantity} {product.unit}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {product.condition}
            </span>
          </div>
        </div>

        {/* Pie de tarjeta: 7. Empresa y 8. Botón "Ver detalles" */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">
              {product.sellerName}
            </span>
          </div>

          <button
            type="button"
            id={`btn-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t('catalog.viewDetail')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
