import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  FileText,
  User,
  KeyRound,
  ArrowLeft,
  Check,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Award,
  UserX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, EmailCheckResult, ThemeMode } from '../../types';

type ViewMode = 'login' | 'register' | 'forgot';

export const LoginView: React.FC = () => {
  const {
    login,
    registerUser,
    loginWithSocial,
    requestPasswordReset,
    checkEmailExists,
    evaluatePasswordStrength,
    setShowLanding,
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    t,
    emailVerificationPending,
    pendingVerificationEmail,
    resendVerificationEmail,
    checkEmailVerificationStatus,
    clearEmailVerificationPending,
  } = useApp();

  const [mode, setMode] = useState<ViewMode>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailCheck, setEmailCheck] = useState<EmailCheckResult | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Register State
  const [regRole, setRegRole] = useState<UserRole>('buyer');
  const [regName, setRegName] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regNit, setRegNit] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Medellín');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  // Feedback & Loading State (5 Login States)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const isEn = language === 'en';

  useEffect(() => {
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);
  }, [mode]);

  const validateEmailFormat = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setThemeMode(next);
  };

  const handleEmailBlur = () => {
    const trimmed = loginEmail.trim();
    if (!trimmed) {
      setEmailCheck(null);
      return;
    }
    if (!validateEmailFormat(trimmed)) {
      setEmailCheck({
        exists: false,
        message: isEn
          ? 'Invalid email format (e.g. user@company.com)'
          : 'Formato de correo inválido (ej. correo@empresa.co)',
      });
      return;
    }
    setEmailCheck(null);
  };

  // State 1: CARGA & State 2: ÉXITO & State 3: ERROR & State 4: USUARIO INEXISTENTE & State 5: CORREO NO VERIFICADO
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    const trimmedEmail = loginEmail.trim();

    if (!validateEmailFormat(trimmedEmail)) {
      setErrorMsg(
        isEn
          ? 'Please enter a valid email address.'
          : 'Por favor ingresa un correo electrónico con formato válido.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMsg(isEn ? 'Please enter your password.' : 'Por favor ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(trimmedEmail, loginPassword, rememberMe);
      if (!result.success) {
        setErrorCode(result.code || null);
        if (result.code === 'user-not-found' || result.message.includes('no está registrada')) {
          setErrorMsg(
            isEn
              ? 'No account was found with this email address. Please check your spelling or create a new account.'
              : 'No existe una cuenta registrada con este correo electrónico. Verifica tus datos o regístrate como nuevo usuario.'
          );
        } else if (result.code === 'email-not-verified') {
          setErrorMsg(
            isEn
              ? 'Your email address is not verified yet. Please check your inbox or spam folder.'
              : 'Tu correo electrónico no ha sido verificado todavía. Por favor revisa tu bandeja de entrada o spam.'
          );
        } else if (result.code === 'wrong-password') {
          setErrorMsg(
            isEn
              ? 'The password entered is incorrect. Please try again or recover your account.'
              : 'La contraseña ingresada es incorrecta. Inténtalo de nuevo o solicita la recuperación de tu contraseña.'
          );
        } else {
          setErrorMsg(result.message);
        }
      } else {
        setSuccessMsg(
          isEn
            ? 'Sign in successful! Redirecting to your dashboard...'
            : '¡Inicio de sesión exitoso! Redirigiendo a tu panel de control...'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg(isEn ? 'Please enter your full name.' : 'Por favor ingresa tu nombre completo.');
      return;
    }

    if (!validateEmailFormat(regEmail)) {
      setErrorMsg(isEn ? 'Enter a valid email address.' : 'Ingresa un correo electrónico válido.');
      return;
    }

    const strength = evaluatePasswordStrength(regPassword);
    if (!strength.hasMinLength || !strength.hasNumber) {
      setErrorMsg(
        isEn
          ? 'Password must have at least 8 characters and include a number.'
          : 'La contraseña debe tener al menos 8 caracteres e incluir un número.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(
        isEn
          ? 'Passwords do not match. Please verify.'
          : 'Las contraseñas no coinciden. Por favor verifícalas.'
      );
      return;
    }

    if (!acceptTerms) {
      setErrorMsg(
        isEn
          ? 'You must accept the terms of use for FoodLink Solidario.'
          : 'Debes aceptar los términos y condiciones de uso de FoodLink Solidario.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        organizationName: regOrg.trim() || regName.trim(),
        nitOrId: regNit.trim() || 'Pendiente',
        phone: regPhone.trim() || 'Pendiente',
        city: regCity,
      });

      if (!result.success) {
        setErrorMsg(result.message);
        setErrorCode(result.code || null);
      } else {
        setSuccessMsg(
          isEn
            ? 'Account created! Verification link sent to your email.'
            : '¡Cuenta creada! Enviamos un enlace de verificación a tu correo.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendingVerification(true);
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        setSuccessMsg(
          isEn
            ? 'Verification email sent. Please check your inbox and spam folder.'
            : 'Correo de verificación reenviado. Revisa tu bandeja de entrada o correo no deseado.'
        );
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCheckingVerification(true);
    try {
      const res = await checkEmailVerificationStatus();
      if (res.verified) {
        setSuccessMsg(
          isEn
            ? 'Email verified successfully! Logging you in...'
            : '¡Correo verificado con éxito! Ingresando a la plataforma...'
        );
      } else {
        setErrorMsg(
          isEn
            ? 'We have not detected your verification yet. Make sure to open the link in your email and click again.'
            : 'Aún no detectamos la verificación. Abre el enlace que llegó a tu correo y vuelve a presionar este botón.'
        );
      }
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateEmailFormat(resetEmail)) {
      setErrorMsg(isEn ? 'Enter a valid email address.' : 'Ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(resetEmail);
      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        setSuccessMsg(
          isEn
            ? 'Password reset instructions have been sent to your email.'
            : 'Enviamos las instrucciones de restablecimiento a tu correo electrónico.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);
    setSocialLoading(true);
    try {
      const preferredRole: UserRole = mode === 'register' ? regRole : 'buyer';
      const res = await loginWithSocial('google', preferredRole);
      if (res.success) {
        setSuccessMsg(
          isEn
            ? 'Google authentication successful! Entering dashboard...'
            : '¡Autenticación con Google exitosa! Ingresando al panel...'
        );
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const switchToRegisterWithPrefill = () => {
    if (loginEmail.trim()) {
      setRegEmail(loginEmail.trim());
    }
    setMode('register');
  };

  const isUserNotFoundState =
    errorCode === 'user-not-found' ||
    (errorMsg &&
      (errorMsg.includes('no está registrada') ||
        errorMsg.includes('not registered') ||
        errorMsg.includes('No existe una cuenta') ||
        errorMsg.includes('No account was found')));

  const pwdStrength = evaluatePasswordStrength(regPassword);
  const passwordsMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[calc(100vh-160px)] font-sans transition-colors duration-200">
      
      {/* LEFT VISUAL HERO PANEL (Modern circular economy presentation with subtle animations) */}
      <div className="lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-[#062016] via-[#0D2D21] to-[#134231] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-emerald-950/70">
        
        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#10b981 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient floating blur lights (Subtle motion) */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />

        {/* Top Header inside Left Panel */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 group-hover:scale-105 group-hover:bg-emerald-400 transition-all duration-300">
              <Leaf className="w-6 h-6 text-slate-950 stroke-[2.5] animate-pulse-subtle" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl leading-none tracking-tight text-white">
                FoodLink
              </h1>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase block mt-0.5">
                Solidario Colombia
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLanding(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? 'Back to home' : 'Volver a inicio'}</span>
          </button>
        </div>

        {/* Center Pitch & Floating Micro-Graphics */}
        <div className="relative z-10 my-10 lg:my-8 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEn ? 'B2B Circular Food Platform' : 'Red de Rescate de Alimentos B2B'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-[1.12]">
            {isEn
              ? 'Zero Waste, Maximum Social Value.'
              : 'Menos desperdicio, más oportunidades.'}
          </h2>

          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            {isEn
              ? 'Connect directly as a Buyer or Seller in Medellín to rescue quality food, negotiate lots, and eliminate waste.'
              : 'Conéctate como Comprador o Vendedor en Medellín y el Valle de Aburrá para comercializar excedentes de calidad y generar impacto social.'}
          </p>

          {/* Interactive Role Showcase */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 transition-all duration-300 hover:border-emerald-400/40 hover:-translate-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>{t('role.buyer')}</span>
              </div>
              <p className="text-xs text-emerald-100/75 leading-relaxed">
                {isEn
                  ? 'Access surplus food lots at solidary pricing, send offers, and receive certificates.'
                  : 'Explora lotes de alimentos, haz ofertas solidarias y recibe actas verificadas.'}
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1.5">
                <Store className="w-4 h-4" />
                <span>{t('role.seller')}</span>
              </div>
              <p className="text-xs text-emerald-100/75 leading-relaxed">
                {isEn
                  ? 'Publish surplus batches, coordinate pricing with buyers, and track sales metrics.'
                  : 'Publica lotes con herramientas exclusivas de venta y métricas de impacto.'}
              </p>
            </div>
          </div>

          {/* Floating Subtle Stats Card (Microinteraction Graphic with gentle float) */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between gap-3 animate-float-slow shadow-lg shadow-black/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-200 block">
                  +48.200 kg {isEn ? 'Rescued Food' : 'Alimentos Rescatados'}
                </span>
                <span className="text-[10px] text-emerald-400/80 block">
                  Medellín y Valle de Aburrá
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Ley 1990
            </span>
          </div>
        </div>

        {/* Bottom Trust Note */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/70 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isEn ? 'Official & Secure Authentication' : 'Autenticación Oficial y Segura'}</span>
          </div>
          <span>Inocuidad y Trazabilidad Colombia</span>
        </div>
      </div>

      {/* RIGHT FORM CONTAINER (Redesigned with modern cards, microinteractions and all 5 states) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 animate-fade-in">
        
        {/* Language and Theme Switcher Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300/80 dark:border-slate-700 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                language === 'es'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Cambiar a Español"
            >
              <span>🇨🇴</span>
              <span className="uppercase text-xs font-extrabold">ES</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to English"
            >
              <span>🇺🇸</span>
              <span className="uppercase text-xs font-extrabold">EN</span>
            </button>
          </div>

          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
          >
            {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {themeMode === 'system' && <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            <span className="text-xs font-medium">
              {themeMode === 'light'
                ? t('profile.light')
                : themeMode === 'dark'
                ? t('profile.dark')
                : t('profile.system')}
            </span>
          </button>
        </div>

        {/* Elevated Form Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300">
          
          {/* Subtle loading line indicator on top during submission */}
          {isSubmitting && (
            <div className="h-1 w-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
              <div className="h-full bg-emerald-600 animate-pulse w-full transition-all duration-300" />
            </div>
          )}

          {/* STATE 5: CORREO NO VERIFICADO (Dedicated verified-screen state) */}
          {emailVerificationPending ? (
            <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-inner">
                <Mail className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  {isEn ? 'Email Verification Pending' : 'Correo No Verificado'}
                </h2>
                {pendingVerificationEmail && (
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 px-3 rounded-lg inline-block border border-emerald-200/60 dark:border-emerald-800/60">
                    {pendingVerificationEmail}
                  </p>
                )}
              </div>

              {/* Clear Informational Box */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                  {isEn
                    ? 'Your email address has not been verified yet. Please check your inbox or spam folder and confirm your email to access the platform.'
                    : 'Tu correo electrónico no ha sido verificado todavía. Para acceder al panel y operar en la red, por favor revisa tu bandeja de entrada o spam y confirma tu correo.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-800 dark:text-red-200">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{successMsg}</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={checkingVerification}
                  className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  {checkingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEn ? 'Checking status...' : 'Comprobando verificación...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEn ? 'I verified my email, sign in' : 'Ya verifiqué mi correo, ingresar'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {resendingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEn ? 'Sending verification email...' : 'Reenviando correo...'}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{isEn ? 'Resend verification link' : 'Reenviar correo de verificación'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearEmailVerificationPending();
                    setMode('login');
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer text-center block"
                >
                  {isEn ? '← Sign in with another account' : '← Iniciar sesión con otra cuenta'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switch Tabs (Iniciar Sesión / Crear Cuenta) */}
              {mode !== 'forgot' && (
                <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 m-6 mb-0 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('auth.loginBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isEn ? 'Create Account' : 'Crear Cuenta'}
                  </button>
                </div>
              )}

              <div className="p-6 sm:p-8">
                
                {/* Header Title */}
                <div className="mb-6">
                  {mode === 'login' && (
                    <>
                      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                        {t('auth.welcomeBack')}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('auth.loginSubtitle')}
                      </p>
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                        {t('auth.registerTitle')}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('auth.registerSubtitle')}
                      </p>
                    </>
                  )}
                  {mode === 'forgot' && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                          {t('auth.forgotPasswordTitle')}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('auth.forgotPasswordSubtitle')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* STATE 4: USUARIO INEXISTENTE (Distinct, prominent guidance) */}
                {isUserNotFoundState && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex items-start gap-3 animate-fade-in shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <UserX className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs text-amber-950 dark:text-amber-200">
                      <p className="font-bold text-sm mb-1">
                        {isEn ? 'Account not registered' : 'Usuario no registrado'}
                      </p>
                      <p className="leading-relaxed text-amber-900 dark:text-amber-300">
                        {isEn
                          ? 'No account was found with this email. Please check your spelling or register for free in seconds.'
                          : 'No encontramos ninguna cuenta registrada con este correo electrónico. Verifica tus datos o crea una cuenta nueva en pocos segundos.'}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                          {isEn ? 'Would you like to sign up now?' : '¿Deseas registrarte ahora?'}
                        </span>
                        <button
                          type="button"
                          onClick={switchToRegisterWithPrefill}
                          className="inline-flex items-center gap-1.5 font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                        >
                          <span>{isEn ? 'Create account' : 'Crear cuenta con este correo'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE 3: ERROR GENERAL BANNER (when not user-not-found) */}
                {errorMsg && !isUserNotFoundState && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-red-900 dark:text-red-200">
                      <p className="font-semibold leading-relaxed">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* STATE 2: ÉXITO (Success Banner with green check and smooth fade) */}
                {successMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 flex items-start gap-3 animate-fade-in shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                    <div className="flex-1 text-xs font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {successMsg}
                    </div>
                  </div>
                )}

                {/* 1. LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                          ref={emailInputRef}
                          type="email"
                          required
                          disabled={isSubmitting}
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (emailCheck) setEmailCheck(null);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          onBlur={handleEmailBlur}
                          placeholder="ejemplo@organizacion.co"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all disabled:opacity-60"
                        />
                        {isCheckingEmail && (
                          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      {/* Real-time email format helper */}
                      {emailCheck && !emailCheck.exists && emailCheck.message && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-center gap-2 animate-fade-in text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{emailCheck.message}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t('auth.password')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(loginEmail);
                            setMode('forgot');
                          }}
                          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {t('auth.forgotPasswordLink')}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          disabled={isSubmitting}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                          aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {t('auth.rememberMe')}
                        </span>
                      </label>
                    </div>

                    {/* Submit Button with STATE 1: CARGA */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm hover:scale-[1.01] active:scale-[0.99] group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isEn ? 'Verifying credentials...' : 'Verificando credenciales...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth.loginBtn')}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 2. REGISTER FORM */}
                {mode === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                    
                    {/* Role Selection: Comprador (buyer) o Vendedor (seller) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t('auth.selectRole')}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setRegRole('buyer')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            regRole === 'buyer'
                              ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <ShoppingBag
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              regRole === 'buyer' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold">{t('role.buyer')}</p>
                            <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                              {t('auth.roleBuyerDesc')}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegRole('seller')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            regRole === 'seller'
                              ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              regRole === 'seller' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold">{t('role.seller')}</p>
                            <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                              {t('auth.roleSellerDesc')}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.fullName')} *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            disabled={isSubmitting}
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Ej. Carolina Montoya"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.orgName')}
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            disabled={isSubmitting}
                            value={regOrg}
                            onChange={(e) => setRegOrg(e.target.value)}
                            placeholder={
                              regRole === 'seller'
                                ? 'Ej. Fruver Valle del Sol'
                                : 'Ej. Fundación San Vicente'
                            }
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.nit')}
                        </label>
                        <div className="relative">
                          <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            disabled={isSubmitting}
                            value={regNit}
                            onChange={(e) => setRegNit(e.target.value)}
                            placeholder="900.123.456-1"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.phone')}
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            disabled={isSubmitting}
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+57 304 526 3106"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.city')}
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <select
                            disabled={isSubmitting}
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                          >
                            <option value="Medellín">Medellín</option>
                            <option value="Bello">Bello</option>
                            <option value="Itagüí">Itagüí</option>
                            <option value="Envigado">Envigado</option>
                            <option value="Sabaneta">Sabaneta</option>
                            <option value="La Estrella">La Estrella</option>
                            <option value="Caldas">Caldas</option>
                            <option value="Copacabana">Copacabana</option>
                            <option value="Girardota">Girardota</option>
                            <option value="Barbosa">Barbosa</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('auth.email')} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          disabled={isSubmitting}
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="contacto@organizacion.co"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.password')} *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            disabled={isSubmitting}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder={isEn ? 'Min. 8 characters' : 'Mín. 8 caracteres'}
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('auth.confirmPassword')} *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            disabled={isSubmitting}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder={isEn ? 'Repeat password' : 'Repite la contraseña'}
                            className={`w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none ${
                              passwordsMismatch
                                ? 'border-red-400 focus:border-red-500'
                                : passwordsMatch
                                ? 'border-emerald-500 focus:border-emerald-600'
                                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                            }`}
                          />
                          {passwordsMatch && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {regPassword.length > 0 && (
                      <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{t('auth.strength')}:</span>
                          <span
                            className={`font-bold ${
                              pwdStrength.score >= 3
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : pwdStrength.score >= 2
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }`}
                          >
                            {pwdStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                pwdStrength.score >= step
                                  ? pwdStrength.score >= 3
                                    ? 'bg-emerald-500'
                                    : pwdStrength.score >= 2
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                                  : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> {t('auth.hasMinLength')}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> {t('auth.hasNumber')}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasMixedCase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> {t('auth.hasMixedCase')}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> {t('auth.hasSymbol')}
                          </span>
                        </div>
                      </div>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t('auth.termsAccept')}
                      </span>
                    </label>

                    {/* Register Submit Button with STATE 1: CARGA */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm hover:scale-[1.01] active:scale-[0.99] group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth.creatingAccount')}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {regRole === 'seller' ? t('auth.registerAsSeller') : t('auth.registerAsBuyer')}
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 3. FORGOT PASSWORD FORM */}
                {mode === 'forgot' && (
                  <form onSubmit={handleForgotSubmit} className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('auth.email')} ({isEn ? 'Registered' : 'Registrado'})
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          disabled={isSubmitting}
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="ejemplo@organizacion.co"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth.sendingLink')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth.sendResetLink')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Google Sign-In Section */}
                {mode !== 'forgot' && (
                  <div className="mt-6">
                    <div className="relative flex items-center justify-center mb-4">
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                      <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                        {t('auth.orContinueWith')}
                      </span>
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={socialLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {socialLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>{isEn ? 'Connecting to Google...' : 'Conectando con Google...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.8z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                            />
                          </svg>
                          <span>{t('auth.googleSignIn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
