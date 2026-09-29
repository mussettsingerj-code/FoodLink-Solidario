import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { RoleType, UserProfile, EmailCheckResult, PasswordStrength } from '../../types';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isFirebaseApiKeyError, getFirebaseAuthErrorMessage } from '../../firebase';
import { MOCK_USERS } from '../../data/initialData';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  RefreshCw,
  KeyRound,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  Leaf,
  Check,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    login,
    showToast,
    setCurrentView,
    authModalMessage,
    setAuthModalMessage,
    authModalTab,
    setAuthModalTab,
  } = useApp();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset' | '2fa'>(
    authModalTab || 'login'
  );

  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab]);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration fields
  const [regRole, setRegRole] = useState<RoleType>('establishment');
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [city, setCity] = useState('Medellín');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  // Email verification and notices
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmailSuccess, setRegisteredEmailSuccess] = useState<string | null>(null);

  // Email debounce check
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset password states
  const [resetToken, setResetToken] = useState('');
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [code2FA, setCode2FA] = useState('');

  // Check URL parameters for Firebase Password Reset links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const oobCode = params.get('oobCode');
      if (mode === 'resetPassword' && oobCode) {
        setResetToken(oobCode);
        setActiveTab('reset');
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  // Debounce email check in registration
  useEffect(() => {
    if (activeTab !== 'register' || !regEmail || !regEmail.includes('@') || regEmail.length < 5) {
      setEmailCheckResult(null);
      setIsCheckingEmail(false);
      return;
    }

    setIsCheckingEmail(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(regEmail.trim())}`);
        if (res.ok) {
          const data: EmailCheckResult = await res.json();
          setEmailCheckResult(data);
        }
      } catch (err) {
        console.warn('Error checking email existence:', err);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [regEmail, activeTab]);

  // Handle Quick Demo Account Access
  const handleQuickDemoAccess = (roleKey: 'establishment' | 'buyer_foundation' | 'admin') => {
    const mockUser = MOCK_USERS[roleKey];
    if (mockUser) {
      setEmail(mockUser.email);
      setPassword('Alimentos2025*');
      login(mockUser);
      showToast(`Ingresaste como: ${mockUser.name} (${roleKey === 'establishment' ? 'Comercio Donante' : roleKey === 'buyer_foundation' ? 'Fundación Receptora' : 'Administrador'})`, 'success');
    }
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUnverifiedEmail(null);
    setVerificationSent(false);

    try {
      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          await userCredential.user.reload();

          if (!userCredential.user.emailVerified) {
            const unverified = userCredential.user.email || email.trim();
            setUnverifiedEmail(unverified);
            await signOut(auth);
            showToast('Tu correo aún no ha sido verificado. Por favor revisa tu bandeja de entrada.', 'warning');
            setIsLoading(false);
            return;
          }

          const uid = userCredential.user.uid;
          const storedRole = (localStorage.getItem(`foodlink_role_${uid}`) as RoleType) ||
            (localStorage.getItem('foodlink_role') as RoleType) ||
            'establishment';
          const storedOrg = localStorage.getItem(`foodlink_org_${uid}`) || 'Organización Solidaria';
          const storedCity = localStorage.getItem(`foodlink_city_${uid}`) || 'Medellín';
          const storedNit = localStorage.getItem(`foodlink_nit_${uid}`) || '900.123.456-7';
          const storedPhone = localStorage.getItem(`foodlink_phone_${uid}`) || '+57 300 123 4567';

          const userProfile: UserProfile = {
            id: uid,
            name: userCredential.user.displayName || localStorage.getItem(`foodlink_name_${uid}`) || email.trim().split('@')[0],
            email: userCredential.user.email || email.trim(),
            role: storedRole,
            organizationName: storedOrg,
            nitOrId: storedNit,
            phone: userCredential.user.phoneNumber || storedPhone,
            city: storedCity,
            verified: true,
            avatarUrl: userCredential.user.photoURL || undefined,
          };

          login(userProfile);
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no configurada o inválida, usando autenticación local:', fbErr);
        }
      }

      // --- Fallback Local Mode ---
      const localUsers = JSON.parse(localStorage.getItem('foodlink_registered_accounts') || '{}');
      const foundUser = localUsers[email.trim().toLowerCase()];

      if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
          showToast('Contraseña incorrecta. Inténtalo de nuevo.', 'error');
          setIsLoading(false);
          return;
        }

        const userProfile: UserProfile = {
          id: foundUser.uid,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          organizationName: foundUser.orgName,
          nitOrId: '900.123.456-7',
          phone: '+57 300 123 4567',
          city: foundUser.city || 'Medellín',
          verified: true,
        };

        login(userProfile);
        return;
      }

      // Mock user detection
      const trimmedEmail = email.trim().toLowerCase();
      let matchedRole: RoleType = 'establishment';
      let matchedName = email.trim().split('@')[0];
      let matchedOrg = 'Organización Solidaria';

      if (trimmedEmail.includes('super') || trimmedEmail.includes('losandes') || trimmedEmail.includes('comercio')) {
        matchedRole = 'establishment';
        matchedName = 'Pedro Gómez';
        matchedOrg = 'Supermercado Los Andes';
      } else if (trimmedEmail.includes('saciar') || trimmedEmail.includes('fundacion') || trimmedEmail.includes('comedor')) {
        matchedRole = 'buyer_foundation';
        matchedName = 'Elena Restrepo';
        matchedOrg = 'Fundación Solidaria Saciar';
      } else if (trimmedEmail.includes('admin') || trimmedEmail.includes('foodlink') || trimmedEmail.includes('publik')) {
        matchedRole = 'admin';
        matchedName = 'Carlos Mendoza';
        matchedOrg = 'Publik Solidario SAS';
      }

      const userProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: matchedName,
        email: email.trim(),
        role: matchedRole,
        organizationName: matchedOrg,
        nitOrId: '900.123.456-7',
        phone: '+57 300 123 4567',
        city: 'Medellín',
        verified: true,
      };

      login(userProfile);
    } catch (err: any) {
      console.warn('Login notice:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (passwordStrength && passwordStrength.score < 2) {
      showToast('La contraseña es demasiado débil. Usa al menos 8 caracteres con números y símbolos.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
          await sendEmailVerification(userCredential.user);

          const uid = userCredential.user.uid;
          localStorage.setItem(`foodlink_role_${uid}`, regRole);
          localStorage.setItem(`foodlink_org_${uid}`, orgName.trim());
          localStorage.setItem(`foodlink_city_${uid}`, city);
          localStorage.setItem(`foodlink_name_${uid}`, contactName.trim() || orgName.trim());

          await signOut(auth);
          setRegisteredEmailSuccess(regEmail.trim());
          showToast('Cuenta creada con éxito. Hemos enviado un correo de verificación.', 'success');
          setIsLoading(false);
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida, registrando en almacenamiento local:', fbErr);
        }
      }

      // Local storage fallback
      const localUsers = JSON.parse(localStorage.getItem('foodlink_registered_accounts') || '{}');
      const uid = 'local_uid_' + Math.random().toString(36).substring(2, 9);
      localUsers[regEmail.trim().toLowerCase()] = {
        uid,
        email: regEmail.trim(),
        password: regPassword,
        name: contactName.trim() || orgName.trim(),
        orgName: orgName.trim(),
        role: regRole,
        city,
        verified: true,
      };
      localStorage.setItem('foodlink_registered_accounts', JSON.stringify(localUsers));

      const newProfile: UserProfile = {
        id: uid,
        name: contactName.trim() || orgName.trim(),
        email: regEmail.trim(),
        role: regRole,
        organizationName: orgName.trim(),
        nitOrId: '900.555.444-1',
        phone: '+57 300 000 0000',
        city,
        verified: true,
      };

      login(newProfile);
      showToast('¡Cuenta creada y sesión iniciada con éxito!', 'success');
    } catch (err: any) {
      console.warn('Registration notice:', err);
      const friendly = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendly, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Ingresa tu correo para recibir las instrucciones.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
        }
      }
      setForgotPasswordSubmitted(true);
      showToast('Enlace de recuperación emitido. Revisa tu bandeja de entrada.', 'success');
    } catch (err: any) {
      const msg = getFirebaseAuthErrorMessage(err.code || '');
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Google popup sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const res = await signInWithPopup(auth, provider);
        const user = res.user;

        const uid = user.uid;
        const storedRole = (localStorage.getItem(`foodlink_role_${uid}`) as RoleType) || 'establishment';
        const storedOrg = localStorage.getItem(`foodlink_org_${uid}`) || 'Organización Google Partner';

        const userProfile: UserProfile = {
          id: uid,
          name: user.displayName || 'Usuario Google Solidario',
          email: user.email || '',
          role: storedRole,
          organizationName: storedOrg,
          nitOrId: '900.123.456-7',
          phone: user.phoneNumber || '+57 300 123 4567',
          city: 'Medellín',
          verified: true,
          avatarUrl: user.photoURL || undefined,
          authProvider: 'google',
        };

        login(userProfile);
        return;
      }

      // Demo fallback
      const demoUser: UserProfile = {
        id: 'google_demo_' + Math.random().toString(36).substring(2, 7),
        name: 'Usuario Google Solidario',
        email: 'usuario.solidario@gmail.com',
        role: 'establishment',
        organizationName: 'Aliado Solidario Google',
        nitOrId: '900.888.777-1',
        phone: '+57 310 999 8888',
        city: 'Bogotá',
        verified: true,
        authProvider: 'google',
      };
      login(demoUser);
      showToast('Sesión iniciada con Google (Modo local)', 'success');
    } catch (err: any) {
      const msg = getFirebaseAuthErrorMessage(err.code || '');
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-4 sm:py-8 transition-colors duration-300">
      {/* Optional Top Warning if route guard triggered it */}
      {authModalMessage && (
        <div className="max-w-5xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-sm shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="font-semibold">{authModalMessage}</p>
        </div>
      )}

      {/* Main Grid: Left Value Proposition & 1-Click Demo Accounts | Right Login Form */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Brand Hero & Quick Demo Role Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Presentation Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="bg-white rounded-2xl p-1.5 shadow-md shrink-0">
                <img
                  src="/logo.png"
                  alt="Publik Solidario"
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] uppercase tracking-wider border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" />
                  Red Solidaria
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                  Publik Solidario
                </h1>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Plataforma de rescate y redistribución de alimentos. Conectamos comercios y restaurantes con bancos de alimentos y comedores comunitarios para erradicar el desperdicio.
            </p>

            {/* Key Value Points */}
            <div className="space-y-3 pt-2 text-xs border-t border-emerald-800/60">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/50 flex items-center justify-center shrink-0 text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Comercios & Donantes</h4>
                  <p className="text-slate-300 text-[11px]">Publica excedentes aptos para consumo y recupera costos operativos.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/50 flex items-center justify-center shrink-0 text-emerald-400">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Fundaciones & Comedores</h4>
                  <p className="text-slate-300 text-[11px]">Accede a lotes de alimentos frescos a precios solidarios o donación.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/50 flex items-center justify-center shrink-0 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Seguridad y Verificación NIT</h4>
                  <p className="text-slate-300 text-[11px]">Cifrado seguro, doble factor (2FA) y certificación de entregas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Access (1-Click Login for immediate evaluation) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Acceso Rápido de Prueba
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Haz clic en cualquier rol para ingresar inmediatamente sin escribir credenciales:
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {/* 1. Comercio */}
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('establishment')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        Comercio / Donante
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Supermercado
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      contacto@superlosandes.com.co
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 2. Fundación */}
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('buyer_foundation')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        Fundación Receptora
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-semibold">
                        Comedor Social
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      direccion@fundacionsaciar.org
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 3. Administrador */}
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('admin')}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        Administrador
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold">
                        Control Total
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      admin@foodlinksolidario.com
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Link to view public catalog or presentation without logging in */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>¿Solo deseas explorar?</span>
              <div className="flex items-center gap-3 font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Catálogo Público</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('landing')}
                  className="text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                >
                  Presentación
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Auth Card (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 px-4 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-4 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Registrarme</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className={`hidden sm:flex py-4 px-4 text-center transition-all cursor-pointer items-center justify-center gap-2 ${
                  activeTab === 'forgot' || activeTab === 'reset'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Recuperar</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              
              {/* TAB 1: INICIAR SESIÓN */}
              {activeTab === 'login' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black font-display text-slate-900 dark:text-slate-100">
                      Bienvenido de nuevo
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ingresa tus credenciales para acceder al panel de Publik Solidario.
                    </p>
                  </div>

                  {/* Unverified Email Warning */}
                  {unverifiedEmail && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2">
                      <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Verificación de correo requerida</p>
                          <p className="text-xs font-normal text-amber-800 dark:text-amber-300 mt-0.5">
                            Tu cuenta (<span className="font-semibold underline">{unverifiedEmail}</span>) aún no ha sido verificada. Debes abrir el enlace que enviamos a tu buzón para poder acceder.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/60">
                        <span className="text-xs text-amber-700 dark:text-amber-400">¿No recibiste el correo?</span>
                        <button
                          type="button"
                          disabled={isResendingVerification || verificationSent}
                          onClick={async () => {
                            setIsResendingVerification(true);
                            try {
                              if (isFirebaseConfigured && auth && password) {
                                const cred = await signInWithEmailAndPassword(auth, unverifiedEmail, password);
                                await sendEmailVerification(cred.user);
                                await signOut(auth);
                              }
                              setVerificationSent(true);
                              showToast('Correo de verificación reenviado.', 'success');
                            } catch (err: any) {
                              showToast(getFirebaseAuthErrorMessage(err?.code || ''), 'error');
                            } finally {
                              setIsResendingVerification(false);
                            }
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {verificationSent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>¡Enviado!</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reenviar correo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTab('forgot')}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me checkbox */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Mantener sesión iniciada</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Protección con cifrado TLS</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Iniciando sesión...</span>
                        </>
                      ) : (
                        <>
                          <span>Iniciar Sesión en Publik Solidario</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Alternative Sign-In Methods */}
                    <div className="pt-3">
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                        <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                          O accede con
                        </span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                      </div>

                      <div className="mt-2">
                        {/* Google Button */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-xs cursor-pointer shadow-2xs"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>Continuar con Google</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: REGISTRARME */}
              {activeTab === 'register' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black font-display text-slate-900 dark:text-slate-100">
                      Crear nueva cuenta
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Únete como comercio donante o fundación solidaria.
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4 text-xs">
                    {/* Role Picker */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Tipo de Entidad:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRegRole('establishment')}
                          className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                            regRole === 'establishment'
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Building2 className="w-5 h-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs block">Comercio / Donante</span>
                          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                            Supermercados, restaurantes
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegRole('buyer_foundation')}
                          className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                            regRole === 'buyer_foundation'
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <HeartHandshake className="w-5 h-5 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                          <span className="text-xs block">Fundación / Receptor</span>
                          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 block mt-0.5">
                            Bancos de alimentos, comedores
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Org Name and Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Nombre de la Organización:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Supermercado El Trébol"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Persona de Contacto:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Laura Ramírez"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                        />
                      </div>
                    </div>

                    {/* Email with Debounce Check */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Correo Corporativo o Institucional:
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="contacto@organizacion.org"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-9 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                        />
                        {isCheckingEmail && (
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-2.5" />
                        )}
                        {!isCheckingEmail && emailCheckResult && !emailCheckResult.exists && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                        )}
                      </div>
                      {emailCheckResult?.exists && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                          Este correo ya está registrado. Por favor inicia sesión.
                        </p>
                      )}
                    </div>

                    {/* Password & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Contraseña:
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 8 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Confirmar Contraseña:
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Repite la contraseña"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                        />
                      </div>
                    </div>

                    {/* Password strength meter */}
                    {regPassword && (
                      <PasswordStrengthMeter
                        password={regPassword}
                        onStrengthChange={setPasswordStrength}
                      />
                    )}

                    {/* City */}
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Ciudad Principal:
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                      >
                        <option value="Medellín">Medellín (Área Metropolitana)</option>
                        <option value="Bogotá">Bogotá D.C.</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                        <option value="Pereira">Pereira (Eje Cafetero)</option>
                      </select>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 cursor-pointer"
                      />
                      <span>
                        Acepto los términos de servicio, política de donaciones y compromisos de inocuidad alimentaria de Publik Solidario.
                      </span>
                    </label>

                    {/* Register submit */}
                    <button
                      type="submit"
                      disabled={isLoading || !termsAccepted || Boolean(emailCheckResult?.exists)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creando cuenta...</span>
                        </>
                      ) : (
                        <>
                          <span>Registrar mi Organización</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: RECUPERAR CONTRASEÑA */}
              {(activeTab === 'forgot' || activeTab === 'reset') && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-black font-display text-slate-900 dark:text-slate-100">
                      Recuperación de Acceso
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Te enviaremos un enlace seguro para restablecer tu contraseña.
                    </p>
                  </div>

                  {!forgotPasswordSubmitted ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Correo Electrónico Registrado:
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            required
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 transition-all text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enviando enlace...</span>
                          </>
                        ) : (
                          <>
                            <span>Enviar Enlace de Recuperación</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                            Enlace de recuperación emitido
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Revisa el buzón de <span className="font-bold text-emerald-700 dark:text-emerald-400">{email}</span> para actualizar tu contraseña de forma segura.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      ← Volver a Iniciar Sesión
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
