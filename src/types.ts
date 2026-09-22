export type UserRole = 'establishment' | 'buyer' | 'buyer_foundation' | 'admin' | 'public';
export type RoleType = UserRole;

export type FoodCategory =
  | 'Frutas'
  | 'Verduras'
  | 'Lácteos'
  | 'Carnes y proteínas'
  | 'Huevos'
  | 'Panadería y repostería'
  | 'Granos y cereales'
  | 'Alimentos enlatados y conservas'
  | 'Bebidas'
  | 'Snacks'
  | 'Alimentos empacados'
  | 'Otros alimentos';

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Frutas',
  'Verduras',
  'Lácteos',
  'Carnes y proteínas',
  'Huevos',
  'Panadería y repostería',
  'Granos y cereales',
  'Alimentos enlatados y conservas',
  'Bebidas',
  'Snacks',
  'Alimentos empacados',
  'Otros alimentos',
];

export type ProductCondition =
  | 'Maduración avanzada'
  | 'Próximo a vencer'
  | 'Excedente de producción'
  | 'Empaque secundario dañado'
  | 'Fuera de calibre comercial'
  | 'Excelente estado / Lote excedente';

export type FoodCondition = ProductCondition;

export const FOOD_CONDITIONS: ProductCondition[] = [
  'Maduración avanzada',
  'Próximo a vencer',
  'Excedente de producción',
  'Empaque secundario dañado',
  'Fuera de calibre comercial',
  'Excelente estado / Lote excedente',
];

export type ProductStatus =
  | 'activa'
  | 'proxima_a_finalizar'
  | 'finalizada'
  | 'pausada'
  | 'vendida';

export type DurationDays = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 14 | 21 | 30;

export interface CommissionPricing {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  14: number;
  21: number;
  30: number;
}

export interface FoodProduct {
  id: string;
  name: string;
  category: FoodCategory;
  brand: string;
  description: string;
  imageUrl: string;
  quantity: number;
  unit: 'kg' | 'cajas' | 'unidades' | 'litros' | 'bultos' | 'bandejas';
  condition: ProductCondition;
  expirationDate: string;
  recommendedConsumptionDate?: string;
  locationCity: string;
  locationAddress: string;
  originalPrice: number; // in COP
  requestedPrice: number; // in COP per unit
  minPurchaseQuantity: number;
  deliveryConditions: string;
  
  // Publication model
  durationDays: DurationDays;
  commissionPaid: number;
  publishedAt: string; // ISO date
  expiresAt: string; // ISO date
  status: ProductStatus;
  
  // Establishment details
  sellerId: string;
  sellerName: string;
  sellerType: 'Supermercado' | 'Restaurante' | 'Panadería' | 'Distribuidor' | 'Fruver' | 'Tienda';
  sellerVerified: boolean;
  sellerPhone?: string;
  
  // Stats
  offersCount: number;
  viewsCount: number;
}

export interface OfferMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'establishment' | 'buyer_foundation';
  timestamp: string;
  text: string;
  isOfferProposal?: boolean;
  proposedPrice?: number;
  proposedQuantity?: number;
}

export type OfferStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'contraoferta';

export interface ProductOffer {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string;
  buyerType: 'Fundación' | 'Empresa Solidaria' | 'Hogar Comunitario' | 'Comprador Mayorista';
  
  requestedQuantity: number;
  offeredPricePerUnit: number;
  totalOfferedPrice: number;
  unit: string;
  message: string;
  pickupMethod: 'Recogida en sede del vendedor' | 'Transporte solidario contratado' | 'Envío acordado';
  proposedDate: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  
  messages: OfferMessage[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'nueva_oferta'
    | 'oferta_aceptada'
    | 'oferta_rechazada'
    | 'nueva_contraoferta'
    | 'mensaje_recibido'
    | 'publicacion_proxima_finalizar'
    | 'publicacion_finalizada'
    | 'pago_realizado'
    | 'publicacion_activada';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedProductId?: string;
  relatedOfferId?: string;
}

export interface CommissionRecord {
  id: string;
  productName: string;
  durationDays: DurationDays;
  commission: number;
  date: string;
  status: 'Activa' | 'Finalizada' | 'Renovada';
  paymentMethod: string;
  transactionRef: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type SupportedLanguage = 'es' | 'en';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  organizationName: string;
  nitOrId: string;
  phone: string;
  city: string;
  verified: boolean;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  preferredLanguage?: SupportedLanguage;
  preferredTheme?: ThemeMode;
  authProvider?: 'email' | 'google' | 'apple' | 'passkey';
}

export interface EmailCheckResult {
  exists: boolean;
  provider?: 'email' | 'google' | 'apple' | 'passkey';
  message?: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Débil' | 'Regular' | 'Buena' | 'Fuerte' | 'Muy Fuerte' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasMixedCase: boolean;
}

