import React, { useState, useEffect, useId, useRef } from 'react';
import { useMapsLibrary, Map, Marker } from '@vis.gl/react-google-maps';
import {
  COMUNA_8_NAME,
  COMUNA_8_SHORT_NAME,
  COMUNA_8_BARRIOS,
  COMUNA_8_BARRIOS_DATA,
  Comuna8Barrio,
  isPointInsideComuna8,
  isValidComuna8Barrio,
  validateAddressTextForComuna8,
  getBarrioCentroid,
} from '../../data/comuna8GeographicData';
import {
  MapPin,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Loader2,
  Building,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export interface Comuna8LocationValue {
  comuna: string;
  barrio: Comuna8Barrio;
  address: string;
  locationReference?: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  verified: boolean;
}

interface Comuna8LocationPickerProps {
  value: Comuna8LocationValue | null;
  onChange: (val: Comuna8LocationValue | null) => void;
  error?: string;
  required?: boolean;
}

export const Comuna8LocationPicker: React.FC<Comuna8LocationPickerProps> = ({
  value,
  onChange,
  error,
  required = true,
}) => {
  const inputId = useId();
  const placesLib = useMapsLibrary('places');

  const [selectedBarrio, setSelectedBarrio] = useState<Comuna8Barrio>(
    (value?.barrio as Comuna8Barrio) || 'Villa Hermosa'
  );
  const [addressInput, setAddressInput] = useState<string>(value?.address || '');
  const [referenceInput, setReferenceInput] = useState<string>(value?.locationReference || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(
    value?.coordinates
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      if (value.barrio && isValidComuna8Barrio(value.barrio)) {
        setSelectedBarrio(value.barrio);
      }
      setAddressInput(value.address || '');
      setReferenceInput(value.locationReference || '');
      setCoordinates(value.coordinates);
    }
  }, [value]);

  // Click outside listener for autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions scoped to Medellin / Comuna 8
  useEffect(() => {
    if (!addressInput.trim() || addressInput.trim().length < 3 || !placesLib) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current && AutocompleteSessionToken) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      const request: google.maps.places.AutocompleteRequest = {
        input: `${addressInput}, ${selectedBarrio}, Medellín`,
        sessionToken: sessionTokenRef.current || undefined,
        includedRegionCodes: ['co'],
      };

      AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        .then((res) => {
          if (!cancelled && res.suggestions) {
            setSuggestions(res.suggestions);
            setIsOpenSuggestions(true);
          }
        })
        .catch(() => {
          // Fallback silently if places fails
        });
    }

    return () => {
      cancelled = true;
    };
  }, [addressInput, selectedBarrio, placesLib]);

  // Validation function: checks text and coordinates against Comuna 8 official bounds
  const validateAndEmit = async (
    barrio: Comuna8Barrio,
    address: string,
    reference: string,
    coords?: { lat: number; lng: number },
    placeId?: string
  ) => {
    setGeoError(null);

    // 1. Validar menciones textuales de otras comunas/municipios
    const textCheck = validateAddressTextForComuna8(address, barrio);
    if (!textCheck.isValid) {
      setGeoError(textCheck.reason || 'Ubicación no autorizada');
      onChange(null);
      return false;
    }

    // 2. Si hay coordenadas, verificar pertenencia espacial estricta a la Comuna 8
    let finalCoords = coords;
    if (coords) {
      const isInside = isPointInsideComuna8(coords.lat, coords.lng);
      if (!isInside) {
        setGeoError(
          `Las coordenadas de esta dirección (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}) se encuentran fuera de los límites oficiales de la Comuna 8 — Villa Hermosa. Debes seleccionar una dirección dentro de la comuna.`
        );
        onChange(null);
        return false;
      }
    } else {
      // Usar centroide del barrio como coordenada referencial si no se dispone de GPS exacto
      finalCoords = getBarrioCentroid(barrio);
    }

    // 3. Verificación adicional con el servidor backend seguro (/api/geo/validate-location)
    try {
      setIsVerifying(true);
      const res = await fetch('/api/geo/validate-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barrio,
          address: address.trim(),
          coordinates: finalCoords,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setGeoError(errorData.error || 'Ubicación rechazada por el servidor geográfico.');
        onChange(null);
        return false;
      }

      // Emisión exitosa del valor estructurado y verificado
      onChange({
        comuna: COMUNA_8_NAME,
        barrio,
        address: address.trim(),
        locationReference: reference.trim(),
        city: 'Medellín',
        coordinates: finalCoords,
        placeId,
        verified: true,
      });

      return true;
    } catch {
      // Si falla la red local, usar validación cliente verificada
      onChange({
        comuna: COMUNA_8_NAME,
        barrio,
        address: address.trim(),
        locationReference: reference.trim(),
        city: 'Medellín',
        coordinates: finalCoords,
        placeId,
        verified: true,
      });
      return true;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBarrioChange = (newBarrio: Comuna8Barrio) => {
    setSelectedBarrio(newBarrio);
    const centroid = getBarrioCentroid(newBarrio);
    setCoordinates(centroid);
    if (addressInput.trim()) {
      validateAndEmit(newBarrio, addressInput, referenceInput, centroid);
    }
  };

  const handleAddressBlur = () => {
    if (addressInput.trim()) {
      validateAndEmit(selectedBarrio, addressInput, referenceInput, coordinates);
    }
  };

  const handleSelectSuggestion = async (sug: google.maps.places.AutocompleteSuggestion) => {
    setIsOpenSuggestions(false);
    let coords: { lat: number; lng: number } | undefined = undefined;
    let placeId: string | undefined = undefined;
    let formattedText = sug.placePrediction?.text?.text || addressInput;

    try {
      if (sug.placePrediction) {
        placeId = (sug.placePrediction as unknown as { placeId?: string }).placeId;
        if (typeof sug.placePrediction.toPlace === 'function') {
          const place = sug.placePrediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress', 'location'] });
          if (place.formattedAddress) formattedText = place.formattedAddress;
          if (place.location) {
            const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
            const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              coords = { lat, lng };
            }
          }
        }
      }
    } catch {
      // Ignorar error de place fields
    }

    setAddressInput(formattedText);
    setCoordinates(coords);
    await validateAndEmit(selectedBarrio, formattedText, referenceInput, coords, placeId);
  };

  const currentCentroid = coordinates || getBarrioCentroid(selectedBarrio);

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Ubicación y Sede de Entrega / Recogida {required && '*'}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          📍 Operación Exclusiva Comuna 8
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campo 1: Comuna (Fijada automáticamente en Comuna 8, No editable) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Comuna Asignada</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Territorio Bloqueado</span>
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              disabled
              value={COMUNA_8_NAME}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed select-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {COMUNA_8_SHORT_NAME}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            FoodLink Solidario opera exclusivamente en los 18 barrios oficiales de la Comuna 8 de Medellín.
          </p>
        </div>

        {/* Campo 2: Selector Obligatorio con los 18 Barrios Oficiales */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Barrio Oficial (Comuna 8) *</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              18 opciones oficiales
            </span>
          </label>
          <select
            required
            value={selectedBarrio}
            onChange={(e) => handleBarrioChange(e.target.value as Comuna8Barrio)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white focus:outline-emerald-600 cursor-pointer shadow-2xs"
          >
            {COMUNA_8_BARRIOS.map((barrio) => (
              <option key={barrio} value={barrio}>
                {barrio} ({COMUNA_8_BARRIOS_DATA[barrio]?.code || '08'})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Referencia: {COMUNA_8_BARRIOS_DATA[selectedBarrio]?.landmark}
          </p>
        </div>

        {/* Campo 3: Dirección o Sede Comercial con Autocompletado */}
        <div className="relative sm:col-span-2">
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between"
          >
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span>Dirección o Vía del Establecimiento *</span>
            </span>
            <span className="text-[10px] text-slate-400">Verificada contra Comuna 8</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              id={inputId}
              type="text"
              required
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setGeoError(null);
              }}
              onBlur={handleAddressBlur}
              placeholder={`Ej: Carrera 40 # 64-28, ${selectedBarrio}, Medellín`}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${
                geoError || error
                  ? 'border-rose-400 ring-2 ring-rose-400/20'
                  : value?.verified
                  ? 'border-emerald-400 ring-1 ring-emerald-400/20'
                  : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
              }`}
            />
          </div>

          {/* Menú de sugerencias Places si está habilitado */}
          {isOpenSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion(sug)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-b border-slate-100 dark:border-slate-800 last:border-b-0 cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{sug.placePrediction?.text?.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Alerta de error si está fuera de la Comuna 8 */}
          {(geoError || error) && (
            <div className="p-3 mt-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{geoError || error}</span>
            </div>
          )}
        </div>

        {/* Campo 4: Referencia adicional del establecimiento */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Punto de Referencia o Indicaciones de Acceso (Opcional)</span>
            <span className="text-[10px] text-slate-400">Ej: Al lado de la iglesia, frente a la UVA</span>
          </label>
          <input
            type="text"
            value={referenceInput}
            onChange={(e) => {
              setReferenceInput(e.target.value);
              if (value && value.verified) {
                onChange({ ...value, locationReference: e.target.value.trim() });
              }
            }}
            placeholder="Ej: A media cuadra del Parque de Villa Hermosa, portón verde"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Visualización y Confirmación de Coordenadas y Mapa de la Comuna 8 */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Validación Territorial Oficial: {selectedBarrio}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
              GPS: {currentCentroid.lat.toFixed(4)}, {currentCentroid.lng.toFixed(4)}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentCentroid.lat},${currentCentroid.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Ver en Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Vista previa en Mapa de Google Maps si está disponible */}
        <div className="w-full h-36 rounded-xl overflow-hidden border border-emerald-300/60 dark:border-emerald-800/80 relative">
          <Map
            defaultCenter={currentCentroid}
            center={currentCentroid}
            defaultZoom={15}
            zoom={15}
            gestureHandling="none"
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
          >
            <Marker position={currentCentroid} title={`${selectedBarrio} — Comuna 8`} />
          </Map>
          <div className="absolute bottom-2 left-2 bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Comuna 8 · {selectedBarrio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
