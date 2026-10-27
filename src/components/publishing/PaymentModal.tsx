import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, CreditCard, ShieldCheck, X, ArrowRight, Loader2, QrCode } from 'lucide-react';
import { DurationDays } from '../../types';
import { useI18n } from '../../i18n/I18nContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  quantityText: string;
  durationDays: DurationDays;
  commissionCOP: number;
  onPaymentSuccess: (paymentMethod: string) => void;
  isRenewal?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  productName,
  quantityText,
  durationDays,
  commissionCOP,
  onPaymentSuccess,
  isRenewal = false,
}) => {
  const { t, language } = useI18n();
  const [selectedMethod, setSelectedMethod] = useState<'nequi' | 'pse' | 'card' | 'daviplata'>('nequi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Method specifics
  const [phoneNumber, setPhoneNumber] = useState('312 456 7890');
  const [selectedBank, setSelectedBank] = useState('Bancolombia');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4092');

  if (!isOpen) return null;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Fire festive eco confetti
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24'],
        });
      } catch (err) {
        console.error(err);
      }

      let methodName = 'Nequi';
      if (selectedMethod === 'pse') methodName = `PSE (${selectedBank})`;
      if (selectedMethod === 'card') methodName = 'Tarjeta de Crédito / Débito';
      if (selectedMethod === 'daviplata') methodName = 'Daviplata';

      onPaymentSuccess(methodName);
    }, 1500);
  };

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 3600 * 1000);
  const locale = language === 'en' ? 'en-US' : 'es-CO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
              Publik Solidario • {t('payment.gatewayTitle', 'Pasarela de Comisión')}
            </span>
            <h3 className="text-lg font-bold font-display text-white">
              {isSuccess
                ? t('payment.confirmedTitle', '¡Pago Confirmado!')
                : isRenewal
                ? t('renewal.modalTitle', 'Renovación de Publicación')
                : t('payment.title', 'Pago de Comisión de Publicación')}
            </h3>
          </div>
          {!isProcessing && (
            <button
              type="button"
              id="btn-close-payment-modal"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 transition-all cursor-pointer border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Resumen de Publicación */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('payment.orderSummary', 'Resumen de la orden')}
                </h4>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{t('publish.nameLabel')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[240px]">{productName}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{t('publish.quantityLabel')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{quantityText}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{t('renewal.currentDuration')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{durationDays} {durationDays === 1 ? t('landing.dayUnit', 'día') : t('landing.daysUnit', 'días')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">{t('publish.commissionFee')}:</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    ${commissionCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                  <span>{t('payment.vatIncluded', 'IVA incluido (19%):')}</span>
                  <span>$0 COP ({t('payment.subsidizedRate', 'Tarifa social subsidiada')})</span>
                </div>
              </div>

              {/* Métodos de Pago Simulados */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2.5">
                  {t('payment.selectMethod', 'Selecciona tu método de pago')}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Nequi */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('nequi')}
                    className={`p-3 rounded-xl border flex flex-col items-start text-left transition-all cursor-pointer ${
                      selectedMethod === 'nequi'
                        ? 'border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 ring-2 ring-fuchsia-500/20'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm text-fuchsia-950 dark:text-fuchsia-200">Nequi</span>
                      <QrCode className="w-4 h-4 text-fuchsia-700 dark:text-fuchsia-400" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('payment.nequiHint', 'Pago instantáneo móvil')}</span>
                  </button>

                  {/* PSE */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('pse')}
                    className={`p-3 rounded-xl border flex flex-col items-start text-left transition-all cursor-pointer ${
                      selectedMethod === 'pse'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">PSE</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">ACH</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('payment.pseHint', 'Cuentas débito/ahorro')}</span>
                  </button>

                  {/* Daviplata */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('daviplata')}
                    className={`p-3 rounded-xl border flex flex-col items-start text-left transition-all cursor-pointer ${
                      selectedMethod === 'daviplata'
                        ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm text-rose-950 dark:text-rose-200">Daviplata</span>
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded">Móvil</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('payment.daviplataHint', 'Monedero Davivienda')}</span>
                  </button>

                  {/* Tarjeta Débito / Crédito */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-start text-left transition-all cursor-pointer ${
                      selectedMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">{t('payment.card', 'Tarjeta')}</span>
                      <CreditCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Visa, Mastercard</span>
                  </button>

                </div>
              </div>

              {/* Dynamic Inputs depending on payment method */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                {selectedMethod === 'nequi' && (
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      {t('payment.nequiPhone', 'Número de celular Nequi registrado:')}
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-emerald-600"
                      placeholder="3XX XXX XXXX"
                    />
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('payment.pushAuthHint', 'Recibirás una notificación push en tu app Nequi para autorizar.')}</p>
                  </div>
                )}

                {selectedMethod === 'pse' && (
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      {t('payment.selectBank', 'Selecciona tu entidad financiera:')}
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-emerald-600"
                    >
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="Banco de Occidente">Banco de Occidente</option>
                      <option value="Banco Popular">Banco Popular</option>
                      <option value="BBVA Colombia">BBVA Colombia</option>
                      <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                    </select>
                  </div>
                )}

                {selectedMethod === 'daviplata' && (
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      {t('payment.daviplataPhone', 'Número Daviplata:')}
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-emerald-600"
                      placeholder="3XX XXX XXXX"
                    />
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">{t('payment.cardNumber', 'Número de tarjeta:')}</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                        placeholder="MM/AA"
                      />
                      <input
                        type="password"
                        defaultValue="782"
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                        placeholder="CVV"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security guarantee */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('payment.encryptedGuarantee', 'Transacción encriptada con certificación SSL y monitoreo antifraude.')}</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="btn-confirm-payment"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('payment.processing', 'Procesando pago seguro...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('payment.payBtn', 'Pagar')} ${commissionCOP.toLocaleString('es-CO')} COP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Pantalla de Pago Exitoso */
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-6 ring-emerald-50 dark:ring-emerald-950/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  {t('payment.approved', 'Transacción Aprobada')}
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  {t('payment.listingActive', '¡Tu publicación está activa!')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t('payment.availableNowDesc', 'Tu oferta ya está disponible para fundaciones y compradores interesados en Colombia.')}
                </p>
              </div>

              {/* Detalle de Confirmación */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('publish.nameLabel')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{productName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('renewal.currentDuration')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{durationDays} {durationDays === 1 ? t('landing.dayUnit', 'día') : t('landing.daysUnit', 'días')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('payment.startDate', 'Fecha de inicio:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {startDate.toLocaleDateString(locale)} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('payment.endDate', 'Fecha de finalización:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {endDate.toLocaleDateString(locale)} {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('renewal.paidFee')}:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">${commissionCOP.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 dark:text-slate-400">{t('product.condition')}:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {t('dashboard.active')}
                  </span>
                </div>
              </div>

              {/* Botón Ver publicación */}
              <button
                type="button"
                id="btn-view-publication-success"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all cursor-pointer text-xs sm:text-sm"
              >
                {t('payment.viewInCatalog', 'Ver publicación en catálogo')}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
