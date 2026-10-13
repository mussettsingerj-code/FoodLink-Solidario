import React, { useEffect } from 'react';
import { PublishProductView } from '../modules/PublishProductView';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

interface PublishFoodModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PublishFoodModal: React.FC<PublishFoodModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { isPublishModalOpen, setIsPublishModalOpen } = useApp();
  const { t } = useI18n();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isPublishModalOpen;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setIsPublishModalOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        <div className="px-5 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {t('app.name', 'FoodLink Solidario')}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('publish.title', 'Publicar lote solidario')}
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-publish-food-modal"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scroll">
          <PublishProductView isModal={true} onSuccessClose={handleClose} />
        </div>
      </div>
    </div>
  );
};
