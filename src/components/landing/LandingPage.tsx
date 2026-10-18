import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  Leaf,
  ShoppingBag,
  UserPlus,
  LogIn,
  Store,
  Search,
  Handshake,
  HeartHandshake,
  Recycle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Scale,
  Building2,
  Users,
} from 'lucide-react';
import {
  ScrollReveal,
  ScrollStaggerContainer,
  ScrollStaggerItem,
} from '../common/ScrollReveal';
import { ParallaxElement } from '../common/ParallaxElement';
import supermarketBg from '../../assets/images/supermarket_bg_1792093942406.jpg';
import { Interactive3DLogo } from './Interactive3DLogo';

export const LandingPage: React.FC = () => {
  const {
    setCurrentView,
    setIsPublishModalOpen,
    openAuthModal,
    isAuthenticated,
    userProfile,
    products,
    formatCOP,
    setSelectedProductIdForDetail,
  } = useApp();
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  // Active non-expired products preview for the catalog section
  const availablePreviewProducts = (products || [])
    .filter((p) => {
      if (p.status !== 'activa' && p.status !== 'proxima_a_finalizar') return false;
      const expTime = p.expirationDate
        ? new Date(`${p.expirationDate}T23:59:59`).getTime()
        : p.expiresAt
        ? new Date(p.expiresAt).getTime()
        : NaN;
      if (!isNaN(expTime) && expTime < Date.now()) {
        return false;
      }
      return true;
    })
    .slice(0, 3);

  const isSeller = isAuthenticated && userProfile?.role === 'seller';

  // Hero staggered animation variants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 transition-colors duration-200 overflow-x-hidden">
      {/* ============================================================ */}
      {/* SECCIÓN 1: ENCABEZADO Y SECCIÓN PRINCIPAL / HERO            */}
      {/* ============================================================ */}
      <section className="relative rounded-3xl overflow-hidden bg-[#071911] text-white p-7 sm:p-12 lg:p-16 shadow-2xl border border-emerald-900/60 min-h-[520px] flex items-center">
        {/* Fotografía panorámica con animación de entrada (desenfoque a nitidez 1.8s) */}
        <motion.div
          initial={{
            filter: shouldReduceMotion ? 'blur(0px)' : 'blur(12px)',
            scale: shouldReduceMotion ? 1 : 1.04,
            opacity: 0,
          }}
          animate={{
            filter: 'blur(0px)',
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0.25 : 1.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        >
          <img
            src={supermarketBg}
            alt="Estanterías de alimentos y verduras frescas FoodLink Solidario"
            className="w-full h-full object-cover object-center will-change-transform"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Capa superpuesta verde oscuro sutil y semitransparente para armonía y contraste visual óptimo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a12]/94 via-[#09261a]/88 to-[#061911]/92 dark:from-[#04120b]/96 dark:via-[#061e13]/92 dark:to-[#04120b]/95 pointer-events-none" />

        {/* Resplandor y viñeta ambiental esmeralda suave */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0B2117]/25 to-[#071911]/80 pointer-events-none" />

        {/* Parallax Organic Floating Background Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <ParallaxElement speed={-0.2} maxOffset={35} className="absolute -right-20 -top-20">
            <div className="w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl animate-drift" />
          </ParallaxElement>

          <ParallaxElement speed={0.18} maxOffset={30} className="absolute -left-20 -bottom-24">
            <div className="w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-drift-reverse" />
          </ParallaxElement>
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Columna Izquierda: Información y llamadas a la acción */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 xl:col-span-7 space-y-6"
          >
            {/* Badge */}
            <motion.div variants={heroItemVariants} className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-xs">
                <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {t('landing.heroBadge', 'Plataforma de Impacto Social y Ambiental')}
                </span>
              </div>
            </motion.div>

            {/* Título Principal */}
            <motion.h1
              variants={heroItemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.12] text-white drop-shadow-xs"
            >
              {t(
                'landing.heroTitle',
                'Transformamos excedentes de alimentos en impacto social real.'
              )}
            </motion.h1>

            {/* Subtítulo descriptivo */}
            <motion.p
              variants={heroItemVariants}
              className="text-emerald-100/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal"
            >
              {t(
                'landing.heroSubtitle',
                'FoodLink Solidario conecta establecimientos con excedentes alimentarios con fundaciones, comedores comunitarios y organizaciones interesadas en aprovecharlos.'
              )}
            </motion.p>

            {/* Acciones principales */}
            <motion.div
              variants={heroItemVariants}
              className="pt-2 flex flex-wrap items-center gap-3.5"
            >
              <button
                type="button"
                id="hero-btn-catalog"
                onClick={() => setCurrentView('catalog')}
                className="btn-interaction px-6 sm:px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#133827]"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-950 shrink-0" />
                <span>{t('landing.heroBtnCatalog', 'Explorar productos')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    id="hero-btn-register"
                    onClick={() => openAuthModal('register')}
                    className="btn-interaction px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>{t('landing.heroBtnRegister', 'Crear una cuenta')}</span>
                  </button>

                  <button
                    type="button"
                    id="hero-btn-login"
                    onClick={() => openAuthModal('login')}
                    className="btn-interaction px-5 py-3.5 text-emerald-200 hover:text-white font-semibold text-sm sm:text-base flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 rounded-xl"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span>{t('landing.heroBtnLogin', 'Iniciar sesión')}</span>
                  </button>
                </>
              ) : isSeller ? (
                <button
                  type="button"
                  id="hero-btn-publish"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="btn-interaction px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{t('landing.heroBtnPublish', 'Publicar producto')}</span>
                </button>
              ) : null}
            </motion.div>
          </motion.div>

          {/* Columna Derecha: Logotipo 3D Interactivo y Animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.85,
              delay: shouldReduceMotion ? 0 : 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-5 xl:col-span-5 flex justify-center items-center py-4 lg:py-0"
          >
            <Interactive3DLogo />
          </motion.div>

          {/* Micro indicadores de confianza (Fila inferior que unifica la sección) */}
          <motion.div
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-12 pt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-emerald-200/90 border-t border-white/15"
          >
            <span className="flex items-center gap-2 transition-transform hover:scale-102">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('landing.trustMicro1', 'Impacto social positivo')}</span>
            </span>
            <span className="flex items-center gap-2 transition-transform hover:scale-102">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('landing.trustMicro2', 'Reducción del desperdicio alimentario')}</span>
            </span>
            <span className="flex items-center gap-2 transition-transform hover:scale-102">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('landing.trustMicro3', 'Economía circular y solidaria')}</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 2: ESTADÍSTICAS DE IMPACTO SOCIAL Y AMBIENTAL        */}
      {/* ============================================================ */}
      <section className="space-y-8">
        <ScrollReveal animation="slide-up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              {t('landing.stats.tag', 'Compromiso de Impacto')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
              {t('landing.stats.title', 'Estadísticas de impacto social y ambiental')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              {t(
                'landing.stats.subtitle',
                'Medición transparente del compromiso de nuestra red por reducir el desperdicio y nutrir comunidades.'
              )}
            </p>
          </div>
        </ScrollReveal>

        <ScrollStaggerContainer
          staggerDelay={0.12}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {/* Métrica 1: Kilos rescatados */}
          <ScrollStaggerItem animation="slide-up">
            <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Scale className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight block min-h-[3rem] flex items-center">
                    {t('landing.stats.val1', 'Impacto en construcción')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 block mt-1">
                    {t('landing.stats.rescuedFoodLabel', 'Kilos de alimentos rescatados')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {t(
                  'landing.stats.rescuedFoodDesc',
                  'Medición progresiva conforme se formalicen las primeras entregas y rescates en la plataforma'
                )}
              </p>
            </div>
          </ScrollStaggerItem>

          {/* Métrica 2: Raciones servidas */}
          <ScrollStaggerItem animation="slide-up">
            <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight block min-h-[3rem] flex items-center">
                    {t('landing.stats.val2', 'Cada aporte cuenta')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-teal-700 dark:text-teal-400 block mt-1">
                    {t('landing.stats.rationsServedLabel', 'Raciones facilitadas')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {t(
                  'landing.stats.rationsServedDesc',
                  'Cada lote donado o transferido apoyará la alimentación de comedores y familias vulnerables'
                )}
              </p>
            </div>
          </ScrollStaggerItem>

          {/* Métrica 3: Emisiones CO2 evitadas */}
          <ScrollStaggerItem animation="slide-up">
            <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Recycle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight block min-h-[3rem] flex items-center">
                    {t('landing.stats.val3', 'Huella positiva')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 block mt-1">
                    {t('landing.stats.co2AvoidedLabel', 'Emisiones de CO₂ mitigadas')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {t(
                  'landing.stats.co2AvoidedDesc',
                  'Indicador ambiental que se calculará a partir del volumen real de alimentos aprovechados'
                )}
              </p>
            </div>
          </ScrollStaggerItem>

          {/* Métrica 4: Ahorro económico */}
          <ScrollStaggerItem animation="slide-up">
            <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 shadow-xs flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight block min-h-[3rem] flex items-center">
                    {t('landing.stats.val4', 'Economía circular')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400 block mt-1">
                    {t('landing.stats.moneyRecoveredLabel', 'Ahorro y valor solidario')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {t(
                  'landing.stats.moneyRecoveredDesc',
                  'Optimizando recursos entre establecimientos donantes y organizaciones receptoras'
                )}
              </p>
            </div>
          </ScrollStaggerItem>
        </ScrollStaggerContainer>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 3: CÓMO FUNCIONA FOODLINK SOLIDARIO                  */}
      {/* ============================================================ */}
      <section className="space-y-10 relative">
        <ScrollReveal animation="slide-up">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              {t('landing.howItWorksTag', 'Plataforma Colaborativa')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
              {t('landing.howItWorksTitle', '¿Cómo funciona FoodLink Solidario?')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t(
                'landing.howItWorksDesc',
                'FoodLink Solidario es una plataforma digital que busca reducir el desperdicio de alimentos y facilitar el aprovechamiento de excedentes alimentarios en Colombia. Conectamos establecimientos que tienen alimentos aptos para el consumo con fundaciones, organizaciones y compradores interesados en aprovecharlos.'
              )}
            </p>

            {/* Distinción clara de roles */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('landing.estTitle', 'Para establecimientos y vendedores')}</span>
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t('landing.buyerTitle', 'Para organizaciones y compradores')}</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Pasos en cuadrícula desktop y apilados en móvil */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900 dark:via-emerald-600 dark:to-emerald-900 z-0 pointer-events-none opacity-60"
          />

          <ScrollStaggerContainer
            staggerDelay={0.14}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10"
          >
            {/* Paso 1 */}
            <ScrollStaggerItem animation="slide-up" distance={24}>
              <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Store className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      01
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {t('landing.step1Title', 'Paso 1. Publicación de excedentes')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(
                      'landing.step1Desc',
                      'Los establecimientos autorizados publican sus lotes de alimentos aptos para el consumo, indicando tipo de producto, cantidad disponible, estado de conservación, ubicación y fecha de vencimiento.'
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Rol: Establecimiento / Donante</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollStaggerItem>

            {/* Paso 2 */}
            <ScrollStaggerItem animation="slide-up" distance={24}>
              <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Search className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      02
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {t('landing.step2Title', 'Paso 2. Exploración del catálogo')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(
                      'landing.step2Desc',
                      'Las fundaciones, comedores comunitarios y compradores navegan el catálogo público filtrando por categoría de alimento, ciudad y urgencia de aprovechamiento.'
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Rol: Organización / Comprador</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollStaggerItem>

            {/* Paso 3 */}
            <ScrollStaggerItem animation="slide-up" distance={24}>
              <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Handshake className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      03
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {t('landing.step3Title', 'Paso 3. Negociación o solicitud directa')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(
                      'landing.step3Desc',
                      'Los interesados envían ofertas transparentes o solicitudes directas por los lotes publicados para convenir las condiciones de entrega sin intermediarios.'
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Trato directo y transparente</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollStaggerItem>

            {/* Paso 4 */}
            <ScrollStaggerItem animation="slide-up" distance={24}>
              <div className="group card-elevation h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      04
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {t('landing.step4Title', 'Paso 4. Entrega y aprovechamiento responsable')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t(
                      'landing.step4Desc',
                      'Ambas partes coordinan de forma rápida y segura la recogida o distribución de los alimentos, logrando que lleguen a tiempo a quienes más los necesitan.'
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Impacto social y ambiental real</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </ScrollStaggerItem>
          </ScrollStaggerContainer>
        </div>

        {/* Nota aclaratoria */}
        <ScrollReveal animation="fade" delay={0.2}>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3 max-w-3xl mx-auto text-xs text-slate-600 dark:text-slate-400 shadow-2xs">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {t(
                'landing.stepsDisclaimer',
                'La disponibilidad de cada función depende de las herramientas implementadas y del estado real de la publicación.'
              )}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 4: BENEFICIOS PARA LOS PARTICIPANTES                 */}
      {/* ============================================================ */}
      <section className="space-y-8">
        <ScrollReveal animation="slide-up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              {t('landing.benefitsTag', 'Ventajas Compartidas')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
              {t('landing.benefitsTitle', 'Beneficios para los participantes')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              {t(
                'landing.benefitsSubtitle',
                'Un modelo colaborativo donde establecimientos y organizaciones generan valor mutuo cuidando el planeta.'
              )}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Beneficios: Establecimientos */}
          <ScrollReveal animation="slide-up" delay={0.1}>
            <div className="card-elevation h-full p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display text-slate-900 dark:text-white">
                    {t('landing.benefitsSellersTitle', 'Para establecimientos y vendedores')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      'landing.benefitsSellersDesc',
                      'Supermercados, restaurantes, hoteles, distribuidores y productores agrícolas.'
                    )}
                  </p>
                </div>
              </div>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitSeller1', 'Reducción significativa de pérdidas y mermas operativas')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitSeller2', 'Impacto ambiental positivo y reducción de huella de carbono')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitSeller3', 'Visibilidad y reputación como empresa socialmente responsable')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitSeller4', 'Recuperación de costos mediante precios solidarios y justos')}</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Tarjeta de Beneficios: Compradores y Organizaciones */}
          <ScrollReveal animation="slide-up" delay={0.2}>
            <div className="card-elevation h-full p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display text-slate-900 dark:text-white">
                    {t('landing.benefitsBuyersTitle', 'Para compradores y organizaciones')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      'landing.benefitsBuyersDesc',
                      'Fundaciones, bancos de alimentos, comedores sociales y comunidades.'
                    )}
                  </p>
                </div>
              </div>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitBuyer1', 'Acceso a alimentos frescos y procesados a costo solidario o donados')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitBuyer2', 'Apoyo directo a la nutrición y seguridad alimentaria comunitaria')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitBuyer3', 'Trazabilidad completa sobre el origen y fecha de vencimiento')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{t('landing.benefitBuyer4', 'Gestión transparente, ágil y sin sobrecostos de intermediación')}</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 5: TRANSPARENCIA Y COMPROMISO SOCIAL                 */}
      {/* ============================================================ */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-7 sm:p-12 border border-slate-200 dark:border-slate-800 space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <ParallaxElement speed={-0.12} maxOffset={25} className="absolute -left-10 top-0">
            <div className="w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl" />
          </ParallaxElement>
        </div>

        <ScrollReveal animation="slide-up">
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 inline-block px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              {t('landing.purposeTag', 'Compromiso Social y Ambiental')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
              {t('landing.purposeTitle', 'Transparencia y compromiso social')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t(
                'landing.purposeDesc',
                'En FoodLink Solidario creemos que los alimentos que todavía son aptos para el consumo pueden tener una segunda oportunidad. Por eso, buscamos conectar a quienes tienen excedentes alimentarios con quienes pueden aprovecharlos, contribuyendo a reducir las pérdidas y el desperdicio de alimentos, fortalecer la colaboración entre organizaciones y promover una cultura de responsabilidad social y ambiental.'
              )}
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Pilares visuales */}
        <ScrollStaggerContainer
          staggerDelay={0.15}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10"
        >
          {/* Pilar 1: Misión Social */}
          <ScrollStaggerItem animation="slide-up" distance={20}>
            <div className="group card-elevation h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-3 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {t('landing.pillarSocialTitle', 'Misión social y solidaria')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                {t(
                  'landing.pillarSocialDesc',
                  'Facilitar el acceso equitativo a alimentos para organizaciones y comunidades vulnerables.'
                )}
              </p>
            </div>
          </ScrollStaggerItem>

          {/* Pilar 2: Responsabilidad Ambiental */}
          <ScrollStaggerItem animation="slide-up" distance={20}>
            <div className="group card-elevation h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400/80 dark:hover:border-teal-500/50 shadow-xs space-y-3 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <Leaf className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {t('landing.pillarEcoTitle', 'Responsabilidad ambiental')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                {t(
                  'landing.pillarEcoDesc',
                  'Prevenir toneladas de residuos orgánicos y mitigar las emisiones de gases de efecto invernadero.'
                )}
              </p>
            </div>
          </ScrollStaggerItem>

          {/* Pilar 3: Seguridad y Trazabilidad */}
          <ScrollStaggerItem animation="slide-up" distance={20}>
            <div className="group card-elevation h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/50 shadow-xs space-y-3 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {t('landing.pillarCircularTitle', 'Seguridad y trazabilidad')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                {t(
                  'landing.pillarCircularDesc',
                  'Garantizar la verificación de fechas de vencimiento y estándares de higiene en cada entrega.'
                )}
              </p>
            </div>
          </ScrollStaggerItem>
        </ScrollStaggerContainer>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 6: VISTA PREVIA DEL CATÁLOGO & LLAMADO A LA ACCIÓN  */}
      {/* ============================================================ */}
      {availablePreviewProducts.length > 0 && (
        <section className="space-y-6">
          <ScrollReveal animation="slide-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400">
                  {t('landing.catalogPreviewTag', 'Catálogo en Tiempo Real')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
                  {t(
                    'landing.catalogPreviewTitle',
                    'Alimentos disponibles para aprovechamiento'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    'landing.catalogPreviewDesc',
                    'Conoce los lotes de alimentos aptos para consumo disponibles en la red de FoodLink Solidario.'
                  )}
                </p>
              </div>

              <button
                type="button"
                id="landing-btn-view-catalog"
                onClick={() => setCurrentView('catalog')}
                className="btn-interaction inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer shrink-0"
              >
                <span>{t('landing.viewFullCatalog', 'Ver catálogo completo')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </ScrollReveal>

          <ScrollStaggerContainer
            staggerDelay={0.12}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {availablePreviewProducts.map((prod) => (
              <ScrollStaggerItem key={prod.id} animation="scale">
                <div
                  onClick={() => {
                    setSelectedProductIdForDetail(prod.id);
                    setCurrentView('catalog');
                  }}
                  className="group card-elevation h-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-500/60 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950/75 text-white backdrop-blur-xs">
                        {prod.category}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                        {prod.condition}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Cantidad:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {prod.quantity.toLocaleString('es-CO')} {prod.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Precio solidario:
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCOP(prod.requestedPrice)} COP
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{prod.locationCity}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Vence: {prod.expirationDate}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollStaggerItem>
            ))}
          </ScrollStaggerContainer>
        </section>
      )}

      {/* LLAMADO A LA ACCIÓN FINAL */}
      <ScrollReveal animation="scale" distance={16} duration={0.65}>
        <section className="rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#143d2c] to-[#0B2117] text-white p-8 sm:p-14 text-center shadow-2xl border border-emerald-800/60 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <ParallaxElement speed={0.15} maxOffset={30} className="absolute -left-16 -bottom-16">
              <div className="w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl animate-drift" />
            </ParallaxElement>
            <ParallaxElement speed={-0.15} maxOffset={25} className="absolute -right-16 -top-16">
              <div className="w-64 h-64 rounded-full bg-teal-400/10 blur-2xl animate-drift-reverse" />
            </ParallaxElement>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white drop-shadow-xs">
              {t('landing.ctaTitle', 'Dale una segunda oportunidad a los alimentos.')}
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              {t(
                'landing.ctaDesc',
                'Explora los alimentos disponibles, conoce cómo funciona nuestra red y participa en una iniciativa que busca transformar los excedentes alimentarios en oportunidades.'
              )}
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                id="cta-btn-catalog"
                onClick={() => setCurrentView('catalog')}
                className="btn-interaction w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span>{t('landing.ctaBtnCatalog', 'Explorar productos')}</span>
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  id="cta-btn-register"
                  onClick={() => openAuthModal('register')}
                  className="btn-interaction w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <UserPlus className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{t('landing.ctaBtnRegister', 'Crear una cuenta')}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};
