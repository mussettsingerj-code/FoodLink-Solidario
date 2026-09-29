import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { CommissionPricing, DurationDays, ThemeMode } from '../../types';
import { DEFAULT_COMMISSION_PRICING } from '../../data/initialData';
import {
  User,
  Building2,
  Sliders,
  ShieldCheck,
  Bell,
  Save,
  RotateCcw,
  LogOut,
  DollarSign,
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    theme,
    setTheme,
    toggle2FA,
    logout,
    commissionPricing,
    updateCommissionPricing,
    resetCommissionPricing,
    showToast,
  } = useApp();

  const { language, setLanguage } = useI18n();

  const [activeTab, setActiveTab] = useState<
    'perfil' | 'preferencias' | 'seguridad' | 'tarifas'
  >('perfil');

  // Datos de usuario, organización y contacto
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [organizationName, setOrganizationName] = useState(
    currentUser?.organizationName || ''
  );
  const [nitOrId, setNitOrId] = useState(currentUser?.nitOrId || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Medellín');

  // Sincronizar campos cuando el usuario alterna de rol o actualiza perfil
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setOrganizationName(currentUser.organizationName || '');
      setNitOrId(currentUser.nitOrId || '');
      setPhone(currentUser.phone || '');
      setCity(currentUser.city || 'Medellín');
    }
  }, [currentUser]);

  // Preferencias de notificaciones
  const [notifNewOffers, setNotifNewOffers] = useState(true);
  const [notifExpiringLots, setNotifExpiringLots] = useState(true);
  const [notifChatMessages, setNotifChatMessages] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(false);

  // Configuración de tarifas de publicación
  const [editablePricing, setEditablePricing] =
    useState<CommissionPricing>(commissionPricing);
  const durationDaysList: DurationDays[] = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim(),
      email: email.trim(),
      organizationName: organizationName.trim(),
      nitOrId: nitOrId.trim(),
      phone: phone.trim(),
      city,
    });
  };

  const handleSavePreferences = () => {
    showToast('Preferencias de plataforma y notificaciones guardadas', 'success');
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommissionPricing(editablePricing);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Perfil y configuración
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra tu información de usuario, datos de tu organización, preferencias, notificaciones y seguridad.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Pestañas de Configuración */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
        {[
          { id: 'perfil', label: 'Usuario y organización', icon: User },
          { id: 'preferencias', label: 'Preferencias y notificaciones', icon: Sliders },
          { id: 'seguridad', label: 'Seguridad y acceso', icon: ShieldCheck },
          { id: 'tarifas', label: 'Tarifas de publicación', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer ${
                active
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Información de Usuario, Empresa/Organización y Contacto */}
      {activeTab === 'perfil' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6"
        >
          {/* Resumen Superior */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
              {(name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {name || 'Usuario Solidario'}
                </h2>
                {currentUser?.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {organizationName} · Rol activo:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {currentUser?.role === 'establishment'
                    ? 'Empresa / Establecimiento'
                    : currentUser?.role === 'admin'
                    ? 'Administrador'
                    : 'Organización / Fundación'}
                </strong>
              </p>
            </div>
          </div>

          {/* Grupo 1: Información de Usuario */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Información de usuario y contacto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nombre completo del responsable *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Correo electrónico corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Teléfono / WhatsApp de contacto *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Ciudad principal de operación *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                >
                  <option value="Medellín">Medellín</option>
                  <option value="Bogotá">Bogotá</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Pereira">Pereira</option>
                  <option value="Cartagena">Cartagena</option>
                  <option value="Manizales">Manizales</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grupo 2: Empresa u Organización */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Empresa u organización representada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Razón social o nombre de la organización *
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  NIT o identificación tributaria *
                </label>
                <input
                  type="text"
                  required
                  value={nitOrId}
                  onChange={(e) => setNitOrId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar cambios del perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Preferencias y Notificaciones */}
      {activeTab === 'preferencias' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Preferencias de visualización e idioma
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tema de la interfaz
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'light', label: 'Claro' },
                      { id: 'dark', label: 'Oscuro' },
                      { id: 'system', label: 'Sistema' },
                    ] as { id: ThemeMode; label: string }[]
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTheme(mode.id)}
                      className={`py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        theme === mode.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Idioma de la plataforma
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'es', label: 'Español (CO)' },
                    { id: 'en', label: 'English (US)' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id as any)}
                      className={`py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        language === lang.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Alertas y notificaciones automáticas</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                {
                  label: 'Nuevas ofertas y contraofertas recibidas',
                  desc: 'Notificar inmediatamente cuando una organización envíe una propuesta por un lote.',
                  checked: notifNewOffers,
                  onChange: setNotifNewOffers,
                },
                {
                  label: 'Alertas de lotes próximos a vencer (< 24h)',
                  desc: 'Recordatorio prioritario antes de que finalice el tiempo contratado de publicación.',
                  checked: notifExpiringLots,
                  onChange: setNotifExpiringLots,
                },
                {
                  label: 'Mensajes en el módulo de negociaciones',
                  desc: 'Avisos en tiempo real cuando un participante escriba en el chat de acuerdo.',
                  checked: notifChatMessages,
                  onChange: setNotifChatMessages,
                },
                {
                  label: 'Reporte semanal de impacto social y ambiental',
                  desc: 'Resumen por correo con los kilogramos rescatados y certificados de operación.',
                  checked: notifWeeklySummary,
                  onChange: setNotifWeeklySummary,
                },
              ].map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar preferencias</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Seguridad */}
      {activeTab === 'seguridad' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Autenticación en dos pasos (2FA) y sesión
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Protege las operaciones comerciales y acuerdos de tu organización con código de verificación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggle2FA(!currentUser?.twoFactorEnabled)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                currentUser?.twoFactorEnabled
                  ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {currentUser?.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar verificación 2FA'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Estado de verificación 2FA
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {currentUser?.twoFactorEnabled
                  ? 'Habilitado. Se solicitará confirmación de seguridad al iniciar sesión en nuevos dispositivos.'
                  : 'Inactivo. Activa el segundo factor para blindar el acceso a tu cuenta.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Proveedor de autenticación
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Sesión sincronizada mediante Firebase Authentication y almacenamiento seguro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Tarifas de Publicación (Administración) */}
      {activeTab === 'tarifas' && (
        <form
          onSubmit={handleSavePricing}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tabla de micro-comisiones por tiempo de publicación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Valores en pesos colombianos (COP) aplicados automáticamente en el paso 5 de publicación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetCommissionPricing();
                setEditablePricing({ ...DEFAULT_COMMISSION_PRICING });
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer valores base</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {durationDaysList.map((days) => (
              <div
                key={days}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {days} {days === 1 ? 'día' : 'días'}
                </span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={editablePricing[days]}
                    onChange={(e) =>
                      setEditablePricing((prev) => ({
                        ...prev,
                        [days]: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y actualizar tarifas</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
