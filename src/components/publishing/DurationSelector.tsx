import React from 'react';
import { DurationDays, FoodCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { SMART_RECOMMENDATIONS } from '../../data/initialData';
import { Sparkles, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DurationSelectorProps {
  selectedDays: DurationDays;
  onChange: (days: DurationDays) => void;
  category?: FoodCategory;
  startDate?: Date;
  idPrefix?: string;
  isRenewal?: boolean;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDays,
  onChange,
  category,
  startDate = new Date(),
  idPrefix = 'duration',
  isRenewal = false,
}) => {
  const { commissionPricing, getCommissionForDays } = useApp();
  const { t, language } = useI18n();

  const durationOptions: DurationDays[] = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];

  // Calculate recommendation based on food category
  const recommendation = category ? SMART_RECOMMENDATIONS[category] : null;
  const isRecommended = (days: DurationDays) => recommendation?.recommendedDays === days;

  // Calculate expiration date string
  const expirationDate = new Date(startDate.getTime() + selectedDays * 24 * 3600 * 1000);
  const formattedExpiration = expirationDate.toLocaleString(language === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const selectedCommission = getCommissionForDays(selectedDays);

  return (
    <div className="space-y-4">
      {/* Header & Smart Recommendation Callout */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>
            {isRenewal
              ? t('renewal.extendDurationTitle', 'Extender publicación por:')
              : t('publish.howLongQuestion', '¿Durante cuánto tiempo quieres publicar este alimento?')}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {t('publish.regulatedFees', 'Valores regulados en COP')}
          </span>
        </label>

        {recommendation && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
              recommendation.alertType === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : recommendation.alertType === 'info'
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            }`}
          >
            {recommendation.alertType === 'warning' ? (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <span>💡 {t('publish.smartRecommendationTitle', 'Sistema Inteligente de Duración FoodLink')}:</span>
                <span className="px-2 py-0.5 bg-white/80 dark:bg-slate-800 rounded-full font-bold border border-current text-xs">
                  {t('publish.suggestedBadge', 'Sugerido')}: {recommendation.recommendedDays} {recommendation.recommendedDays === 1 ? t('landing.dayUnit', 'día') : t('landing.daysUnit', 'días')}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{recommendation.reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* 10 Duration Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {durationOptions.map((days) => {
          const isSelected = selectedDays === days;
          const recommended = isRecommended(days);
          const price = commissionPricing[days] ?? getCommissionForDays(days);

          return (
            <button
              type="button"
              key={days}
              id={`${idPrefix}-option-${days}`}
              onClick={() => onChange(days)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
              }`}
            >
              {recommended && (
                <span className="absolute -top-2.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-0.5">
                  ⭐ {t('publish.suggestedBadge', 'Sugerido')}
                </span>
              )}

              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {days} {days === 1 ? t('landing.dayUnit', 'día') : t('landing.daysUnit', 'días')}
              </span>

              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                ${price.toLocaleString('es-CO')} COP
              </span>

              {isSelected && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('publish.selectedState', 'Seleccionado')}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Expiration & Commission Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('publish.calculatedValidity', 'Vigencia calculada')}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {t('publish.availableUntil', 'Tu publicación estará disponible hasta el')}{' '}
              <span className="text-emerald-700 dark:text-emerald-400 capitalize">{formattedExpiration}</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-right shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('publish.publishingFeeLabel', 'Comisión de publicación')}:</span>
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
            ${selectedCommission.toLocaleString('es-CO')} COP
          </span>
        </div>
      </div>
    </div>
  );
};
