import React, { useState, useEffect } from 'react';
import { FoodProduct } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { ProductImage } from '../common/ProductImage';
import { X, Send, Sparkles } from 'lucide-react';

interface MakeOfferModalProps {
  product: FoodProduct | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ product, isOpen = true, onClose, onSuccess }) => {
  const {
    currentUser,
    userProfile,
    isAuthenticated,
    createOffer,
    setSelectedOfferIdForNegotiation,
    setActiveTab,
    showToast,
  } = useApp();
  const { t } = useI18n();

  const [requestedQuantity, setRequestedQuantity] = useState<number>(1);
  const [offeredPricePerUnit, setOfferedPricePerUnit] = useState<number>(1000);
  const [message, setMessage] = useState<string>('');
  const [pickupMethod, setPickupMethod] = useState<'Recogida en sede del vendedor' | 'Transporte solidario contratado' | 'Envío acordado'>('Recogida en sede del vendedor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default date tomorrow
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const [proposedDate, setProposedDate] = useState<string>(tomorrow);

  useEffect(() => {
    if (product) {
      setRequestedQuantity(Math.min(product.quantity, Math.max(product.minPurchaseQuantity, 20)));
      setOfferedPricePerUnit(product.requestedPrice);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Auto calculated total
  const totalOffered = requestedQuantity * offeredPricePerUnit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedQuantity <= 0 || offeredPricePerUnit <= 0) return;

    const currentUserId = userProfile?.id || currentUser?.id;
    if (!isAuthenticated || !currentUserId) {
      showToast('Debes iniciar sesión para realizar una oferta', 'warning');
      setActiveTab('auth');
      onClose();
      return;
    }

    if (product.sellerId === currentUserId) {
      showToast('No puedes realizar ofertas a tus propias publicaciones', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOffer = await createOffer({
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        buyerId: currentUserId,
        buyerName: userProfile?.name || currentUser?.name || 'Comprador Solidario',
        buyerOrganization: userProfile?.organizationName || currentUser?.organizationName || 'Organización Social',
        buyerType: (userProfile?.role === 'buyer' ? 'Fundación' : 'Organización') as any,
        requestedQuantity,
        offeredPricePerUnit,
        totalOfferedPrice: totalOffered,
        unit: product.unit,
        message,
        pickupMethod,
        proposedDate,
      });

      showToast(t('offer.successToast'), 'success');
      onClose();
      if (onSuccess) onSuccess();
      // Open negotiation view in negotiations tab
      setSelectedOfferIdForNegotiation(newOffer.id);
      setActiveTab('negotiations');
    } catch (err: any) {
      showToast(err?.message || 'Error al enviar la oferta a Firebase', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors my-auto">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                {t('offer.modalTag')}
              </span>
              <h3 className="text-lg font-bold font-display text-white">
                {t('offer.modalTitle')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-make-offer-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Product Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              category={product.category}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{product.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('offer.seller')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.sellerName}</span> • {t('offer.suggestedPrice')}: <span className="font-bold text-emerald-700 dark:text-emerald-400">${product.requestedPrice.toLocaleString('es-CO')}/{product.unit}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {t('publish.quantityLabel')}: {product.quantity} {product.unit} • {t('product.minPurchase')}: {product.minPurchaseQuantity} {product.unit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cantidad solicitada */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t('offer.requestedQty')} ({product.unit}) *
              </label>
              <input
                type="number"
                required
                min={product.minPurchaseQuantity || 1}
                max={product.quantity}
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-900 font-semibold transition-all"
              />
            </div>

            {/* Precio ofrecido por unidad */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t('offer.offeredPrice')} *
              </label>
              <input
                type="number"
                required
                min="100"
                value={offeredPricePerUnit}
                onChange={(e) => setOfferedPricePerUnit(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-900 font-semibold transition-all"
              />
            </div>
          </div>

          {/* Método de Recogida */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t('offer.pickupMethod')} *
            </label>
            <select
              value={pickupMethod}
              onChange={(e) => setPickupMethod(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="Recogida en sede del vendedor" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {t('offer.pickupSeller')}
              </option>
              <option value="Transporte solidario contratado" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {t('offer.pickupTransport')}
              </option>
              <option value="Envío acordado" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {t('offer.pickupAgreed')}
              </option>
            </select>
          </div>

          {/* Fecha propuesta */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t('offer.proposedDate')} *
            </label>
            <input
              type="date"
              required
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:bg-white transition-all cursor-pointer"
            />
          </div>

          {/* Mensaje al establecimiento */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t('offer.messageLabel')}
            </label>
            <textarea
              rows={2}
              placeholder={t('offer.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-emerald-600 focus:bg-white transition-all"
            />
          </div>

          {/* Resumen Oferta Total */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-300 block">{t('offer.totalCalculated')}:</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {requestedQuantity} {product.unit} × ${offeredPricePerUnit.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 block uppercase">{t('offer.totalCalculated')}:</span>
              <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                ${totalOffered.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {t('offer.cancelBtn')}
            </button>
            <button
              type="submit"
              id="btn-send-offer-submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : t('offer.sendOfferBtn')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
