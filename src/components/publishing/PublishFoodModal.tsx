import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { DurationDays, FoodCategory, ProductCondition } from '../../types';
import { DurationSelector } from './DurationSelector';
import { PaymentModal } from './PaymentModal';
import { X, Upload, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface PublishFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: FoodCategory[] = [
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

const CONDITIONS: ProductCondition[] = [
  'Maduración avanzada',
  'Próximo a vencer',
  'Excedente de producción',
  'Empaque secundario dañado',
  'Fuera de calibre comercial',
  'Excelente estado / Lote excedente',
];

const PRESET_PHOTOS: Record<FoodCategory, string> = {
  'Frutas': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
  'Verduras': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  'Lácteos': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
  'Carnes y proteínas': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80',
  'Huevos': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80',
  'Panadería y repostería': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'Granos y cereales': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
  'Alimentos enlatados y conservas': 'https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?w=800&auto=format&fit=crop&q=80',
  'Bebidas': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
  'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&auto=format&fit=crop&q=80',
  'Alimentos empacados': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
  'Otros alimentos': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
};

export const PublishFoodModal: React.FC<PublishFoodModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addProduct, getCommissionForDays, setCurrentView } = useApp();
  const { t } = useI18n();

  // Step management: 1: Form & Duration, 2: Review / Checkout
  const [step, setStep] = useState<1 | 2>(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Verduras');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS['Verduras']);
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<'kg' | 'cajas' | 'unidades' | 'litros' | 'bultos' | 'bandejas'>('kg');
  const [condition, setCondition] = useState<ProductCondition>('Maduración avanzada');
  
  // Expiration dates
  const defaultExp = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const [expirationDate, setExpirationDate] = useState(defaultExp);
  const [recommendedConsumptionDate, setRecommendedConsumptionDate] = useState(defaultExp);

  // Location
  const [locationCity, setLocationCity] = useState(currentUser?.city || 'Medellín');
  const [locationAddress, setLocationAddress] = useState('Central Mayorista, Bloque 4');

  // Commercial information
  const [originalPrice, setOriginalPrice] = useState<number>(3500);
  const [requestedPrice, setRequestedPrice] = useState<number>(1500);
  const [minPurchaseQuantity, setMinPurchaseQuantity] = useState<number>(10);
  const [deliveryConditions, setDeliveryConditions] = useState('Retiro en punto de venta o coordinación directa.');

  // Duration
  const [durationDays, setDurationDays] = useState<DurationDays>(3);

  // Auto-calculated discount
  const discountPercentage = originalPrice > 0 && requestedPrice < originalPrice
    ? Math.round(((originalPrice - requestedPrice) / originalPrice) * 100)
    : 0;

  const commission = getCommissionForDays(durationDays);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: FoodCategory) => {
    setCategory(newCat);
    setImageUrl(PRESET_PHOTOS[newCat] || PRESET_PHOTOS['Otros alimentos']);
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleOpenPayment = () => {
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentMethod: string) => {
    addProduct(
      {
        name,
        category,
        brand: brand || currentUser?.organizationName || 'Establecimiento Donante',
        description,
        imageUrl,
        quantity,
        unit,
        condition,
        expirationDate,
        recommendedConsumptionDate,
        locationCity,
        locationAddress,
        originalPrice,
        requestedPrice,
        minPurchaseQuantity,
        deliveryConditions,
        durationDays,
        commissionPaid: commission,
        status: 'activa',
        sellerId: currentUser ? currentUser.id : 'anon-seller',
        sellerName: currentUser ? currentUser.organizationName : 'Establecimiento Donante',
        sellerType: 'Supermercado',
        sellerVerified: true,
        sellerPhone: currentUser ? currentUser.phone : '+57 300 000 0000',
      },
      paymentMethod
    );

    setTimeout(() => {
      setIsPaymentOpen(false);
      onClose();
      setCurrentView('establishment_dashboard');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-3xl w-full my-auto overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                FoodLink Solidario • {t('landing.tagline', 'Menos desperdicio, más oportunidades')}
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {step === 1 ? t('publish.modalTitle', 'Publicar Alimento para Rescate') : t('publish.reviewModalTitle', 'Revisar y Confirmar Publicación')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-publish-food-modal"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 transition-colors cursor-pointer border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper */}
        <div className="bg-slate-50 dark:bg-slate-850 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'}`}>
              1
            </span>
            <span>{t('publish.step1Title', 'Información y Duración')}</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              2
            </span>
            <span>{t('publish.step2Title', 'Resumen y Pago de Comisión')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {step === 1 ? (
            <form onSubmit={handleProceedToReview} className="space-y-6">
              
              {/* Sección: Información del Producto */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. {t('publish.productInfoSection', 'Información del Producto')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.nameLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Tomates Chonto maduros en canastilla"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.categoryLabel')} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as FoodCategory)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Marca */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.brandLabel', 'Marca / Origen productor')}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Finca Rionegro / Marca propia"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Cantidad y Unidad */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.quantityLabel')} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.unitLabel', 'Unidad de medida')} *
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    >
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="cajas">Cajas</option>
                      <option value="unidades">Unidades</option>
                      <option value="litros">Litros</option>
                      <option value="bultos">Bultos</option>
                      <option value="bandejas">Bandejas</option>
                    </select>
                  </div>

                  {/* Estado del Producto */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.conditionLabel', 'Estado del producto')} *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ProductCondition)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de vencimiento */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.expirationLabel')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Fecha recomendada de consumo */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.bestBeforeLabel', 'Fecha recomendada de consumo')}
                    </label>
                    <input
                      type="date"
                      value={recommendedConsumptionDate}
                      onChange={(e) => setRecommendedConsumptionDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Ubicación (Ciudad y Dirección) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.cityLabel', 'Ciudad en Colombia')} *
                    </label>
                    <select
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    >
                      <option value="Medellín">Medellín</option>
                      <option value="Bogotá">Bogotá</option>
                      <option value="Cali">Cali</option>
                      <option value="Barranquilla">Barranquilla</option>
                      <option value="Bucaramanga">Bucaramanga</option>
                      <option value="Pereira">Pereira</option>
                      <option value="Cartagena">Cartagena</option>
                      <option value="Manizales">Manizales</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.addressLabel', 'Dirección exacta o punto de retiro')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Calle 10 # 43E-12, Muelle 2"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Fotografía Preview & URL */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.photoLabel', 'Fotografía del alimento')}
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="URL de la imagen"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setImageUrl(PRESET_PHOTOS[category])}
                            className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                          >
                            {t('publish.suggestedPhotoBtn', 'Usar foto sugerida por categoría')}
                          </button>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Upload className="w-3 h-3" /> {t('publish.cameraUploadCompatible', 'Compatible con fotos tomadas en bodega')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.descriptionLabel', 'Descripción detallada')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Indica detalles sobre calidad, empaque, conservación requerida o motivo del excedente..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Información Comercial */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    2. {t('publish.commercialInfoSection', 'Información Comercial')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Precio original */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.originalPriceLabel', 'Precio original por')} {unit} (COP) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Precio solicitado */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.requestedPriceLabel', 'Precio solicitado por')} {unit} (COP) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={requestedPrice}
                      onChange={(e) => setRequestedPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Descuento aproximado badge */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.calculatedDiscount', 'Descuento calculado')}
                    </label>
                    <div className="h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t('publish.buyerSavings', 'Ahorro comprador')}:</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {discountPercentage > 0 ? `-${discountPercentage}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Cantidad mínima */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.minQuantityLabel', 'Cantidad mínima de compra')} ({unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={minPurchaseQuantity}
                      onChange={(e) => setMinPurchaseQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Condiciones de entrega */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {t('publish.deliveryConditionsLabel', 'Condiciones de entrega o recogida')}
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Retiro en sede entre 2:00 PM y 6:00 PM con vehículo térmico"
                      value={deliveryConditions}
                      onChange={(e) => setDeliveryConditions(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Duración de la Publicación */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    3. {t('publish.durationSection', 'Duración de la Publicación y Comisión')}
                  </h3>
                </div>

                <DurationSelector
                  selectedDays={durationDays}
                  onChange={setDurationDays}
                  category={category}
                  startDate={new Date()}
                  idPrefix="publish-form"
                />
              </div>

              {/* Submit to review */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-xs sm:text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {t('catalog.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  id="btn-goto-step-2"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>{t('publish.continueToReview', 'Continuar a revisión')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          ) : (
            /* Step 2: Resumen antes del pago */
            <div className="space-y-6">
              
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-sm text-emerald-950 dark:text-emerald-200">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">{t('publish.verifyOfferTitle', 'Verifica los datos de tu oferta solidaria')}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {t('publish.verifyOfferDesc', 'Al confirmar el pago de la micro-comisión, tu publicación pasará de inmediato al catálogo activo visible por fundaciones y compradores.')}
                  </p>
                </div>
              </div>

              {/* Tarjeta de Resumen Estructurado */}
              <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-5 border border-slate-200 dark:border-slate-750 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-750">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {category} • {condition}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      📍 {locationCity} ({locationAddress})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('publish.quantityLabel')}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{quantity} {unit}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('publish.requestedPriceLabel')}</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${requestedPrice.toLocaleString('es-CO')} / {unit}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('publish.expirationLabel')}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{expirationDate}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t('publish.calculatedDiscount')}</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">-{discountPercentage}%</span>
                  </div>
                </div>

                {/* Resumen de Publicación & Comisión */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs sm:text-sm">
                  <h5 className="font-bold text-xs uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    {t('publish.summaryBoxTitle', 'Resumen de publicación FoodLink')}
                  </h5>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{t('publish.nameLabel')}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{name}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{t('publish.quantityLabel')}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{quantity} {unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{t('publish.durationLabel')}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{durationDays} {t('landing.daysUnit', 'días')}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{t('publish.commissionFee')}:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">${commission.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    <span>{t('payment.totalToPay')}:</span>
                    <span className="text-lg sm:text-xl text-emerald-700 dark:text-emerald-400">${commission.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700"
                >
                  {t('publish.backToEdit', 'Volver a editar')}
                </button>
                <button
                  type="button"
                  id="btn-continue-to-payment"
                  onClick={handleOpenPayment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <span>{t('publish.continueToPayment', 'Continuar al pago')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Embedded Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        productName={name}
        quantityText={`${quantity} ${unit}`}
        durationDays={durationDays}
        commissionCOP={commission}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
