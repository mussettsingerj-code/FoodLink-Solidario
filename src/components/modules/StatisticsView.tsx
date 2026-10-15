import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  PackageCheck,
  Award,
  BarChart3,
  PlusCircle,
  Sparkles,
  Heart,
  Globe2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { AnimatedNumber } from '../common/AnimatedNumber';

export const StatisticsView: React.FC = () => {
  const {
    products,
    offers,
    commissions,
    formatCOP,
    userProfile,
    isAuthenticated,
    setActiveTab,
  } = useApp();
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  // Security guard: Exclusively for authenticated sellers
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return null;
  }

  // Strictly calculate real metrics from the authenticated seller's own data
  const myProducts = products.filter((p) => p.sellerId === userProfile.id);
  const myOffers = offers.filter((o) => o.sellerId === userProfile.id);
  const myAcceptedOffers = myOffers.filter((o) => o.status === 'aceptada');

  const totalPublished = myProducts.length;
  const completedSales =
    myProducts.filter((p) => p.status === 'vendida').length + myAcceptedOffers.length;
  const totalRevenue = myAcceptedOffers.reduce((acc, o) => acc + o.totalOfferedPrice, 0);
  const totalCommissionsPaid = commissions.reduce((acc, c) => acc + c.commission, 0);
  const totalKgRescued = myAcceptedOffers.reduce((acc, o) => acc + o.requestedQuantity, 0);

  // Environmental and social estimations
  const co2AvoidedKg = Math.round(totalKgRescued * 2.5);
  const mealsServed = totalKgRescued * 4;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl bg-gradient-to-br from-[#0B2117] via-[#123826] to-[#081811] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-emerald-900/60"
      >
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('statistics.tag')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              {t('statistics.title')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              {t('statistics.subtitle')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-emerald-200 text-xs font-bold backdrop-blur-md shrink-0">
            <Award className="w-4 h-4 text-emerald-300" />
            <span>{t('statistics.certificateActive')}</span>
          </div>
        </div>
      </motion.div>

      {/* Top 4 KPI Cards (100% Real Data) with Dynamic Number Counters */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {t('statistics.foodRescued')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              <AnimatedNumber value={totalKgRescued} />{' '}
              <span className="text-sm font-semibold text-slate-400">kg / unid</span>
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('statistics.foodRescuedSub')}</span>
            </p>
          </div>
        </div>

        <div className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {t('statistics.moneyRecovered')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatCOP(totalRevenue)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              {t('statistics.moneyRecoveredSub')}
            </p>
          </div>
        </div>

        <div className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {t('statistics.lotsPublished')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              <AnimatedNumber value={totalPublished} />
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1.5">
              {completedSales} {t('statistics.lotsPublishedSub')}
            </p>
          </div>
        </div>

        <div className="interactive-card card-elevation bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {t('statistics.feesInvested')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatCOP(totalCommissionsPaid)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              {t('statistics.feesInvestedSub')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Triple Impact Estimation Banner */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 shrink-0">
            <Globe2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Impacto Ecológico Estimado
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              <AnimatedNumber value={co2AvoidedKg} /> kg CO₂e
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Emisiones de gases de efecto invernadero evitadas al prevenir la descomposición en vertederos.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/20 shrink-0">
            <Heart className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Impacto Nutricional Solidario
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              <AnimatedNumber value={mealsServed} /> raciones
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Platos potenciales entregados a familias y comedores comunitarios vinculados a la red.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Breakdown or Empty State */}
      <motion.div variants={itemVariants}>
        {totalPublished === 0 && myOffers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-250 dark:border-slate-800 p-12 text-center shadow-xs">
            <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('statistics.noStatsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-md mx-auto">
              {t('statistics.noStatsDesc')}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('publish')}
              className="btn-interaction inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('statistics.publishFirst')}</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">
                  {t('statistics.breakdownTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Desglose lote a lote de tus publicaciones y valor estimado
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {myProducts.length} publicaciones
              </span>
            </div>

            <div className="space-y-3">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{prod.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {prod.category} • {prod.quantity.toLocaleString('es-CO')} {prod.unit} • Estado: {prod.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[11px] text-slate-400 font-medium">Valor solidario total</p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatCOP(prod.requestedPrice * prod.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
