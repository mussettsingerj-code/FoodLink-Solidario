import React from 'react';
import { FoodProduct } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { Clock, Building2, ArrowRight, MapPin } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: FoodProduct;
  onSelect: (product: FoodProduct) => void;
  onMakeOffer?: (product: FoodProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { t, language } = useI18n();
  const { formatCOP } = useApp();

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
  let urgencyDotClass = 'bg-slate-400';

  if (diffHours <= 0 || product.status === 'finalizada') {
    remainingLabel = language === 'en' ? 'Finished' : 'Finalizada';
    urgencyColorClass = 'text-rose-600 dark:text-rose-400';
    urgencyDotClass = 'bg-rose-500';
  } else if (diffHours < 24) {
    remainingLabel = language === 'en' ? `${diffHours}h left` : `${diffHours}h restantes`;
    urgencyColorClass = 'text-amber-600 dark:text-amber-400 font-bold';
    urgencyDotClass = 'bg-amber-500 animate-pulse';
  } else if (diffDays <= 3) {
    remainingLabel = language === 'en'
      ? `${diffDays}d ${remainingHoursInDay}h left`
      : `${diffDays}d ${remainingHoursInDay}h restantes`;
    urgencyColorClass = 'text-emerald-700 dark:text-emerald-400 font-semibold';
    urgencyDotClass = 'bg-emerald-500';
  }

  // Calculate solidarity discount percentage if original price exists
  const discountPct = product.originalPrice && product.originalPrice > product.requestedPrice
    ? Math.round(((product.originalPrice - product.requestedPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group interactive-card card-elevation bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-500/70 dark:hover:border-emerald-500/50 flex flex-col overflow-hidden cursor-pointer justify-between"
    >
      {/* 1. Fotografía con aspect ratio y micro-badge sutil de estado */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Solidarity savings badge if applicable */}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-600 text-white shadow-xs backdrop-blur-xs">
            -{discountPct}% {language === 'en' ? 'Solidarity Off' : 'Ahorro Solidario'}
          </span>
        )}

        {/* Reserved badge if product status is reservado */}
        {product.status === 'reservado' && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 text-white shadow-xs backdrop-blur-xs">
            Lote Reservado
          </span>
        )}

        {/* Location pill */}
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-950/75 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{product.locationCity}</span>
        </span>
      </div>

      {/* 2. Contenido de la tarjeta */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          {/* Metadata superior: Categoría & Urgencia de vencimiento */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] truncate">
              {product.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 tabular-nums shrink-0 text-xs ${urgencyColorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${urgencyDotClass}`} />
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{remainingLabel}</span>
            </span>
          </div>

          {/* Nombre y Marca */}
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors font-display">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                {product.brand}
              </p>
            )}
          </div>

          {/* Cantidad disponible y condición */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 pt-0.5 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {product.quantity.toLocaleString('es-CO')} {product.unit}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
              {product.condition}
            </span>
          </div>

          {/* Precio solidario destacado */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {formatCOP(product.requestedPrice)} COP
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              / {product.unit}
            </span>
            {product.originalPrice && product.originalPrice > product.requestedPrice && (
              <span className="text-xs text-slate-400 line-through tabular-nums ml-auto">
                {formatCOP(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Pie de tarjeta: Establecimiento vendedor y botón interactivo */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
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
            className="btn-interaction px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <span>{t('catalog.viewDetail')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
