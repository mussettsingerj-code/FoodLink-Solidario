import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { DurationDays, FoodProduct } from '../../types';
import { DurationSelector } from './DurationSelector';
import { PaymentModal } from './PaymentModal';
import { X, Clock, RefreshCw } from 'lucide-react';

interface RenewalModalProps {
  product: FoodProduct | null;
  onClose: () => void;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({ product, onClose }) => {
  const { renewProduct, getCommissionForDays } = useApp();
  const { t, language } = useI18n();
  const [selectedDays, setSelectedDays] = useState<DurationDays>(3);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!product) return null;

  const commissionCost = getCommissionForDays(selectedDays);

  const handleOpenPayment = () => {
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentMethod: string) => {
    renewProduct(product.id, selectedDays, paymentMethod);
    setTimeout(() => {
      setIsPaymentOpen(false);
      onClose();
    }, 1500);
  };

  // Remaining time / status description
  const currentExpiry = new Date(product.expiresAt);
  const now = new Date();
  const isAlreadyExpired = currentExpiry.getTime() <= now.getTime();
  const locale = language === 'en' ? 'en-US' : 'es-CO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                {t('renewal.validityExtension', 'Extensión de Vigencia')}
              </span>
              <h3 className="text-lg font-bold font-display text-white">
                {t('renewal.modalTitle', 'Renovar Publicación')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-renewal-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 transition-colors cursor-pointer border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Info del producto actual */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                {product.category}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{product.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAlreadyExpired ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    ⚠️ {t('renewal.expiredOn', 'Expirada el')} {currentExpiry.toLocaleDateString(locale)}
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">
                    {t('product.expires')}: {currentExpiry.toLocaleDateString(locale)} ({currentExpiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Selector de Duración Reutilizable */}
          <DurationSelector
            selectedDays={selectedDays}
            onChange={setSelectedDays}
            category={product.category}
            startDate={isAlreadyExpired ? new Date() : currentExpiry}
            idPrefix="renewal"
            isRenewal={true}
          />

          {/* Action Button */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {t('catalog.cancel', 'Cancelar')}
            </button>
            <button
              type="button"
              id="btn-confirm-renewal"
              onClick={handleOpenPayment}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('renewal.extendAndPay', 'Extender y pagar')} ${commissionCost.toLocaleString('es-CO')} COP</span>
            </button>
          </div>
        </div>

      </div>

      {/* Payment modal for renewal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        productName={`${t('renewal.extensionPrefix', 'Extensión:')} ${product.name}`}
        quantityText={`${product.quantity} ${product.unit}`}
        durationDays={selectedDays}
        commissionCOP={commissionCost}
        onPaymentSuccess={handlePaymentSuccess}
        isRenewal={true}
      />
    </div>
  );
};
