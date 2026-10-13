import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  Heart,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Smartphone,
  ExternalLink,
  Globe,
  Sun,
  Moon,
  Monitor,
  FileText,
  Lock,
  Leaf,
  HelpCircle,
} from 'lucide-react';
import { ShareQrModal } from './ShareQrModal';
import { FooterInfoModal, FooterModalType } from './FooterInfoModal';

export const Footer: React.FC = () => {
  const { language, setLanguage, themeMode, setThemeMode } = useApp();
  const { t } = useI18n();

  const [activeModal, setActiveModal] = useState<FooterModalType>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && qrCanvasRef.current) {
      const url = window.location.origin || window.location.href;
      QRCode.toCanvas(
        qrCanvasRef.current,
        url,
        {
          width: 90,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error drawing footer QR:', error);
        }
      );
    }
  }, []);

  const isEn = language === 'en';

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 pt-12 pb-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Circular Initiative */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="inline-flex items-center justify-center bg-emerald-50 dark:bg-slate-800 rounded-xl p-2 border border-emerald-100 dark:border-slate-700">
                <img
                  src="/logo.png"
                  alt="FoodLink Solidario"
                  className="h-9 w-9 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white block leading-none">
                  FoodLink <span className="text-emerald-600 dark:text-emerald-400">Solidario</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mt-0.5">
                  {isEn ? 'B2B Food Rescue Network' : 'Red de Rescate Alimentario'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isEn
                ? 'Circular technology connecting food establishments with verified buyers and foundations to eliminate waste and maximize social impact.'
                : 'Plataforma tecnológica de economía circular que conecta establecimientos con excedentes de alimentos con compradores y fundaciones.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isEn ? 'Colombian Circular Economy Initiative' : 'Iniciativa de Economía Circular en Colombia'}</span>
            </div>

            {/* Quick QR Mini Section */}
            <div className="pt-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
                <div className="p-1 bg-white rounded-lg shadow-2xs shrink-0">
                  <canvas ref={qrCanvasRef} className="rounded w-16 h-16 block" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider block flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {isEn ? 'Scan & Share' : 'Escanear / Compartir'}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {isEn ? 'Open on mobile phone' : 'Accede desde tu celular'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>{isEn ? 'View QR' : 'Ver QR'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Enlaces (Legal & Institutional) */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs font-display">
              {isEn ? 'Information & Legal' : 'Enlaces'}
            </h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isEn ? 'Privacy Policy' : 'Política de Privacidad'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isEn ? 'Terms of Service' : 'Términos de Servicio'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('sustainability')}
                  className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isEn ? 'Sustainability Report' : 'Reporte de Sostenibilidad'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('help')}
                  className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isEn ? 'Help Center' : 'Centro de Ayuda'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Canales y Aliados */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs font-display">
              {isEn ? 'Channels & Partners' : 'Canales y Aliados'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              {isEn
                ? 'Direct assistance for commercial establishments, foundations, and suppliers:'
                : 'Atención personalizada a comercios aliados, fundaciones e instituciones:'}
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="mailto:mussettsingerj@gmail.com"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isEn ? 'Official Email' : 'Correo Oficial'}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    mussettsingerj@gmail.com
                  </span>
                </div>
              </a>

              <a
                href="tel:+573045263106"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isEn ? 'Direct Line / WhatsApp' : 'Línea Directa / WhatsApp'}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    +57 304 526 3106
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 4: Presencia Nacional (Únicamente Medellín y Valle de Aburrá) */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs font-display">
              {isEn ? 'National Presence' : 'Presencia Nacional'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {isEn
                ? 'Active logistics coverage and regional operations hub:'
                : 'Zona de cobertura y nodo logístico principal activo:'}
            </p>
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Medellín y Valle de Aburrá</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                {isEn
                  ? 'Active network servicing municipalities across the metropolitan valley.'
                  : 'Red operativa activa con cobertura en el área metropolitana del Valle de Aburrá.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Language, Theme, Made With */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} FoodLink Solidario Colombia. {isEn ? 'All rights reserved.' : 'Todos los derechos reservados.'}</p>

          {/* Permanent Language & Theme Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switch */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-400 mx-1" />
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Español"
              >
                🇨🇴 ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="English"
              >
                🇺🇸 EN
              </button>
            </div>

            {/* Theme Switch */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={t('profile.light')}
                aria-label={t('profile.light')}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={t('profile.dark')}
                aria-label={t('profile.dark')}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={t('profile.system')}
                aria-label={t('profile.system')}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>{isEn ? 'Crafted for zero waste' : 'Diseñado para cero desperdicio'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline ml-1" />
          </div>
        </div>

      </div>

      {/* Share QR Modal */}
      <ShareQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Reusable Info Modal for Privacy, Terms, Sustainability & Help */}
      <FooterInfoModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </footer>
  );
};
