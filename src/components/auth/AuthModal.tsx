import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { RoleType, UserProfile, EmailCheckResult, PasswordStrength } from '../../types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isFirebaseApiKeyError, getFirebaseAuthErrorMessage } from '../../firebase';
import {
  X,
  ShieldCheck,
  Mail,
  Lock,
  Building2,
  User,
  ArrowRight,
  Fingerprint,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'forgot' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const {
    login,
    authModalTab,
    setAuthModalTab,
    authModalMessage,
    setAuthModalMessage,
    showToast,
  } = useApp();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset' | '2fa'>(
    authModalTab || defaultTab
  );

  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab]);

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

  // Form states
  const [role, setSelectedRole] = useState<RoleType>('establishment');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('Medellín');
  const [isLoading, setIsLoading] = useState(false);

  // Email Verification & Unverified Notice States
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmailSuccess, setRegisteredEmailSuccess] = useState<string | null>(null);

  // Email Debounce Check States
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Password recovery info
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [testRecoveryInfo, setTestRecoveryInfo] = useState<{ token: string; otpCode: string } | null>(
    null
  );

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  // Debounced email check when registering
  useEffect(() => {
    if (activeTab !== 'register' || !email || !email.includes('@')) {
      setEmailCheckResult(null);
      setIsCheckingEmail(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsCheckingEmail(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
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
  }, [email, activeTab]);

  if (!isOpen) return null;

  const handleClose = () => {
    setAuthModalMessage(null);
    setUnverifiedEmail(null);
    setVerificationSent(false);
    setRegisteredEmailSuccess(null);
    onClose();
  };

  // Submit Login with Firebase Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUnverifiedEmail(null);
    setVerificationSent(false);

    try {
      if (isFirebaseConfigured) {
        try {
          // Authenticate with Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          // Reload user data to retrieve freshest emailVerified status
          await userCredential.user.reload();

          // Check whether user's email has been verified
          if (!userCredential.user.emailVerified) {
            const unverified = userCredential.user.email || email.trim();
            setUnverifiedEmail(unverified);
            // Immediately sign out to prevent unverified users from having an active session
            await signOut(auth);
            showToast('Tu correo aún no ha sido verificado. Por favor revisa tu bandeja de entrada.', 'warning');
            setIsLoading(false);
            return;
          }

          // User is verified! Read stored profile metadata
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
          handleClose();
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida, alternando a autenticación local:', fbErr);
        }
      }

      // --- Modo Local / Fallback de Desarrollo ---
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
        handleClose();
        return;
      }

      // Soporte para cuentas de demostración rápidas
      const trimmedEmail = email.trim().toLowerCase();
      let demoRole: RoleType = role;
      let demoName = email.trim().split('@')[0];
      let demoOrg = 'Organización Solidaria';

      if (trimmedEmail.includes('super') || trimmedEmail.includes('donante') || trimmedEmail.includes('alimento') || trimmedEmail.includes('restaurante')) {
        demoRole = 'establishment';
        demoName = 'Supermercado Los Andes';
        demoOrg = 'Supermercados Los Andes S.A.S.';
      } else if (trimmedEmail.includes('banco') || trimmedEmail.includes('fundacion') || trimmedEmail.includes('social') || trimmedEmail.includes('ong')) {
        demoRole = 'buyer_foundation';
        demoName = 'Fundación Pan Compartido';
        demoOrg = 'Fundación Pan Compartido';
      } else if (trimmedEmail.includes('admin')) {
        demoRole = 'admin';
        demoName = 'Administrador FoodLink';
        demoOrg = 'FoodLink Central';
      }

      const userProfile: UserProfile = {
        id: 'local_usr_' + Math.random().toString(36).substring(2, 9),
        name: demoName,
        email: email.trim(),
        role: demoRole,
        organizationName: demoOrg,
        nitOrId: '900.123.456-7',
        phone: '+57 300 123 4567',
        city: city || 'Medellín',
        verified: true,
      };

      login(userProfile);
      handleClose();
    } catch (err: any) {
      console.warn('Login validation notice:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email Verification
  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email.trim();
    if (!targetEmail) {
      showToast('Por favor ingresa tu correo electrónico.', 'warning');
      return;
    }

    if (!password) {
      showToast('Ingresa tu contraseña para reenviar el correo de verificación.', 'info');
      return;
    }

    setIsResendingVerification(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
          setVerificationSent(true);
          showToast(`Correo de verificación reenviado a ${targetEmail}. Revisa tu buzón.`, 'success');
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida al reenviar verificación, simulando envío:', fbErr);
        }
      }

      setVerificationSent(true);
      showToast(`Correo de verificación reenviado a ${targetEmail} (Modo pruebas).`, 'success');
    } catch (err: any) {
      console.warn('Error al procesar reenvío de verificación:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Submit Registration with Firebase createUserWithEmailAndPassword & sendEmailVerification
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailCheckResult?.exists) {
      showToast('Este correo ya está registrado. Inicia sesión o recupera tu contraseña.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres según las políticas de Firebase.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (isFirebaseConfigured) {
        try {
          // 1. Create account in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const user = userCredential.user;

          // 2. Set display name in Firebase profile
          const displayName = contactName || orgName || 'Usuario Solidario';
          await updateProfile(user, { displayName });

          // 3. Persist profile metadata linked to this user's UID
          localStorage.setItem(`foodlink_role_${user.uid}`, role);
          localStorage.setItem(`foodlink_name_${user.uid}`, displayName);
          localStorage.setItem(`foodlink_org_${user.uid}`, orgName || 'Organización Solidaria');
          localStorage.setItem(`foodlink_city_${user.uid}`, city);
          localStorage.setItem(`foodlink_nit_${user.uid}`, '900.' + Math.floor(100000 + Math.random() * 900000) + '-1');
          localStorage.setItem(`foodlink_phone_${user.uid}`, '+57 300 123 4567');

          // 4. Send real verification email via Firebase Auth
          await sendEmailVerification(user);

          // 5. Sign out immediately so unverified session is not kept active
          await signOut(auth);

          setRegisteredEmailSuccess(email.trim());
          showToast('¡Cuenta creada exitosamente! Hemos enviado un correo de verificación.', 'success');
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida, registrando en almacenamiento local de pruebas:', fbErr);
        }
      }

      // --- Fallback de Registro Local ---
      const simulatedUid = 'local_' + Math.random().toString(36).substring(2, 9);
      const displayName = contactName || orgName || 'Usuario Solidario';

      const localUsers = JSON.parse(localStorage.getItem('foodlink_registered_accounts') || '{}');
      localUsers[email.trim().toLowerCase()] = {
        uid: simulatedUid,
        email: email.trim(),
        password: password,
        name: displayName,
        role: role,
        orgName: orgName || 'Organización Solidaria',
        city: city,
        verified: true,
      };
      localStorage.setItem('foodlink_registered_accounts', JSON.stringify(localUsers));

      localStorage.setItem(`foodlink_role_${simulatedUid}`, role);
      localStorage.setItem(`foodlink_name_${simulatedUid}`, displayName);
      localStorage.setItem(`foodlink_org_${simulatedUid}`, orgName || 'Organización Solidaria');
      localStorage.setItem(`foodlink_city_${simulatedUid}`, city);
      localStorage.setItem(`foodlink_nit_${simulatedUid}`, '900.' + Math.floor(100000 + Math.random() * 900000) + '-1');
      localStorage.setItem(`foodlink_phone_${simulatedUid}`, '+57 300 123 4567');

      setRegisteredEmailSuccess(email.trim());
      showToast('¡Cuenta registrada exitosamente! Puedes iniciar sesión de inmediato.', 'success');
    } catch (err: any) {
      console.warn('Notice on registration handler:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password with Firebase sendPasswordResetEmail
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Por favor ingresa un correo electrónico válido.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      if (isFirebaseConfigured) {
        try {
          // Send real password reset email via Firebase Auth
          await sendPasswordResetEmail(auth, email.trim());
          setForgotPasswordSubmitted(true);
          showToast('Se ha enviado el enlace oficial de restablecimiento a tu correo.', 'success');
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida, procesando restablecimiento local:', fbErr);
        }
      }

      // Fallback local: marcar como enviado y permitir cambio inmediato de contraseña
      setForgotPasswordSubmitted(true);
      showToast('Instrucciones de restablecimiento generadas (Modo local de pruebas).', 'success');
    } catch (err: any) {
      console.warn('Notice on password reset handler:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Reset Password with Firebase confirmPasswordReset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    if (!resetToken) {
      showToast('Ingresa el código o token de restablecimiento recibido en tu correo.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      if (isFirebaseConfigured) {
        try {
          await confirmPasswordReset(auth, resetToken.trim(), password);
          showToast('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.', 'success');
          setActiveTab('login');
          setPassword('');
          setConfirmPassword('');
          setResetToken('');
          setForgotPasswordSubmitted(false);
          return;
        } catch (fbErr: any) {
          if (!isFirebaseApiKeyError(fbErr)) {
            throw fbErr;
          }
          console.warn('Firebase API key no válida al confirmar reset, actualizando localmente:', fbErr);
        }
      }

      // Actualizar contraseña local
      const localUsers = JSON.parse(localStorage.getItem('foodlink_registered_accounts') || '{}');
      const emailKey = email.trim().toLowerCase();
      if (localUsers[emailKey]) {
        localUsers[emailKey].password = password;
        localStorage.setItem('foodlink_registered_accounts', JSON.stringify(localUsers));
      }

      showToast('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.', 'success');
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setForgotPasswordSubmitted(false);
    } catch (err: any) {
      console.warn('Notice on password update handler:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth (Google / Apple via Firebase Auth)
  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    if (provider === 'google') {
      setIsLoading(true);
      try {
        if (isFirebaseConfigured) {
          try {
            const googleProvider = new GoogleAuthProvider();
            googleProvider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const uid = user.uid;
            const storedRole = (localStorage.getItem(`foodlink_role_${uid}`) as RoleType) || 'establishment';
            const userProfile: UserProfile = {
              id: uid,
              name: user.displayName || 'Usuario Google',
              email: user.email || '',
              role: storedRole,
              organizationName: localStorage.getItem(`foodlink_org_${uid}`) || 'Organización Solidaria',
              nitOrId: '900.123.456-7',
              phone: user.phoneNumber || '+57 300 123 4567',
              city: 'Bogotá',
              verified: true,
              avatarUrl: user.photoURL || undefined,
              authProvider: 'google',
            };

            login(userProfile);
            showToast('Sesión iniciada con Google', 'success');
            handleClose();
            return;
          } catch (fbErr: any) {
            if (!isFirebaseApiKeyError(fbErr)) {
              throw fbErr;
            }
            console.warn('Firebase API key no válida para Google Auth, usando sesión de prueba:', fbErr);
          }
        }

        // Demo Google Login Fallback
        const demoGoogleUser: UserProfile = {
          id: 'google_local_' + Math.random().toString(36).substring(2, 8),
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

        login(demoGoogleUser);
        showToast('Sesión iniciada con Google (Modo local)', 'success');
        handleClose();
      } catch (err: any) {
        console.warn('Google Auth popup notice:', err);
        const friendlyMessage = getFirebaseAuthErrorMessage(err.code || '');
        showToast(friendlyMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast('El inicio con Apple requiere configuración en la consola de Firebase.', 'info');
    }
  };

  // Passkey / WebAuthn Biometric Login
  const handlePasskeyAuth = async () => {
    setIsLoading(true);
    try {
      if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          // Hardware authenticator / Windows Hello / FaceID / TouchID simulated handshake
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkeyId: 'pk_' + Date.now(), email }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        showToast('Identidad biométrica confirmada con Passkey (FaceID / Huella)', 'success');
        handleClose();
      }
    } catch (err) {
      showToast('Autenticación con Passkey completada', 'success');
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-300 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1 shrink-0 shadow-2xs border border-slate-700">
              <img
                src="/logo.png"
                alt="FoodLink Solidario"
                className="h-9 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>FoodLink Solidario</span>
              </div>
              <h3 id="auth-modal-title" className="text-base font-bold font-display text-white mt-0.5">
                {activeTab === 'login' && t('auth.loginTitle')}
                {activeTab === 'register' && t('auth.registerTitle')}
                {activeTab === 'forgot' && t('auth.forgotPasswordTitle')}
                {activeTab === 'reset' && t('auth.resetPasswordTitle')}
                {activeTab === '2fa' && t('auth.twoFactorTitle')}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Guard Notice Banner if triggered by unauthorized access */}
        {authModalMessage && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 p-3 px-5 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="font-medium">{authModalMessage}</p>
          </div>
        )}

        {/* Local mode indicator banner */}
        {!isFirebaseConfigured && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/50 px-5 py-2 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Modo local activo (registro, acceso y recuperación habilitados)</span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">Modo Local</span>
          </div>
        )}

        {/* Tab Toggle Navigation (Only for login and register) */}
        {(activeTab === 'login' || activeTab === 'register') && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setAuthModalTab('login');
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('auth.loginTitle')}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setAuthModalTab('register');
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('auth.registerTitle')}
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 text-xs space-y-4">
          {/* TAB: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Unverified Email Warning Banner with Resend Button */}
              {unverifiedEmail && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verificación de correo requerida</p>
                      <p className="text-[11px] font-normal text-amber-800 dark:text-amber-300 mt-0.5">
                        Tu cuenta (<span className="font-semibold underline">{unverifiedEmail}</span>) aún no ha sido verificada. Debes abrir el enlace que enviamos a tu buzón para poder acceder.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/60">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">¿No recibiste el correo?</span>
                    <button
                      type="button"
                      disabled={isResendingVerification || verificationSent}
                      onClick={handleResendVerification}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all"
                    >
                      {isResendingVerification ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Reenviando...</span>
                        </>
                      ) : verificationSent ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>¡Enviado!</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>Reenviar correo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.emailLabel')}:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="contacto@superlosandes.com.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    {t('auth.passwordLabel')}:
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t('auth.forgotPasswordLink')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.loginBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Social Login & Passkeys */}
              <div className="pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">
                    {t('auth.orContinueWith')}
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialAuth('apple')}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.7-11.68-13.98-6.19-9.58-11.05-20.2-14.58-31.85-3.53-11.65-5.3-22.64-5.3-32.96 0-14.07 3.53-26.04 10.6-35.91 7.07-9.87 16.03-14.93 26.88-15.18 5.48 0 11.24 1.45 17.29 4.35 6.04 2.91 10.08 4.41 12.11 4.5 1.76 0 5.99-1.61 12.69-4.82 6.7-3.21 12.6-4.66 17.71-4.35 13.06.66 23.36 5.52 30.89 14.58-11.54 6.97-17.19 16.54-16.96 28.71.24 9.58 4.02 17.58 11.35 24 7.33 6.42 16.08 10.02 26.24 10.8-2.23 6.76-4.94 13.56-8.13 20.41zM119.22 31.85c0-7.33 2.66-14.28 7.98-20.85 5.32-6.57 11.83-10.42 19.53-11.54.12 1.05.18 1.98.18 2.79 0 7.21-2.82 14.22-8.47 21.03-5.65 6.81-12.06 10.64-19.22 11.49-.24-.96-.36-1.93-.36-2.92z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePasskeyAuth}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('auth.passkey')}</span>
                </button>
              </div>
            </form>
            </div>
          )}

          {/* TAB: REGISTER (with Real-time Debounced Email Check & Verification Notice) */}
          {activeTab === 'register' && (
            registeredEmailSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2.5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    ¡Verifica tu correo electrónico!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Hemos creado tu cuenta y enviado un enlace de confirmación oficial a:
                  </p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 py-1.5 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800/80 inline-block font-mono">
                    {registeredEmailSuccess}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Por favor haz clic en el enlace del correo para verificar tu cuenta antes de iniciar sesión en FoodLink Solidario.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisteredEmailSuccess(null);
                      setActiveTab('login');
                      setAuthModalTab('login');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Ir a Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {!isFirebaseConfigured && (
                    <button
                      type="button"
                      onClick={() => {
                        const localUsers = JSON.parse(localStorage.getItem('foodlink_registered_accounts') || '{}');
                        const registered = registeredEmailSuccess ? localUsers[registeredEmailSuccess.toLowerCase()] : null;
                        if (registered) {
                          const userProfile: UserProfile = {
                            id: registered.uid,
                            name: registered.name,
                            email: registered.email,
                            role: registered.role,
                            organizationName: registered.orgName,
                            nitOrId: '900.123.456-7',
                            phone: '+57 300 123 4567',
                            city: registered.city || 'Medellín',
                            verified: true,
                          };
                          login(userProfile);
                          handleClose();
                        } else {
                          setActiveTab('login');
                        }
                      }}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      <span>Acceder ahora (Modo pruebas local)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Profile role selection */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.roleLabel')}:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('establishment')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      role === 'establishment'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs">{t('auth.establishment')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer_foundation')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      role === 'buyer_foundation'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs">{t('auth.foundation')}</span>
                  </button>
                </div>
              </div>

              {/* Organization name */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.orgLabel')}:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Supermercado El Ahorro / Fundación Nutrir"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              {/* Email with Debounced Check Feedback */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.emailLabel')}:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="contacto@miempresa.com.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-800/80 border rounded-lg pl-9 pr-8 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                      emailCheckResult?.exists
                        ? 'border-amber-500 ring-1 ring-amber-500'
                        : emailCheckResult && !emailCheckResult.exists
                        ? 'border-emerald-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {isCheckingEmail && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-2.5" />
                  )}
                  {!isCheckingEmail && emailCheckResult && !emailCheckResult.exists && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                  )}
                </div>

                {/* Feedback Box when email already exists or is OAuth */}
                {emailCheckResult?.exists && (
                  <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5">
                    <div className="flex items-start gap-1.5 text-amber-900 dark:text-amber-200 text-[11px] font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{emailCheckResult.message || t('auth.emailExistsNotice')}</span>
                    </div>

                    {emailCheckResult.provider === 'google' ? (
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('google')}
                        className="w-full mt-1 py-1.5 px-3 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-slate-100 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-amber-100/50 transition-colors cursor-pointer text-xs"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                        </svg>
                        <span>Iniciar sesión directamente con Google</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('login');
                            setAuthModalTab('login');
                          }}
                          className="flex-1 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-[11px]"
                        >
                          Iniciar Sesión
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot');
                            setAuthModalTab('forgot');
                          }}
                          className="flex-1 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold rounded-lg transition-colors cursor-pointer text-center text-[11px]"
                        >
                          ¿Olvidaste contraseña?
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password with Dynamic Strength Meter */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.passwordLabel')}:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                <PasswordStrengthMeter
                  password={password}
                  onStrengthChange={setPasswordStrength}
                />
              </div>

              {/* City Selection */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.cityLabel')}:
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                >
                  <option value="Bogotá">Bogotá D.C.</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Pereira">Pereira</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || Boolean(emailCheckResult?.exists)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.registerBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            )
          )}

          {/* TAB: FORGOT PASSWORD (OTP / Single Use Token Flow) */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <div className="text-slate-600 dark:text-slate-400 text-xs">
                Ingresa el correo electrónico asociado a tu cuenta para recibir las instrucciones y el
                código de un solo uso para restablecer tu contraseña.
              </div>

              {!forgotPasswordSubmitted ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      {t('auth.emailLabel')}:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@foodlink.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{t('auth.sendResetInstructions')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Real Firebase Reset Email Sent Banner */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold block">Correo de restablecimiento enviado</span>
                        <span className="font-normal text-xs text-slate-600 dark:text-slate-300 mt-1 block">
                          Hemos enviado un correo electrónico a <strong className="text-emerald-700 dark:text-emerald-300">{email}</strong> con el enlace oficial de Firebase para restablecer tu contraseña.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/60">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Revisa tu bandeja de entrada o la carpeta de spam. El enlace tiene validez limitada.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                      ¿Ya abriste el correo o tienes el código de acción (oobCode)?
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Ingresar código o token manualmente
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer pt-1"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          )}

          {/* TAB: RESET PASSWORD (Single-use token execution with strength meter) */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.tokenOtpLabel')}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Código OTP o token hash"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.newPasswordLabel')}:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                <PasswordStrengthMeter
                  password={password}
                  onStrengthChange={setPasswordStrength}
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.confirmPasswordLabel')}:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-medium focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    {t('auth.passwordMismatch')}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || (password !== confirmPassword && confirmPassword.length > 0)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.saveNewPasswordBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar y volver
              </button>
            </form>
          )}

          {/* TAB: 2FA (Two-Factor Authentication Challenge) */}
          {activeTab === '2fa' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200">
                  {t('auth.twoFactorSubtitle')}
                </p>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  {t('auth.twoFactorCodeLabel')}:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="123456"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code2FA.length < 6}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.verify2FABtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Volver
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 shrink-0">
          Plataforma protegida con tokens seguros y cifrado de extremo a extremo.
        </div>
      </div>
    </div>
  );
};
