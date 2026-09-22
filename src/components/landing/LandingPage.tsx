import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Recycle,
  ShoppingBag,
  Building2,
  Clock,
  CheckCircle2,
  Leaf,
  DollarSign,
  ChevronRight,
  Truck,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setIsPublishModalOpen, commissionPricing } = useApp();
  const { t } = useI18n();

  return (
    <div className="space-y-16 pb-12 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-8 sm:p-14 lg:p-20 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>{t('landing.heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] text-white">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            {t('landing.heroSubtitle')}
          </p>

          {/* Call to action buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              id="hero-btn-publish"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center gap-2.5 text-base cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>{t('landing.heroBtnPublish')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              id="hero-btn-catalog"
              onClick={() => setCurrentView('catalog')}
              className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2.5 text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <span>{t('landing.heroBtnCatalog')}</span>
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('landing.trustMicro1')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('landing.trustMicro2')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('landing.trustMicro3')}</span>
            </span>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 2. REAL-TIME IMPACT STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('landing.stats.rescuedFoodLabel')}
          </span>
          <span className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 font-display block mt-1">
            {t('landing.stats.rescuedFood')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('landing.stats.rescuedFoodSub')}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('landing.stats.rationsServedLabel')}
          </span>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-display block mt-1">
            {t('landing.stats.rationsServed')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('landing.stats.rationsServedSub')}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('landing.stats.moneyRecoveredLabel')}
          </span>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 font-display block mt-1">
            {t('landing.stats.moneyRecovered')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('landing.stats.moneyRecoveredSub')}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('landing.stats.co2AvoidedLabel')}
          </span>
          <span className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400 font-display block mt-1">
            {t('landing.stats.co2Avoided')}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('landing.stats.co2AvoidedSub')}
          </p>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA FOODLINK SOLIDARIO */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
            {t('landing.howItWorksTag')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-slate-100">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t('landing.howItWorksDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Para Establecimientos */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {t('landing.estTitle')}
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                  {t('landing.estSubtitle')}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.estStep1Title')} </strong>
                  {t('landing.estStep1Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.estStep2Title')} </strong>
                  {t('landing.estStep2Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.estStep3Title')} </strong>
                  {t('landing.estStep3Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.estStep4Title')} </strong>
                  {t('landing.estStep4Desc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {t('landing.estBtn')}
            </button>
          </div>

          {/* Para Fundaciones y Compradores */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  {t('landing.buyerTitle')}
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                  {t('landing.buyerSubtitle')}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.buyerStep1Title')} </strong>
                  {t('landing.buyerStep1Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.buyerStep2Title')} </strong>
                  {t('landing.buyerStep2Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.buyerStep3Title')} </strong>
                  {t('landing.buyerStep3Desc')}
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p>
                  <strong className="text-slate-900 dark:text-white">{t('landing.buyerStep4Title')} </strong>
                  {t('landing.buyerStep4Desc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('catalog')}
              className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer border border-slate-700/50"
            >
              {t('landing.buyerBtn')}
            </button>
          </div>

        </div>
      </section>

      {/* 4. MODELO DE COMISIONES TRANSPARENTE */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
            {t('landing.pricingTag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-slate-100">
            {t('landing.pricingTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {t('landing.pricingDesc')}
          </p>
        </div>

        {/* Pricing Table / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { days: 1, label: '1 día', desc: 'Súper perecederos' },
            { days: 2, label: '2 días', desc: 'Maduración avanzada' },
            { days: 3, label: '3 días', desc: 'Más popular', popular: true },
            { days: 4, label: '4 días', desc: 'Lácteos frescos' },
            { days: 5, label: '5 días', desc: 'Fruver fresco' },
            { days: 6, label: '6 días', desc: 'Semana completa' },
            { days: 7, label: '7 días', desc: '1 semana' },
            { days: 14, label: '14 días', desc: '2 semanas' },
            { days: 21, label: '21 días', desc: '3 semanas' },
            { days: 30, label: '30 días', desc: '1 mes / Abarrotes' },
          ].map((item) => {
            const price = commissionPricing[item.days as any] || 1000;
            return (
              <div
                key={item.days}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all text-center relative ${
                  item.popular
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {item.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {t('landing.recommended')}
                  </span>
                )}
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">{item.label}</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 block my-1">
                  ${price.toLocaleString('es-CO')}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">{item.desc}</span>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {t('landing.supportIncluded')}
            </span>
          </div>
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer"
          >
            {t('landing.publishWithRate')}
          </button>
        </div>
      </section>

      {/* 5. TESTIMONIOS Y CONFIANZA */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
            {t('landing.testimonialsTag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-slate-100">
            {t('landing.testimonialsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <p className="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed">
              {t('landing.test1Quote')}
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black flex items-center justify-center text-sm">
                CR
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                  {t('landing.test1Author')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('landing.test1Role')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <p className="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed">
              {t('landing.test2Quote')}
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-black flex items-center justify-center text-sm">
                MP
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                  {t('landing.test2Author')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('landing.test2Role')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <p className="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed">
              {t('landing.test3Quote')}
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black flex items-center justify-center text-sm">
                AG
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                  {t('landing.test3Author')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('landing.test3Role')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PREGUNTAS FRECUENTES (FAQ) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
            {t('landing.faqTag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-slate-100">
            {t('landing.faqTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{t('landing.faq1Q')}</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              {t('landing.faq1A')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{t('landing.faq2Q')}</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              {t('landing.faq2A')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{t('landing.faq3Q')}</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              {t('landing.faq3A')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{t('landing.faq4Q')}</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              {t('landing.faq4A')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
