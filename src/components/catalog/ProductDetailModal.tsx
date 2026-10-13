import React, { useState } from 'react';
import { FoodProduct } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { MakeOfferModal } from './MakeOfferModal';
import { ProductImage } from '../common/ProductImage';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Building2,
  Heart,
  Share2,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Send,
} from 'lucide-react';

interface ProductDetailModalProps {
  productId?: string | null;
  onClose?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId: propProductId,
  onClose: propOnClose,
}) => {
  const {
    products,
    toggleFavorite,
    isFavorite,
    currentRole,
    showToast,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    selectedProduct,
    setSelectedProduct,
  } = useApp();
  const { t } = useI18n();
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);

  const activeId =
    propProductId !== undefined
      ? propProductId
      : selectedProductIdForDetail || selectedProduct?.id || null;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    }
    setSelectedProductIdForDetail(null);
    setSelectedProduct(null);
  };

  const product = products.find((p) => p.id === activeId);

  if (!activeId || !product) return null;

  const favorite = isFavorite(product.id);

  // Time remaining calculations
  const now = Date.now();
  const expires = new Date(product.expiresAt).getTime();
  const diffHours = Math.max(0, Math.round((expires - now) / (1000 * 3600)));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHoursInDay = diffHours % 24;

  const discount = product.originalPrice > 0
    ? Math.round(((product.originalPrice - product.requestedPrice) / product.originalPrice) * 100)
    : 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(t('product.linkCopied', 'Enlace copiado al portapapeles'), 'info');
  };

  React.useEffect(() => {
    if (!activeId || !product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, product]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Modal Top Bar */}
        <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40"></div>

          {/* Close button */}
          <button
            type="button"
            id="btn-close-product-detail-modal"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="absolute top-3 right-3 min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition-all cursor-pointer border border-slate-700/60 shadow-md focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Action buttons */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-full shadow-xs backdrop-blur-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                favorite ? 'bg-rose-500 text-white' : 'bg-slate-900/70 text-white hover:bg-slate-900 border border-slate-700/50'
              }`}
              title={favorite ? t('product.favoriteRemove') : t('product.favoriteAdd')}
              aria-label={favorite ? t('product.favoriteRemove') : t('product.favoriteAdd')}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 shadow-xs backdrop-blur-md transition-all cursor-pointer border border-slate-700/50 focus-visible:ring-2 focus-visible:ring-emerald-600"
              title={t('product.share')}
              aria-label={t('product.share')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Overlay Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1 uppercase tracking-wider">
              <span>{product.category}</span>
              <span>•</span>
              <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[11px] text-white">
                {product.condition}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight drop-shadow-sm">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-5 text-sm custom-scroll">
          
          {/* Price & Urgency Hero */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                {t('product.suggestedPrice')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  ${product.requestedPrice.toLocaleString('es-CO')}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">/ {product.unit}</span>
                {product.originalPrice > product.requestedPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toLocaleString('es-CO')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                    -{discount}% {t('product.discount')}
                  </span>
                )}
              </div>
            </div>

            {/* Urgency Box */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  {t('catalog.urgencyFilterLabel')}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {diffHours <= 0
                    ? t('product.finished')
                    : diffHours < 24
                    ? `⚠️ ${diffHours}h ${t('product.remainingTime')}`
                    : `${diffDays}d ${remainingHoursInDay}h ${t('product.remainingTime')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              {t('product.condition')}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description || 'Alimento disponible para rescate solidario en condiciones aptas para consumo.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">{t('publish.quantityLabel')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.quantity} {product.unit}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">{t('product.minPurchase')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.minPurchaseQuantity} {product.unit}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">{t('product.expiration')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.expirationDate}</span>
            </div>
            {product.recommendedConsumptionDate && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block">{t('product.recommendedDate')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.recommendedConsumptionDate}</span>
              </div>
            )}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">{t('publish.brandLabel')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{product.brand}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">{t('product.condition')}</span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{product.condition}</span>
            </div>
          </div>

          {/* Seller and Location Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{product.sellerName}</span>
                  {product.sellerVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" title="Verificado" />
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-400 block">{product.sellerType}</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{product.locationCity} — {product.locationAddress}</span>
                </p>
                {product.deliveryConditions && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    📦 <span className="font-medium">{product.deliveryConditions}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guarantees note */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span>{t('product.guaranteeText')}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 min-h-[42px] text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {t('negotiation.closeBtn')}
          </button>

          <button
            type="button"
            id="btn-detail-make-offer"
            onClick={() => setIsMakeOfferOpen(true)}
            className="px-5 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <Send className="w-4 h-4" />
            <span>{t('product.makeOfferBtn')}</span>
          </button>
        </div>

      </div>

      {/* Embedded Make Offer Modal */}
      <MakeOfferModal
        product={product}
        isOpen={isMakeOfferOpen}
        onClose={() => setIsMakeOfferOpen(false)}
        onSuccess={() => {
          setIsMakeOfferOpen(false);
          handleClose();
        }}
      />
    </div>
  );
};
