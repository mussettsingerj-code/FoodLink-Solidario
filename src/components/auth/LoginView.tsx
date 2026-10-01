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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, EmailCheckResult } from '../../types';

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
  const [regCity, setRegCity] = useState('Bogotá D.C.');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  // Feedback & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);
  }, [mode]);

  const validateEmailFormat = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleEmailBlur = async () => {
    const trimmed = loginEmail.trim();
    if (!trimmed) {
      setEmailCheck(null);
      return;
    }
    if (!validateEmailFormat(trimmed)) {
      setEmailCheck({
        exists: false,
        message:
          language === 'en'
            ? 'Invalid email format (e.g. user@company.com)'
            : 'Formato de correo inválido (ej. correo@empresa.co)',
      });
      return;
    }

    setIsCheckingEmail(true);
    try {
      const result = await checkEmailExists(trimmed);
      setEmailCheck(result);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    if (!validateEmailFormat(loginEmail)) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter a valid email address.'
          : 'Por favor ingresa un correo electrónico con formato válido.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMsg(
        language === 'en' ? 'Please enter your password.' : 'Por favor ingresa tu contraseña.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword, rememberMe);
      if (!result.success) {
        setErrorMsg(result.message);
        setErrorCode(result.code || null);
      } else {
        setSuccessMsg(result.message);
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
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!validateEmailFormat(regEmail)) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    const strength = evaluatePasswordStrength(regPassword);
    if (!strength.hasMinLength || !strength.hasNumber) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres e incluir un número.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los términos y condiciones de uso de FoodLink Solidario.');
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
        setSuccessMsg(result.message);
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
        setSuccessMsg(res.message);
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
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
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
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(resetEmail);
      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        setSuccessMsg(result.message);
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
        setSuccessMsg(res.message);
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

  const pwdStrength = evaluatePasswordStrength(regPassword);
  const passwordsMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex flex-col lg:flex-row font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      {/* Left Hero Panel */}
      <div className="lg:w-5/12 xl:w-1/2 bg-[#0F291E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none tracking-tight text-white">
                FoodLink
              </h1>
              <span className="text-[11px] font-semibold text-emerald-400 tracking-widest uppercase block mt-0.5">
                Solidario Colombia
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLanding(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === 'en' ? 'Back to website' : 'Volver a portada'}
          </button>
        </div>

        <div className="relative z-10 my-12 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {language === 'en'
                ? 'Circular Food Economy Network'
                : 'Red Empresarial de Economía Circular'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] mb-6">
            {language === 'en'
              ? 'Connect surplus food with organizations that need it today.'
              : 'Transformamos excedentes de alimentos en impacto social real.'}
          </h2>

          <p className="text-emerald-100/80 text-base sm:text-lg leading-relaxed mb-8">
            {language === 'en'
              ? 'Join supermarkets, restaurants, bakeries, and verified social foundations across Colombia.'
              : 'Únete como Comprador o Vendedor a la red colombiana que conecta establecimientos gastronómicos, supermercados y fundaciones sociales.'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Rol Comprador</span>
              </div>
              <p className="text-xs text-emerald-100/70">
                Explora lotes disponibles, realiza ofertas y coordina entregas verificadas.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <Store className="w-4 h-4" />
                <span>Rol Vendedor</span>
              </div>
              <p className="text-xs text-emerald-100/70">
                Publica excedentes alimentarios, gestiona ofertas recibidas y mide tu impacto.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/70 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autenticación segura con Firebase Authentication</span>
          </div>
          <span>Ley 1990 de 2019 • Colombia</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
          {/* Email Verification Pending View (Requirement 5) */}
          {emailVerificationPending ? (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verificación de correo electrónico requerida
                </h2>
                {pendingVerificationEmail && (
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Cuenta: {pendingVerificationEmail}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                  Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                    {successMsg}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={checkingVerification}
                  className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {checkingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Comprobando verificación...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Ya verifiqué mi correo, continuar
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
                      Enviando correo...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Reenviar correo de verificación
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearEmailVerificationPending();
                    setMode('login');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Volver al inicio de sesión con otra cuenta
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switch Tabs */}
              {mode !== 'forgot' && (
                <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 m-6 mb-0 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
                  </button>
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Header Title */}
                <div className="mb-6">
                  {mode === 'login' && (
                    <>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {language === 'en' ? 'Welcome back' : 'Bienvenido a FoodLink'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'en'
                          ? 'Enter your credentials to access your dashboard'
                          : 'Ingresa con tu cuenta registrada para continuar'}
                      </p>
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {language === 'en' ? 'Create your account' : 'Registro de Nuevo Usuario'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Selecciona tu rol (Comprador o Vendedor) y completa tus datos
                      </p>
                    </>
                  )}
                  {mode === 'forgot' && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          Recuperar Contraseña
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Te enviaremos un enlace seguro a tu correo electrónico
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Alert Banner */}
                {errorMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-red-800 dark:text-red-200">
                      <p className="font-semibold leading-relaxed">{errorMsg}</p>
                      {errorCode === 'user-not-found' && mode === 'login' && (
                        <button
                          type="button"
                          onClick={switchToRegisterWithPrefill}
                          className="mt-2.5 inline-flex items-center gap-1.5 font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          Crear una cuenta ahora <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Success Alert Banner */}
                {successMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                      {successMsg}
                    </div>
                  </div>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          ref={emailInputRef}
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (emailCheck) setEmailCheck(null);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          onBlur={handleEmailBlur}
                          placeholder="ejemplo@organizacion.co"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 transition-all"
                        />
                        {isCheckingEmail && (
                          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      {emailCheck && !emailCheck.exists && validateEmailFormat(loginEmail) && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                            Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.
                          </span>
                          <button
                            type="button"
                            onClick={switchToRegisterWithPrefill}
                            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
                          >
                            Registrarse →
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(loginEmail);
                            setMode('forgot');
                          }}
                          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Mantener sesión iniciada
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md shadow-emerald-950/15 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verificando credenciales...
                        </>
                      ) : (
                        <>
                          Iniciar Sesión
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* Role Selection: Comprador o Vendedor (Requirement 1 & 2) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Selecciona tu rol en la plataforma
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setRegRole('buyer')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            regRole === 'buyer'
                              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/15'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <ShoppingBag
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              regRole === 'buyer' ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold">Comprador</p>
                            <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                              Explorar y adquirir alimentos
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegRole('seller')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            regRole === 'seller'
                              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/15'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 shrink-0 mt-0.5 ${
                              regRole === 'seller' ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold">Vendedor</p>
                            <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                              Publicar y vender excedentes
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nombre Completo *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Ej. Carlos Mendoza"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Organización / Entidad
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={regOrg}
                            onChange={(e) => setRegOrg(e.target.value)}
                            placeholder={
                              regRole === 'seller'
                                ? 'Ej. Supermercados El Sol'
                                : 'Ej. Fundación Semillas'
                            }
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          NIT o Documento
                        </label>
                        <div className="relative">
                          <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={regNit}
                            onChange={(e) => setRegNit(e.target.value)}
                            placeholder="900.123.456-1"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Teléfono / Celular
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+57 300 000 0000"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Ciudad Principal
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <select
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
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
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Correo Electrónico *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
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
                          Contraseña *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Mín. 8 caracteres"
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showRegPassword ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Confirmar Contraseña *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
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

                    {/* Password Strength Meter */}
                    {regPassword.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Seguridad de contraseña:
                          </span>
                          <span
                            className={`font-bold ${
                              pwdStrength.score <= 1
                                ? 'text-red-500'
                                : pwdStrength.score === 2
                                ? 'text-amber-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {pwdStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`rounded-full transition-colors ${
                                pwdStrength.score >= step
                                  ? pwdStrength.score <= 1
                                    ? 'bg-red-500'
                                    : pwdStrength.score === 2
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasMinLength
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> 8+ caracteres
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasNumber
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> 1+ número
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              pwdStrength.hasSymbol
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> 1+ símbolo
                          </span>
                        </div>
                      </div>
                    )}

                    <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Acepto los Términos de Uso, Política de Tratamiento de Datos e Inocuidad
                        Alimentaria de FoodLink Solidario Colombia.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          Registrarme como {regRole === 'seller' ? 'Vendedor' : 'Comprador'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* FORGOT PASSWORD FORM */}
                {mode === 'forgot' && (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Correo Electrónico Registrado
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
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
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando enlace...
                        </>
                      ) : (
                        <>
                          Enviar enlace de recuperación
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Google Sign-In Section (Requirement 6) */}
                {mode !== 'forgot' && (
                  <div className="mt-6">
                    <div className="relative flex items-center justify-center mb-4">
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                      <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                        O continuar con
                      </span>
                      <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={socialLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                    >
                      {socialLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                          <span>Continuar con Google</span>
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
