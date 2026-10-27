import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserRole,
  FoodProduct,
  ProductOffer,
  NotificationItem,
  NotificationType,
  DurationDays,
  ProductStatus,
  CommissionRecord,
  UserProfile,
  ThemeMode,
  SupportedLanguage,
  EmailCheckResult,
  PasswordStrength,
} from '../types';
import {
  COMMISSION_PRICING,
  INITIAL_PRODUCTS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMMISSIONS,
} from '../data/initialData';
import {
  subscribeToProducts,
  createProductInFirestore,
  updateProductStatusInFirestore,
  incrementProductViewsInFirestore,
  subscribeToUserConversations,
  getOrCreateConversationInFirestore,
  sendMessageInFirestore,
  respondToOfferInFirestore,
} from '../services/firestoreService';
import {
  auth,
  db,
  isFirebaseConfigured,
  getFirebaseAuthErrorMessage,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  fetchSignInMethodsForEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useI18n } from '../i18n/I18nContext';

export const SELLER_ONLY_TABS = new Set(['publish', 'my-publications', 'statistics']);

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationName?: string;
  nitOrId?: string;
  phone?: string;
  city?: string;
}

export interface AuthActionResponse {
  success: boolean;
  message: string;
  code?: string;
  requiresEmailVerification?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Navigation & Auth State
  showLanding: boolean;
  setShowLanding: (show: boolean) => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userProfile: UserProfile;
  currentUser: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  upgradeToSeller: () => Promise<AuthActionResponse>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  navigateWithGuard: (view: string) => void;

  // Email verification state
  emailVerificationPending: boolean;
  pendingVerificationEmail: string;
  resendVerificationEmail: () => Promise<AuthActionResponse>;
  checkEmailVerificationStatus: () => Promise<{ verified: boolean; message: string }>;
  clearEmailVerificationPending: () => Promise<void>;

  // Auth Actions
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialMode: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  authModalMessage: string | null;
  setAuthModalMessage: (msg: string | null) => void;
  openAuthModal: (mode?: 'login' | 'register', preselectedRole?: UserRole) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthActionResponse>;
  registerUser: (data: RegisterPayload) => Promise<AuthActionResponse>;
  loginWithSocial: (provider: 'google', preferredRole?: UserRole) => Promise<AuthActionResponse>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  checkEmailExists: (email: string) => Promise<EmailCheckResult>;
  evaluatePasswordStrength: (password: string) => PasswordStrength;
  toggle2FA: (enabled?: boolean) => void;
  logout: () => Promise<{ success: boolean; error?: string }>;

  // Preferences (Dark Mode & Language)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;

  // Search & Favorites & Toasts
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Data
  products: FoodProduct[];
  offers: ProductOffer[];
  notifications: NotificationItem[];
  commissions: CommissionRecord[];
  commissionRecords: CommissionRecord[];
  commissionPricing: typeof COMMISSION_PRICING;
  updateCommissionPricing: (pricing: typeof COMMISSION_PRICING) => void;
  resetCommissionPricing: () => void;
  unreadNotificationsCount: number;
  loadDemoData: () => void;

  // Modals & Selection
  selectedProduct: FoodProduct | null;
  setSelectedProduct: (product: FoodProduct | null) => void;
  selectedProductIdForDetail: string | null;
  setSelectedProductIdForDetail: (id: string | null) => void;
  makingOfferProduct: FoodProduct | null;
  setMakingOfferProduct: (product: FoodProduct | null) => void;
  activeNegotiationOffer: ProductOffer | null;
  setActiveNegotiationOffer: (offer: ProductOffer | null) => void;
  selectedOfferIdForNegotiation: string | null;
  setSelectedOfferIdForNegotiation: (id: string | null) => void;
  deliveryActOffer: ProductOffer | null;
  setDeliveryActOffer: (offer: ProductOffer | null) => void;
  isPublishModalOpen: boolean;
  setIsPublishModalOpen: (open: boolean) => void;

  // Actions
  addProduct: (
    productData: Omit<
      FoodProduct,
      'id' | 'publishedAt' | 'expiresAt' | 'status' | 'commissionPaid' | 'offersCount' | 'viewsCount'
    >
  ) => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  changeProductStatus: (productId: string, status: ProductStatus) => void;
  simulateExpirationForProduct: (productId: string) => void;
  republishProduct: (productId: string, durationDays: DurationDays, paymentMethod?: string) => void;
  renewProduct: (productId: string, durationDays: DurationDays, paymentMethod?: string) => void;
  createOffer: (
    offerData: Omit<
      ProductOffer,
      'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'
    >
  ) => Promise<ProductOffer> | ProductOffer;
  startNegotiationWithSeller: (
    product: FoodProduct,
    initialMessage?: string
  ) => Promise<string>;
  updateOfferStatus: (
    offerId: string,
    status: 'aceptada' | 'rechazada' | 'contraoferta',
    counterPrice?: number,
    counterQuantity?: number,
    counterMessage?: string
  ) => void;
  respondToOffer: (
    offerId: string,
    status: 'aceptada' | 'rechazada' | 'contraoferta',
    counterPrice?: number,
    counterQuantity?: number,
    counterMessage?: string
  ) => void;
  sendOfferMessage: (
    offerId: string,
    text: string,
    isProposal?: boolean,
    proposedPrice?: number,
    proposedQuantity?: number
  ) => void;
  sendMessageToOffer: (
    offerId: string,
    text: string,
    isProposal?: boolean,
    proposedPrice?: number,
    proposedQuantity?: number
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  toggleNotificationRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  runExpirationAlertsCheck: (force?: boolean) => void;
  checkProductExpirations: (force?: boolean) => void;
  getCommissionForDuration: (days: DurationDays) => number;
  getCommissionForDays: (days: DurationDays) => number;
  formatCOP: (amount: number) => string;
}

const EMPTY_USER_PROFILE: UserProfile = {
  id: '',
  uid: '',
  name: '',
  email: '',
  role: 'buyer',
  photoURL: '',
  avatarUrl: '',
  organizationName: '',
  nitOrId: '',
  phone: '',
  city: 'Bogotá D.C.',
  verified: false,
  twoFactorEnabled: false,
  preferredLanguage: 'es',
  preferredTheme: 'light',
};

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    'nav.home': 'Inicio / Resumen',
    'nav.explore': 'Explorar Productos',
    'nav.map': 'Mapa Solidario',
    'nav.publish': 'Publicar Producto',
    'nav.myPublications': 'Mis Publicaciones',
    'nav.offers': 'Ofertas Recibidas',
    'nav.myOffers': 'Mis Ofertas Enviadas',
    'nav.negotiations': 'Negociaciones',
    'nav.notifications': 'Notificaciones',
    'nav.statistics': 'Estadísticas',
    'nav.profile': 'Configuración de Perfil',
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Crear Cuenta',
    'auth.logout': 'Cerrar Sesión',
    'auth.welcome': 'Bienvenido de nuevo',
    'role.seller': 'Vendedor',
    'role.buyer': 'Comprador',
  },
  en: {
    'nav.home': 'Home / Overview',
    'nav.explore': 'Explore Products',
    'nav.map': 'Solidarity Map',
    'nav.publish': 'Publish Product',
    'nav.myPublications': 'My Publications',
    'nav.offers': 'Received Offers',
    'nav.myOffers': 'My Sent Offers',
    'nav.negotiations': 'Negotiations',
    'nav.notifications': 'Notifications',
    'nav.statistics': 'Analytics & Impact',
    'nav.profile': 'Profile Settings',
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.logout': 'Sign Out',
    'auth.welcome': 'Welcome back',
    'role.seller': 'Seller',
    'role.buyer': 'Buyer',
  },
};

const USER_PROFILES_CACHE_KEY = 'foodlink_users_firestore_cache_v3';

function readCachedUserProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILES_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, UserProfile>;
    return map[uid] || null;
  } catch {
    return null;
  }
}

function writeCachedUserProfile(profile: UserProfile): void {
  if (!profile.id) return;
  try {
    const raw = localStorage.getItem(USER_PROFILES_CACHE_KEY);
    const map: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
    map[profile.id] = profile;
    localStorage.setItem(USER_PROFILES_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function isOfflineFirestoreError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    msg.includes('offline') ||
    msg.includes('unavailable') ||
    msg.includes('network') ||
    msg.includes('could not reach')
  );
}

function normalizeRole(rawRole: unknown): UserRole {
  if (rawRole === 'seller' || rawRole === 'establishment') {
    return 'seller';
  }
  return 'buyer';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('foodlink_is_auth_v3');
    return savedAuth !== 'true';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] = useState<boolean>(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');

  const [userProfile, setUserProfile] = useState<UserProfile>(EMPTY_USER_PROFILE);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('buyer');

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [commissionPricing, setCommissionPricing] = useState<typeof COMMISSION_PRICING>(COMMISSION_PRICING);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const updateCommissionPricing = useCallback((pricing: typeof COMMISSION_PRICING) => {
    setCommissionPricing(pricing);
  }, []);

  const resetCommissionPricing = useCallback(() => {
    setCommissionPricing(COMMISSION_PRICING);
  }, []);

  // Lock map to avoid duplicate Firestore user profile creations on concurrent auth events
  const userDocLocksRef = useRef<Map<string, Promise<UserProfile>>>(new Map());

  // Preferences: Theme & Language
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('foodlink_theme_mode') as ThemeMode | null;
    return saved || 'light';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const { language: i18nLang, setLanguage: setI18nLanguage, toggleLanguage: i18nToggle, t: i18nT } = useI18n();

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return i18nLang || 'es';
  });

  useEffect(() => {
    if (i18nLang && i18nLang !== language) {
      setLanguageState(i18nLang);
    }
  }, [i18nLang, language]);

  useEffect(() => {
    localStorage.setItem('foodlink_theme_mode', themeMode);
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };
    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setI18nLanguage(lang);
  };

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      return i18nT(key, fallback, params);
    },
    [i18nT]
  );

  /**
   * Syncs user metadata with backend `/api/auth/sync-user` for accurate email existence checks.
   */
  const syncUserWithBackend = useCallback(async (profile: UserProfile) => {
    try {
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          organizationName: profile.organizationName,
          nitOrId: profile.nitOrId,
          phone: profile.phone,
          city: profile.city,
          verified: profile.verified,
          provider: profile.authProvider || 'email',
        }),
      });
    } catch {
      // Non-blocking sync
    }
  }, []);

  /**
   * Ensures a Firestore document `users/{uid}` exists for the authenticated Firebase user,
   * preventing duplicate documents and normalizing the profile structure.
   */
  const ensureUserProfileInFirestore = useCallback(
    async (
      firebaseUser: FirebaseUser,
      preferredRole?: UserRole,
      registrationDetails?: Partial<RegisterPayload>
    ): Promise<UserProfile> => {
      const uid = firebaseUser.uid;
      const existingPromise = userDocLocksRef.current.get(uid);
      if (existingPromise) {
        return existingPromise;
      }

      const task = (async (): Promise<UserProfile> => {
        const userDocRef = doc(db, 'users', uid);
        let snapshot;
        try {
          snapshot = await getDoc(userDocRef);
        } catch (error) {
          if (!isOfflineFirestoreError(error)) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
          }
        }

        const isGoogleProvider = firebaseUser.providerData.some(p => p.providerId === 'google.com');
        const providerType: 'email' | 'google' = isGoogleProvider ? 'google' : 'email';

        if (snapshot && snapshot.exists()) {
          const data = snapshot.data();
          const role = normalizeRole(data.role);
          const loadedProfile: UserProfile = {
            id: uid,
            uid,
            name: String(data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario'),
            email: String(data.email || firebaseUser.email || '').toLowerCase(),
            role,
            photoURL: String(data.photoURL || firebaseUser.photoURL || ''),
            avatarUrl: String(data.photoURL || firebaseUser.photoURL || ''),
            organizationName: String(data.organizationName || data.name || 'Usuario Independiente'),
            nitOrId: String(data.nitOrId || 'Pendiente'),
            phone: String(data.phone || 'Pendiente'),
            city: String(data.city || 'Bogotá D.C.'),
            verified: Boolean(firebaseUser.emailVerified || isGoogleProvider || data.verified),
            twoFactorEnabled: Boolean(data.twoFactorEnabled),
            preferredLanguage: (data.preferredLanguage as SupportedLanguage) || 'es',
            preferredTheme: (data.preferredTheme as ThemeMode) || 'light',
            authProvider: (data.authProvider as 'email' | 'google') || providerType,
            createdAt: String(data.createdAt || new Date().toISOString()),
            updatedAt: String(data.updatedAt || new Date().toISOString()),
          };
          writeCachedUserProfile(loadedProfile);
          await syncUserWithBackend(loadedProfile);
          return loadedProfile;
        }

        const cachedExisting = readCachedUserProfile(uid);
        if (cachedExisting && !registrationDetails) {
          const recoveredProfile: UserProfile = {
            ...cachedExisting,
            role: normalizeRole(cachedExisting.role),
            verified: Boolean(firebaseUser.emailVerified || isGoogleProvider || cachedExisting.verified),
          };
          writeCachedUserProfile(recoveredProfile);
          await syncUserWithBackend(recoveredProfile);
          return recoveredProfile;
        }

        // First-time user: create document in `users/{uid}`
        const nowIso = new Date().toISOString();
        const assignedRole: UserRole = normalizeRole(preferredRole || registrationDetails?.role || 'buyer');
        const cleanName = (
          registrationDetails?.name ||
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'Usuario'
        )
          .trim()
          .slice(0, 120);
        const cleanEmail = (registrationDetails?.email || firebaseUser.email || '')
          .trim()
          .toLowerCase()
          .slice(0, 160);
        const cleanPhotoURL = (firebaseUser.photoURL || '').slice(0, 1024);
        const cleanOrg = (
          registrationDetails?.organizationName ||
          cleanName ||
          'Usuario Independiente'
        )
          .trim()
          .slice(0, 160);
        const cleanNit = (registrationDetails?.nitOrId || 'Pendiente').trim().slice(0, 60);
        const cleanPhone = (registrationDetails?.phone || firebaseUser.phoneNumber || 'Pendiente')
          .trim()
          .slice(0, 40);
        const cleanCity = (registrationDetails?.city || 'Bogotá D.C.').trim().slice(0, 80);

        const newFirestoreDoc = {
          uid,
          name: cleanName,
          email: cleanEmail,
          role: assignedRole,
          photoURL: cleanPhotoURL,
          organizationName: cleanOrg,
          nitOrId: cleanNit,
          phone: cleanPhone,
          city: cleanCity,
          verified: Boolean(firebaseUser.emailVerified || isGoogleProvider),
          authProvider: providerType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(userDocRef, newFirestoreDoc);
        } catch (error) {
          if (!isOfflineFirestoreError(error)) {
            handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
          }
        }

        const createdProfile: UserProfile = {
          id: uid,
          uid,
          name: cleanName,
          email: cleanEmail,
          role: assignedRole,
          photoURL: cleanPhotoURL,
          avatarUrl: cleanPhotoURL,
          organizationName: cleanOrg,
          nitOrId: cleanNit,
          phone: cleanPhone,
          city: cleanCity,
          verified: Boolean(firebaseUser.emailVerified || isGoogleProvider),
          twoFactorEnabled: false,
          preferredLanguage: 'es',
          preferredTheme: 'light',
          authProvider: providerType,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        writeCachedUserProfile(createdProfile);
        await syncUserWithBackend(createdProfile);
        return createdProfile;
      })();

      userDocLocksRef.current.set(uid, task);
      try {
        return await task;
      } finally {
        userDocLocksRef.current.delete(uid);
      }
    },
    [syncUserWithBackend]
  );

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAuthenticated(false);
        setUserProfile(EMPTY_USER_PROFILE);
        setCurrentRoleState('buyer');
        localStorage.removeItem('foodlink_is_auth_v3');
        setIsAuthReady(true);
        return;
      }

      const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
      const isPasswordUser = firebaseUser.providerData.some(p => p.providerId === 'password');

      // Requirement 5: Email/password users must have emailVerified === true before accessing platform
      if (isPasswordUser && !isGoogleUser && !firebaseUser.emailVerified) {
        setEmailVerificationPending(true);
        setPendingVerificationEmail(firebaseUser.email || '');
        setIsAuthenticated(false);
        localStorage.removeItem('foodlink_is_auth_v3');
        setIsAuthReady(true);
        return;
      }

      try {
        const profile = await ensureUserProfileInFirestore(firebaseUser);
        setUserProfile(profile);
        setCurrentRoleState(profile.role);
        setEmailVerificationPending(false);
        setPendingVerificationEmail('');
        setIsAuthenticated(true);
        localStorage.setItem('foodlink_is_auth_v3', 'true');
      } catch (err) {
        console.error('Error loading user profile from Firestore:', err);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [ensureUserProfileInFirestore]);

  // Role-protected navigation & URL route protection (Requirement 9)
  const setActiveTab = useCallback(
    (tab: string) => {
      if (tab === 'login') {
        setShowLanding(false);
        return;
      }
      const viewAliases: Record<string, string> = {
        catalog: 'explore',
        dashboard: 'home',
      };
      const normalizedTab = viewAliases[tab] || tab;
      setShowLanding(false);

      if (SELLER_ONLY_TABS.has(normalizedTab)) {
        if (!isAuthenticated || !userProfile.id || userProfile.role !== 'seller') {
          setActiveTabState('home');
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState(null, '', '#home');
          }
          return;
        }
      }
      setActiveTabState(normalizedTab);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${normalizedTab}`);
      }
    },
    [isAuthenticated, userProfile.id, userProfile.role]
  );

  const navigateWithGuard = useCallback(
    (view: string) => {
      if (view === 'landing') {
        setShowLanding(true);
        setActiveTabState('home');
        return;
      }
      if (view === 'catalog' || view === 'explore') {
        setActiveTab(view);
        return;
      }
      if (view === 'login' || view === 'register') {
        setShowLanding(false);
        setActiveTabState('home');
        return;
      }
      setShowLanding(false);
      setActiveTab(view);
    },
    [setActiveTab]
  );

  // Enforce route protection if user manually edits URL path or hash
  useEffect(() => {
    const enforceRouteSecurity = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      const rawPath = window.location.pathname.replace(/^\/+/, '').trim();
      const requestedRoute = rawHash || rawPath;

      if (!requestedRoute) return;

      // If unauthenticated user tries to access any internal route via URL
      const protectedRoutes = new Set([
        'home',
        'dashboard',
        'explore',
        'map',
        'publish',
        'my-publications',
        'offers',
        'negotiations',
        'notifications',
        'statistics',
        'profile',
      ]);

      if (!isAuthenticated && (protectedRoutes.has(requestedRoute) || rawHash)) {
        setShowLanding(false);
        setActiveTabState('home');
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/');
        }
        return;
      }

      if (isAuthenticated && SELLER_ONLY_TABS.has(requestedRoute)) {
        if (userProfile.role !== 'seller') {
          setActiveTabState('home');
          window.history.replaceState(null, '', '#home');
          return;
        }
      }

      if (isAuthenticated && protectedRoutes.has(requestedRoute)) {
        const normalizedTab = requestedRoute === 'dashboard' ? 'home' : requestedRoute;
        if (!SELLER_ONLY_TABS.has(normalizedTab) || userProfile.role === 'seller') {
          setActiveTabState(normalizedTab);
        }
      }
    };

    enforceRouteSecurity();
    window.addEventListener('hashchange', enforceRouteSecurity);
    window.addEventListener('popstate', enforceRouteSecurity);
    return () => {
      window.removeEventListener('hashchange', enforceRouteSecurity);
      window.removeEventListener('popstate', enforceRouteSecurity);
    };
  }, [isAuthenticated, userProfile.role]);

  // Whenever user role is buyer, ensure activeTab is never a seller-only tab
  useEffect(() => {
    if (userProfile.role !== 'seller' && SELLER_ONLY_TABS.has(activeTab)) {
      setActiveTabState('home');
    }
  }, [userProfile.role, activeTab]);

  // Estado en tiempo real sincronizado con Cloud Firestore (sin localStorage para datos transaccionales)
  const [allProducts, setAllProducts] = useState<FoodProduct[]>([]);
  const [allOffers, setAllOffers] = useState<ProductOffer[]>([]);

  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('foodlink_real_notifications_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [allCommissions, setAllCommissions] = useState<CommissionRecord[]>(() => {
    const saved = localStorage.getItem('foodlink_real_commissions_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMMISSIONS;
  });

  // 1. Suscripción en tiempo real a publicaciones en Firestore (Catálogo compartido entre todos los usuarios)
  useEffect(() => {
    const unsubscribe = subscribeToProducts((liveProducts) => {
      setAllProducts(liveProducts);
    });
    return () => unsubscribe();
  }, []);

  // 2. Suscripción en tiempo real a conversaciones y ofertas del usuario autenticado en Firestore
  useEffect(() => {
    if (!isAuthenticated || !userProfile.id) {
      setAllOffers([]);
      return;
    }
    const unsubscribe = subscribeToUserConversations(userProfile.id, (liveOffers) => {
      setAllOffers(liveOffers);
    });
    return () => unsubscribe();
  }, [isAuthenticated, userProfile.id]);

  useEffect(() => {
    localStorage.setItem('foodlink_real_notifications_v1', JSON.stringify(allNotifications));
  }, [allNotifications]);

  useEffect(() => {
    localStorage.setItem('foodlink_real_commissions_v1', JSON.stringify(allCommissions));
  }, [allCommissions]);

  // Scoped data for the currently authenticated user so a user never sees another user's private negotiations, notifications, or commissions
  const products = allProducts;
  const offers = isAuthenticated && userProfile.id
    ? allOffers.filter(o => o.buyerId === userProfile.id || o.sellerId === userProfile.id)
    : [];
  const notifications = isAuthenticated && userProfile.id
    ? allNotifications.filter(n => n.userId === userProfile.id)
    : [];
  const commissions = isAuthenticated && userProfile.id
    ? allCommissions.filter(c => c.sellerId === userProfile.id)
    : [];

  // Modals & Selection State
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);
  const [makingOfferProduct, setMakingOfferProduct] = useState<FoodProduct | null>(null);
  const [activeNegotiationOffer, setActiveNegotiationOffer] = useState<ProductOffer | null>(null);
  const [deliveryActOffer, setDeliveryActOffer] = useState<ProductOffer | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpenState] = useState<boolean>(false);

  const setIsPublishModalOpen = useCallback(
    (open: boolean) => {
      if (open && (!isAuthenticated || !userProfile.id || userProfile.role !== 'seller')) {
        return;
      }
      setIsPublishModalOpenState(open);
    },
    [isAuthenticated, userProfile.id, userProfile.role]
  );

  // Role setter only allows setting current user's validated role
  const setCurrentRole = useCallback(
    (role: UserRole) => {
      if (!isAuthenticated) {
        setCurrentRoleState(role);
        return;
      }
      // When authenticated, role changes must go through Firestore (`upgradeToSeller`)
      if (userProfile.role === role) {
        setCurrentRoleState(role);
      }
    },
    [isAuthenticated, userProfile.role]
  );

  /**
   * Requirement 3: Upgrade from buyer to seller ("Quiero vender productos")
   */
  const upgradeToSeller = useCallback(async (): Promise<AuthActionResponse> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !isAuthenticated || !userProfile.id) {
      return {
        success: false,
        message: 'Debes iniciar sesión para cambiar tu rol a vendedor.',
      };
    }

    if (userProfile.role === 'seller') {
      return {
        success: true,
        message: 'Tu cuenta ya tiene el rol de Vendedor activo.',
      };
    }

    const uid = currentUser.uid;
    const nowIso = new Date().toISOString();
    const userDocRef = doc(db, 'users', uid);

    try {
      await updateDoc(userDocRef, {
        role: 'seller',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (!isOfflineFirestoreError(error)) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      }
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      role: 'seller',
      updatedAt: nowIso,
    };

    writeCachedUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
    setCurrentRoleState('seller');
    await syncUserWithBackend(updatedProfile);

    return {
      success: true,
      message: '¡Felicidades! Tu cuenta ahora es de Vendedor. Ya puedes publicar productos y acceder a tus estadísticas.',
    };
  }, [isAuthenticated, userProfile, syncUserWithBackend]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const currentUser = auth.currentUser;
      if (!currentUser || !isAuthenticated || !userProfile.id) return;

      const uid = currentUser.uid;
      const nowIso = new Date().toISOString();
      const nextName = (updates.name ?? userProfile.name).trim().slice(0, 120);
      const nextPhoto = (updates.photoURL ?? updates.avatarUrl ?? userProfile.photoURL ?? '').slice(0, 1024);
      const nextOrg = (updates.organizationName ?? userProfile.organizationName).trim().slice(0, 160);
      const nextNit = (updates.nitOrId ?? userProfile.nitOrId).trim().slice(0, 60);
      const nextPhone = (updates.phone ?? userProfile.phone).trim().slice(0, 40);
      const nextCity = (updates.city ?? userProfile.city).trim().slice(0, 80);
      const nextLang = updates.preferredLanguage ?? userProfile.preferredLanguage ?? 'es';
      const nextTheme = updates.preferredTheme ?? userProfile.preferredTheme ?? 'light';
      const nextTwoFactor = updates.twoFactorEnabled ?? userProfile.twoFactorEnabled ?? false;

      const firestoreUpdates: Record<string, unknown> = {
        name: nextName,
        photoURL: nextPhoto,
        organizationName: nextOrg,
        nitOrId: nextNit,
        phone: nextPhone,
        city: nextCity,
        updatedAt: serverTimestamp(),
      };

      try {
        await updateDoc(doc(db, 'users', uid), firestoreUpdates);
      } catch (error) {
        if (!isOfflineFirestoreError(error)) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
        }
      }

      const updated: UserProfile = {
        ...userProfile,
        name: nextName,
        photoURL: nextPhoto,
        avatarUrl: nextPhoto,
        organizationName: nextOrg,
        nitOrId: nextNit,
        phone: nextPhone,
        city: nextCity,
        preferredLanguage: nextLang,
        preferredTheme: nextTheme,
        twoFactorEnabled: nextTwoFactor,
        updatedAt: nowIso,
      };

      writeCachedUserProfile(updated);
      setUserProfile(updated);
      await syncUserWithBackend(updated);
    },
    [isAuthenticated, userProfile, syncUserWithBackend]
  );

  const openAuthModal = (mode: 'login' | 'register' = 'login', preselectedRole?: UserRole) => {
    setAuthModalInitialMode(mode);
    if (preselectedRole) {
      setCurrentRoleState(preselectedRole);
    }
    setIsAuthModalOpen(true);
  };

  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password);
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    if (hasMixedCase) score += 1;

    const labelsEs: PasswordStrength['label'][] = ['Débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    const labelsEn: PasswordStrength['label'][] = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return {
      score,
      label: language === 'en' ? labelsEn[score] : labelsEs[score],
      hasMinLength,
      hasNumber,
      hasSymbol,
      hasMixedCase,
    };
  };

  const checkEmailExists = async (email: string): Promise<EmailCheckResult> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      return { exists: false, message: 'Formato de correo inválido.' };
    }

    // 1. Check Firebase Auth signInMethods if available
    try {
      const methods = await fetchSignInMethodsForEmail(auth, normalized);
      if (methods && methods.length > 0) {
        const isGoogle = methods.includes('google.com');
        return {
          exists: true,
          provider: isGoogle ? 'google' : 'email',
          message: 'Cuenta encontrada.',
        };
      }
    } catch {
      // Fallback to backend registry check
    }

    // 2. Check backend synced registry
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          exists: Boolean(data.exists),
          provider: data.provider === 'google' ? 'google' : 'email',
          message: data.message,
        };
      }
    } catch {
      // Ignore network error
    }

    return {
      exists: false,
      message: 'Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.',
    };
  };

  /**
   * Requirement 4 & 5: Real Firebase Email/Password Login + Email Verification Check
   */
  const login = async (
    email: string,
    password: string,
    rememberMe = true
  ): Promise<AuthActionResponse> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      return {
        success: false,
        message: 'Por favor ingresa tu correo electrónico y contraseña.',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, normalized, password);
      await cred.user.reload();

      // Requirement 5: Verify emailVerified before allowing dashboard access
      if (!cred.user.emailVerified) {
        setEmailVerificationPending(true);
        setPendingVerificationEmail(cred.user.email || normalized);
        setIsAuthenticated(false);
        localStorage.removeItem('foodlink_is_auth_v3');
        return {
          success: false,
          code: 'email-not-verified',
          requiresEmailVerification: true,
          message: 'Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.',
        };
      }

      const profile = await ensureUserProfileInFirestore(cred.user);
      setUserProfile(profile);
      setCurrentRoleState(profile.role);
      setEmailVerificationPending(false);
      setPendingVerificationEmail('');
      setIsAuthenticated(true);
      setShowLanding(false);
      setIsAuthModalOpen(false);
      if (rememberMe) {
        localStorage.setItem('foodlink_is_auth_v3', 'true');
      }

      return {
        success: true,
        message: `Bienvenido a FoodLink Solidario, ${profile.name}`,
      };
    } catch (firebaseErr: unknown) {
      const fbCode =
        firebaseErr && typeof firebaseErr === 'object' && 'code' in firebaseErr
          ? String((firebaseErr as { code: unknown }).code)
          : '';

      if (fbCode === 'auth/user-not-found') {
        return {
          success: false,
          code: 'user-not-found',
          message: 'Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.',
        };
      }

      if (fbCode === 'auth/invalid-credential' || fbCode === 'auth/wrong-password') {
        // Check if the email exists to distinguish unregistered accounts from wrong password
        const check = await checkEmailExists(normalized);
        if (!check.exists) {
          return {
            success: false,
            code: 'user-not-found',
            message: 'Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.',
          };
        }
        return {
          success: false,
          code: 'wrong-password',
          message: 'La contraseña ingresada es incorrecta. Inténtalo de nuevo o solicita recuperación.',
        };
      }

      return {
        success: false,
        code: fbCode || 'auth-error',
        message: getFirebaseAuthErrorMessage(fbCode),
      };
    }
  };

  /**
   * Requirement 2 & 5: Real Firebase Registration with Role Selection ('buyer' | 'seller')
   * and Email Verification dispatch.
   */
  const registerUser = async (data: RegisterPayload): Promise<AuthActionResponse> => {
    const normalized = data.email.trim().toLowerCase();
    const selectedRole: UserRole = data.role === 'seller' ? 'seller' : 'buyer';

    if (!data.name.trim()) {
      return { success: false, message: 'El nombre completo o razón social es obligatorio.' };
    }

    const strength = evaluatePasswordStrength(data.password);
    if (!strength.hasMinLength || !strength.hasNumber) {
      return {
        success: false,
        message: 'La contraseña debe tener mínimo 8 caracteres e incluir al menos un número.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, normalized, data.password);
      await updateFirebaseProfile(cred.user, { displayName: data.name.trim() });

      // Save user profile and selected role in Firestore `users/{uid}`
      await ensureUserProfileInFirestore(cred.user, selectedRole, {
        ...data,
        email: normalized,
        role: selectedRole,
      });

      // Send real Firebase verification email
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.warn('Error al enviar correo de verificación inicial:', verifyErr);
      }

      // Require email verification before entering dashboard
      setEmailVerificationPending(true);
      setPendingVerificationEmail(normalized);
      setIsAuthenticated(false);
      localStorage.removeItem('foodlink_is_auth_v3');

      return {
        success: true,
        code: 'email-verification-sent',
        requiresEmailVerification: true,
        message: 'Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.',
      };
    } catch (firebaseErr: unknown) {
      const fbCode =
        firebaseErr && typeof firebaseErr === 'object' && 'code' in firebaseErr
          ? String((firebaseErr as { code: unknown }).code)
          : '';

      return {
        success: false,
        code: fbCode || 'register-error',
        message: getFirebaseAuthErrorMessage(fbCode),
      };
    }
  };

  /**
   * Requirement 5: Resend verification email ("Reenviar correo de verificación")
   */
  const resendVerificationEmail = async (): Promise<AuthActionResponse> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'Inicia sesión nuevamente con tu correo y contraseña para reenviar el enlace de verificación.',
      };
    }

    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        const profile = await ensureUserProfileInFirestore(currentUser);
        setUserProfile(profile);
        setCurrentRoleState(profile.role);
        setEmailVerificationPending(false);
        setPendingVerificationEmail('');
        setIsAuthenticated(true);
        setShowLanding(false);
        setIsAuthModalOpen(false);
        return {
          success: true,
          message: 'Tu correo electrónico ya está verificado. Accediendo a la plataforma...',
        };
      }

      await sendEmailVerification(currentUser);
      return {
        success: true,
        message: `Se ha reenviado el correo de verificación a ${currentUser.email}. Revisa tu bandeja de entrada y carpeta de spam.`,
      };
    } catch (err: unknown) {
      const fbCode =
        err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (fbCode === 'auth/too-many-requests') {
        return {
          success: false,
          message: 'Ya se envió un correo recientemente. Por favor espera unos segundos antes de volver a intentarlo.',
        };
      }
      return {
        success: false,
        message: 'No se pudo reenviar el correo de verificación en este momento. Inténtalo nuevamente.',
      };
    }
  };

  /**
   * Checks if the current user has clicked the verification link in their email
   */
  const checkEmailVerificationStatus = async (): Promise<{ verified: boolean; message: string }> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        verified: false,
        message: 'Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.',
      };
    }

    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        const profile = await ensureUserProfileInFirestore(currentUser);
        if (!profile.verified) {
          try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              verified: true,
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Ignore non-critical update error
          }
        }
        setUserProfile({ ...profile, verified: true });
        setCurrentRoleState(profile.role);
        setEmailVerificationPending(false);
        setPendingVerificationEmail('');
        setIsAuthenticated(true);
        setShowLanding(false);
        setIsAuthModalOpen(false);
        localStorage.setItem('foodlink_is_auth_v3', 'true');
        return {
          verified: true,
          message: '¡Correo electrónico verificado correctamente! Bienvenido a FoodLink Solidario.',
        };
      }
      return {
        verified: false,
        message: 'Tu correo electrónico aún no está verificado. Verifica tu correo antes de continuar.',
      };
    } catch {
      return {
        verified: false,
        message: 'No se pudo comprobar el estado de verificación. Intenta nuevamente.',
      };
    }
  };

  const clearEmailVerificationPending = async () => {
    setEmailVerificationPending(false);
    setPendingVerificationEmail('');
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
  };

  /**
   * Requirement 6: Real Google Sign-In + Firebase Authentication + Firestore Profile Creation
   */
  const loginWithSocial = async (
    _provider: 'google',
    preferredRole?: UserRole
  ): Promise<AuthActionResponse> => {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);

      const validRole: UserRole = preferredRole === 'seller' ? 'seller' : 'buyer';
      const profile = await ensureUserProfileInFirestore(result.user, validRole);

      setUserProfile(profile);
      setCurrentRoleState(profile.role);
      setEmailVerificationPending(false);
      setPendingVerificationEmail('');
      setIsAuthenticated(true);
      setShowLanding(false);
      setIsAuthModalOpen(false);
      localStorage.setItem('foodlink_is_auth_v3', 'true');

      return {
        success: true,
        message: `Autenticado con Google como ${profile.name}`,
      };
    } catch (firebaseErr: unknown) {
      const fbCode =
        firebaseErr && typeof firebaseErr === 'object' && 'code' in firebaseErr
          ? String((firebaseErr as { code: unknown }).code)
          : '';

      return {
        success: false,
        code: fbCode || 'google-auth-error',
        message: getFirebaseAuthErrorMessage(fbCode),
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      return { success: false, message: 'Ingresa un correo electrónico válido.' };
    }

    try {
      await sendPasswordResetEmail(auth, normalized);
      return {
        success: true,
        message: `Hemos enviado un enlace de recuperación a ${normalized}. Revisa tu bandeja de entrada.`,
      };
    } catch (firebaseErr: unknown) {
      const fbCode =
        firebaseErr && typeof firebaseErr === 'object' && 'code' in firebaseErr
          ? String((firebaseErr as { code: unknown }).code)
          : '';
      return {
        success: false,
        message: getFirebaseAuthErrorMessage(fbCode),
      };
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setEmailVerificationPending(false);
      setPendingVerificationEmail('');
      setUserProfile(EMPTY_USER_PROFILE);
      setCurrentRoleState('buyer');
      setShowLanding(false); // Redirige directamente al inicio de sesión (LoginView)
      setActiveTabState('home');
      localStorage.removeItem('foodlink_is_auth_v3');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
      return { success: true };
    } catch (e: unknown) {
      console.error('Error cerrando sesión en Firebase:', e);
      const msg =
        e instanceof Error
          ? e.message
          : 'Ocurrió un error al comunicarse con Firebase Authentication. Por favor, intenta de nuevo.';
      return { success: false, error: msg };
    }
  };

  const formatCOP = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCommissionForDuration = (days: DurationDays): number => {
    return commissionPricing[days] || COMMISSION_PRICING[days] || 12000;
  };

  /**
   * Central Notification Dispatcher (In-App + Automated Email Dispatch)
   */
  const dispatchNotificationEvent = useCallback(
    (params: {
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      relatedProductId?: string;
      relatedOfferId?: string;
      productName?: string;
      recipientEmail?: string;
      recipientName?: string;
      actionLabel?: string;
      dedupKey?: string;
    }) => {
      const notificationId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const nowIso = new Date().toISOString();
      const targetEmail = params.recipientEmail || userProfile.email || '';
      const targetName = params.recipientName || userProfile.organizationName || userProfile.name || 'Usuario';

      const newNotif: NotificationItem = {
        id: notificationId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        timestamp: 'Justo ahora',
        createdAt: nowIso,
        read: false,
        relatedProductId: params.relatedProductId,
        relatedOfferId: params.relatedOfferId,
        recipientEmail: targetEmail,
        recipientName: targetName,
        emailSubject: `[FoodLink Solidario] ${params.title}`,
        emailStatus: 'queued_local',
        dedupKey: params.dedupKey,
      };

      setAllNotifications((prev) => {
        if (params.dedupKey && prev.some((n) => n.dedupKey === params.dedupKey)) {
          return prev;
        }
        return [newNotif, ...prev];
      });

      if (targetEmail) {
        fetch('/api/notifications/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetEmail,
            recipientName: targetName,
            subject: `[FoodLink Solidario] ${params.title}`,
            notificationType: params.type,
            title: params.title,
            message: params.message,
            actionLabel: params.actionLabel || 'Ver operación en FoodLink Solidario',
            productName: params.productName,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.status) {
              setAllNotifications((prev) =>
                prev.map((n) =>
                  n.id === notificationId
                    ? {
                        ...n,
                        emailStatus: data.status,
                        emailHtmlPreview: data.emailEntry?.html,
                      }
                    : n
                )
              );
            }
          })
          .catch(() => {
            // Keep local notification intact
          });
      }
    },
    [userProfile.email, userProfile.organizationName, userProfile.name]
  );

  // Security check in addProduct: only authenticated sellers can publish products directly to Cloud Firestore
  const addProduct = async (
    productData: Omit<
      FoodProduct,
      'id' | 'publishedAt' | 'expiresAt' | 'status' | 'commissionPaid' | 'offersCount' | 'viewsCount'
    >
  ): Promise<FoodProduct | null> => {
    if (!isAuthenticated || !userProfile.id || userProfile.role !== 'seller') {
      return null;
    }

    try {
      const created = await createProductInFirestore(productData, {
        id: userProfile.id,
        name: userProfile.organizationName || userProfile.name,
        type: productData.sellerType || 'Supermercado',
        verified: userProfile.verified,
      });

      dispatchNotificationEvent({
        userId: userProfile.id,
        type: 'publicacion_activada',
        title: 'Producto publicado correctamente',
        message: `Tu producto "${created.name}" se encuentra activo en el catálogo hasta el ${created.expirationDate}.`,
        relatedProductId: created.id,
        productName: created.name,
        recipientEmail: userProfile.email,
        recipientName: userProfile.organizationName || userProfile.name,
        actionLabel: 'Ver Mis Publicaciones',
      });

      return created;
    } catch (err) {
      console.error('Error publicando producto en Firestore:', err);
      throw err;
    }
  };

  const updateProductStatus = async (productId: string, status: ProductStatus) => {
    if (!isAuthenticated || !userProfile.id) {
      return;
    }
    try {
      await updateProductStatusInFirestore(productId, status);
    } catch (err) {
      console.error('Error actualizando estado del producto en Firestore:', err);
    }
  };

  const republishProduct = (productId: string, durationDays: DurationDays) => {
    if (!isAuthenticated || !userProfile.id || userProfile.role !== 'seller') {
      return;
    }

    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const commission = getCommissionForDuration(durationDays);

    let targetName = '';
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId && p.sellerId === userProfile.id) {
          targetName = `${p.name} (${p.quantity} ${p.unit})`;
          return {
            ...p,
            durationDays,
            commissionPaid: p.commissionPaid + commission,
            publishedAt: now.toISOString(),
            expiresAt: expires.toISOString(),
            status: 'activa',
          };
        }
        return p;
      })
    );

    if (targetName) {
      const newCommission: CommissionRecord = {
        id: `com-${Date.now()}`,
        sellerId: userProfile.id,
        productName: `${targetName} (Renovación)`,
        durationDays,
        commission,
        date: now.toISOString().split('T')[0],
        status: 'Renovada',
        paymentMethod: 'PSE Empresarial',
        transactionRef: `PSE-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setAllCommissions((prev) => [newCommission, ...prev]);

      dispatchNotificationEvent({
        userId: userProfile.id,
        type: 'pago_realizado',
        title: 'Renovación de publicación exitosa',
        message: `Has renovado la publicación por ${durationDays} días adicionales (${formatCOP(commission)}).`,
        relatedProductId: productId,
        productName: targetName,
        recipientEmail: userProfile.email,
        recipientName: userProfile.organizationName || userProfile.name,
        actionLabel: 'Consultar Publicación Renovada',
      });
    }
  };

  const createOffer = async (
    offerData: Omit<ProductOffer, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>
  ): Promise<ProductOffer> => {
    if (!isAuthenticated || !userProfile.id) {
      throw new Error('Debes iniciar sesión para realizar una oferta.');
    }

    const { conversationId } = await getOrCreateConversationInFirestore({
      productId: offerData.productId,
      productName: offerData.productName,
      productImageUrl: offerData.productImageUrl,
      sellerId: offerData.sellerId,
      sellerName: offerData.sellerName,
      buyerId: userProfile.id,
      buyerName: userProfile.name,
      buyerOrganization: userProfile.organizationName || userProfile.name,
      buyerType: offerData.buyerType,
      requestedQuantity: offerData.requestedQuantity,
      offeredPricePerUnit: offerData.offeredPricePerUnit,
      totalOfferedPrice: offerData.totalOfferedPrice,
      unit: offerData.unit,
      message: offerData.message,
      pickupMethod: offerData.pickupMethod,
      proposedDate: offerData.proposedDate,
    });

    dispatchNotificationEvent({
      userId: offerData.sellerId,
      type: 'nueva_oferta',
      title: `Nueva oferta recibida de ${userProfile.organizationName || userProfile.name}`,
      message: `${userProfile.organizationName || userProfile.name} ha enviado una oferta de ${formatCOP(offerData.totalOfferedPrice)} (${formatCOP(offerData.offeredPricePerUnit)}/${offerData.unit}) por ${offerData.requestedQuantity} ${offerData.unit} de "${offerData.productName}".`,
      relatedOfferId: conversationId,
      relatedProductId: offerData.productId,
      productName: offerData.productName,
      recipientName: offerData.sellerName,
      actionLabel: 'Revisar y Responder Oferta',
    });

    return {
      ...offerData,
      id: conversationId,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
  };

  const startNegotiationWithSeller = async (
    product: FoodProduct,
    initialMessage?: string
  ): Promise<string> => {
    if (!isAuthenticated || !userProfile.id) {
      openAuthModal('login');
      showToast('Inicia sesión para iniciar una conversación con el vendedor.', 'info');
      throw new Error('No autenticado');
    }

    if (userProfile.id === product.sellerId) {
      setActiveTabState('my-publications');
      showToast('Estás gestionando tu propia publicación', 'info');
      return '';
    }

    const { conversationId } = await getOrCreateConversationInFirestore({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      buyerId: userProfile.id,
      buyerName: userProfile.name,
      buyerOrganization: userProfile.organizationName || userProfile.name,
      buyerType: 'Fundación / Comprador',
      requestedQuantity: product.minPurchaseQuantity || 1,
      offeredPricePerUnit: product.requestedPrice,
      totalOfferedPrice: (product.minPurchaseQuantity || 1) * product.requestedPrice,
      unit: product.unit,
      message:
        initialMessage ||
        `Hola ${product.sellerName}, me interesa este lote de "${product.name}". ¿Podemos acordar detalles de entrega?`,
    });

    setSelectedOfferIdForNegotiation(conversationId);
    setActiveTabState('negotiations');
    return conversationId;
  };

  const updateOfferStatus = async (
    offerId: string,
    status: 'aceptada' | 'rechazada' | 'contraoferta',
    counterPrice?: number,
    counterQuantity?: number,
    counterMessage?: string
  ) => {
    if (!isAuthenticated || !userProfile.id) return;

    try {
      await respondToOfferInFirestore(
        offerId,
        status,
        {
          id: userProfile.id,
          name: userProfile.organizationName || userProfile.name,
          role: userProfile.role,
        },
        counterPrice,
        counterQuantity,
        counterMessage
      );

      const targetOffer = allOffers.find((o) => o.id === offerId);
      if (targetOffer) {
        const notifType: NotificationType =
          status === 'aceptada'
            ? 'oferta_aceptada'
            : status === 'rechazada'
            ? 'oferta_rechazada'
            : 'nueva_contraoferta';

        const finalPrice = counterPrice ?? targetOffer.offeredPricePerUnit;
        const finalQty = counterQuantity ?? targetOffer.requestedQuantity;

        const notifTitle =
          status === 'aceptada'
            ? `¡Oferta aceptada para ${targetOffer.productName}!`
            : status === 'rechazada'
            ? `Oferta no aceptada en ${targetOffer.productName}`
            : `Nueva contraoferta recibida en ${targetOffer.productName}`;

        const notifMessage =
          status === 'aceptada'
            ? `La oferta por ${finalQty} ${targetOffer.unit} de "${targetOffer.productName}" (${formatCOP(finalPrice * finalQty)}) ha sido ACEPTADA. Ingresa a la negociación para coordinar la entrega.`
            : status === 'rechazada'
            ? `La propuesta por "${targetOffer.productName}" ha sido rechazada por la contraparte.`
            : `Se ha propuesto una contraoferta para "${targetOffer.productName}": ${formatCOP(finalPrice)}/${targetOffer.unit} por ${finalQty} ${targetOffer.unit} (Total: ${formatCOP(finalPrice * finalQty)}).`;

        const recipientUserId =
          userProfile.id === targetOffer.sellerId ? targetOffer.buyerId : targetOffer.sellerId;
        const recipientName =
          userProfile.id === targetOffer.sellerId ? targetOffer.buyerOrganization : targetOffer.sellerName;

        dispatchNotificationEvent({
          userId: recipientUserId,
          type: notifType,
          title: notifTitle,
          message: notifMessage,
          relatedOfferId: offerId,
          relatedProductId: targetOffer.productId,
          productName: targetOffer.productName,
          recipientName,
          actionLabel:
            status === 'contraoferta'
              ? 'Revisar Contraoferta en Negociaciones'
              : 'Ver Detalle de la Operación',
        });
      }
    } catch (err) {
      console.error('Error actualizando oferta en Firestore:', err);
    }
  };

  const sendOfferMessage = async (
    offerId: string,
    text: string,
    isProposal = false,
    proposedPrice?: number,
    proposedQuantity?: number
  ) => {
    if (!isAuthenticated || !userProfile.id || !text.trim()) return;

    try {
      await sendMessageInFirestore(offerId, {
        senderId: userProfile.id,
        senderName: userProfile.organizationName || userProfile.name,
        senderRole: userProfile.role,
        text: text.trim(),
        isProposal,
        proposedPrice,
        proposedQuantity,
      });

      const targetOffer = allOffers.find((o) => o.id === offerId);
      if (targetOffer && isProposal && proposedPrice && proposedQuantity) {
        const recipientUserId =
          userProfile.id === targetOffer.sellerId ? targetOffer.buyerId : targetOffer.sellerId;
        const recipientName =
          userProfile.id === targetOffer.sellerId ? targetOffer.buyerOrganization : targetOffer.sellerName;

        dispatchNotificationEvent({
          userId: recipientUserId,
          type: 'nueva_contraoferta',
          title: `Contraoferta en negociación: ${targetOffer.productName}`,
          message: `${userProfile.organizationName || userProfile.name} envió una contraoferta de ${formatCOP(proposedPrice)}/${targetOffer.unit} por ${proposedQuantity} ${targetOffer.unit} (Total: ${formatCOP(proposedPrice * proposedQuantity)}).`,
          relatedOfferId: offerId,
          relatedProductId: targetOffer.productId,
          productName: targetOffer.productName,
          recipientName,
          actionLabel: 'Responder Contraoferta',
        });
      }
    } catch (err) {
      console.error('Error enviando mensaje en Firestore:', err);
    }
  };

  /**
   * Automatic Expiration Monitor (Checks ONLY the authenticated user's own active publications)
   */
  const runExpirationAlertsCheck = useCallback(() => {
    if (!isAuthenticated || !userProfile.id) return;
    const nowMs = Date.now();

    allProducts.forEach((prod) => {
      if (prod.sellerId !== userProfile.id) return;
      if (prod.status === 'vendida' || prod.status === 'pausada' || prod.status === 'finalizada') {
        return;
      }

      const expiresAtMs = new Date(prod.expiresAt).getTime();
      const productExpDateMs = new Date(`${prod.expirationDate}T23:59:59`).getTime();
      const effectiveExpMs = Math.min(
        Number.isNaN(expiresAtMs) ? Infinity : expiresAtMs,
        Number.isNaN(productExpDateMs) ? Infinity : productExpDateMs
      );

      if (effectiveExpMs === Infinity) return;

      const hoursRemaining = (effectiveExpMs - nowMs) / (1000 * 60 * 60);

      if (hoursRemaining > 0 && hoursRemaining <= 6) {
        const dedupKey = `exp-6h-${prod.id}`;
        dispatchNotificationEvent({
          userId: prod.sellerId,
          type: 'publicacion_menos_6h',
          title: `¡URGENTE! Menos de 6 horas para vencer: ${prod.name}`,
          message: `La publicación "${prod.name}" (${prod.quantity} ${prod.unit}) vence en ${Math.max(1, Math.round(hoursRemaining))} hora(s). Revisa ofertas pendientes para evitar pérdida del lote.`,
          relatedProductId: prod.id,
          productName: prod.name,
          recipientEmail: userProfile.email,
          recipientName: prod.sellerName,
          actionLabel: 'Gestionar Lote Urgente',
          dedupKey,
        });
      } else if (hoursRemaining > 6 && hoursRemaining <= 24) {
        const dedupKey = `exp-24h-${prod.id}`;
        dispatchNotificationEvent({
          userId: prod.sellerId,
          type: 'publicacion_proxima_finalizar',
          title: `Publicación próxima a vencer: ${prod.name}`,
          message: `Tu publicación "${prod.name}" vencerá en aproximadamente ${Math.round(hoursRemaining)} horas.`,
          relatedProductId: prod.id,
          productName: prod.name,
          recipientEmail: userProfile.email,
          recipientName: prod.sellerName,
          actionLabel: 'Revisar Publicación',
          dedupKey,
        });
      }
    });
  }, [allProducts, isAuthenticated, userProfile.id, userProfile.email, dispatchNotificationEvent]);

  useEffect(() => {
    if (!isAuthenticated || !userProfile.id) return;
    const timer = setTimeout(() => {
      runExpirationAlertsCheck();
    }, 1500);
    const interval = setInterval(() => {
      runExpirationAlertsCheck();
    }, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isAuthenticated, userProfile.id, runExpirationAlertsCheck]);

  const markNotificationAsRead = (notificationId: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!userProfile.id) return;
    setAllNotifications((prev) =>
      prev.map((n) => (n.userId === userProfile.id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const currentUser: UserProfile | null = isAuthenticated && userProfile.id ? userProfile : null;

  const selectedProductIdForDetail = selectedProduct ? selectedProduct.id : null;
  const setSelectedProductIdForDetail = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedProduct(null);
        return;
      }
      const found = allProducts.find((p) => p.id === id) || null;
      setSelectedProduct(found);
    },
    [allProducts]
  );

  const selectedOfferIdForNegotiation = activeNegotiationOffer ? activeNegotiationOffer.id : null;
  const setSelectedOfferIdForNegotiation = useCallback(
    (id: string | null) => {
      if (!id) {
        setActiveNegotiationOffer(null);
        return;
      }
      const found = allOffers.find((o) => o.id === id) || null;
      setActiveNegotiationOffer(found);
    },
    [allOffers]
  );

  const simulateExpirationForProduct = (productId: string) => {
    if (!isAuthenticated || !userProfile.id || userProfile.role !== 'seller') return;
    const inThreeHours = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === productId && p.sellerId === userProfile.id
          ? { ...p, expiresAt: inThreeHours, status: 'proxima_a_finalizar' }
          : p
      )
    );
  };

  const toggle2FA = (enabled?: boolean) => {
    const nextValue = typeof enabled === 'boolean' ? enabled : !userProfile.twoFactorEnabled;
    updateUserProfile({ twoFactorEnabled: nextValue });
  };

  const loadDemoData = () => {
    // No-op: Demo data is disabled so users always see real states
  };

  return (
    <AppContext.Provider
      value={{
        showLanding,
        setShowLanding,
        isAuthenticated,
        isAuthReady,
        currentRole,
        setCurrentRole,
        userProfile,
        currentUser,
        updateUserProfile,
        upgradeToSeller,
        activeTab,
        setActiveTab,
        currentView: activeTab,
        setCurrentView: navigateWithGuard,
        navigateWithGuard,
        emailVerificationPending,
        pendingVerificationEmail,
        resendVerificationEmail,
        checkEmailVerificationStatus,
        clearEmailVerificationPending,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialMode,
        setAuthModalTab: setAuthModalInitialMode,
        authModalMessage,
        setAuthModalMessage,
        openAuthModal,
        login,
        registerUser,
        loginWithSocial,
        requestPasswordReset,
        checkEmailExists,
        evaluatePasswordStrength,
        toggle2FA,
        logout,
        themeMode,
        setThemeMode,
        isDarkMode,
        language,
        setLanguage,
        toggleLanguage: i18nToggle,
        t,
        globalSearchQuery,
        setGlobalSearchQuery,
        favorites,
        toggleFavorite,
        isFavorite,
        toasts,
        showToast,
        addToast: showToast,
        removeToast,
        products,
        offers,
        notifications,
        commissions,
        commissionRecords: commissions,
        commissionPricing,
        updateCommissionPricing,
        resetCommissionPricing,
        unreadNotificationsCount,
        loadDemoData,
        selectedProduct,
        setSelectedProduct,
        selectedProductIdForDetail,
        setSelectedProductIdForDetail,
        makingOfferProduct,
        setMakingOfferProduct,
        activeNegotiationOffer,
        setActiveNegotiationOffer,
        selectedOfferIdForNegotiation,
        setSelectedOfferIdForNegotiation,
        deliveryActOffer,
        setDeliveryActOffer,
        isPublishModalOpen,
        setIsPublishModalOpen,
        addProduct,
        updateProductStatus,
        changeProductStatus: updateProductStatus,
        simulateExpirationForProduct,
        republishProduct,
        renewProduct: republishProduct,
        createOffer,
        startNegotiationWithSeller,
        updateOfferStatus,
        respondToOffer: updateOfferStatus,
        sendOfferMessage,
        sendMessageToOffer: sendOfferMessage,
        markNotificationAsRead,
        toggleNotificationRead: markNotificationAsRead,
        markAllNotificationsAsRead,
        runExpirationAlertsCheck,
        checkProductExpirations: runExpirationAlertsCheck,
        getCommissionForDuration,
        getCommissionForDays: getCommissionForDuration,
        formatCOP,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
