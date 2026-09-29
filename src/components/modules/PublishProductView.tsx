import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DurationDays,
  FoodCategory,
  FOOD_CATEGORIES,
  FOOD_CONDITIONS,
  ProductCondition,
} from '../../types';
import { CATEGORY_ILLUSTRATIONS } from '../../data/demoData';
import { DurationSelector } from '../publishing/DurationSelector';
import { PaymentModal } from '../publishing/PaymentModal';
import { ProductImage } from '../common/ProductImage';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Upload,
  Info,
  Sparkles,
} from 'lucide-react';

interface PublishProductViewProps {
  onSuccessClose?: () => void;
  isModal?: boolean;
}

const STEP_TITLES = [
  { number: 1, title: 'Información del producto', subtitle: 'Nombre, categoría, marca y ubicación' },
  { number: 2, title: 'Cantidad y estado', subtitle: 'Volumen disponible, estado y valor de rescate' },
  { number: 3, title: 'Fecha de vencimiento', subtitle: 'Caducidad y condiciones de retiro' },
  { number: 4, title: 'Fotografías', subtitle: 'Imagen de referencia del lote' },
  { number: 5, title: 'Tiempo de publicación', subtitle: 'Duración en catálogo y micro-comisión' },
  { number: 6, title: 'Confirmación', subtitle: 'Revisión final y activación' },
];

export const PublishProductView: React.FC<PublishProductViewProps> = ({
  onSuccessClose,
  isModal = false,
}) => {
  const { currentUser, addProduct, getCommissionForDays, setCurrentView, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Paso 1: Información del producto
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Verduras');
  const [brand, setBrand] = useState(currentUser?.organizationName || '');
  const [description, setDescription] = useState('');
  const [locationCity, setLocationCity] = useState(currentUser?.city || 'Medellín');
  const [locationAddress, setLocationAddress] = useState('Calle 10 # 43E-12, Punto Principal');

  // Paso 2: Cantidad, estado y precios
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<'kg' | 'cajas' | 'unidades' | 'litros' | 'bultos' | 'bandejas'>('kg');
  const [condition, setCondition] = useState<ProductCondition>('Maduración avanzada');
  const [originalPrice, setOriginalPrice] = useState<number>(4000);
  const [requestedPrice, setRequestedPrice] = useState<number>(1600);
  const [minPurchaseQuantity, setMinPurchaseQuantity] = useState<number>(10);

  // Paso 3: Fecha de vencimiento y entrega
  const defaultExp = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const [expirationDate, setExpirationDate] = useState(defaultExp);
  const [recommendedConsumptionDate, setRecommendedConsumptionDate] = useState(defaultExp);
  const [deliveryConditions, setDeliveryConditions] = useState(
    'Retiro en sede del establecimiento en horario acordado.'
  );

  // Paso 4: Fotografías
  const [imageUrl, setImageUrl] = useState<string>(CATEGORY_ILLUSTRATIONS['Verduras']);

  // Paso 5: Tiempo de publicación
  const [durationDays, setDurationDays] = useState<DurationDays>(3);

  const discountPercentage =
    originalPrice > 0 && requestedPrice < originalPrice
      ? Math.round(((originalPrice - requestedPrice) / originalPrice) * 100)
      : 0;

  const commission = getCommissionForDays(durationDays);
  const progressPercentage = Math.round((step / 6) * 100);

  const handleCategoryChange = (newCat: FoodCategory) => {
    setCategory(newCat);
    if (imageUrl.startsWith('data:image/svg+xml')) {
      setImageUrl(CATEGORY_ILLUSTRATIONS[newCat]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        showToast('Fotografía cargada correctamente', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentStep = (): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!name.trim() || name.trim().length < 3) {
        setErrorMsg('Por favor ingresa un nombre descriptivo para el producto (mínimo 3 caracteres).');
        return false;
      }
      if (!locationAddress.trim()) {
        setErrorMsg('Indica la dirección o punto de retiro del alimento.');
        return false;
      }
    }
    if (step === 2) {
      if (quantity <= 0) {
        setErrorMsg('La cantidad disponible debe ser mayor a 0.');
        return false;
      }
      if (requestedPrice <= 0) {
        setErrorMsg('El precio de rescate por unidad debe ser mayor a $0 COP.');
        return false;
      }
      if (minPurchaseQuantity > quantity) {
        setErrorMsg('La cantidad mínima de compra no puede superar la cantidad total disponible.');
        return false;
      }
    }
    if (step === 3) {
      if (!expirationDate) {
        setErrorMsg('Selecciona la fecha límite o de vencimiento del lote.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handlePaymentSuccess = (paymentMethod: string) => {
    addProduct(
      {
        name: name.trim(),
        category,
        brand: brand.trim() || currentUser?.organizationName || 'Establecimiento Aliado',
        description:
          description.trim() ||
          `Lote de ${name.trim()} en estado ${condition.toLowerCase()}, verificado para rescate solidario.`,
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
        sellerId: currentUser ? currentUser.id : 'user-est-01',
        sellerName: currentUser ? currentUser.organizationName : 'Establecimiento Aliado',
        sellerType: 'Supermercado',
        sellerVerified: true,
        sellerPhone: currentUser ? currentUser.phone : '+57 300 000 0000',
      },
      paymentMethod
    );

    setTimeout(() => {
      setIsPaymentOpen(false);
      if (onSuccessClose) {
        onSuccessClose();
      }
      setCurrentView('my_publications');
    }, 1200);
  };

  const activeStepMeta = STEP_TITLES[step - 1];

  return (
    <div className={isModal ? 'space-y-5' : 'max-w-3xl mx-auto space-y-6'}>
      {!isModal && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Publicar producto
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Completa los 6 pasos para publicar un lote de alimentos en el catálogo solidario.
          </p>
        </div>
      )}

      {/* Barra de Progreso y Pasos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Paso {step} de 6
            </span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">·</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {activeStepMeta.title}
            </span>
          </div>
          <span className="font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-400">
            {progressPercentage}%
          </span>
        </div>

        {/* Barra de progreso continua */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="h-full bg-emerald-600 transition-all duration-200 rounded-full"
          />
        </div>

        {/* Indicadores de los 6 pasos */}
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {STEP_TITLES.map((s) => {
            const isDone = step > s.number;
            const isCurrent = step === s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < step || validateCurrentStep()) {
                    setStep(s.number);
                  }
                }}
                className={`text-left p-2 rounded-lg border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : isDone
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                    : 'border-transparent bg-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono tabular-nums ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isDone
                        ? 'bg-slate-900 dark:bg-emerald-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.number}
                  </span>
                  <span className="hidden sm:inline truncate text-slate-700 dark:text-slate-200">
                    {s.title.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mensaje de validación de error si existe */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cuerpo del Paso Activo */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {activeStepMeta.number}. {activeStepMeta.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeStepMeta.subtitle}
          </p>
        </div>

        {/* PASO 1: Información del producto */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Nombre del producto o lote *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Tomate Chonto maduro en canastilla x 25kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-emerald-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Incluye el tipo de alimento y presentación para facilitar su búsqueda.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as FoodCategory)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Marca / Productor
              </label>
              <input
                type="text"
                placeholder="Ej: Cosecha Local / Marca propia"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Ciudad de ubicación *
              </label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
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

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Dirección o muelle de retiro *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Calle 10 # 43E-12, Bodega 2"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Descripción y observaciones de calidad
              </label>
              <textarea
                rows={3}
                placeholder="Describe el estado de conservación, empaque o características relevantes del lote..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
              />
            </div>
          </div>
        )}

        {/* PASO 2: Cantidad y estado */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Cantidad total disponible *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Unidad de medida *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                >
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="cajas">Cajas</option>
                  <option value="unidades">Unidades</option>
                  <option value="litros">Litros</option>
                  <option value="bultos">Bultos</option>
                  <option value="bandejas">Bandejas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pedido mínimo ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={quantity}
                  value={minPurchaseQuantity}
                  onChange={(e) => setMinPurchaseQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Estado del producto *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FOOD_CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      condition === cond
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{cond}</span>
                    {condition === cond && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Precio comercial original / {unit} (COP)
                </label>
                <input
                  type="number"
                  min="100"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Precio solidario solicitado / {unit} (COP) *
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Ahorro estimado para fundaciones
                </span>
                <div className="h-[42px] px-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Descuento:</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    -{discountPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: Fecha de vencimiento */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Fecha de vencimiento o caducidad *
                </label>
                <input
                  type="date"
                  required
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Fecha impresa en el empaque o límite sanitario estimado.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Fecha recomendada de consumo prioritario
                </label>
                <input
                  type="date"
                  value={recommendedConsumptionDate}
                  onChange={(e) => setRecommendedConsumptionDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Fecha óptima para mantener frescura y calidad nutricional.
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Condiciones logísticas de retiro o entrega
              </label>
              <input
                type="text"
                value={deliveryConditions}
                onChange={(e) => setDeliveryConditions(e.target.value)}
                placeholder="Ej: Retiro con canastillas propias entre 8:00 AM y 4:00 PM"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Recuerda que todos los alimentos publicados deben ser aptos para consumo humano según la normativa sanitaria vigente en Colombia.
              </span>
            </div>
          </div>
        )}

        {/* PASO 4: Fotografías */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-5 aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <ProductImage
                  src={imageUrl}
                  alt={name || category}
                  category={category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-7 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Subir fotografía desde tu dispositivo
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar archivo de imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    O ingresa URL de imagen personalizada
                  </label>
                  <input
                    type="text"
                    value={imageUrl.startsWith('data:image/svg+xml') ? '' : imageUrl}
                    onChange={(e) =>
                      setImageUrl(e.target.value.trim() || CATEGORY_ILLUSTRATIONS[category])
                    }
                    placeholder="https://ejemplo.com/foto-lote.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setImageUrl(CATEGORY_ILLUSTRATIONS[category])}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Restablecer ilustración verificada de la categoría ({category})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Tiempo de publicación */}
        {step === 5 && (
          <DurationSelector
            selectedDays={durationDays}
            onChange={setDurationDays}
            category={category}
            startDate={new Date()}
            idPrefix="publish-wizard"
          />
        )}

        {/* PASO 6: Confirmación */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Revisión final antes de publicar
                </span>
                <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">
                  Verifica que los datos del lote sean correctos. Al confirmar la micro-comisión, el producto aparecerá de inmediato en el catálogo activo.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                <ProductImage src={imageUrl} alt={name} category={category} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{category}</span>
                  <span className="mx-1.5">·</span>
                  <span>{condition}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {locationCity} — {locationAddress}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Cantidad</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                  {quantity} {unit}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Valor unitario</span>
                <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">
                  ${requestedPrice.toLocaleString('es-CO')} / {unit}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Vencimiento</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                  {expirationDate}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">Vigencia elegida</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                  {durationDays} {durationDays === 1 ? 'día' : 'días'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Micro-comisión de publicación</span>
                <span className="text-xs text-slate-300">
                  Cubre visibilidad en catálogo y alertas a fundaciones por {durationDays} día(s)
                </span>
              </div>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                ${commission.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        )}

        {/* Controles de Navegación entre Pasos */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Paso anterior</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onSuccessClose ? onSuccessClose() : setCurrentView('dashboard'))}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              id="btn-wizard-next"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar al paso {step + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-continue-to-payment"
              onClick={() => setIsPaymentOpen(true)}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Confirmar y activar publicación</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pasarela de Pago de Micro-Comisión */}
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
