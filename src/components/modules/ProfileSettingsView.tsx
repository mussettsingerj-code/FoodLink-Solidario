import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Store,
  ShoppingBag,
  Save,
  CheckCircle2,
  FileText,
  Award,
  Sun,
  Moon,
  Monitor,
  Globe,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeMode, SupportedLanguage } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';

export const ProfileSettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    upgradeToSeller,
    products,
    offers,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
  } = useApp();

  const isSeller = userProfile.role === 'seller';

  const [name, setName] = useState(userProfile.name);
  const [organizationName, setOrganizationName] = useState(userProfile.organizationName);
  const [nitOrId, setNitOrId] = useState(userProfile.nitOrId);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);

  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation modal state for "Quiero vender productos" (Requirement 3)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    setName(userProfile.name);
    setOrganizationName(userProfile.organizationName);
    setNitOrId(userProfile.nitOrId);
    setEmail(userProfile.email);
    setPhone(userProfile.phone);
    setCity(userProfile.city);
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        organizationName,
        nitOrId,
        phone,
        city,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmUpgradeToSeller = async () => {
    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      const result = await upgradeToSeller();
      if (result.success) {
        setShowUpgradeModal(false);
        setUpgradeMessage(result.message);
        setTimeout(() => setUpgradeMessage(null), 6000);
      } else {
        setUpgradeError(result.message);
      }
    } catch {
      setUpgradeError('No se pudo actualizar el rol en este momento. Inténtalo de nuevo.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Real user statistics (no fake data)
  const myPublishedProductsCount = products.filter((p) => p.sellerId === userProfile.id).length;
  const myCompletedOperationsCount = offers.filter((o) => o.status === 'aceptada').length;
  const myActiveOffersCount = offers.filter(
    (o) => o.status === 'pendiente' || o.status === 'contraoferta'
  ).length;

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
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
      className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-[#0F291E] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-emerald-900/60"
      >
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                  {isSeller ? (
                    <>
                      <Store className="w-3.5 h-3.5 text-amber-300" />
                      {t('role.seller')}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                      {t('role.buyer')}
                    </>
                  )}
                </span>
                {userProfile.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('profile.verifiedAccount', 'Cuenta Verificada')}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {userProfile.organizationName || userProfile.name}
              </h2>
              <p className="text-emerald-200/80 text-xs sm:text-sm">
                {userProfile.name} • {userProfile.email}
              </p>
            </div>
          </div>

          {/* Buyer to Seller Role Upgrade Action in Header if Buyer */}
          {!isSeller && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/30 transition-all cursor-pointer shrink-0"
            >
              <Store className="w-4 h-4" />
              <span>{t('profile.wantToSell')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Role Upgrade Success Banner */}
      {upgradeMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{upgradeMessage}</p>
        </div>
      )}

      {/* Requirement 3: Dedicated Card for Buyers to Switch to Seller ("Quiero vender productos") */}
      {!isSeller && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                {t('profile.upgradeBannerTag')}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('profile.upgradeBannerTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {t('profile.upgradeBannerDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-5 py-3 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Store className="w-4 h-4 text-emerald-300" />
            <span>{t('profile.wantToSell')}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('profile.accountInfoTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('profile.accountInfoDesc')}
                </p>
              </div>
              {savedToast && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> {t('profile.changesSaved')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.orgLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.nitLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={nitOrId}
                  onChange={(e) => setNitOrId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.repNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.emailLabel')}
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.phoneLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {t('profile.cityLabel')}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Bogotá D.C.">Bogotá D.C.</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Cartagena">Cartagena</option>
                  <option value="Pereira">Pereira</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t('profile.saveChanges')}
              </button>
            </div>
          </form>

          {/* Preferences Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('profile.preferencesTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('profile.preferencesDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {t('profile.appearanceLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light' as ThemeMode, labelKey: 'profile.light', icon: Sun },
                    { id: 'dark' as ThemeMode, labelKey: 'profile.dark', icon: Moon },
                    { id: 'system' as ThemeMode, labelKey: 'profile.system', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = themeMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setThemeMode(item.id)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t(item.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  {t('profile.languageLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'es' as SupportedLanguage, labelKey: 'profile.spanish', flag: '🇨🇴' },
                    { id: 'en' as SupportedLanguage, labelKey: 'profile.english', flag: '🇺🇸' },
                  ].map((lang) => {
                    const active = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLanguage(lang.id)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{t(lang.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary & Real Activity Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              {t('profile.realSummaryTitle')}
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">{t('profile.activeRole')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase">
                  {isSeller ? `${t('role.seller')} (seller)` : `${t('role.buyer')} (buyer)`}
                </span>
              </div>

              {isSeller && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {t('profile.publishedLotsCount')}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-base tabular-nums">
                    <AnimatedNumber value={myPublishedProductsCount} />
                  </span>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {t('profile.activeOffers')}
                </span>
                <span className="font-black text-slate-900 dark:text-white text-base tabular-nums">
                  <AnimatedNumber value={myActiveOffersCount} />
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {t('profile.completedOperations')}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-base tabular-nums">
                  <AnimatedNumber value={myCompletedOperationsCount} />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950 text-white rounded-3xl p-6 border border-emerald-800 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              {language === 'en' ? 'Law 1990 Certification' : 'Certificación Ley 1990'}
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
              {language === 'en'
                ? 'Your account complies with Colombian traceability and food safety standards for the prevention of food loss and waste.'
                : 'Tu cuenta cumple con los lineamientos de trazabilidad e inocuidad para la prevención de pérdidas y desperdicio de alimentos en Colombia.'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for "Quiero vender productos" (Requirement 3) */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Store className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('profile.upgradeModalTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t('profile.upgradeModalDesc')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">
                  {language === 'en' ? 'Upon confirming this change:' : 'Al confirmar este cambio:'}
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    {language === 'en'
                      ? 'Your role in Firestore will become Seller (seller).'
                      : 'Tu rol en Firestore pasará a ser Vendedor (seller).'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'You can publish surplus food batches and manage listings.'
                      : 'Podrás publicar productos y gestionar tus publicaciones.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'Exclusive merchant and statistics tools will be enabled.'
                      : 'Se habilitarán las herramientas y estadísticas exclusivas de vendedor.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'The change remains permanently across logins.'
                      : 'El cambio se mantendrá guardado al cerrar sesión y volver a entrar.'}
                  </li>
                </ul>
              </div>

              {upgradeError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center gap-2 text-xs text-red-800 dark:text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{upgradeError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  disabled={isUpgrading}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('profile.canceling')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgradeToSeller}
                  disabled={isUpgrading}
                  className="btn-interaction px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'en' ? 'Updating role...' : 'Actualizando rol...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t('profile.confirmUpgrade')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
