import React, { useState } from 'react';
import {
  Tag,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  Image as ImageIcon,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  FOOD_CATEGORIES,
  FOOD_CONDITIONS,
  FoodCategory,
  ProductCondition,
  DurationDays,
} from '../../types';
import { COMMISSION_PRICING } from '../../data/initialData';

const DURATION_OPTIONS: DurationDays[] = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];

const SAMPLE_IMAGES: Record<string, string> = {
  Frutas: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80',
  Verduras: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
  Lácteos: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80',
  'Carnes y proteínas': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80',
  Huevos: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80',
  'Panadería y repostería': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  'Granos y cereales': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
  'Alimentos enlatados y conservas': 'https://images.unsplash.com/photo-1584263347416-85a696b4eda7?auto=format&fit=crop&w=900&q=80',
  Bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
  Snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=900&q=80',
  'Alimentos empacados': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  'Otros alimentos': 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=900&q=80',
};

interface PublishProductViewProps {
  isModal?: boolean;
  onSuccessClose?: () => void;
}

export const PublishProductView: React.FC<PublishProductViewProps> = ({
  isModal = false,
  onSuccessClose,
}) => {
  const { addProduct, formatCOP, setActiveTab, userProfile, isAuthenticated } = useApp();

  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Frutas');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(25);
  const [unit, setUnit] = useState<'kg' | 'cajas' | 'unidades' | 'litros' | 'bultos' | 'bandejas'>('kg');
  const [condition, setCondition] = useState<ProductCondition>('Próximo a vencer');
  const [expirationDate, setExpirationDate] = useState('2026-10-15');
  const [recommendedDate, setRecommendedDate] = useState('2026-10-13');
  const [locationCity, setLocationCity] = useState(userProfile.city || 'Bogotá D.C.');
  const [locationAddress, setLocationAddress] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(8500);
  const [requestedPrice, setRequestedPrice] = useState<number>(3200);
  const [minPurchaseQuantity, setMinPurchaseQuantity] = useState<number>(5);
  const [deliveryConditions, setDeliveryConditions] = useState(
    'Recogida en bodega principal con cita previa. Traer canastillas limpias.'
  );
  const [sellerName, setSellerName] = useState(userProfile.organizationName || userProfile.name);
  const [sellerType, setSellerType] = useState<
    'Supermercado' | 'Restaurante' | 'Panadería' | 'Distribuidor' | 'Fruver' | 'Tienda'
  >('Supermercado');

  const [durationDays, setDurationDays] = useState<DurationDays>(3);
  const [paymentMethod, setPaymentMethod] = useState<'pse' | 'card' | 'nequi'>('pse');
  const [selectedBank, setSelectedBank] = useState('Bancolombia');

  // Security guard: Only authenticated sellers can access this view (Requirement 9)
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return null;
  }

  const commissionToPay = COMMISSION_PRICING[durationDays];
  const discountPercent =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - requestedPrice) / originalPrice) * 100))
      : 0;
  const totalLotValue = requestedPrice * quantity;

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmPaymentAndPublish = () => {
    const finalImage = imageUrl.trim() || SAMPLE_IMAGES[category] || SAMPLE_IMAGES['Frutas'];

    addProduct({
      name,
      category,
      brand: brand || 'Marca Propia / Lote Directo',
      description,
      imageUrl: finalImage,
      quantity,
      unit,
      condition,
      expirationDate,
      recommendedConsumptionDate: recommendedDate,
      locationCity,
      locationAddress: locationAddress || `${locationCity} - Bodega Principal`,
      originalPrice,
      requestedPrice,
      minPurchaseQuantity,
      deliveryConditions,
      durationDays,
      sellerId: userProfile.id,
      sellerName: sellerName || userProfile.organizationName || userProfile.name,
      sellerType,
      sellerVerified: userProfile.verified,
    });

    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            Transacción PSE Aprobada • Publicación Activa
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            ¡Tu lote de alimento ya está publicado!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6">
            El lote <strong>"{name}"</strong> estará visible en el catálogo durante{' '}
            <strong>{durationDays} día(s)</strong>. Recibirás notificaciones inmediatas cuando un
            comprador realice una oferta.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 text-left mb-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Producto publicado:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {name} ({quantity} {unit})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor solicitado por unidad:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400">
                {formatCOP(requestedPrice)} / {unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tiempo de exposición contratado:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {durationDays} día(s) calendario
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Comisión de publicación pagada:</span>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-400">
                {formatCOP(commissionToPay)} COP
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                if (onSuccessClose) onSuccessClose();
                setActiveTab('my-publications');
              }}
              className="bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Ir a Mis Publicaciones
            </button>
            <button
              onClick={() => {
                setName('');
                setDescription('');
                setStep('form');
              }}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Publicar otro lote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isModal ? 'w-full' : 'max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8'}>
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Publicación Comercial y Solidaria</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 'form'
              ? 'Publicar Nuevo Lote de Alimentos'
              : 'Confirmación y Pago de Tarifa por Exposición'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completa la ficha técnica del alimento y selecciona cuántos días deseas mantener activa
            la oferta.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span
            className={`px-3 py-1.5 rounded-xl border ${
              step === 'form'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            1. Ficha y Duración
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span
            className={`px-3 py-1.5 rounded-xl border ${
              step === 'payment'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            2. Pago de Comisión
          </span>
        </div>
      </div>

      {step === 'form' ? (
        <form
          onSubmit={handleContinueToPayment}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left 2 Columns: Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Basic Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Tag className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  1. Identificación del Alimento
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nombre del Producto / Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Banano Criollo Tipo Exportación (Maduración 85%)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoría Alimentaria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Marca o Productor
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej: Urabá Fresh / Colanta / Propia"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Descripción Detallada y Estado de Inocuidad *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe el estado organoléptico, motivo del excedente, condiciones de cadena de frío y recomendaciones de uso..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    URL de Fotografía del Lote (Opcional - se asigna imagen por categoría si se deja
                    vacío)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Condition, Expiration & Quantity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  2. Condición, Cantidades y Fechas Límite
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Estado / Motivo de Comercialización Solidaria *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {FOOD_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Unidad de Medida *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as typeof unit)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="unidades">Unidades</option>
                    <option value="cajas">Cajas</option>
                    <option value="litros">Litros</option>
                    <option value="bultos">Bultos</option>
                    <option value="bandejas">Bandejas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cantidad Total Disponible *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Compra Mínima Permitida *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={quantity}
                    required
                    value={minPurchaseQuantity}
                    onChange={(e) => setMinPurchaseQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fecha Recomendada de Consumo Preferente
                  </label>
                  <input
                    type="date"
                    value={recommendedDate}
                    onChange={(e) => setRecommendedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Logistics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  3. Precio Solidario y Condiciones de Entrega
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Precio Comercial Original por {unit} (COP) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Valor Solicitado en FoodLink por {unit} (COP) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={requestedPrice}
                    onChange={(e) => setRequestedPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-bold text-emerald-950 dark:text-emerald-200 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                    Ahorro solidario ofrecido: <strong>{discountPercent}% de descuento</strong>
                  </span>
                  <span className="text-emerald-950 dark:text-emerald-300 font-bold">
                    Valor total estimado del lote: {formatCOP(totalLotValue)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-slate-400" /> Establecimiento Publicador
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ciudad y Sede de Recogida *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      className="w-1/2 px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Bogotá D.C.">Bogotá D.C.</option>
                      <option value="Medellín">Medellín</option>
                      <option value="Cali">Cali</option>
                      <option value="Barranquilla">Barranquilla</option>
                      <option value="Bucaramanga">Bucaramanga</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Dirección o Zona"
                      className="w-1/2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipo de Establecimiento
                  </label>
                  <select
                    value={sellerType}
                    onChange={(e) => setSellerType(e.target.value as typeof sellerType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Supermercado">Supermercado</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Distribuidor">Distribuidor</option>
                    <option value="Fruver">Fruver</option>
                    <option value="Tienda">Tienda</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Condiciones Logísticas de Entrega / Recogida *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryConditions}
                    onChange={(e) => setDeliveryConditions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Publication Duration & Commission Calculator */}
          <div className="space-y-6">
            <div className="bg-[#0F291E] text-white rounded-3xl p-6 shadow-xl lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto custom-scroll">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4" />
                <span>Modelo de Exposición por Tiempo</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Duración de la Publicación</h3>
              <p className="text-xs text-emerald-100/75 leading-relaxed mb-5">
                Selecciona cuántos días estará activo tu producto en la plataforma. La comisión se
                calcula automáticamente según la vigencia elegida.
              </p>

              {/* Duration Selector Grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {DURATION_OPTIONS.map((days) => {
                  const price = COMMISSION_PRICING[days];
                  const isSelected = durationDays === days;
                  return (
                    <button
                      type="button"
                      key={days}
                      onClick={() => setDurationDays(days)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold shadow-md'
                          : 'bg-emerald-950/60 text-emerald-100 border-emerald-800/70 hover:bg-emerald-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">
                          {days} {days === 1 ? 'Día' : 'Días'}
                        </span>
                        {days === 3 && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                              isSelected
                                ? 'bg-slate-950 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isSelected ? 'text-slate-900 font-bold' : 'text-emerald-300/80'
                        }`}
                      >
                        {formatCOP(price)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Summary Breakdown */}
              <div className="bg-emerald-950/80 rounded-2xl p-4 border border-emerald-800/70 space-y-2.5 text-xs mb-6">
                <div className="flex justify-between text-emerald-200/80">
                  <span>Duración seleccionada:</span>
                  <span className="font-bold text-white">{durationDays} día(s) calendario</span>
                </div>
                <div className="flex justify-between text-emerald-200/80">
                  <span>Visibilidad prioritaria B2B:</span>
                  <span className="font-bold text-emerald-400">Incluida</span>
                </div>
                <div className="flex justify-between text-emerald-200/80">
                  <span>Chat de negociación y alertas:</span>
                  <span className="font-bold text-emerald-400">Ilimitado</span>
                </div>
                <div className="pt-2.5 border-t border-emerald-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Comisión a Pagar:</span>
                  <span className="text-xl font-extrabold text-amber-400">
                    {formatCOP(commissionToPay)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar al Pago de Publicación</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-start gap-2 text-[11px] text-emerald-200/70">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Si la publicación finaliza sin venta, podrás renovarla seleccionando un nuevo
                  periodo de exposición.
                </span>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Step 2: Payment Confirmation */
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Pasarela Empresarial Segura
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Pago de Comisión por Tiempo de Publicación
              </h3>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Lote a activar en plataforma:</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {name} ({quantity} {unit})
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Exposición activa por <strong>{durationDays} día(s)</strong> • Valor lote:{' '}
                {formatCOP(totalLotValue)}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-xs text-slate-500">Total Comisión FoodLink</p>
              <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
                {formatCOP(commissionToPay)}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              Selecciona el Método de Pago Corporativo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pse')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'pse'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  PSE / Transferencia
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Débito bancario inmediato</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Tarjeta Corporativa
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Visa / Mastercard Empresarial</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nequi')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'nequi'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Billetera Digital
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Nequi / Daviplata Negocios</p>
              </button>
            </div>
          </div>

          {paymentMethod === 'pse' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Entidad Financiera
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="Bancolombia">Bancolombia Empresarial</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="Davivienda">Banco Davivienda</option>
                  <option value="BBVA Colombia">BBVA Colombia</option>
                  <option value="Banco de Occidente">Banco de Occidente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  NIT del Establecimiento Pagador
                </label>
                <input
                  type="text"
                  defaultValue={userProfile.nitOrId}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Al confirmar el pago de <strong>{formatCOP(commissionToPay)}</strong>, la publicación
              se activará inmediatamente por <strong>{durationDays} día(s)</strong> y se emitirá el
              soporte electrónico correspondiente.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 cursor-pointer"
            >
              Volver y editar datos
            </button>

            <button
              type="button"
              onClick={handleConfirmPaymentAndPublish}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-7 py-3 rounded-xl text-sm shadow-lg transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pagar {formatCOP(commissionToPay)} y Activar Publicación</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
