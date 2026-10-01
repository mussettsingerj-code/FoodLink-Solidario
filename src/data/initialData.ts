import {
  FoodProduct,
  ProductOffer,
  NotificationItem,
  CommissionPricing,
  CommissionRecord,
  FoodCategory,
  DurationDays,
  UserProfile,
} from '../types';

export const COMMISSION_PRICING: CommissionPricing = {
  1: 12000,
  2: 20000,
  3: 28000,
  4: 35000,
  5: 42000,
  6: 48000,
  7: 52000,
  14: 85000,
  21: 115000,
  30: 145000,
};

export interface SmartRecommendation {
  recommendedDays: DurationDays;
  reason: string;
  alertType: 'warning' | 'info' | 'success';
}

export const SMART_RECOMMENDATIONS: Record<FoodCategory, SmartRecommendation> = {
  Frutas: {
    recommendedDays: 2,
    reason: 'Alimento altamente perecedero; rotación recomendada de 24 a 48 horas.',
    alertType: 'warning',
  },
  Verduras: {
    recommendedDays: 2,
    reason: 'Hortalizas y verduras frescas requieren rescate rápido para conservar calidad.',
    alertType: 'warning',
  },
  Lácteos: {
    recommendedDays: 3,
    reason: 'Requiere cadena de frío continua; recomendamos ventana máxima de 3 días.',
    alertType: 'warning',
  },
  'Carnes y proteínas': {
    recommendedDays: 1,
    reason: 'Alta prioridad sanitaria y cadena de frío estricta; despacho sugerido en 24h.',
    alertType: 'warning',
  },
  Huevos: {
    recommendedDays: 5,
    reason: 'Buena estabilidad en ambiente fresco; óptimo entre 3 y 5 días.',
    alertType: 'info',
  },
  'Panadería y repostería': {
    recommendedDays: 1,
    reason: 'Producto de consumo inmediato; recomendamos ventana de 24 horas.',
    alertType: 'warning',
  },
  'Granos y cereales': {
    recommendedDays: 14,
    reason: 'No perecedero de alta estabilidad; permite negociación de mayor volumen.',
    alertType: 'success',
  },
  'Alimentos enlatados y conservas': {
    recommendedDays: 14,
    reason: 'Larga vida útil en empaque sellado; ideal para lotes mayoristas.',
    alertType: 'success',
  },
  Bebidas: {
    recommendedDays: 7,
    reason: 'Rotación media; 7 días permite consolidar transporte solidario.',
    alertType: 'info',
  },
  Snacks: {
    recommendedDays: 7,
    reason: 'Producto empacado estable; ventana recomendada de 7 días.',
    alertType: 'info',
  },
  'Alimentos empacados': {
    recommendedDays: 7,
    reason: 'Buena vida útil; 7 días maximiza ofertas de fundaciones y compradores.',
    alertType: 'info',
  },
  'Otros alimentos': {
    recommendedDays: 3,
    reason: 'Duración estándar sugerida para lotes mixtos de rescate alimentario.',
    alertType: 'info',
  },
};

export const MOCK_USERS: Record<string, UserProfile> = {};

// Real empty initial states for new users (no mock/fake data)
export const INITIAL_PRODUCTS: FoodProduct[] = [];
export const INITIAL_OFFERS: ProductOffer[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_COMMISSIONS: CommissionRecord[] = [];
