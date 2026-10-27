import React, { useState, useEffect } from 'react';
import {
  X,
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  ShoppingBag,
  Building2,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  User,
  KeyRound,
  ArrowLeft,
  Check,
  RefreshCw,
  UserX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, EmailCheckResult } from '../../types';

type ModalMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialMode,
    login,
    registerUser,
    loginWithSocial,
    requestPasswordReset,
    checkEmailExists,
    evaluatePasswordStrength,
    emailVerificationPending,
    pendingVerificationEmail,
    resendVerificationEmail,
    checkEmailVerificationStatus,
    clearEmailVerificationPending,
  } = useApp();

  const [mode, setMode] = useState<ModalMode>('login');

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

  // Forgot Password
  const [resetEmail, setResetEmail] = useState('');

  // Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalInitialMode);
      setErrorMsg(null);
      setErrorCode(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authModalInitialMode]);

  if (!isAuthModalOpen) return null;

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
      setEmailCheck({ exists: false, message: 'Formato de correo inválido.' });
      return;
    }
    setIsCheckingEmail(true);
    try {
      const res = await checkEmailExists(trimmed);
      setEmailCheck(res);
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
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword, rememberMe);
      if (!res.success) {
        setErrorCode(res.code || null);
        if (res.code === 'user-not-found' || res.message.includes('no está registrada')) {
          setErrorMsg('No existe una cuenta registrada con este correo electrónico. Verifica tus datos o regístrate como nuevo usuario.');
        } else if (res.code === 'email-not-verified') {
          setErrorMsg('Tu correo electrónico no ha sido verificado todavía. Por favor revisa tu bandeja de entrada o spam.');
        } else if (res.code === 'wrong-password') {
          setErrorMsg('La contraseña ingresada es incorrecta. Inténtalo de nuevo o solicita la recuperación de tu contraseña.');
        } else {
          setErrorMsg(res.message);
        }
      } else {
        setSuccessMsg('¡Inicio de sesión exitoso! Ingresando a la plataforma...');
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
      setErrorMsg('La contraseña debe tener mínimo 8 caracteres e incluir un número.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los términos y condiciones.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        organizationName: regOrg.trim() || regName.trim(),
        nitOrId: regNit.trim() || 'Pendiente',
        phone: regPhone.trim() || 'Pendiente',
        city: regCity,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setErrorCode(res.code || null);
      } else {
        setSuccessMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
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
      const res = await requestPasswordReset(resetEmail);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSocialLoading(true);
    try {
      const preferredRole: UserRole = mode === 'register' ? regRole : 'buyer';
      const res = await loginWithSocial('google', preferredRole);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    } finally {
      setSocialLoading(false);
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

  const switchToRegisterWithPrefill = () => {
    if (loginEmail.trim()) {
      setRegEmail(loginEmail.trim());
    }
    setErrorMsg(null);
    setErrorCode(null);
    setMode('register');
  };

  const pwdStrength = evaluatePasswordStrength(regPassword);
  const passwordsMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8 transition-colors">
        {/* Top Banner */}
        <div className="bg-[#1B4332] px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-inner">
              <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block leading-none">
                FoodLink Solidario
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-widest">
                Red B2B Colombia
              </span>
            </div>
          </div>

          <h2 className="text-lg font-bold tracking-tight">
            {emailVerificationPending
              ? 'Verifica tu correo electrónico'
              : mode === 'login'
              ? 'Bienvenido de nuevo'
              : mode === 'register'
              ? 'Crear Cuenta en FoodLink'
              : 'Recuperar Contraseña'}
          </h2>
        </div>

        {emailVerificationPending ? (
          <div className="p-6 space-y-5">
            {pendingVerificationEmail && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 text-center">
                Cuenta: {pendingVerificationEmail}
              </p>
            )}

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-200 font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                {successMsg}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={checkingVerification}
                className="w-full py-3 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
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
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {resendingVerification ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reenviando...
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
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
              >
                Usar otra cuenta
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switch Tabs */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>
            )}

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Alerts */}
              {(errorCode === 'user-not-found' || (errorMsg && (errorMsg.includes('no está registrada') || errorMsg.includes('No existe una cuenta')))) && mode === 'login' ? (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs text-amber-950 dark:text-amber-200">
                    <p className="font-bold text-sm mb-1">Usuario no registrado</p>
                    <p className="leading-relaxed text-amber-900 dark:text-amber-300">
                      No encontramos ninguna cuenta registrada con este correo electrónico. Verifica tus datos o crea una cuenta nueva.
                    </p>
                    <button
                      type="button"
                      onClick={switchToRegisterWithPrefill}
                      className="mt-2.5 inline-flex items-center gap-1.5 font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Crear cuenta con este correo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-red-800 dark:text-red-200">
                    <p className="font-semibold">{errorMsg}</p>
                  </div>
                </div>
              ) : null}

              {successMsg && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                    {successMsg}
                  </p>
                </div>
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (emailCheck) setEmailCheck(null);
                        }}
                        onBlur={handleEmailBlur}
                        placeholder="ejemplo@organizacion.co"
                        className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      />
                      {isCheckingEmail && (
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {emailCheck && !emailCheck.exists && validateEmailFormat(loginEmail) && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
                        <span>
                          Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.
                        </span>
                        <button
                          type="button"
                          onClick={switchToRegisterWithPrefill}
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer shrink-0 ml-2"
                        >
                          Crear cuenta →
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginEmail);
                          setMode('forgot');
                        }}
                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
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
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Recordar mi sesión
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Selecciona tu rol
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegRole('buyer')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          regRole === 'buyer'
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/15'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold leading-none">Comprador</p>
                          <p className="text-[10px] opacity-75 mt-0.5">Comprar / Recibir</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('seller')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          regRole === 'seller'
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600/15'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold leading-none">Vendedor</p>
                          <p className="text-[10px] opacity-75 mt-0.5">Publicar / Vender</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Organización
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regOrg}
                          onChange={(e) => setRegOrg(e.target.value)}
                          placeholder="Opcional"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regNit}
                        onChange={(e) => setRegNit(e.target.value)}
                        placeholder="NIT / ID"
                        className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full pl-7 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full pl-6 pr-1 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      >
                        <option value="Bogotá D.C.">Bogotá</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contacto@empresa.co"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mín. 8 caract."
                          className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
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
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirmar *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repetir clave"
                          className={`w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none ${
                            passwordsMismatch
                              ? 'border-red-400'
                              : passwordsMatch
                              ? 'border-emerald-500'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {regPassword.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Seguridad:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {pwdStrength.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span
                          className={`flex items-center gap-0.5 ${
                            pwdStrength.hasMinLength ? 'text-emerald-600 font-semibold' : ''
                          }`}
                        >
                          <Check className="w-3 h-3" /> 8+ caract.
                        </span>
                        <span
                          className={`flex items-center gap-0.5 ${
                            pwdStrength.hasNumber ? 'text-emerald-600 font-semibold' : ''
                          }`}
                        >
                          <Check className="w-3 h-3" /> Número
                        </span>
                        <span
                          className={`flex items-center gap-0.5 ${
                            pwdStrength.hasSymbol ? 'text-emerald-600 font-semibold' : ''
                          }`}
                        >
                          <Check className="w-3 h-3" /> Símbolo
                        </span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Acepto los Términos y Condiciones de FoodLink Solidario.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#1B4332] hover:bg-emerald-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        Registrarme como {regRole === 'seller' ? 'Vendedor' : 'Comprador'}{' '}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORGOT FORM */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a Iniciar Sesión
                  </button>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="ejemplo@organizacion.co"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </button>
                </form>
              )}

              {/* Google Sign-In */}
              {mode !== 'forgot' && (
                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                    O continuar con Google
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={socialLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {socialLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autenticación real con Firebase Authentication</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
