import React, { useState, useEffect, useRef } from 'react';
import { ProductOffer, OfferMessage } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { ProductImage } from '../common/ProductImage';
import { DeliveryCertificateModal } from '../common/DeliveryCertificateModal';
import { subscribeToConversationMessages, markConversationAsReadInFirestore } from '../../services/firestoreService';
import {
  X,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  AlertCircle,
  Truck,
  FileText,
  MapPin,
} from 'lucide-react';

interface NegotiationChatModalProps {
  offerId: string | null;
  onClose: () => void;
}

export const NegotiationChatModal: React.FC<NegotiationChatModalProps> = ({ offerId, onClose }) => {
  const { offers, products, respondToOffer, sendMessageToOffer, currentUser, userProfile, currentRole } = useApp();
  const { t, language } = useI18n();

  const [messageText, setMessageText] = useState('');
  const [liveMessages, setLiveMessages] = useState<OfferMessage[]>([]);
  const [isCounterOfferOpen, setIsCounterOfferOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterQty, setCounterQty] = useState<number>(0);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);

  const offer = offers.find((o) => o.id === offerId);
  const product = products.find((p) => p.id === offer?.productId);

  // Suscripción en tiempo real a los mensajes de la subcolección
  useEffect(() => {
    if (!offerId) {
      setLiveMessages([]);
      return;
    }
    const unsubscribe = subscribeToConversationMessages(offerId, (msgs) => {
      setLiveMessages(msgs);
    });

    const userRole: 'buyer' | 'seller' = userProfile?.role === 'seller' ? 'seller' : 'buyer';
    markConversationAsReadInFirestore(offerId, userRole);

    return () => {
      unsubscribe();
    };
  }, [offerId, userProfile?.id, currentUser?.id]);

  const displayedMessages = liveMessages.length > 0 ? liveMessages : (offer?.messages || []);

  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [offerId, displayedMessages.length]);

  if (!offerId || !offer) return null;

  const isSeller = currentRole === 'seller' || (currentUser ? currentUser.id === offer.sellerId : false);
  const locale = language === 'en' ? 'en-US' : 'es-CO';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageToOffer(offer.id, messageText);
    setMessageText('');
  };

  const handleAccept = () => {
    respondToOffer(offer.id, 'aceptada');
  };

  const handleReject = () => {
    respondToOffer(offer.id, 'rechazada');
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (counterPrice <= 0) return;
    respondToOffer(
      offer.id,
      'contraoferta',
      counterPrice,
      counterQty || offer.requestedQuantity,
      `${t('negotiation.counterOfferTitle', 'Contraoferta formal')}: $${counterPrice.toLocaleString('es-CO')} ${t('catalog.perUnit', 'por unidad')} ${t('negotiation.forQuantity', 'para')} ${counterQty || offer.requestedQuantity} ${offer.unit}.`
    );
    setIsCounterOfferOpen(false);
  };

  // Status badge styling
  let statusBadge = {
    text: t('negotiation.pendingStatus', 'En negociación / Pendiente'),
    bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800',
    icon: Clock,
  };

  if (offer.status === 'aceptada') {
    statusBadge = {
      text: t('negotiation.acceptedStatus', '¡Oferta Aceptada y Concretada!'),
      bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
      icon: CheckCircle2,
    };
  } else if (offer.status === 'rechazada') {
    statusBadge = {
      text: t('negotiation.rejectedStatus', 'Oferta Rechazada'),
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800',
      icon: XCircle,
    };
  } else if (offer.status === 'contraoferta') {
    statusBadge = {
      text: t('negotiation.counterStatus', 'Contraoferta en revisión'),
      bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800',
      icon: RefreshCw,
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              <ProductImage
                src={offer.productImageUrl}
                alt={offer.productName}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {t('negotiation.moduleTitle', 'Módulo de Negociación Solidaria')}
                </span>
                {product?.barrio && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                    {product.barrio} · Comuna 8
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base font-display truncate max-w-xs sm:max-w-md text-white">
                {offer.productName}
              </h3>
              <p className="text-xs text-slate-400">
                {offer.buyerOrganization} ↔ {offer.sellerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-negotiation-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${statusBadge.bg}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusBadge.text}</span>
            </div>

            {offer.status === 'aceptada' && (
              <button
                type="button"
                onClick={() => setIsCertificateOpen(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generar acta de entrega</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
            <span>
              {t('publish.quantityLabel')}: <strong className="text-slate-900 dark:text-slate-100">{offer.requestedQuantity} {offer.unit}</strong>
            </span>
            <span>
              {t('negotiation.totalOffered', 'Total ofrecido')}: <strong className="text-emerald-700 dark:text-emerald-400">${offer.totalOfferedPrice.toLocaleString('es-CO')} COP</strong>
            </span>
          </div>
        </div>

        {/* Action Panel for Seller (Establishment) */}
        {isSeller && offer.status !== 'aceptada' && offer.status !== 'rechazada' && (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t('negotiation.sellerActionsNotice', 'Acciones del establecimiento para esta propuesta:')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-offer-accept"
                onClick={handleAccept}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('negotiation.acceptOfferBtn', 'Aceptar Oferta')}</span>
              </button>

              <button
                type="button"
                id="btn-offer-counter"
                onClick={() => {
                  setCounterPrice(offer.offeredPricePerUnit);
                  setCounterQty(offer.requestedQuantity);
                  setIsCounterOfferOpen(!isCounterOfferOpen);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('negotiation.counterOfferBtn', 'Contraofertar')}</span>
              </button>

              <button
                type="button"
                id="btn-offer-reject"
                onClick={handleReject}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span>{t('negotiation.rejectOfferBtn', 'Rechazar')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Counter Offer Drawer */}
        {isCounterOfferOpen && (
          <form onSubmit={handleSendCounter} className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 space-y-3 text-xs">
            <span className="font-bold text-blue-950 dark:text-blue-200 block">
              {t('negotiation.makeCounterTitle', 'Formular Contraoferta al Comprador:')}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('negotiation.newPriceLabel', 'Nuevo precio por')} {offer.unit} (COP):
                </label>
                <input
                  type="number"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('negotiation.adjustedQtyLabel', 'Cantidad ajustada')} ({offer.unit}):
                </label>
                <input
                  type="number"
                  required
                  value={counterQty}
                  onChange={(e) => setCounterQty(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-emerald-600"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300">
                {t('negotiation.newTotalProposed', 'Nuevo total propuesto')}: <strong className="text-blue-900 dark:text-blue-300 font-bold">${(counterPrice * counterQty).toLocaleString('es-CO')} COP</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCounterOfferOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {t('catalog.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {t('negotiation.sendCounterBtn', 'Enviar Contraoferta')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Messages Scroll Area */}
        <div
          ref={messagesScrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950 text-sm"
        >
          {/* Terms info card */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('offer.pickupMethod')}: <strong>{offer.pickupMethod}</strong></span>
            </span>
            <span>{t('offer.proposedDate')}: <strong>{new Date(offer.proposedDate).toLocaleDateString(locale)}</strong></span>
          </div>

          {displayedMessages.map((msg) => {
            const currentUserId = userProfile?.id || currentUser?.id;
            const isMe = currentUserId ? msg.senderId === currentUserId : false;
            const isCounterparty = !isMe;
            const canActOnProposal = isCounterparty && (offer.status === 'pendiente' || offer.status === 'contraoferta');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mb-1 px-1">
                  {isMe ? 'Tú' : msg.senderName} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-md p-3.5 rounded-2xl shadow-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Tarjeta de propuesta si corresponde */}
                  {(msg.isOfferProposal || msg.proposedPrice) && msg.proposedPrice && (
                    <div className={`mb-2 pb-2 border-b text-xs font-bold ${isMe ? 'border-white/20 text-emerald-100' : 'border-slate-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-400'}`}>
                      📋 {t('negotiation.economicProposal', 'Propuesta económica')}: ${msg.proposedPrice.toLocaleString('es-CO')} c/u • {t('payment.totalToPay')}: ${(msg.proposedPrice * (msg.proposedQuantity || offer.requestedQuantity)).toLocaleString('es-CO')} COP
                      {canActOnProposal && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => respondToOffer(offer.id, 'aceptada')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCounterPrice(msg.proposedPrice || 0);
                              setCounterQty(msg.proposedQuantity || offer.requestedQuantity);
                              setIsCounterOfferOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Contraofertar
                          </button>
                          <button
                            type="button"
                            onClick={() => respondToOffer(offer.id, 'rechazada')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input con Enter y Shift+Enter */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2"
        >
          <textarea
            rows={1}
            placeholder={t('negotiation.typeMessagePlaceholder', 'Escribe un mensaje de negociación (Enter para enviar, Shift+Enter para nueva línea)...')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageText.trim()) {
                  sendMessageToOffer(offer.id, messageText.trim());
                  setMessageText('');
                }
              }
            }}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className={`p-2.5 rounded-lg shadow-xs transition-colors shrink-0 ${
              messageText.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={t('negotiation.sendMessageBtn', 'Enviar mensaje')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Modal de Acta de Entrega en PDF (Exclusivo para operaciones Aceptadas) */}
      <DeliveryCertificateModal
        offer={isCertificateOpen && offer.status === 'aceptada' ? offer : null}
        onClose={() => setIsCertificateOpen(false)}
      />
    </div>
  );
};
