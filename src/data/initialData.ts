import {
  CommissionPricing,
  CommissionRecord,
  DurationDays,
  FoodProduct,
  NotificationItem,
  ProductOffer,
  UserProfile,
} from '../types';

export const DEFAULT_COMMISSION_PRICING: CommissionPricing = {
  1: 1000,
  2: 1800,
  3: 2500,
  4: 3000,
  5: 3500,
  6: 4000,
  7: 4500,
  14: 7000,
  21: 9000,
  30: 12000,
};

export const MOCK_USERS: Record<string, UserProfile> = {
  establishment: {
    id: 'user-est-01',
    name: 'Pedro Gómez',
    email: 'contacto@superlosandes.com.co',
    role: 'establishment',
    organizationName: 'Supermercado Los Andes',
    nitOrId: '900.842.119-4',
    phone: '+57 312 456 7890',
    city: 'Medellín',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  buyer_foundation: {
    id: 'user-fnd-01',
    name: 'Elena Restrepo',
    email: 'direccion@fundacionsaciar.org',
    role: 'buyer_foundation',
    organizationName: 'Fundación Solidaria Saciar',
    nitOrId: '890.901.442-1',
    phone: '+57 310 987 6543',
    city: 'Medellín',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  admin: {
    id: 'user-adm-01',
    name: 'Carlos Mendoza',
    email: 'admin@foodlinksolidario.com',
    role: 'admin',
    organizationName: 'FoodLink Solidario SAS',
    nitOrId: '901.650.320-8',
    phone: '+57 300 123 4567',
    city: 'Bogotá',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  public: {
    id: 'user-pub-01',
    name: 'Visitante Solidario',
    email: 'invitado@foodlink.co',
    role: 'public',
    organizationName: 'Invitado',
    nitOrId: '',
    phone: '',
    city: 'Colombia',
    verified: false,
  },
};

// Clean initial platform state: 0 inflated figures, 0 fake sales, 0 test records
export const INITIAL_PRODUCTS: FoodProduct[] = [];
export const INITIAL_OFFERS: ProductOffer[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_COMMISSION_RECORDS: CommissionRecord[] = [];

export const SMART_RECOMMENDATIONS: Record<string, { recommendedDays: DurationDays; reason: string; alertType: 'warning' | 'info' | 'success' }> = {
  'Frutas': {
    recommendedDays: 3,
    reason: 'Las frutas tienen maduración acelerada y respiración celular alta. Recomendamos publicaciones cortas de 2 a 3 días para garantizar que lleguen frescas a comedores o consumidores.',
    alertType: 'warning'
  },
  'Verduras': {
    recommendedDays: 3,
    reason: 'Las verduras de hoja y hortalizas pierden turgencia rápidamente. Publicaciones de 2 a 4 días aseguran su rescate oportuno.',
    alertType: 'warning'
  },
  'Carnes y proteínas': {
    recommendedDays: 1,
    reason: '¡Atención sanitaria crítica! Los productos cárnicos requieren cadena de frío estricta (0°C a 4°C). Recomendamos 1 a 2 días como máximo y retiro prioritario en menos de 24 horas.',
    alertType: 'warning'
  },
  'Lácteos': {
    recommendedDays: 2,
    reason: 'Lácteos pasteurizados próximos a vencer tienen ventana de consumo reducida. Recomendamos publicaciones de 2 a 3 días según la fecha de caducidad.',
    alertType: 'info'
  },
  'Panadería y repostería': {
    recommendedDays: 1,
    reason: 'El pan artesanal pierde humedad y suavidad en 24 a 48 horas. Recomendamos publicaciones de 1 día para retiro vespertino.',
    alertType: 'info'
  },
  'Huevos': {
    recommendedDays: 5,
    reason: 'Los huevos tienen buena estabilidad si se conservan en lugar fresco. Un período de 4 a 7 días es adecuado.',
    alertType: 'success'
  },
  'Granos y cereales': {
    recommendedDays: 21,
    reason: 'Alimento no perecedero con empaque seco. Se aconseja una duración amplia de 14 a 30 días para obtener el mejor acuerdo.',
    alertType: 'success'
  },
  'Alimentos enlatados y conservas': {
    recommendedDays: 30,
    reason: 'Larga vida útil y cierre hermético. Permite el período máximo de 30 días con excelente rentabilidad.',
    alertType: 'success'
  },
  'Bebidas': {
    recommendedDays: 7,
    reason: 'Bebidas empacadas y jugos tienen buena estabilidad. Se recomiendan entre 5 y 14 días.',
    alertType: 'info'
  },
  'Snacks': {
    recommendedDays: 14,
    reason: 'Snacks con atmósfera modificada permiten publicaciones de 7 a 21 días.',
    alertType: 'success'
  },
  'Alimentos empacados': {
    recommendedDays: 14,
    reason: 'Productos empacados permiten duraciones medias a largas (7 a 21 días).',
    alertType: 'success'
  },
  'Otros alimentos': {
    recommendedDays: 5,
    reason: 'Evalúa la fecha de vencimiento. Duración promedio recomendada: 5 días.',
    alertType: 'info'
  }
};
