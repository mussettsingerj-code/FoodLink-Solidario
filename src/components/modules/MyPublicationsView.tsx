import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Package,
  Clock,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Eye,
  Inbox,
  Calendar,
  CreditCard,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Store,
  DollarSign,
  Tag,
  ExternalLink,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DurationDays, ProductStatus } from '../../types';
import { COMMISSION_PRICING } from '../../data/initialData';
import { AnimatedNumber } from '../common/AnimatedNumber';

export const MyPublicationsView: React.FC = () => {
  const {
    products,
    updateProductStatus,
    republishProduct,
    setActiveTab,
    setSelectedProduct,
    formatCOP,
    commissions,
    userProfile,
    isAuthenticated,
    t,
  } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [renewModalProductId, setRenewModalProductId] = useState<string | null>(null);
  const [renewDays, setRenewDays] = useState<DurationDays>(3);

  // Security guard: Only authenticated sellers can view/manage publications
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return null;
  }

  // Strictly show only the authenticated seller's own publications
  const myProducts = products.filter((p) => p.sellerId === userProfile.id);

  const activeCount = myProducts.filter((p) => p.status === 'activa').length;
  const expiringCount = myProducts.filter((p) => p.status === 'proxima_a_finalizar').length;
  const pausedCount = myProducts.filter((p) => p.status === 'pausada').length;
  const soldCount = myProducts.filter((p) => p.status === 'vendida').length;
  const finishedCount = myProducts.filter((p) => p.status === 'finalizada').length;

  const filteredProducts = myProducts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('myPublications.active')}</span>
          </span>
        );
      case 'proxima_a_finalizar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('myPublications.expiringSoon')}</span>
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('myPublications.finished')}</span>
          </span>
        );
      case 'pausada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('myPublications.paused')}</span>
          </span>
        );
      case 'vendida':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300/80 dark:border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('myPublications.sold')}</span>
          </span>
        );
    }
  };

  const handleConfirmRenew = () => {
    if (!renewModalProductId) return;
    republishProduct(renewModalProductId, renewDays);
    setRenewModalProductId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
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
      {/* Top Header Banner with Depth */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl bg-gradient-to-br from-[#0B2117] via-[#123826] to-[#081811] text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-emerald-900/60"
      >
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('myPublications.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              {t('myPublications.title')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              {t('myPublications.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className="btn-interaction flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.8]" />
            <span>{t('myPublications.publishNew')}</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Stats Row with Dynamic Counters */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Lotes</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              <AnimatedNumber value={myProducts.length} />
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Activas</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
              <AnimatedNumber value={activeCount} />
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Por Vencer</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 tabular-nums mt-0.5">
              <AnimatedNumber value={expiringCount} />
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Vendidas</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300 tabular-nums mt-0.5">
              <AnimatedNumber value={soldCount} />
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Status Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-2.5 custom-scroll"
      >
        {[
          { id: 'all', label: t('myPublications.all'), count: myProducts.length },
          { id: 'activa', label: t('myPublications.active'), count: activeCount },
          { id: 'proxima_a_finalizar', label: t('myPublications.expiringSoon'), count: expiringCount },
          { id: 'pausada', label: t('myPublications.paused'), count: pausedCount },
          { id: 'vendida', label: t('myPublications.sold'), count: soldCount },
          { id: 'finalizada', label: t('myPublications.finished'), count: finishedCount },
        ].map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-black tabular-nums ${
                  isActive
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Publications Cards Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-250 dark:border-slate-800 p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('myPublications.noProductsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 max-w-md mx-auto">
              {t('myPublications.noProductsDesc')}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('publish')}
              className="btn-interaction inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('myPublications.publishFirst')}</span>
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              className="interactive-card card-elevation bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-950/70 text-white backdrop-blur-xs">
                    {product.category}
                  </span>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(product.status)}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      • {product.condition}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-slate-400 font-medium">
                        • {product.brand}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate font-display">
                    {product.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      {t('catalog.available')}:{' '}
                      <strong className="text-slate-900 dark:text-white font-bold tabular-nums">
                        {product.quantity.toLocaleString('es-CO')} {product.unit}
                      </strong>
                    </span>
                    <span>
                      {t('product.requestedPrice')}:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold tabular-nums">
                        {formatCOP(product.requestedPrice)}/{product.unit}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('product.expiration')}:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{product.expirationDate}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{product.durationDays} {t('product.remainingDays')}</span>
                      <span className="text-slate-400">({formatCOP(product.commissionPaid)})</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-lg font-bold">
                      <Inbox className="w-3.5 h-3.5 text-blue-600" />
                      <span>{product.offersCount}</span> {t('myPublications.offers')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{product.viewsCount} {t('myPublications.views')}</span>
                    </span>
                  </div>
                </div>
              </div>

                {/* Interactive Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="btn-interaction px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('catalog.viewDetail')}</span>
                </button>

                {(product.status === 'activa' || product.status === 'proxima_a_finalizar') && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateProductStatus(product.id, 'pausada')}
                      className="btn-interaction flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>{t('myPublications.pause')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProductStatus(product.id, 'vendida')}
                      className="btn-interaction flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('myPublications.markSold')}</span>
                    </button>
                  </>
                )}

                {product.status === 'pausada' && (
                  <button
                    type="button"
                    onClick={() => updateProductStatus(product.id, 'activa')}
                    className="btn-interaction flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{t('myPublications.reactivate')}</span>
                  </button>
                )}

                {(product.status === 'finalizada' ||
                  product.status === 'proxima_a_finalizar') && (
                  <button
                    type="button"
                    onClick={() => setRenewModalProductId(product.id)}
                    className="btn-interaction flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('myPublications.renew')}</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Commission Billing History Card */}
      {commissions.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">
                Historial de Comisiones por Tiempo de Exposición
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro transparente de aportes realizados por publicación y renovación de lotes
              </p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                  <th className="py-3 px-3">Referencia</th>
                  <th className="py-3 px-3">Lote / Alimento</th>
                  <th className="py-3 px-3">Duración</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Método</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Comisión Pagada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {commissions.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      {rec.transactionRef}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {rec.productName}
                    </td>
                    <td className="py-3 px-3">{rec.durationDays} días</td>
                    <td className="py-3 px-3">{rec.date}</td>
                    <td className="py-3 px-3">{rec.paymentMethod}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          rec.status === 'Activa'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : rec.status === 'Renovada'
                            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatCOP(rec.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Renew Modal */}
      <AnimatePresence>
        {renewModalProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Renovación Solidaria
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 font-display">
                    {t('myPublications.renewTitle')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRenewModalProductId(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('myPublications.renewDesc')}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {([1, 2, 3, 5, 7, 14] as DurationDays[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setRenewDays(d)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      renewDays === d
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold">{d} {t('product.remainingDays')}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold tabular-nums">
                      {formatCOP(COMMISSION_PRICING[d])}
                    </p>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs border border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('myPublications.durationDays')} ({renewDays})
                </span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatCOP(COMMISSION_PRICING[renewDays])}
                </span>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRenewModalProductId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRenew}
                  className="btn-interaction px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  {t('myPublications.confirmRenew')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
