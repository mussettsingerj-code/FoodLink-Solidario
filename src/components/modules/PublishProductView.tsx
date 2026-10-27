import React, { useState } from 'react';
import {
  Tag,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  Upload,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  FileCheck,
  HelpCircle,
  Layers,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  FOOD_CATEGORIES,
  FOOD_CONDITIONS,
  FoodCategory,
  ProductCondition,
} from '../../types';
import {
  Comuna8LocationPicker,
  Comuna8LocationValue,
} from '../common/Comuna8LocationPicker';
import {
  COMUNA_8_NAME,
  COMUNA_8_SHORT_NAME,
  COMUNA_8_BARRIOS,
} from '../../data/comuna8GeographicData';
import { uploadProductImage } from '../../utils/imageUpload';

interface PublishProductViewProps {
  isModal?: boolean;
  onSuccessClose?: () => void;
}

const CATEGORY_DEFAULT_PHOTOS: Record<string, string> = {
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

// Formatea dígitos con separación de miles (ej: 2000000 -> "2.000.000")
const formatThousandsDisplay = (val: string): string => {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('es-CO');
};

// Limpia el string a un número entero limpio para almacenar en Firebase
const cleanDigitsToNumber = (val: string): number => {
  const clean = val.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const PublishProductView: React.FC<PublishProductViewProps> = ({
  isModal = false,
  onSuccessClose,
}) => {
  const { addProduct, formatCOP, setActiveTab, userProfile, isAuthenticated } = useApp();

  // Fecha actual en formato YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Navigation steps: 'form' -> 'confirm' -> 'success'
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  // Form states - Cantidad y Precio deben comenzar VACÍOS según especificación (Requisitos 2 y 3)
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Frutas');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<'kg' | 'cajas' | 'unidades' | 'litros' | 'bultos' | 'bandejas'>('kg');
  const [condition, setCondition] = useState<ProductCondition>('Próximo a vencer');

  // Cantidad: comienza VACÍA (NO poner 0)
  const [quantityInput, setQuantityInput] = useState<string>('');

  // Precios: comienzan VACÍOS y con formato de separación de miles (ej: 2.000.000)
  const [requestedPriceInput, setRequestedPriceInput] = useState<string>('');
  const [originalPriceInput, setOriginalPriceInput] = useState<string>('');
  const [minPurchaseQuantityInput, setMinPurchaseQuantityInput] = useState<string>('');

  // Fechas: comienzan VACÍAS y con validaciones estrictas
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [recommendedDate, setRecommendedDate] = useState<string>('');

  // Ubicación: Exclusiva para la Comuna 8 — Villa Hermosa (18 barrios oficiales)
  const [comuna8Location, setComuna8Location] = useState<Comuna8LocationValue | null>(null);

  // Fotografías: Sistema de carga de archivos (con Firebase Storage y fallback a Data URL)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [selectedCategoryPreset, setSelectedCategoryPreset] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Condiciones de entrega y establecimiento
  const [sellerName, setSellerName] = useState(
    userProfile.organizationName || userProfile.name || ''
  );
  const [sellerType, setSellerType] = useState<
    'Supermercado' | 'Restaurante' | 'Panadería' | 'Distribuidor' | 'Fruver' | 'Tienda'
  >('Supermercado');
  const [deliveryConditions, setDeliveryConditions] = useState(
    'Recogida en sede o bodega con cita previa. Se coordinará horario y entrega en el chat.'
  );

  // Errores de validación
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restricción de Rol estricta: Únicamente accesible para usuarios con rol 'seller'
  if (!isAuthenticated || userProfile.role !== 'seller') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Acceso Exclusivo para Vendedores
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          La funcionalidad de publicación de alimentos está disponible exclusivamente para usuarios
          con rol <strong>Vendedor</strong>.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Explorar Catálogo de Alimentos
          </button>
        </div>
      </div>
    );
  }

  // Manejo de carga de archivos de fotografía
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const uploadedUrl = await uploadProductImage(file, userProfile.id);
        newUrls.push(uploadedUrl);
      }

      if (newUrls.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...newUrls]);
        setSelectedCategoryPreset('');
      }
    } catch (err) {
      console.error('Error cargando fotografía:', err);
      setValidationErrors((prev) => ({
        ...prev,
        photos: 'No fue posible cargar la fotografía seleccionada. Intenta nuevamente.',
      }));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Cálculo de valores limpios
  const cleanQuantity = cleanDigitsToNumber(quantityInput);
  const cleanRequestedPrice = cleanDigitsToNumber(requestedPriceInput);
  const cleanOriginalPrice = cleanDigitsToNumber(originalPriceInput);
  const cleanMinPurchase = cleanDigitsToNumber(minPurchaseQuantityInput);

  // Fotografía final a mostrar
  const activePhoto =
    uploadedPhotos[0] ||
    (selectedCategoryPreset ? CATEGORY_DEFAULT_PHOTOS[selectedCategoryPreset] : null) ||
    CATEGORY_DEFAULT_PHOTOS[category];

  // Validación completa de la ficha técnica
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Nombre del producto
    if (!name.trim()) {
      errors.name = 'El nombre del producto o lote es obligatorio.';
    }

    // 2. Cantidad (Requisito 2: Validar que sea un número mayor que cero)
    if (!quantityInput.trim() || cleanQuantity <= 0) {
      errors.quantity = 'Debes introducir una cantidad válida mayor que cero.';
    }

    // 3. Precio solidario (Requisito 3: Debe ser mayor que cero)
    if (!requestedPriceInput.trim() || cleanRequestedPrice <= 0) {
      errors.requestedPrice = 'Debes ingresar un precio de comercialización solidaria mayor que cero.';
    }

    // Compra mínima
    if (cleanMinPurchase > 0 && cleanMinPurchase > cleanQuantity) {
      errors.minPurchaseQuantity = 'La compra mínima no puede ser superior a la cantidad total disponible.';
    }

    // 4. Fechas (Requisito 4: expirationDate >= currentDate, expirationDate >= publicationDate)
    if (!expirationDate) {
      errors.expirationDate = 'Debes ingresar la fecha de vencimiento del lote.';
    } else {
      if (expirationDate < todayStr) {
        errors.expirationDate = 'La fecha de vencimiento no puede ser anterior a la fecha actual.';
      }
    }

    // Fecha de consumo preferente: recomendada <= expirationDate y >= todayStr
    if (recommendedDate) {
      if (recommendedDate < todayStr) {
        errors.recommendedDate = 'La fecha de consumo preferente no puede ser anterior a la fecha actual.';
      } else if (expirationDate && recommendedDate > expirationDate) {
        errors.recommendedDate = 'La fecha de consumo preferente debe ser anterior o igual a la fecha de vencimiento.';
      }
    }

    // Ubicación exclusiva para la Comuna 8 — Villa Hermosa
    if (!comuna8Location || !comuna8Location.address.trim() || !comuna8Location.barrio) {
      errors.location = 'Debes seleccionar un barrio oficial de la Comuna 8 e ingresar la dirección o sede de entrega.';
    }

    // Descripción
    if (!description.trim()) {
      errors.description = 'Describe el estado de inocuidad y motivo del excedente del lote.';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const handleGoToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('confirm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Publicación final en Firebase
  const handleFinalPublish = async () => {
    if (!validateForm() || !comuna8Location) {
      setStep('form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Guardar con valores numéricos limpios y campos territoriales en Firestore
      await addProduct({
        name: name.trim(),
        category,
        brand: brand.trim() || 'Lote Directo',
        description: description.trim(),
        imageUrl: activePhoto,
        images: uploadedPhotos.length > 0 ? uploadedPhotos : [activePhoto],
        quantity: cleanQuantity,
        unit,
        condition,
        expirationDate,
        recommendedConsumptionDate: recommendedDate || undefined,
        locationCity: 'Medellín',
        locationAddress: comuna8Location.address,
        comuna: COMUNA_8_NAME,
        barrio: comuna8Location.barrio,
        locationReference: comuna8Location.locationReference || '',
        coordinates: comuna8Location.coordinates,
        placeId: comuna8Location.placeId,
        requestedPrice: cleanRequestedPrice,
        originalPrice: cleanOriginalPrice > 0 ? cleanOriginalPrice : cleanRequestedPrice,
        minPurchaseQuantity: cleanMinPurchase > 0 ? cleanMinPurchase : 1,
        deliveryConditions: deliveryConditions.trim(),
        sellerId: userProfile.id,
        sellerName: sellerName.trim() || userProfile.organizationName || userProfile.name,
        sellerType,
        sellerVerified: userProfile.verified,
      });

      setIsSubmitting(false);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error publicando producto:', err);
      setIsSubmitting(false);
      setValidationErrors({
        publish: 'Ocurrió un error al registrar el producto. Por favor intenta nuevamente.',
      });
    }
  };

  // ==========================================
  // ESTADO 3: ÉXITO DE PUBLICACIÓN (Requisito 7)
  // Mensaje exacto: "Producto publicado correctamente."
  // ==========================================
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 p-6 sm:p-10 text-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-xs ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <Check className="w-10 h-10 stroke-[2.6]" />
          </div>

          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 mb-3">
            Publicación Inmediata Activa
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Producto publicado correctamente.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
            El lote de <strong>"{name}"</strong> se encuentra activo en el catálogo y estará visible
            para todos los compradores mientras siga siendo válido (hasta el{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">{expirationDate}</strong>).
          </p>

          {/* Resumen final */}
          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 text-left mb-6 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Producto y Cantidad:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {name} — {cleanQuantity.toLocaleString('es-CO')} {unit}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Territorio y Barrio Oficial:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {comuna8Location?.barrio || 'Villa Hermosa'} · {COMUNA_8_SHORT_NAME}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Dirección Sede Comuna 8:</span>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-[240px] truncate">
                {comuna8Location?.address}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-slate-400">Vigencia hasta:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {expirationDate} (Cierre automático al vencer)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                if (isModal && onSuccessClose) {
                  onSuccessClose();
                }
                setActiveTab('my-publications');
              }}
              className="bg-[#1B4332] hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md cursor-pointer"
            >
              Ir a Mis Publicaciones
            </button>
            <button
              type="button"
              onClick={() => {
                if (isModal && onSuccessClose) {
                  onSuccessClose();
                }
                setActiveTab('catalog');
              }}
              className="bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold px-6 py-3 rounded-xl text-sm transition-colors border border-emerald-200 dark:border-emerald-800 cursor-pointer"
            >
              Ver en el Catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
                setQuantityInput('');
                setRequestedPriceInput('');
                setOriginalPriceInput('');
                setMinPurchaseQuantityInput('');
                setExpirationDate('');
                setRecommendedDate('');
                setDescription('');
                setComuna8Location(null);
                setUploadedPhotos([]);
                setValidationErrors({});
                setStep('form');
              }}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Publicar otro lote
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 2: CONFIRMACIÓN DEL LOTE (Requisito 7)
  // Muestra: producto, cantidad, precio, ubicación, fotografías, fecha, vencimiento
  // Botón: "Publicar producto"
  // ==========================================
  if (step === 'confirm') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 animate-in fade-in slide-in-from-right-2 duration-150">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paso 2: Revisión y Confirmación</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Confirmación de Publicación de Producto
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Revisa los detalles antes de activar el lote en el catálogo solidario. No requiere ningún
            pago ni tarifa de comisión.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
          {/* Header del producto con fotografía */}
          <div className="flex flex-col sm:flex-row gap-5 items-start pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 relative">
              <img
                src={activePhoto}
                alt={name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/75 text-white backdrop-blur-xs">
                {category}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                {condition}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {name}
              </h3>
              {brand && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Marca / Productor: <strong>{brand}</strong>
                </p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Rejilla de información obligatoria de confirmación (Requisito 7) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Cantidad */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Cantidad Total Ofertada:
              </span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {cleanQuantity.toLocaleString('es-CO')} {unit}
              </p>
              {cleanMinPurchase > 0 && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compra mínima permitida: {cleanMinPurchase.toLocaleString('es-CO')} {unit}
                </p>
              )}
            </div>

            {/* 2. Precio */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                Precio Solidario por {unit}:
              </span>
              <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
                {formatCOP(cleanRequestedPrice)} COP
              </p>
              {cleanOriginalPrice > 0 && (
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 line-through">
                  Comercial regular: {formatCOP(cleanOriginalPrice)} COP
                </p>
              )}
            </div>

            {/* 3. Ubicación Comuna 8 — Villa Hermosa */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ubicación en Comuna 8 (Medellín):</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {comuna8Location?.address}
              </p>
              {comuna8Location?.locationReference && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ref: {comuna8Location.locationReference}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  Barrio: {comuna8Location?.barrio}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  {COMUNA_8_SHORT_NAME}
                </span>
                {comuna8Location?.coordinates && (
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    GPS: {comuna8Location.coordinates.lat.toFixed(5)},{' '}
                    {comuna8Location.coordinates.lng.toFixed(5)}
                  </span>
                )}
              </div>
            </div>

            {/* 4. Fecha de Publicación */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Fecha de Publicación:
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{todayStr} (Hoy)</span>
              </p>
            </div>

            {/* 5. Vencimiento */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Fecha de Vencimiento:
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{expirationDate}</span>
              </p>
              {recommendedDate && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Consumo preferente: {recommendedDate}
                </p>
              )}
            </div>
          </div>

          {/* Galería de fotografías subidas si hay más de una */}
          {uploadedPhotos.length > 1 && (
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Fotografías registradas ({uploadedPhotos.length}):
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {uploadedPhotos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Foto ${i + 1}`}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Banner de confirmación */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Publicación directa sin cobros ni comisiones</p>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                El producto permanecerá visible automáticamente hasta el día de su vencimiento (
                {expirationDate}). Al expirar esa fecha, dejará de mostrarse en el catálogo.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep('form')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modificar datos</span>
            </button>

            <button
              type="button"
              id="btn-publicar-producto"
              disabled={isSubmitting}
              onClick={handleFinalPublish}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-extrabold px-8 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publicando en catálogo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Publicar producto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 1: FORMULARIO TÉCNICO DE PUBLICACIÓN
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panel de Vendedor</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Publicar Producto Solidario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ingresa la información técnica del alimento. Tu lote quedará activo mientras siga siendo
            válido.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <span className="px-3 py-1.5 rounded-xl border bg-[#1B4332] text-white border-[#1B4332] flex items-center gap-1.5">
            <span>1. Datos del Alimento</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 rounded-xl border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
            2. Confirmar
          </span>
        </div>
      </div>

      {validationErrors.publish && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationErrors.publish}</span>
        </div>
      )}

      <form onSubmit={handleGoToConfirm} className="space-y-6">
        {/* SECCIÓN 1: IDENTIFICACIÓN DEL PRODUCTO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Tag className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
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
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                placeholder="Ej: Aguacate Hass Maduración 80% / Tomate Chonto"
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.name
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoría Alimentaria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
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
                Marca o Productor (Opcional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Urabá Campo / Colanta / Directo Finca"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Descripción Detallada e Inocuidad *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationErrors.description) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                  }
                }}
                placeholder="Indica el estado del producto, recomendaciones de conservación, motivo del excedente y condiciones de empaque..."
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.description
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.description && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CANTIDAD, UNIDAD Y CONDICIÓN (Requisito 2) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              2. Cantidad y Condición del Lote
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Condición / Motivo Comercial *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="unidades">Unidades</option>
                <option value="cajas">Cajas</option>
                <option value="litros">Litros</option>
                <option value="bultos">Bultos</option>
                <option value="bandejas">Bandejas</option>
              </select>
            </div>

            {/* Requisito 2: El campo de cantidad debe comenzar VACÍO, NO poner 0. Validar mayor que cero. */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Cantidad Total Disponible *</span>
                <span className="text-[10px] text-slate-400 font-normal">Mayor a 0</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={quantityInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setQuantityInput(val);
                  if (validationErrors.quantity) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.quantity;
                      return next;
                    });
                  }
                }}
                placeholder="Ingresa la cantidad..."
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.quantity
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.quantity && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.quantity}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Compra Mínima por Pedido (Opcional - en {unit})
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={minPurchaseQuantityInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setMinPurchaseQuantityInput(val);
                  if (validationErrors.minPurchaseQuantity) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.minPurchaseQuantity;
                      return next;
                    });
                  }
                }}
                placeholder={`Ej: 5 (mínimo de ${unit} por comprador)`}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.minPurchaseQuantity
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.minPurchaseQuantity && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.minPurchaseQuantity}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PRECIOS CON SEPARACIÓN DE MILES (Requisito 3) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              3. Precio Solidario (Formato de Miles)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precio solidario solicitado (Comienza VACÍO, visualiza 2.000.000, guarda 2000000) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Precio Solidario por {unit} (COP) *</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Visualizado con puntos de miles
                </span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatThousandsDisplay(requestedPriceInput)}
                  onChange={(e) => {
                    const rawDigits = e.target.value.replace(/\D/g, '');
                    setRequestedPriceInput(rawDigits);
                    if (validationErrors.requestedPrice) {
                      setValidationErrors((prev) => {
                        const next = { ...prev };
                        delete next.requestedPrice;
                        return next;
                      });
                    }
                  }}
                  placeholder="Ej: 2.000.000"
                  className={`w-full pl-8 pr-4 py-2.5 bg-emerald-50/40 dark:bg-emerald-950/20 border rounded-xl text-base font-bold text-emerald-950 dark:text-emerald-200 focus:bg-white focus:outline-none transition-all ${
                    validationErrors.requestedPrice
                      ? 'border-rose-400 ring-2 ring-rose-400/20'
                      : 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-600'
                  }`}
                />
              </div>
              {validationErrors.requestedPrice && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.requestedPrice}</p>
              )}
              {cleanRequestedPrice > 0 && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                  Valor numérico guardado en base de datos: <strong>{cleanRequestedPrice}</strong>
                </p>
              )}
            </div>

            {/* Precio comercial de referencia (Comienza VACÍO) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Precio Comercial Regular por {unit} (COP)</span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional de referencia</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousandsDisplay(originalPriceInput)}
                  onChange={(e) => {
                    const rawDigits = e.target.value.replace(/\D/g, '');
                    setOriginalPriceInput(rawDigits);
                  }}
                  placeholder="Ej: 4.500.000"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Resumen del valor total calculado si hay cantidad y precio */}
            {cleanQuantity > 0 && cleanRequestedPrice > 0 && (
              <div className="sm:col-span-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                  Lote total: <strong>{cleanQuantity.toLocaleString('es-CO')} {unit}</strong> a{' '}
                  <strong>${cleanRequestedPrice.toLocaleString('es-CO')} c/u</strong>
                </span>
                <span className="text-emerald-950 dark:text-emerald-300 font-extrabold text-sm">
                  Valor total estimado: ${(cleanQuantity * cleanRequestedPrice).toLocaleString('es-CO')} COP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 4: FECHAS CON REGLAS ESTRICTAS (Requisito 4) */}
        {/* expirationDate >= currentDate, expirationDate >= publicationDate, consumo preferente <= vencimiento */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              4. Fechas de Vigencia y Vencimiento
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Fecha de Vencimiento *</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Mínimo: {todayStr} (Hoy)
                </span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={expirationDate}
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  if (validationErrors.expirationDate) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.expirationDate;
                      return next;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.expirationDate
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.expirationDate && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.expirationDate}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                La publicación permanecerá activa hasta esta fecha. Al vencer, se ocultará
                automáticamente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Fecha Recomendada de Consumo Preferente</span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </label>
              <input
                type="date"
                min={todayStr}
                max={expirationDate || undefined}
                value={recommendedDate}
                onChange={(e) => {
                  setRecommendedDate(e.target.value);
                  if (validationErrors.recommendedDate) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.recommendedDate;
                      return next;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none transition-all ${
                  validationErrors.recommendedDate
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
                }`}
              />
              {validationErrors.recommendedDate && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.recommendedDate}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Debe ser anterior o igual a la fecha de vencimiento.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: UBICACIÓN TERRITORIAL COMUNA 8 — VILLA HERMOSA */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <Comuna8LocationPicker
            value={comuna8Location}
            onChange={(loc) => {
              setComuna8Location(loc);
              if (validationErrors.location) {
                setValidationErrors((prev) => {
                  const next = { ...prev };
                  delete next.location;
                  return next;
                });
              }
            }}
            error={validationErrors.location}
            required={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-400" /> Establecimiento Publicador
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Establecimiento
              </label>
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value as typeof sellerType)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
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
                Condiciones Logísticas de Entrega o Recogida *
              </label>
              <input
                type="text"
                required
                value={deliveryConditions}
                onChange={(e) => setDeliveryConditions(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 6: FOTOGRAFÍAS (Requisito 5) */}
        {/* Se eliminó totalmente "Ingresar URL de la imagen personalizada". Carga de archivos y Firebase Storage */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                5. Fotografías del Alimento
              </h3>
            </div>
            <span className="text-xs text-slate-400">JPG, PNG o WEBP</span>
          </div>

          {/* Área de carga de archivos (Dropzone & Botón) */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-colors bg-slate-50/50 dark:bg-slate-800/40 relative">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploadingPhoto}
              onChange={handlePhotoFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Procesando y optimizando imagen...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Arrastra tus fotografías aquí o haz clic para subir
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sube fotos reales del lote para mayor transparencia y confianza con los
                    compradores
                  </p>
                </>
              )}
            </div>
          </div>

          {validationErrors.photos && (
            <p className="text-xs text-rose-600">{validationErrors.photos}</p>
          )}

          {/* Vista previa de fotografías subidas */}
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Fotografías subidas ({uploadedPhotos.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={photo}
                      alt={`Foto subida ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                      title="Eliminar fotografía"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opción de selección de imagen representativa de alta calidad si no se sube foto */}
          {uploadedPhotos.length === 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                O selecciona una imagen representativa del catálogo para {category}:
              </span>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <img
                  src={CATEGORY_DEFAULT_PHOTOS[category] || CATEGORY_DEFAULT_PHOTOS['Frutas']}
                  alt={category}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Fotografía sugerida para la categoría {category}
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Se utilizará automáticamente si no adjuntas fotos propias de la cámara o galería.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón para continuar a la Confirmación */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-emerald-900 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Revisar y Confirmar Publicación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
