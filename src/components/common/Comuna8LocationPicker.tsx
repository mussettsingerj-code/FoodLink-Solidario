import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  Crosshair,
  Building2,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  COMUNA_8_NAME,
  COMUNA_8_SHORT_NAME,
  COMUNA_8_BARRIOS,
  COMUNA_8_CENTER,
  COMUNA_8_BOUNDS,
  COMUNA_8_POLYGON,
  Comuna8Barrio,
  isPointInsideComuna8,
  isValidComuna8Barrio,
  getBarrioCentroid,
  findClosestComuna8Barrio,
  validateAddressTextForComuna8,
} from '../../data/comuna8GeographicData';

export interface Comuna8LocationValue {
  address: string;
  comuna: typeof COMUNA_8_NAME;
  barrio: Comuna8Barrio;
  locationReference?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  isVerifiedInsideComuna8: boolean;
}

interface Comuna8LocationPickerProps {
  value: Comuna8LocationValue | null;
  onChange: (val: Comuna8LocationValue) => void;
  error?: string;
}

/**
 * Componente interno que dibuja el polígono de delimitación oficial de la Comuna 8
 */
const Comuna8PolygonLayer: React.FC = () => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    if (!polygonRef.current) {
      polygonRef.current = new mapsLib.Polygon({
        paths: COMUNA_8_POLYGON,
        strokeColor: '#059669',
        strokeOpacity: 0.85,
        strokeWeight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 0.12,
        clickable: false,
        zIndex: 1,
      });
      polygonRef.current.setMap(map);
    }

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, mapsLib]);

  return null;
};

export const Comuna8LocationPicker: React.FC<Comuna8LocationPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const [selectedBarrio, setSelectedBarrio] = useState<Comuna8Barrio>(
    value?.barrio || 'Villa Hermosa'
  );
  const [addressInput, setAddressInput] = useState<string>(value?.address || '');
  const [referenceInput, setReferenceInput] = useState<string>(
    value?.locationReference || ''
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    value?.coordinates || getBarrioCentroid('Villa Hermosa')
  );
  const [isInsideComuna8, setIsInsideComuna8] = useState<boolean>(
    value?.isVerifiedInsideComuna8 ?? true
  );
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Array<{ description: string; placeId: string }>>([]);

  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<any>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Sincronizar hacia el padre cuando los datos locales cambien y sean válidos
  const emitChange = useCallback(
    (
      barrio: Comuna8Barrio,
      address: string,
      reference: string,
      c: { lat: number; lng: number } | null,
      validInside: boolean,
      placeId?: string
    ) => {
      onChange({
        address: address.trim(),
        comuna: COMUNA_8_NAME,
        barrio,
        locationReference: reference.trim(),
        coordinates: c || undefined,
        placeId,
        isVerifiedInsideComuna8: validInside,
      });
    },
    [onChange]
  );

  // Manejador de cambio de barrio
  const handleBarrioChange = (barrio: Comuna8Barrio) => {
    setSelectedBarrio(barrio);
    setLocationWarning(null);

    // Centrar coordenadas en el barrio seleccionado si aún no hay punto fijado
    const centroid = getBarrioCentroid(barrio);
    setCoords(centroid);
    setIsInsideComuna8(true);

    if (mapRef.current) {
      mapRef.current.panTo(centroid);
      mapRef.current.setZoom(15);
    }

    emitChange(barrio, addressInput, referenceInput, centroid, true);
  };

  // Manejador de clic en el mapa para ubicar el establecimiento
  const handleMapClick = (e: any) => {
    if (!e.detail?.latLng) return;
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;

    const inside = isPointInsideComuna8(lat, lng);
    if (!inside) {
      setIsInsideComuna8(false);
      setLocationWarning(
        `El punto marcado (${lat.toFixed(4)}, ${lng.toFixed(4)}) se encuentra FUERA del polígono oficial de la Comuna 8 — Villa Hermosa. Por favor selecciona una ubicación dentro de la Comuna 8.`
      );
      return;
    }

    // Está dentro de la Comuna 8
    setIsInsideComuna8(true);
    setLocationWarning(null);
    const newCoords = { lat, lng };
    setCoords(newCoords);

    // Sugerir el barrio más cercano si es diferente
    const closest = findClosestComuna8Barrio(lat, lng);
    if (closest !== selectedBarrio) {
      setSelectedBarrio(closest);
    }

    // Si la dirección está vacía, colocar referencia con barrio
    const finalAddress =
      addressInput.trim() || `Barrio ${closest}, Comuna 8 — Villa Hermosa`;
    setAddressInput(finalAddress);

    emitChange(closest, finalAddress, referenceInput, newCoords, true);
  };

  // Búsqueda asistida con Google Places Autocomplete (Places API New)
  const handleAddressInputChange = async (val: string) => {
    setAddressInput(val);
    setLocationWarning(null);

    // Validar si menciona explícitamente comunas prohibidas
    const textValidation = validateAddressTextForComuna8(val, selectedBarrio);
    if (!textValidation.isValid) {
      setLocationWarning(textValidation.reason || 'Ubicación fuera de la Comuna 8.');
      return;
    }

    if (!val.trim() || val.length < 3 || !placesLib) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearchingPlaces(true);
      if (!sessionTokenRef.current && (placesLib as any).AutocompleteSessionToken) {
        sessionTokenRef.current = new (placesLib as any).AutocompleteSessionToken();
      }

      // AutocompleteSuggestion de Places API (New)
      if ((placesLib as any).AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        const req = {
          input: `${val}, Medellín, Comuna 8`,
          sessionToken: sessionTokenRef.current,
          locationBias: {
            north: COMUNA_8_BOUNDS.north,
            south: COMUNA_8_BOUNDS.south,
            east: COMUNA_8_BOUNDS.east,
            west: COMUNA_8_BOUNDS.west,
          },
        };
        const response = await (placesLib as any).AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
        if (response?.suggestions) {
          const mapped = response.suggestions.slice(0, 4).map((s: any) => ({
            description: s.placePrediction?.text?.text || val,
            placeId: s.placePrediction?.placeId || '',
          }));
          setSuggestions(mapped);
        }
      }
    } catch {
      // Silencioso en caso de restricciones de red
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Selección de una predicción de Places
  const handleSelectSuggestion = async (s: { description: string; placeId: string }) => {
    setAddressInput(s.description);
    setSuggestions([]);

    const textValidation = validateAddressTextForComuna8(s.description, selectedBarrio);
    if (!textValidation.isValid) {
      setLocationWarning(textValidation.reason || 'Ubicación fuera de la Comuna 8.');
      return;
    }

    if (placesLib && s.placeId && (placesLib as any).Place) {
      try {
        const place = new (placesLib as any).Place({ id: s.placeId });
        await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });
        if (place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();
          const inside = isPointInsideComuna8(lat, lng);

          if (!inside) {
            setIsInsideComuna8(false);
            setLocationWarning(
              `La dirección "${s.description}" se encuentra fuera del área autorizada de la Comuna 8 — Villa Hermosa. Selecciona una ubicación dentro de la comuna.`
            );
            return;
          }

          setIsInsideComuna8(true);
          setLocationWarning(null);
          const newCoords = { lat, lng };
          setCoords(newCoords);

          const closest = findClosestComuna8Barrio(lat, lng);
          setSelectedBarrio(closest);

          if (mapRef.current) {
            mapRef.current.panTo(newCoords);
            mapRef.current.setZoom(16);
          }

          emitChange(closest, s.description, referenceInput, newCoords, true, s.placeId);
          return;
        }
      } catch (err) {
        console.warn('Error resolviendo lugar en Places:', err);
      }
    }

    // Fallback: usar centroide del barrio seleccionado
    const centroid = getBarrioCentroid(selectedBarrio);
    emitChange(selectedBarrio, s.description, referenceInput, centroid, true);
  };

  return (
    <div className="space-y-4">
      {/* 1. Indicador Territorial Fijo: Comuna 8 — Villa Hermosa */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                Ámbito Territorial Oficial
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                Fijado
              </span>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-300 font-semibold mt-0.5">
              {COMUNA_8_NAME}
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
              Operación exclusiva en los 18 barrios oficiales de Villa Hermosa, Medellín.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const centroid = getBarrioCentroid(selectedBarrio);
            setCoords(centroid);
            if (mapRef.current) {
              mapRef.current.panTo(centroid);
              mapRef.current.setZoom(15);
            }
          }}
          title="Centrar mapa en Comuna 8"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-700 text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Selector Obligatorio de los 18 Barrios Oficiales */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Barrio Oficial de la Comuna 8 *</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            18 Barrios Oficiales
          </span>
        </label>
        <select
          value={selectedBarrio}
          onChange={(e) => handleBarrioChange(e.target.value as Comuna8Barrio)}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer transition-colors"
        >
          {COMUNA_8_BARRIOS.map((b) => (
            <option key={b} value={b} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Campo de Dirección y Google Places Autocomplete */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Dirección o Sede del Establecimiento en {selectedBarrio} *
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            value={addressInput}
            onChange={(e) => handleAddressInputChange(e.target.value)}
            placeholder={`Ej: Calle 56 # 40-12, Barrio ${selectedBarrio}`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Sugerencias de Google Places */}
        {suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 animate-in fade-in duration-100">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{s.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Referencia adicional del establecimiento (Opcional pero muy útil para compradores) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Punto de Referencia Autorizado (Opcional)
        </label>
        <input
          type="text"
          value={referenceInput}
          onChange={(e) => {
            setReferenceInput(e.target.value);
            emitChange(
              selectedBarrio,
              addressInput,
              e.target.value,
              coords,
              isInsideComuna8
            );
          }}
          placeholder="Ej: Frente al Parque de Villa Hermosa, al lado de la droguería"
          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
        />
      </div>

      {/* Alerta de advertencia territorial si la ubicación está fuera de la Comuna 8 */}
      {locationWarning && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-rose-900 dark:text-rose-200 text-xs animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Ubicación No Autorizada</p>
            <p className="mt-0.5 leading-relaxed">{locationWarning}</p>
          </div>
        </div>
      )}

      {/* Error de validación general si viene del formulario padre */}
      {error && !locationWarning && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5. Mapa Interactivo de Google Maps con el polígono oficial de Comuna 8 */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Ubicación en Google Maps ({selectedBarrio})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              Haz clic en el mapa para ajustar el punto
            </span>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
            </button>
          </div>
        </div>

        {showMap && (
          <div className="relative h-64 sm:h-72 w-full">
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={coords || COMUNA_8_CENTER}
              defaultZoom={14}
              minZoom={12}
              maxZoom={18}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleMapClick}
              className="w-full h-full"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <Comuna8PolygonLayer />

              {coords && (
                <AdvancedMarker
                  position={coords}
                  title={`Ubicación del lote en ${selectedBarrio}`}
                >
                  <div className="flex flex-col items-center group cursor-pointer animate-bounce-subtle">
                    <div className="px-2 py-0.5 rounded-md bg-emerald-900 text-white text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                      {selectedBarrio}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <MapPin className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </AdvancedMarker>
              )}
            </Map>

            {/* Badge de estado en esquina inferior del mapa */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Límite Comuna 8 (Polígono Verde)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
