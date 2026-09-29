import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { Heart, ShieldCheck, Mail, Phone, MapPin, QrCode, Smartphone, ExternalLink } from 'lucide-react';
import { ShareQrModal } from './ShareQrModal';

export const Footer: React.FC = () => {
  const { setCurrentView, setIsPublishModalOpen, isAuthenticated, navigateWithGuard } = useApp();
  const { t } = useI18n();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && qrCanvasRef.current) {
      const url = window.location.origin || window.location.href;
      QRCode.toCanvas(
        qrCanvasRef.current,
        url,
        {
          width: 96,
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

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-2">
            <div
              onClick={() => setCurrentView('landing')}
              className="cursor-pointer inline-flex items-center gap-3 group"
            >
              <div className="inline-flex items-center justify-center bg-white rounded-xl p-1.5 shadow-2xs border border-slate-700">
                <img
                  src="/logo.png"
                  alt="Publik Solidario"
                  className="h-11 sm:h-12 w-11 sm:w-12 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight text-white block leading-none">
                  Publik <span className="text-emerald-400">Solidario</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mt-0.5">
                  Red de Rescate Alimentario
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              «{t('app.tagline')}». {t('app.description')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('footer.circularInitiative')}</span>
            </div>

            {/* Escanear / Compartir QR Section */}
            <div className="pt-2">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-3.5 max-w-sm shadow-xs">
                <div className="p-1 bg-white rounded-xl shadow-xs shrink-0">
                  <canvas ref={qrCanvasRef} className="rounded-lg w-20 h-20 block" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    {t('footer.scanShare', 'Escanear / Compartir')}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {t('footer.scanShareDesc', 'Accede o comparte desde tu celular')}
                  </p>
                  <button
                    type="button"
                    id="btn-footer-open-qr"
                    onClick={() => setIsQrModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span>{t('footer.openQr', 'Ver Código QR')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Links 1: Plataforma */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              {t('footer.platform')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('footer.homeProposal')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('footer.foodCatalog')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigateWithGuard('dashboard');
                      return;
                    }
                    setIsPublishModalOpen(true);
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('footer.publishFood')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('organizations')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Empresas y Organizaciones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateWithGuard('dashboard')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('footer.dashboards')}
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2: Ciudades de Cobertura */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              {t('footer.nationalPresence')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('footer.medellin')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('footer.bogota')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('footer.cali')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('footer.barranquilla')}</span>
              </li>
            </ul>
          </div>

          {/* Contacto y Pagos */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              {t('footer.alliances')}
            </h4>
            <p className="text-slate-400">
              {t('footer.support')}
            </p>
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.contact')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.phone')}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1">{t('footer.paymentMethods')}</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Nequi</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Daviplata</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">PSE</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Bancolombia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t('app.copyright')}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{t('app.madeWith')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline ml-1" />
          </div>
        </div>
      </div>

      {/* Share QR Modal */}
      <ShareQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </footer>
  );
};
