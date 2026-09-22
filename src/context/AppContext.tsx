import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';
import {
  DEFAULT_COMMISSION_PRICING,
  INITIAL_COMMISSION_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFERS,
  INITIAL_PRODUCTS,
  MOCK_USERS,
} from '../data/initialData';
import {
  CommissionPricing,
  CommissionRecord,
  DurationDays,
  FoodProduct,
  NotificationItem,
  ProductOffer,
  ProductStatus,
  RoleType,
  SupportedLanguage,
  ThemeMode,
  UserProfile,
} from '../types';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // User & Auth
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  currentRole: RoleType;
  switchRole: (role: RoleType) => void;
  setRole: (role: RoleType) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  login: (user: UserProfile, token?: string) => void;
  toggle2FA: (enabled: boolean) => Promise<void>;

  // Route Guards & Redirect
  redirectTo: string | null;
  setRedirectTo: (target: string | null) => void;
  navigateWithGuard: (targetView: string, requiredRole?: RoleType) => boolean;

  // Auth Modal Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot' | 'reset';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot' | 'reset') => void;
  authModalMessage: string | null;
  setAuthModalMessage: (msg: string | null) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  
  // Commission Pricing (Admin controlled)
  commissionPricing: CommissionPricing;
  updateCommissionPricing: (newPricing: CommissionPricing) => void;
  resetCommissionPricing: () => void;
  getCommissionForDays: (days: DurationDays) => number;
  
  // Products
  products: FoodProduct[];
  addProduct: (product: Omit<FoodProduct, 'id' | 'publishedAt' | 'expiresAt' | 'offersCount' | 'viewsCount'>, paymentMethod: string) => FoodProduct;
  updateProduct: (id: string, updates: Partial<FoodProduct>) => void;
  renewProduct: (id: string, additionalDays: DurationDays, paymentMethod: string) => void;
  changeProductStatus: (id: string, newStatus: ProductStatus) => void;
  deleteProduct: (id: string) => void;
  
  // Offers & Negotiations
  offers: ProductOffer[];
  createOffer: (offerData: Omit<ProductOffer, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>) => ProductOffer;
  respondToOffer: (offerId: string, action: 'aceptada' | 'rechazada' | 'contraoferta', counterPrice?: number, counterQuantity?: number, message?: string) => void;
  sendMessageToOffer: (offerId: string, text: string) => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  
  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
  
  // Commission Records
  commissionRecords: CommissionRecord[];
  
  // Navigation & UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedProductIdForDetail: string | null;
  setSelectedProductIdForDetail: (id: string | null) => void;
  selectedOfferIdForNegotiation: string | null;
  setSelectedOfferIdForNegotiation: (id: string | null) => void;
  productForRenewal: FoodProduct | null;
  setProductForRenewal: (product: FoodProduct | null) => void;
  isPublishModalOpen: boolean;
  setIsPublishModalOpen: (open: boolean) => void;
  
  // Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Simulator helper: simulate expiry for demo
  simulateExpirationForProduct: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & User - Restore saved session if present
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('foodlink_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // ignore JSON parse error
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    try {
      const savedUser = localStorage.getItem('foodlink_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) return parsed.role as RoleType;
      }
      const savedRole = localStorage.getItem('foodlink_role');
      if (savedRole) return savedRole as RoleType;
    } catch {
      // ignore
    }
    return 'public';
  });

  const isAuthenticated = useMemo(() => {
    return currentUser !== null && currentUser.role !== 'public';
  }, [currentUser]);

  // Subscribe to Firebase Authentication in real-time if configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // En modo local / desarrollo no sobrescribimos el usuario con null de Firebase
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Only set user when Firebase confirms an active, email-verified session
      if (firebaseUser && firebaseUser.emailVerified) {
        const storedRole = (localStorage.getItem(`foodlink_role_${firebaseUser.uid}`) as RoleType) ||
          (localStorage.getItem('foodlink_role') as RoleType) ||
          'establishment';
        const storedOrg = localStorage.getItem(`foodlink_org_${firebaseUser.uid}`) || 'Organización Solidaria';
        const storedCity = localStorage.getItem(`foodlink_city_${firebaseUser.uid}`) || 'Medellín';
        const storedNit = localStorage.getItem(`foodlink_nit_${firebaseUser.uid}`) || '900.123.456-7';
        const storedPhone = localStorage.getItem(`foodlink_phone_${firebaseUser.uid}`) || '+57 300 123 4567';

        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || localStorage.getItem(`foodlink_name_${firebaseUser.uid}`) || firebaseUser.email?.split('@')[0] || 'Usuario Solidario',
          email: firebaseUser.email || '',
          role: storedRole,
          organizationName: storedOrg,
          nitOrId: storedNit,
          phone: firebaseUser.phoneNumber || storedPhone,
          city: storedCity,
          verified: true,
          avatarUrl: firebaseUser.photoURL || undefined,
        };

        setCurrentUser(userProfile);
        setCurrentRole(userProfile.role);
        localStorage.setItem('foodlink_user', JSON.stringify(userProfile));
      } else {
        // If not verified or signed out, ensure public restricted state
        setCurrentUser(null);
        setCurrentRole('public');
        localStorage.removeItem('foodlink_user');
      }
    });

    return () => unsubscribe();
  }, []);

  // Theme Management (Light, Dark, System)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('foodlink_theme') as ThemeMode;
    return saved || 'system';
  });

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('foodlink_theme', mode);
    applyTheme(mode);
  };

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Navigation, Route Guards & Auth Modal State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);

  const navigateWithGuard = (targetView: string, requiredRole?: RoleType): boolean => {
    if (!isAuthenticated) {
      if (targetView !== 'landing') {
        setRedirectTo(targetView);
        setAuthModalTab('login');
        setAuthModalMessage('Acceso privado: Debes iniciar sesión para interactuar con la plataforma.');
        setIsAuthModalOpen(true);
        showToast('Acceso restringido: Inicia sesión para continuar.', 'warning');
        return false;
      }
      setCurrentView('landing');
      return true;
    }

    if (requiredRole && currentRole !== requiredRole && currentRole !== 'admin') {
      showToast(
        `Esta sección requiere perfil de: ${
          requiredRole === 'establishment' ? 'Establecimiento' : 'Fundación / Comprador'
        }`,
        'error'
      );
      return false;
    }
    setCurrentView(targetView);
    return true;
  };

  // Safe setter for currentView that respects authentication
  const handleSetCurrentView = (targetView: string) => {
    if (!isAuthenticated && targetView !== 'landing') {
      setRedirectTo(targetView);
      setAuthModalTab('login');
      setAuthModalMessage('Acceso privado: Debes iniciar sesión o registrarte para ver el catálogo y funciones.');
      setIsAuthModalOpen(true);
      showToast('Acceso privado: Inicia sesión para continuar.', 'warning');
      return;
    }
    setCurrentView(targetView);
  };

  // Secure Logout with Firebase
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch (err) {
      console.warn('Logout API call exception (fallback applied):', err);
    }

    localStorage.removeItem('foodlink_token');
    localStorage.removeItem('foodlink_role');
    localStorage.removeItem('foodlink_user');
    setCurrentRole('public');
    setCurrentUser(null);
    setRedirectTo(null);
    setCurrentView('landing');
    showToast('Has cerrado sesión correctamente', 'info');
  };

  // Login handler with redirectTo support
  const login = (user: UserProfile, token?: string) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('foodlink_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('foodlink_token', token);
    }
    localStorage.setItem('foodlink_role', user.role);
    setIsAuthModalOpen(false);
    setAuthModalMessage(null);

    showToast(`¡Bienvenido, ${user.name}!`, 'success');

    if (redirectTo) {
      const destination = redirectTo;
      setRedirectTo(null);
      setCurrentView(destination);
      showToast(`Redirigiendo a: ${destination === 'dashboard' ? 'Panel de Control' : destination === 'catalog' ? 'Catálogo' : destination}`, 'info');
    } else {
      setCurrentView(user.role === 'admin' ? 'admin' : user.role === 'public' ? 'landing' : 'dashboard');
    }
  };

  // 2FA Toggle
  const toggle2FA = async (enabled: boolean) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, enabled }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser((prev) => (prev ? { ...prev, twoFactorEnabled: data.twoFactorEnabled } : null));
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Error al actualizar 2FA', 'error');
      }
    } catch (err) {
      setCurrentUser((prev) => (prev ? { ...prev, twoFactorEnabled: enabled } : null));
      showToast(enabled ? 'Verificación en Dos Pasos (2FA) activada' : '2FA desactivada', 'success');
    }
  };

  // Commission Pricing (Admin configurable)
  const [commissionPricing, setCommissionPricing] = useState<CommissionPricing>(() => {
    const saved = localStorage.getItem('foodlink_commissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_COMMISSION_PRICING;
  });

  // Products
  const [products, setProducts] = useState<FoodProduct[]>(() => {
    const saved = localStorage.getItem('foodlink_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMocks = parsed.some((p: FoodProduct) => p.id === 'prod-01' || p.id === 'prod-02');
          if (!hasOldMocks) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Offers
  const [offers, setOffers] = useState<ProductOffer[]>(() => {
    const saved = localStorage.getItem('foodlink_offers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMocks = parsed.some((o: ProductOffer) => o.id === 'off-01' || o.id === 'off-02');
          if (!hasOldMocks) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_OFFERS;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('foodlink_favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMocks = parsed.some((id: string) => id === 'prod-01' || id === 'prod-03');
          if (!hasOldMocks) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('foodlink_notifs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Commission Records
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>(() => {
    const saved = localStorage.getItem('foodlink_com_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasOldMocks = parsed.some((c: CommissionRecord) => c.id === 'com-01' || c.id === 'com-02');
          if (!hasOldMocks) {
            return parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMMISSION_RECORDS;
  });

  // Navigation & Modals
  const [selectedProductIdForDetail, setSelectedProductIdForDetail] = useState<string | null>(null);
  const [selectedOfferIdForNegotiation, setSelectedOfferIdForNegotiation] = useState<string | null>(null);
  const [productForRenewal, setProductForRenewal] = useState<FoodProduct | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

  // Guarded setters that enforce authentication for interactive modals and detail views
  const handleSetIsPublishModalOpen = (open: boolean) => {
    if (open && !isAuthenticated) {
      setRedirectTo('dashboard');
      setAuthModalTab('login');
      setAuthModalMessage('Debes iniciar sesión con tu cuenta de establecimiento para publicar alimentos.');
      setIsAuthModalOpen(true);
      showToast('Acceso restringido: Inicia sesión para publicar alimentos.', 'warning');
      return;
    }
    setIsPublishModalOpen(open);
  };

  const handleSetSelectedOfferIdForNegotiation = (id: string | null) => {
    if (id && !isAuthenticated) {
      setRedirectTo('dashboard');
      setAuthModalTab('login');
      setAuthModalMessage('Debes iniciar sesión para acceder a la sala de negociación.');
      setIsAuthModalOpen(true);
      showToast('Acceso privado: Inicia sesión para negociar.', 'warning');
      return;
    }
    setSelectedOfferIdForNegotiation(id);
  };

  const handleSetSelectedProductIdForDetail = (id: string | null) => {
    if (id && !isAuthenticated) {
      setRedirectTo('catalog');
      setAuthModalTab('login');
      setAuthModalMessage('Inicia sesión o regístrate para ver detalles y ofertar por este producto.');
      setIsAuthModalOpen(true);
      showToast('Acceso privado: Inicia sesión para continuar.', 'warning');
      return;
    }
    setSelectedProductIdForDetail(id);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('foodlink_role', currentRole);
    } else {
      localStorage.removeItem('foodlink_role');
    }
    localStorage.setItem('foodlink_commissions', JSON.stringify(commissionPricing));
    localStorage.setItem('foodlink_products', JSON.stringify(products));
    localStorage.setItem('foodlink_offers', JSON.stringify(offers));
    localStorage.setItem('foodlink_favorites', JSON.stringify(favorites));
    localStorage.setItem('foodlink_notifs', JSON.stringify(notifications));
    localStorage.setItem('foodlink_com_records', JSON.stringify(commissionRecords));
  }, [currentUser, currentRole, commissionPricing, products, offers, favorites, notifications, commissionRecords]);

  // Handle role switch
  const switchRole = (role: RoleType) => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    const normalizedRole = (role === 'buyer' ? 'buyer_foundation' : role) as RoleType;
    setCurrentRole(normalizedRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: normalizedRole });
    }
    showToast(`Modo cambiado a: ${normalizedRole === 'establishment' ? 'Establecimiento' : normalizedRole === 'admin' ? 'Administrador' : 'Fundación / Comprador'}`, 'info');
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    showToast('Perfil actualizado correctamente', 'success');
  };

  const updateCommissionPricing = (newPricing: CommissionPricing) => {
    setCommissionPricing(newPricing);
    showToast('Tabla de comisiones actualizada por el administrador', 'success');
  };

  const resetCommissionPricing = () => {
    setCommissionPricing(DEFAULT_COMMISSION_PRICING);
    showToast('Comisiones restablecidas a los valores por defecto', 'info');
  };

  const getCommissionForDays = (days: DurationDays): number => {
    return commissionPricing[days] ?? 2500;
  };

  // Product actions
  const addProduct = (
    productData: Omit<FoodProduct, 'id' | 'publishedAt' | 'expiresAt' | 'offersCount' | 'viewsCount'>,
    paymentMethod: string
  ): FoodProduct => {
    const publishedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + productData.durationDays * 24 * 3600 * 1000).toISOString();
    const id = 'prod-' + Date.now().toString(36);

    const newProduct: FoodProduct = {
      ...productData,
      id,
      publishedAt,
      expiresAt,
      status: 'activa',
      offersCount: 0,
      viewsCount: 1,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Create commission record
    const newRecord: CommissionRecord = {
      id: 'com-' + Date.now().toString(36),
      productName: newProduct.name,
      durationDays: newProduct.durationDays,
      commission: newProduct.commissionPaid,
      date: new Date().toISOString().split('T')[0],
      status: 'Activa',
      paymentMethod,
      transactionRef: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
    };
    setCommissionRecords((prev) => [newRecord, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now().toString(36),
      userId: newProduct.sellerId,
      type: 'publicacion_activada',
      title: '¡Publicación activada con éxito!',
      message: `Tu producto "${newProduct.name}" ya está visible en el catálogo por ${newProduct.durationDays} día(s).`,
      timestamp: 'Hace un momento',
      read: false,
      relatedProductId: id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`¡Publicación de "${newProduct.name}" activada exitosamente!`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<FoodProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Producto actualizado correctamente', 'info');
  };

  const renewProduct = (id: string, additionalDays: DurationDays, paymentMethod: string) => {
    const commissionCost = getCommissionForDays(additionalDays);
    let updatedName = '';

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedName = p.name;
          // Calculate new expiration date
          const currentExpiry = new Date(p.expiresAt).getTime();
          const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
          const newExpiresAt = new Date(baseTime + additionalDays * 24 * 3600 * 1000).toISOString();
          return {
            ...p,
            durationDays: ((p.durationDays + additionalDays) as DurationDays),
            commissionPaid: p.commissionPaid + commissionCost,
            expiresAt: newExpiresAt,
            status: 'activa' as ProductStatus,
          };
        }
        return p;
      })
    );

    // Create commission record for renewal
    const newRecord: CommissionRecord = {
      id: 'com-ren-' + Date.now().toString(36),
      productName: updatedName,
      durationDays: additionalDays,
      commission: commissionCost,
      date: new Date().toISOString().split('T')[0],
      status: 'Renovada',
      paymentMethod,
      transactionRef: 'RNW-' + Math.floor(100000 + Math.random() * 900000),
    };
    setCommissionRecords((prev) => [newRecord, ...prev]);

    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now().toString(36),
      userId: currentUser?.id || 'anon-user',
      type: 'publicacion_activada',
      title: 'Publicación renovada',
      message: `Has extendido "${updatedName}" por ${additionalDays} día(s) adicionales.`,
      timestamp: 'Hace un momento',
      read: false,
      relatedProductId: id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Publicación extendida por ${additionalDays} días. Comisión pagada: $${commissionCost.toLocaleString('es-CO')} COP`, 'success');
  };

  const changeProductStatus = (id: string, newStatus: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Estado de la publicación cambiado a: ${newStatus}`, 'info');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Publicación retirada de la plataforma', 'info');
  };

  const simulateExpirationForProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            expiresAt: new Date(Date.now() - 1000 * 60).toISOString(),
            status: 'finalizada' as ProductStatus,
          };
        }
        return p;
      })
    );
    showToast('Se ha simulado la finalización del tiempo contratado.', 'warning');
  };

  // Offers
  const createOffer = (
    offerData: Omit<ProductOffer, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>
  ): ProductOffer => {
    const id = 'off-' + Date.now().toString(36);
    const nowIso = new Date().toISOString();

    const newOffer: ProductOffer = {
      ...offerData,
      id,
      status: 'pendiente',
      createdAt: nowIso,
      updatedAt: nowIso,
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: offerData.buyerId,
          senderName: `${offerData.buyerName} (${offerData.buyerOrganization})`,
          senderRole: 'buyer_foundation',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: offerData.message || `Propuesta de adquisición por ${offerData.requestedQuantity} ${offerData.unit} a $${offerData.offeredPricePerUnit.toLocaleString('es-CO')} c/u. Total: $${offerData.totalOfferedPrice.toLocaleString('es-CO')} COP`,
          isOfferProposal: true,
          proposedPrice: offerData.offeredPricePerUnit,
          proposedQuantity: offerData.requestedQuantity,
        },
      ],
    };

    setOffers((prev) => [newOffer, ...prev]);

    // Update product offersCount
    setProducts((prev) =>
      prev.map((p) => (p.id === offerData.productId ? { ...p, offersCount: (p.offersCount || 0) + 1 } : p))
    );

    // Notify seller
    const sellerNotif: NotificationItem = {
      id: 'notif-' + Date.now().toString(36),
      userId: offerData.sellerId,
      type: 'nueva_oferta',
      title: '¡Nueva oferta recibida!',
      message: `${offerData.buyerOrganization} ofreció $${offerData.totalOfferedPrice.toLocaleString('es-CO')} COP por ${offerData.productName}.`,
      timestamp: 'Hace un momento',
      read: false,
      relatedProductId: offerData.productId,
      relatedOfferId: id,
    };
    setNotifications((prev) => [sellerNotif, ...prev]);

    showToast('¡Oferta enviada al establecimiento con éxito!', 'success');
    return newOffer;
  };

  const respondToOffer = (
    offerId: string,
    action: 'aceptada' | 'rechazada' | 'contraoferta',
    counterPrice?: number,
    counterQuantity?: number,
    messageText?: string
  ) => {
    setOffers((prev) =>
      prev.map((off) => {
        if (off.id === offerId) {
          const updatedMessages = [...off.messages];
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const senderId = currentUser?.id || 'seller-id';
          const senderName = currentUser ? `${currentUser.name} (${off.sellerName})` : off.sellerName;

          if (action === 'aceptada') {
            updatedMessages.push({
              id: 'msg-' + Date.now(),
              senderId,
              senderName,
              senderRole: 'establishment',
              timestamp: time,
              text: messageText || '¡Hemos aceptado tu oferta! Tu pedido ha sido reservado para recogida.',
            });
          } else if (action === 'rechazada') {
            updatedMessages.push({
              id: 'msg-' + Date.now(),
              senderId,
              senderName,
              senderRole: 'establishment',
              timestamp: time,
              text: messageText || 'Agradecemos tu interés, pero en este momento no podemos aceptar estos términos de oferta.',
            });
          } else if (action === 'contraoferta') {
            updatedMessages.push({
              id: 'msg-' + Date.now(),
              senderId,
              senderName,
              senderRole: 'establishment',
              timestamp: time,
              text: messageText || `Te proponemos una contraoferta de $${counterPrice?.toLocaleString('es-CO')} por unidad.`,
              isOfferProposal: true,
              proposedPrice: counterPrice,
              proposedQuantity: counterQuantity,
            });
          }

          return {
            ...off,
            status: action,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
            offeredPricePerUnit: counterPrice || off.offeredPricePerUnit,
            requestedQuantity: counterQuantity || off.requestedQuantity,
            totalOfferedPrice: (counterPrice || off.offeredPricePerUnit) * (counterQuantity || off.requestedQuantity),
          };
        }
        return off;
      })
    );

    // If accepted, we can also mark product as partially sold or sold if desired
    if (action === 'aceptada') {
      showToast('¡Oferta aceptada! Se ha notificado al comprador para concretar la entrega.', 'success');
    } else if (action === 'contraoferta') {
      showToast('Contraoferta enviada al comprador.', 'info');
    } else {
      showToast('Oferta rechazada.', 'warning');
    }
  };

  const sendMessageToOffer = (offerId: string, text: string) => {
    if (!text.trim()) return;
    const senderId = currentUser?.id || 'user-id';
    const senderName = currentUser ? `${currentUser.name} (${currentUser.organizationName || 'Usuario'})` : 'Usuario';

    setOffers((prev) =>
      prev.map((off) => {
        if (off.id === offerId) {
          return {
            ...off,
            messages: [
              ...off.messages,
              {
                id: 'msg-' + Date.now(),
                senderId,
                senderName,
                senderRole: currentRole === 'establishment' ? 'establishment' : 'buyer_foundation',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return off;
      })
    );
  };

  // Favorites
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Producto removido de favoritos', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Producto guardado en tus favoritos', 'success');
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas las notificaciones marcadas como leídas', 'info');
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        switchRole,
        setRole: switchRole,
        updateCurrentUser,
        isAuthenticated,
        logout,
        login,
        toggle2FA,
        redirectTo,
        setRedirectTo,
        navigateWithGuard,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        authModalMessage,
        setAuthModalMessage,
        theme,
        setTheme,
        commissionPricing,
        updateCommissionPricing,
        resetCommissionPricing,
        getCommissionForDays,
        products,
        addProduct,
        updateProduct,
        renewProduct,
        changeProductStatus,
        deleteProduct,
        offers,
        createOffer,
        respondToOffer,
        sendMessageToOffer,
        favorites,
        toggleFavorite,
        isFavorite,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        commissionRecords,
        currentView,
        setCurrentView: handleSetCurrentView,
        selectedProductIdForDetail,
        setSelectedProductIdForDetail: handleSetSelectedProductIdForDetail,
        selectedOfferIdForNegotiation,
        setSelectedOfferIdForNegotiation: handleSetSelectedOfferIdForNegotiation,
        productForRenewal,
        setProductForRenewal,
        isPublishModalOpen,
        setIsPublishModalOpen: handleSetIsPublishModalOpen,
        toasts,
        showToast,
        removeToast,
        simulateExpirationForProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
