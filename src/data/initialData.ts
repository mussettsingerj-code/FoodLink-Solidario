import {
  CommissionPricing,
  CommissionRecord,
  DurationDays,
  FoodProduct,
  NotificationItem,
  ProductOffer,
  UserProfile,
} from '../types';
import { getSampleNotifications, getSampleOffers, getSampleProducts } from './demoData';

const createAvatarSvg = (initials: string, bg: string, fg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="60" fill="${bg}"/>
      <text x="60" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-weight="700" font-size="42" fill="${fg}">${initials}</text>
    </svg>`
  )}`;

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
    avatarUrl: createAvatarSvg('PG', '#065f46', '#ecfdf5'),
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
    avatarUrl: createAvatarSvg('ER', '#0f172a', '#f8fafc'),
  },
  admin: {
    id: 'user-adm-01',
    name: 'Carlos Mendoza',
    email: 'admin@publiksolidario.com',
    role: 'admin',
    organizationName: 'Publik Solidario SAS',
    nitOrId: '901.650.320-8',
    phone: '+57 300 123 4567',
    city: 'Bogotá',
    verified: true,
    avatarUrl: createAvatarSvg('CM', '#1e293b', '#34d399'),
  },
  public: {
    id: 'user-pub-01',
    name: 'Visitante Solidario',
    email: 'invitado@publiksolidario.com',
    role: 'public',
    organizationName: 'Invitado',
    nitOrId: '',
    phone: '',
    city: 'Colombia',
    verified: false,
  },
};

export const INITIAL_PRODUCTS: FoodProduct[] = getSampleProducts();
export const INITIAL_OFFERS: ProductOffer[] = getSampleOffers();
export const INITIAL_NOTIFICATIONS: NotificationItem[] = getSampleNotifications();
export const INITIAL_COMMISSION_RECORDS: CommissionRecord[] = [
  {
    id: 'com-demo-01',
    productName: 'Tomate Chonto Seleccionado en Canastilla',
    durationDays: 3,
    commission: 2500,
    date: new Date().toISOString().split('T')[0],
    status: 'Activa',
    paymentMethod: 'PSE Empresarial',
    transactionRef: 'TRX-849201',
  },
  {
    id: 'com-demo-02',
    productName: 'Yogurt Entero Natural Bolsa x 1L',
    durationDays: 2,
    commission: 1800,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'Activa',
    paymentMethod: 'Nequi Negocios',
    transactionRef: 'TRX-738194',
  },
];

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
