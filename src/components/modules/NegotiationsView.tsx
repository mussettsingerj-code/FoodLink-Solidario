import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProductOffer, OfferMessage } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { DeliveryCertificateModal } from '../common/DeliveryCertificateModal';
import { EmptyState } from '../common/EmptyState';
import {
  subscribeToConversationMessages,
  markConversationAsReadInFirestore,
} from '../../services/firestoreService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  ArrowLeft,
  FileText,
  AlertCircle,
  Store,
  ShoppingBag,
  DollarSign,
  Package,
  Check,
  MapPin,
} from 'lucide-react';

export const NegotiationsView: React.FC = () => {
  const {
    offers,
    products,
    currentUser,
    userProfile,
    respondToOffer,
    sendMessageToOffer,
    selectedOfferIdForNegotiation,
    setSelectedOfferIdForNegotiation,
    setCurrentView,
  } = useApp();

  const [activeOfferId, setActiveOfferId] = useState<string | null>(
    selectedOfferIdForNegotiation || (offers[0]?.id ?? null)
  );
  const [mobileShowList, setMobileShowList] = useState<boolean>(!selectedOfferIdForNegotiation);
  const [messageText, setMessageText] = useState('');
  const [liveMessages, setLiveMessages] = useState<OfferMessage[]>([]);
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterQty, setCounterQty] = useState<number>(0);
  const [offerForCertificate, setOfferForCertificate] = useState<ProductOffer | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedOfferIdForNegotiation) {
      setActiveOfferId(selectedOfferIdForNegotiation);
      setMobileShowList(false);
    } else if (!activeOfferId && offers.length > 0) {
      setActiveOfferId(offers[0].id);
    }
  }, [selectedOfferIdForNegotiation, offers]);

  const activeOffer = offers.find((o) => o.id === activeOfferId) || offers[0] || null;
  const activeProduct = products.find((p) => p.id === activeOffer?.productId);

  // Suscripción en tiempo real a los mensajes de la subcolección de Firestore
  useEffect(() => {
    if (!activeOffer?.id) {
      setLiveMessages([]);
      return;
    }

    const unsubscribe = subscribeToConversationMessages(
      activeOffer.id,
      (msgs) => {
        setLiveMessages(msgs);
      },
      (err) => {
        console.warn('Suscripción a mensajes de negociación:', err);
      }
    );

    const userRole: 'buyer' | 'seller' = userProfile?.role === 'seller' ? 'seller' : 'buyer';
    markConversationAsReadInFirestore(activeOffer.id, userRole);

    return () => {
      unsubscribe();
    };
  }, [activeOffer?.id, userProfile?.id, currentUser?.id]);

  const displayedMessages = liveMessages.length > 0 ? liveMessages : (activeOffer?.messages || []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeOffer?.id, displayedMessages.length]);

  const handleSelectThread = (id: string) => {
    setActiveOfferId(id);
    setSelectedOfferIdForNegotiation(null);
    setIsCounterOpen(false);
    setMobileShowList(false);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeOffer || !messageText.trim()) return;
    sendMessageToOffer(activeOffer.id, messageText.trim());
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOffer || counterPrice <= 0) return;
    const qty = counterQty > 0 ? counterQty : activeOffer.requestedQuantity;
    respondToOffer(
      activeOffer.id,
      'contraoferta',
      counterPrice,
      qty,
      `Contraoferta formal: $${counterPrice.toLocaleString('es-CO')} COP por ${activeOffer.unit} para ${qty} ${activeOffer.unit}.`
    );
    setIsCounterOpen(false);
  };

  if (offers.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-display">
            Negociaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sala de conversación directa entre compradores y vendedores para coordinar entregas solidarias.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-10 sm:p-14 text-center">
          <EmptyState
            icon={MessageSquare}
            title="No tienes negociaciones activas todavía."
            description="Cuando realices o recibas una oferta por un producto del catálogo, podrás conversar y acordar los términos aquí."
            actionLabel="Explorar productos"
            onAction={() => setCurrentView('catalog')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-display">
          Negociaciones
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comunícate en tiempo real para coordinar precios solidarios, cantidades y horarios de recogida.
        </p>
      </div>

      {/* Contenedor Tipo Chat de Dos Paneles con Card Elevation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] shadow-xs">
        {/* Panel Izquierdo: Lista de Conversaciones */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/50 dark:bg-slate-900/40 ${
            mobileShowList ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Conversaciones ({offers.length})
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              Tiempo real
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto max-h-[540px] custom-scroll">
            {offers.map((thread) => {
              const isSelected = activeOffer?.id === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleSelectThread(thread.id)}
                  className={`w-full p-4 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-l-emerald-500 shadow-2xs'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                    <ProductImage src={thread.productImageUrl} alt={thread.productName} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                        {thread.productName}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                        {lastMsg?.timestamp || 'Hoy'}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {thread.buyerOrganization} ↔ {thread.sellerName}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-400 truncate">
                        {lastMsg?.text || 'Sin mensajes'}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          thread.status === 'aceptada'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : thread.status === 'rechazada'
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                            : thread.status === 'contraoferta'
                            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {thread.status === 'aceptada'
                          ? 'Aceptada'
                          : thread.status === 'rechazada'
                          ? 'Rechazada'
                          : thread.status === 'contraoferta'
                          ? 'Contraoferta'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Derecho: Sala de Chat Activa */}
        {activeOffer && (
          <div
            className={`lg:col-span-8 flex-col h-full bg-white dark:bg-slate-900 ${
              mobileShowList ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Botón de regreso a lista en móviles */}
            <div className="lg:hidden px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileShowList(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a conversaciones</span>
              </button>
            </div>

            {/* Cabecera del Chat: Producto, Participantes y Acciones Rápidas */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <ProductImage src={activeOffer.productImageUrl} alt={activeOffer.productName} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate font-display">
                      {activeOffer.productName}
                    </h2>
                    {activeProduct?.barrio && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                        {activeProduct.barrio} · Comuna 8
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeOffer.buyerOrganization} ↔ {activeOffer.sellerName}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap mt-0.5">
                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {activeOffer.requestedQuantity.toLocaleString('es-CO')} {activeOffer.unit} • ${activeOffer.totalOfferedPrice.toLocaleString('es-CO')} COP
                    </p>
                    {activeProduct?.locationReference && (
                      <span className="text-[10px] text-slate-400 truncate max-w-xs">
                        Ref: {activeProduct.locationReference}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones del Chat */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activeOffer.status === 'aceptada' ? (
                  <button
                    type="button"
                    onClick={() => setOfferForCertificate(activeOffer)}
                    className="btn-interaction px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Certificado de Entrega</span>
                  </button>
                ) : activeOffer.status !== 'rechazada' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => respondToOffer(activeOffer.id, 'aceptada')}
                      className="btn-interaction px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aceptar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCounterOpen(!isCounterOpen)}
                      className="btn-interaction px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Contraofertar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => respondToOffer(activeOffer.id, 'rechazada')}
                      className="btn-interaction px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                    Oferta finalizada (Rechazada)
                  </span>
                )}
              </div>
            </div>

            {/* Contraoferta Drawer Expandible */}
            <AnimatePresence>
              {isCounterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 p-4"
                >
                  <form onSubmit={handleSendCounter} className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 block">
                      Proponer Contraoferta Formal
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Precio por unidad (COP)
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={counterPrice || ''}
                          onChange={(e) => setCounterPrice(Number(e.target.value))}
                          placeholder="Ej: 8000"
                          className="modern-input w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Cantidad a retirar ({activeOffer.unit})
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={counterQty || ''}
                          onChange={(e) => setCounterQty(Number(e.target.value))}
                          placeholder={`Por defecto: ${activeOffer.requestedQuantity}`}
                          className="modern-input w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCounterOpen(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Enviar Contraoferta
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mensajes del Hilo */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[380px] custom-scroll bg-slate-50/30 dark:bg-slate-950/20"
            >
              {displayedMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  Inicia la conversación para acordar detalles con la contraparte.
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const currentUserId = userProfile?.id || currentUser?.id;
                  const isMe = currentUserId ? msg.senderId === currentUserId : (msg.senderRole === userProfile?.role);
                  const isCounterparty = !isMe;
                  const canActOnProposal = isCounterparty && (activeOffer.status === 'pendiente' || activeOffer.status === 'contraoferta');

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl shadow-2xs space-y-2 ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                          <span className="font-bold">
                            {isMe ? 'Tú' : msg.senderName} ({msg.senderRole === 'seller' ? 'Vendedor' : 'Comprador'})
                          </span>
                          <span className="font-mono tabular-nums">{msg.timestamp}</span>
                        </div>

                        {/* Texto del mensaje */}
                        {msg.text && (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}

                        {/* Tarjeta de propuesta económica estructurada */}
                        {(msg.isOfferProposal || msg.proposedPrice) && msg.proposedPrice && (
                          <div
                            className={`p-3 rounded-xl border mt-2 space-y-2 text-xs ${
                              isMe
                                ? 'bg-emerald-700/80 border-emerald-500/50 text-white'
                                : 'bg-slate-50 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-800/80 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5 text-xs">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Propuesta Solidaria</span>
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  activeOffer.status === 'aceptada'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : activeOffer.status === 'rechazada'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {activeOffer.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-lg bg-black/10 dark:bg-black/25">
                                <span className="opacity-75 block text-[10px]">Precio unitario:</span>
                                <span className="font-bold">${msg.proposedPrice.toLocaleString('es-CO')} COP/{activeOffer.unit}</span>
                              </div>
                              <div className="p-2 rounded-lg bg-black/10 dark:bg-black/25">
                                <span className="opacity-75 block text-[10px]">Cantidad:</span>
                                <span className="font-bold">{msg.proposedQuantity || activeOffer.requestedQuantity} {activeOffer.unit}</span>
                              </div>
                            </div>

                            <div className="p-2 rounded-lg bg-emerald-900/20 dark:bg-emerald-900/40 flex items-center justify-between text-xs font-bold">
                              <span className="opacity-80 text-[11px]">Total propuesto:</span>
                              <span className="text-sm font-black text-emerald-400 dark:text-emerald-300">
                                ${(msg.proposedPrice * (msg.proposedQuantity || activeOffer.requestedQuantity)).toLocaleString('es-CO')} COP
                              </span>
                            </div>

                            {/* Botones de acción directa si la propuesta está pendiente y el usuario es la contraparte */}
                            {canActOnProposal && (
                              <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/40 dark:border-emerald-800/60">
                                <button
                                  type="button"
                                  onClick={() => respondToOffer(activeOffer.id, 'aceptada')}
                                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Aceptar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounterPrice(msg.proposedPrice || 0);
                                    setCounterQty(msg.proposedQuantity || activeOffer.requestedQuantity);
                                    setIsCounterOpen(true);
                                  }}
                                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Contraofertar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => respondToOffer(activeOffer.id, 'rechazada')}
                                  title="Rechazar propuesta"
                                  className="py-1.5 px-2.5 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isMe && (
                        <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          Tú
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input para Enviar Mensaje con soporte Enter y Shift+Enter */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2 bg-white dark:bg-slate-900"
            >
              <textarea
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje (Enter para enviar, Shift+Enter para salto de línea)..."
                className="modern-input flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-emerald-600 dark:focus:outline-emerald-500 resize-none max-h-24 transition-all"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!messageText.trim()}
                className="btn-interaction p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl cursor-pointer shadow-md shadow-emerald-950/20 disabled:cursor-not-allowed shrink-0"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Certificado */}
      {offerForCertificate && (
        <DeliveryCertificateModal
          offer={offerForCertificate}
          onClose={() => setOfferForCertificate(null)}
        />
      )}
    </div>
  );
};
