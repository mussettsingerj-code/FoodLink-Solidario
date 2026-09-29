import React from 'react';
import { PublishProductView } from '../modules/PublishProductView';
import { X } from 'lucide-react';

interface PublishFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishFoodModal: React.FC<PublishFoodModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Publik Solidario
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Publicar producto
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-publish-food-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[82vh] overflow-y-auto custom-scroll">
          <PublishProductView isModal={true} onSuccessClose={onClose} />
        </div>
      </div>
    </div>
  );
};
