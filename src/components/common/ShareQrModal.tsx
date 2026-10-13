import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, QrCode, Share2, Smartphone } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin || window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || !shareUrl) return;

    QRCode.toCanvas(
      canvasRef.current,
      shareUrl,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('Error generating QR code:', error);
      }
    );
  }, [isOpen, shareUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'FoodLink-Solidario-QR.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-all my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 id="qr-modal-title" className="font-bold text-sm font-display text-white">
              {t('qr.title', 'Escanear y Compartir')}
            </h3>
          </div>
          <button
            type="button"
            id="btn-close-qr-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60 focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4 overflow-y-auto">
          <div className="inline-flex items-center justify-center bg-white rounded-xl p-1.5 shadow-2xs border border-slate-200 dark:border-slate-700 mx-auto">
            <img
              src="/logo.png"
              alt="FoodLink Solidario"
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t(
              'qr.instructions',
              'Apunta con la cámara de tu celular para acceder directamente a la plataforma Publik Solidario o compartirla con tu comunidad.'
            )}
          </p>

          {/* QR Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-inner inline-block mx-auto">
            <canvas ref={canvasRef} className="rounded-lg max-w-full" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('qr.mobileReady', 'Compatible con iOS y Android')}</span>
          </div>

          {/* URL Pill & Copy */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="flex-1 truncate px-2 text-left text-slate-600 dark:text-slate-300 font-mono text-[11px]">
              {shareUrl}
            </span>
            <button
              type="button"
              id="btn-copy-share-url"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('qr.copied', 'Copiado') : t('qr.copy', 'Copiar')}</span>
            </button>
          </div>

          {/* Download button */}
          <button
            type="button"
            id="btn-download-qr"
            onClick={handleDownload}
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('qr.downloadPng', 'Descargar imagen QR')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
