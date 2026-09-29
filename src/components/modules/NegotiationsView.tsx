import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductOffer } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { DeliveryCertificateModal } from '../common/DeliveryCertificateModal';
import { EmptyState } from '../common/EmptyState';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Truck,
  Calendar,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export const NegotiationsView: React.FC = () => {
  const {
    offers,
    currentUser,
    respondToOffer,
    sendMessageToOffer,
    selectedOfferIdForNegotiation,
    setSelectedOfferIdForNegotiation,
    setCurrentView,
    loadDemoData,
  } = useApp();

  const [activeOfferId, setActiveOfferId] = useState<string | null>(
    selectedOfferIdForNegotiation || (offers[0]?.id ?? null)
  );
  const [mobileShowList, setMobileShowList] = useState<boolean>(!selectedOfferIdForNegotiation);
  const [messageText, setMessageText] = useState('');
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

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeOffer?.id, activeOffer?.messages.length]);

  const handleSelectThread = (id: string) => {
    setActiveOfferId(id);
    setSelectedOfferIdForNegotiation(null);
    setIsCounterOpen(false);
    setMobileShowList(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOffer || !messageText.trim()) return;
    sendMessageToOffer(activeOffer.id, messageText.trim());
    setMessageText('');
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Negociaciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sala de conversación directa entre empresas y organizaciones para acordar entregas.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={MessageSquare}
            title="No tienes negociaciones activas todavía."
            description="Cuando realices o recibas una oferta por un producto, podrás conversar y acordar los términos de entrega aquí."
            actionLabel="Explorar productos"
            onAction={() => setCurrentView('catalog')}
            secondaryLabel="Cargar negociaciones de ejemplo"
            onSecondaryAction={loadDemoData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Negociaciones
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comunícate en tiempo real para coordinar precios, cantidades y horarios de recogida.
        </p>
      </div>

      {/* Contenedor Tipo Chat de Dos Paneles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Panel Izquierdo: Lista de Conversaciones (4 columnas en escritorio, alternable en móvil) */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex-col ${
            mobileShowList ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Conversaciones ({offers.length})
            </span>
            <span className="text-[11px] text-slate-400">Ordenadas por actividad</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[520px] custom-scroll">
            {offers.map((thread) => {
              const isSelected = activeOffer?.id === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleSelectThread(thread.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-2 border-l-emerald-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                    <ProductImage src={thread.productImageUrl} alt={thread.productName} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {thread.productName}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                        {lastMsg?.timestamp || 'Hoy'}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                      {thread.buyerOrganization} ↔ {thread.sellerName}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-400 truncate">
                        {lastMsg?.text || 'Sin mensajes'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold shrink-0 ${
                          thread.status === 'aceptada'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : thread.status === 'rechazada'
                            ? 'text-rose-600 dark:text-rose-400'
                            : thread.status === 'contraoferta'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {thread.status === 'aceptada'
                          ? 'Aceptada'
                          : thread.status === 'rechazada'
                          ? 'Rechazada'
                          : thread.status === 'contraoferta'
                          ? 'En negociación'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Derecho: Sala de Chat Activa (8 columnas) */}
        {activeOffer && (
          <div
            className={`lg:col-span-8 flex-col h-full ${
              mobileShowList ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Botón de regreso a lista en móviles */}
            <div className="lg:hidden px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileShowList(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a conversaciones ({offers.length})</span>
              </button>
            </div>

            {/* Cabecera del Chat: Producto, Participantes, Estado, Última Actividad */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <ProductImage src={activeOffer.productImageUrl} alt={activeOffer.productName} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {activeOffer.productName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Participantes: <strong className="text-slate-700 dark:text-slate-200">{activeOffer.buyerOrganization}</strong> ↔{' '}
                    <strong className="text-slate-700 dark:text-slate-200">{activeOffer.sellerName}</strong>
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>
                      Última actividad: {activeOffer.messages[activeOffer.messages.length - 1]?.timestamp || 'Hace un momento'}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                      {activeOffer.requestedQuantity} {activeOffer.unit} por ${activeOffer.totalOfferedPrice.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y Controles de Decisión */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activeOffer.status !== 'aceptada' && activeOffer.status !== 'rechazada' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => respondToOffer(activeOffer.id, 'aceptada')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aceptar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCounterPrice(activeOffer.offeredPricePerUnit);
                        setCounterQty(activeOffer.requestedQuantity);
                        setIsCounterOpen(!isCounterOpen);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Contraofertar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => respondToOffer(activeOffer.id, 'rechazada')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                        activeOffer.status === 'aceptada'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {activeOffer.status === 'aceptada' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Operación aceptada</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Oferta rechazada</span>
                        </>
                      )}
                    </span>

                    {activeOffer.status === 'aceptada' && (
                      <button
                        type="button"
                        onClick={() => setOfferForCertificate(activeOffer)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generar acta de entrega</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panel Desplegable de Contraoferta */}
            {isCounterOpen && (
              <form
                onSubmit={handleSendCounter}
                className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Proponer nuevos términos de negociación
                  </span>
                  <span className="font-mono tabular-nums font-bold text-amber-800 dark:text-amber-300">
                    Nuevo total: ${(counterPrice * counterQty).toLocaleString('es-CO')} COP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">
                      Precio por {activeOffer.unit} (COP)
                    </label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">
                      Cantidad ({activeOffer.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={counterQty}
                      onChange={(e) => setCounterQty(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCounterOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                    >
                      Enviar propuesta
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Resumen de Condiciones de Entrega */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modalidad: <strong>{activeOffer.pickupMethod}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha propuesta: <strong>{activeOffer.proposedDate}</strong></span>
              </span>
            </div>

            {/* Historial de Mensajes */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40 max-h-[380px] custom-scroll"
            >
              {activeOffer.messages.map((msg) => {
                const isOwn =
                  currentUser &&
                  (msg.senderId === currentUser.id ||
                    (currentUser.role === 'establishment' && msg.senderRole === 'establishment'));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {msg.senderName}
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-lg p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {msg.isOfferProposal && (
                        <div
                          className={`mb-2 pb-2 border-b text-xs font-mono tabular-nums font-semibold ${
                            isOwn
                              ? 'border-white/20 text-emerald-50'
                              : 'border-slate-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          Propuesta económica: ${msg.proposedPrice?.toLocaleString('es-CO')} / {activeOffer.unit} · Total: $
                          {((msg.proposedPrice || 0) * (msg.proposedQuantity || 1)).toLocaleString('es-CO')} COP
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formulario de Envío de Mensaje */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe un mensaje para coordinar horario, transporte o condiciones..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-emerald-600"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  messageText.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Acta de Entrega en PDF (Exclusivo para operaciones Aceptadas) */}
      <DeliveryCertificateModal
        offer={offerForCertificate}
        onClose={() => setOfferForCertificate(null)}
      />
    </div>
  );
};
