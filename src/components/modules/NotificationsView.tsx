import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, NotificationType } from '../../types';
import { EmptyState } from '../common/EmptyState';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Package,
  ArrowRight,
  AlertTriangle,
  Mail,
  RefreshCw,
  XCircle,
  MessageSquare,
  Calendar,
  Eye,
  X,
  Filter,
} from 'lucide-react';

interface EmailOutboxEntry {
  id: string;
  to: string;
  recipientName: string;
  from: string;
  subject: string;
  eventType: string;
  title: string;
  message: string;
  actionLabel: string;
  htmlBody: string;
  status: 'sent' | 'queued_local';
  provider: string;
  sentAt: string;
}

const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  {
    label: string;
    colorClass: string;
    iconBgClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  publicacion_menos_6h: {
    label: 'Menos de 6h para vencer',
    colorClass: 'text-rose-700 dark:text-rose-400',
    iconBgClass: 'bg-rose-600 text-white',
    icon: AlertTriangle,
  },
  publicacion_proxima_finalizar: {
    label: 'Próxima a vencer (< 24h)',
    colorClass: 'text-amber-700 dark:text-amber-400',
    iconBgClass: 'bg-amber-500 text-white',
    icon: Clock,
  },
  nueva_oferta: {
    label: 'Oferta recibida',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-600 text-white',
    icon: FileSpreadsheet,
  },
  nueva_contraoferta: {
    label: 'Contraoferta recibida',
    colorClass: 'text-amber-700 dark:text-amber-400',
    iconBgClass: 'bg-amber-600 text-white',
    icon: MessageSquare,
  },
  oferta_aceptada: {
    label: 'Oferta aceptada',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-600 text-white',
    icon: CheckCircle2,
  },
  oferta_rechazada: {
    label: 'Oferta rechazada',
    colorClass: 'text-rose-700 dark:text-rose-400',
    iconBgClass: 'bg-slate-700 text-white',
    icon: XCircle,
  },
  mensaje_recibido: {
    label: 'Mensaje en negociación',
    colorClass: 'text-slate-700 dark:text-slate-300',
    iconBgClass: 'bg-slate-800 text-white',
    icon: MessageSquare,
  },
  publicacion_activada: {
    label: 'Publicación activada',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-600 text-white',
    icon: Package,
  },
  publicacion_finalizada: {
    label: 'Publicación finalizada',
    colorClass: 'text-slate-600 dark:text-slate-400',
    iconBgClass: 'bg-slate-600 text-white',
    icon: Package,
  },
  pago_realizado: {
    label: 'Pago confirmado',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-600 text-white',
    icon: CheckCircle2,
  },
};

function formatNotificationDate(isoDate?: string, fallbackTimestamp?: string): string {
  if (!isoDate) return fallbackTimestamp || 'Reciente';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return fallbackTimestamp || 'Reciente';
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fallbackTimestamp || 'Reciente';
  }
}

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    toggleNotificationRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
    checkProductExpirations,
    setCurrentView,
    setSelectedOfferIdForNegotiation,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
  } = useApp();

  const [readFilter, setReadFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [previewNotif, setPreviewNotif] = useState<NotificationItem | null>(null);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [outboxEmails, setOutboxEmails] = useState<EmailOutboxEntry[]>([]);
  const [providerConfigured, setProviderConfigured] = useState(false);

  const readNotificationsCount = notifications.length - unreadNotificationsCount;

  const fetchEmailOutbox = () => {
    fetch('/api/notifications/email-outbox')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.outbox)) {
          setOutboxEmails(data.outbox);
        }
        setProviderConfigured(Boolean(data?.providerConfigured));
      })
      .catch(() => {
        // ignore offline fallback
      });
  };

  useEffect(() => {
    fetchEmailOutbox();
  }, [notifications.length]);

  const filteredNotifications = notifications.filter((n) => {
    if (readFilter === 'no_leidas' && n.read) return false;
    if (readFilter === 'leidas' && !n.read) return false;

    if (typeFilter !== 'todos') {
      if (typeFilter === 'vencimientos') {
        return (
          n.type === 'publicacion_menos_6h' ||
          n.type === 'publicacion_proxima_finalizar' ||
          n.type === 'publicacion_finalizada'
        );
      }
      return n.type === typeFilter;
    }

    return true;
  });

  const handleGoToOperation = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.relatedOfferId) {
      setSelectedOfferIdForNegotiation(notif.relatedOfferId);
      if (notif.type === 'nueva_oferta' || notif.type === 'oferta_rechazada') {
        setCurrentView('offers');
      } else {
        setCurrentView('negotiations');
      }
    } else if (notif.relatedProductId) {
      if (
        notif.type === 'publicacion_menos_6h' ||
        notif.type === 'publicacion_proxima_finalizar' ||
        notif.type === 'publicacion_finalizada'
      ) {
        setCurrentView('my_publications');
      } else {
        setSelectedProductIdForDetail(notif.relatedProductId);
      }
    }
  };

  const getOperationLinkLabel = (notif: NotificationItem): string => {
    if (notif.relatedOfferId) {
      if (notif.type === 'nueva_oferta') return 'Revisar oferta';
      if (notif.type === 'nueva_contraoferta') return 'Responder contraoferta';
      if (notif.type === 'oferta_aceptada') return 'Ir a la negociación';
      if (notif.type === 'oferta_rechazada') return 'Ver estado de oferta';
      return 'Ver negociación';
    }
    if (notif.relatedProductId) {
      if (notif.type === 'publicacion_menos_6h' || notif.type === 'publicacion_proxima_finalizar') {
        return 'Gestionar publicación';
      }
      return 'Ver producto';
    }
    return 'Ver operación';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecera y Acciones del Sistema de Alertas */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Centro de Notificaciones y Alertas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             Monitoreo de vencimientos (&lt; 24h y &lt; 6h), ofertas, contraofertas y notificaciones por correo electrónico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              checkProductExpirations(true);
              fetchEmailOutbox();
            }}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificar vencimientos ahora</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchEmailOutbox();
              setIsOutboxOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>Correos generados ({outboxEmails.length || notifications.length})</span>
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas como leídas ({unreadNotificationsCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros: Estado (No leídas / Leídas / Todas) + Tipo de Notificación */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pestañas: Todas / No leídas / Leídas */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'todas', label: 'Todas', count: notifications.length },
            { id: 'no_leidas', label: 'No leídas', count: unreadNotificationsCount },
            { id: 'leidas', label: 'Leídas', count: readNotificationsCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReadFilter(tab.id as 'todas' | 'no_leidas' | 'leidas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                readFilter === tab.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Selector por Tipo de Notificación */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            Tipo:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo de notificación"
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            <option value="todos" className="bg-white dark:bg-slate-800">
              Todos los tipos
            </option>
            <option value="publicacion_menos_6h" className="bg-white dark:bg-slate-800">
              Alerta urgente (&lt; 6 horas para vencer)
            </option>
            <option value="publicacion_proxima_finalizar" className="bg-white dark:bg-slate-800">
              Publicación próxima a vencer (&lt; 24h)
            </option>
            <option value="nueva_oferta" className="bg-white dark:bg-slate-800">
              Oferta recibida
            </option>
            <option value="nueva_contraoferta" className="bg-white dark:bg-slate-800">
              Contraoferta recibida
            </option>
            <option value="oferta_aceptada" className="bg-white dark:bg-slate-800">
              Oferta aceptada
            </option>
            <option value="oferta_rechazada" className="bg-white dark:bg-slate-800">
              Oferta rechazada
            </option>
          </select>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={Bell}
            title={
              readFilter === 'no_leidas'
                ? 'No tienes notificaciones pendientes por leer'
                : readFilter === 'leidas'
                ? 'Aún no tienes notificaciones marcadas como leídas'
                : 'No se encontraron notificaciones con este filtro'
            }
            description="El sistema detecta automáticamente publicaciones próximas a vencer (< 24h y < 6h), nuevas ofertas, contraofertas, aceptaciones y rechazos."
            actionLabel="Ver todas las notificaciones"
            onAction={() => {
              setReadFilter('todas');
              setTypeFilter('todos');
            }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredNotifications.map((notif) => {
            const meta =
              NOTIFICATION_TYPE_META[notif.type] || NOTIFICATION_TYPE_META.publicacion_activada;
            const IconComponent = meta.icon;
            const formattedDate = formatNotificationDate(notif.createdAt, notif.timestamp);

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  !notif.read
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/15 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/25'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Icono semántico según el tipo de alerta */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.read
                        ? meta.iconBgClass
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Fila superior: Tipo de notificación · Estado (No leída / Leída) · Fecha */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className={`font-bold ${meta.colorClass}`}>{meta.label}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span
                        className={`font-semibold ${
                          !notif.read
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {!notif.read ? '● No leída' : 'Leída'}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono tabular-nums text-[11px]">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Título y Mensaje */}
                    <h3
                      className={`text-sm ${
                        !notif.read
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-semibold text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadatos de Correo Electrónico */}
                    {notif.recipientEmail && (
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            Correo:{' '}
                            <strong className="font-medium text-slate-700 dark:text-slate-300">
                              {notif.recipientEmail}
                            </strong>
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewNotif(notif)}
                          className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver correo enviado</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones: Marcar leída/no leída + Enlace directo a la operación */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                  {(notif.relatedOfferId || notif.relatedProductId) && (
                    <button
                      type="button"
                      onClick={() => handleGoToOperation(notif)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>{getOperationLinkLabel(notif)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {notif.relatedProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        setSelectedProductIdForDetail(notif.relatedProductId || null);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                    >
                      Ficha del lote
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleNotificationRead(notif.id)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 cursor-pointer whitespace-nowrap"
                  >
                    {notif.read ? 'Marcar como no leída' : 'Marcar como leída'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Previsualización del Correo Electrónico Transaccional */}
      {previewNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden shadow-2xl my-auto">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">
                  Vista previa de Notificación por Correo Electrónico
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNotif(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Para:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {previewNotif.recipientName || 'Usuario'} &lt;{previewNotif.recipientEmail}&gt;
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Asunto:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {previewNotif.emailSubject || `[Publik Solidario] ${previewNotif.title}`}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Fecha:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {formatNotificationDate(previewNotif.createdAt, previewNotif.timestamp)}
                  </span>
                </div>
              </div>

              {/* Cuerpo del correo */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white text-slate-900">
                <div className="bg-slate-900 p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Publik Solidario · Alerta Automática
                  </span>
                  <h4 className="text-base font-bold mt-1">{previewNotif.title}</h4>
                </div>
                <div className="p-5 space-y-4 text-sm">
                  <p className="text-slate-700">
                    Hola <strong>{previewNotif.recipientName || 'Usuario Solidario'}</strong>,
                  </p>
                  <div className="p-4 bg-slate-50 border-l-4 border-emerald-600 rounded-r-lg text-slate-800 leading-relaxed">
                    {previewNotif.message}
                  </div>
                  <p className="text-xs text-slate-500">
                    Puedes acceder directamente a la operación haciendo clic en el siguiente enlace dentro de la plataforma:
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewNotif;
                        setPreviewNotif(null);
                        handleGoToOperation(target);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{getOperationLinkLabel(previewNotif)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bandeja de Salida de Correos y Estado de Configuración Externa */}
      {isOutboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">
                  Registro de Correos Transaccionales (/api/notifications/email-outbox)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div
                className={`p-3.5 rounded-xl border ${
                  providerConfigured
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                <p className="font-bold">
                  {providerConfigured
                    ? 'Proveedor de correo externo activo'
                    : 'Modo Bandeja Transaccional Local activo (Sin credenciales externas inventadas)'}
                </p>
                <p className="mt-1 leading-relaxed opacity-90">
                  {providerConfigured
                    ? 'Los correos se están despachando a través del proveedor configurado en las variables de entorno.'
                    : 'Todos los eventos generan el correo HTML real en el servidor. Para despacharlos hacia bandejas externas en producción, configura RESEND_API_KEY o SMTP_HOST / SMTP_USER / SMTP_PASS en las variables de entorno.'}
                </p>
              </div>

              {outboxEmails.length === 0 ? (
                <p className="text-slate-500 py-6 text-center">
                  Realiza una oferta, contraoferta, aceptación o verificación de vencimientos para ver el registro en vivo de despachos del servidor.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {outboxEmails.map((item) => (
                    <div key={item.id} className="p-3.5 space-y-1 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.subject}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {formatNotificationDate(item.sentAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Destinatario: <strong>{item.to}</strong> ({item.recipientName})
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
