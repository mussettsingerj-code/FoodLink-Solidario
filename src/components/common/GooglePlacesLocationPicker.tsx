import React, { useState, useEffect, useRef, useId } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, CheckCircle2, X, Loader2, Navigation } from 'lucide-react';

export interface SelectedLocationData {
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

interface GooglePlacesLocationPickerProps {
  value: SelectedLocationData | null;
  onChange: (loc: SelectedLocationData | null) => void;
  error?: string;
  required?: boolean;
  defaultCity?: string;
}

export const GooglePlacesLocationPicker: React.FC<GooglePlacesLocationPickerProps> = ({
  value,
  onChange,
  error,
  required = true,
  defaultCity = 'Medellín',
}) => {
  const inputId = useId();
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions via Google Places API (New) AutocompleteSuggestion
  useEffect(() => {
    if (!inputValue.trim() || inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (!placesLib) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    try {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

      if (!sessionTokenRef.current && AutocompleteSessionToken) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        const request: google.maps.places.AutocompleteRequest = {
          input: inputValue,
          sessionToken: sessionTokenRef.current || undefined,
          includedRegionCodes: ['co'],
        };

        AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
          .then((res) => {
            if (!cancelled) {
              setSuggestions(res.suggestions || []);
              setIsOpen(true);
              setIsLoading(false);
            }
          })
          .catch((err) => {
            if (!cancelled) {
              console.warn('Google Places suggestion fetch warning:', err);
              setIsLoading(false);
            }
          });
      } else if ((placesLib as unknown as { AutocompleteService?: new () => google.maps.places.AutocompleteService }).AutocompleteService) {
        const service = new (placesLib as unknown as { AutocompleteService: new () => google.maps.places.AutocompleteService }).AutocompleteService();
        service.getPlacePredictions(
          {
            input: inputValue,
            componentRestrictions: { country: 'co' },
          },
          (preds) => {
            if (!cancelled) {
              if (preds && preds.length > 0) {
                // Adapt classic predictions
                const adapted = preds.map((p) => ({
                  placePrediction: {
                    placeId: p.place_id,
                    text: { text: p.description },
                    structuredFormat: {
                      mainText: { text: p.structured_formatting?.main_text || p.description },
                      secondaryText: { text: p.structured_formatting?.secondary_text || '' },
                    },
                    toPlace: () => ({
                      fetchFields: async () => {
                        return {
                          place: {
                            formattedAddress: p.description,
                            displayName: p.structured_formatting?.main_text,
                          },
                        };
                      },
                    }),
                  },
                })) as unknown as google.maps.places.AutocompleteSuggestion[];
                setSuggestions(adapted);
                setIsOpen(true);
              } else {
                setSuggestions([]);
              }
              setIsLoading(false);
            }
          }
        );
      }
    } catch (err) {
      if (!cancelled) {
        console.warn('Places Autocomplete initialization notice:', err);
        setIsLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [placesLib, inputValue]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    try {
      setIsLoading(true);
      let formattedAddress = '';
      let coordinates: { lat: number; lng: number } | undefined = undefined;
      let placeId: string | undefined = undefined;
      let detectedCity = defaultCity || 'Medellín';

      const prediction = suggestion.placePrediction;
      if (prediction) {
        placeId = (prediction as unknown as { placeId?: string }).placeId;
        formattedAddress = prediction.text?.text || '';

        if (typeof prediction.toPlace === 'function') {
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
          });

          if (place.formattedAddress) {
            formattedAddress = place.formattedAddress;
          }

          if (place.location) {
            const lat =
              typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
            const lng =
              typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              coordinates = { lat, lng };
            }
          }

          if (place.addressComponents && Array.isArray(place.addressComponents)) {
            for (const comp of place.addressComponents) {
              const types = comp.types || [];
              if (
                types.includes('locality') ||
                types.includes('administrative_area_level_2') ||
                types.includes('sublocality')
              ) {
                detectedCity = comp.longText || comp.shortText || detectedCity;
                break;
              }
            }
          }
        }
      }

      // Reset session token per Google Places best practice
      sessionTokenRef.current = null;
      setSuggestions([]);
      setIsOpen(false);
      setInputValue('');

      onChange({
        address: formattedAddress || inputValue,
        city: detectedCity,
        coordinates,
        placeId,
      });
    } catch (err) {
      console.warn('Error fetching place details, saving prediction:', err);
      onChange({
        address: suggestion.placePrediction?.text?.text || inputValue,
        city: defaultCity,
        placeId: (suggestion.placePrediction as unknown as { placeId?: string })?.placeId,
      });
      setSuggestions([]);
      setIsOpen(false);
      setInputValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConfirm = () => {
    if (!inputValue.trim()) return;
    onChange({
      address: inputValue.trim(),
      city: defaultCity,
    });
    setInputValue('');
    setIsOpen(false);
    setManualEntryMode(false);
  };

  const handleClear = () => {
    onChange(null);
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ubicación y Sede de Entrega / Recogida {required && '*'}</span>
        </label>
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          Google Maps / Places
        </span>
      </div>

      {value ? (
        // Selected location display card
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 rounded-2xl p-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {value.address}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 shadow-2xs">
                    {value.city}
                  </span>
                  {value.coordinates && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                      GPS: {value.coordinates.lat.toFixed(4)}, {value.coordinates.lng.toFixed(4)}
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    • Ubicación confirmada
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Cambiar ubicación"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Eliminar ubicación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Search & autocomplete input (Single integrated field)
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              id={inputId}
              type="text"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (suggestions.length > 0) {
                    handleSelectSuggestion(suggestions[0]);
                  } else if (inputValue.trim()) {
                    handleManualConfirm();
                  }
                }
              }}
              placeholder="Buscar bodega, sede comercial o dirección en Google Maps..."
              className={`w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/90 border rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                error
                  ? 'border-rose-400 dark:border-rose-600'
                  : 'border-slate-200 dark:border-slate-700 focus:border-emerald-600'
              }`}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  setSuggestions([]);
                  setIsOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto custom-scroll animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Resultados de Google Places</span>
                <span>Selecciona tu dirección</span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {suggestions.map((suggestion, idx) => {
                  const pred = suggestion.placePrediction;
                  const mainText =
                    pred?.structuredFormat?.mainText?.text || pred?.text?.text || '';
                  const secondaryText = pred?.structuredFormat?.secondaryText?.text || '';

                  return (
                    <li key={(pred as unknown as { placeId?: string })?.placeId || idx}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 flex items-start gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                            {mainText}
                          </p>
                          {secondaryText && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {secondaryText}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {inputValue.trim() && (
                <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={handleManualConfirm}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Usar "{inputValue.trim()}" directamente como dirección
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fallback button if places are taking a moment */}
          {!isOpen && inputValue.trim().length >= 3 && !value && (
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Presiona enter o confirma la dirección manual:</span>
              <button
                type="button"
                onClick={handleManualConfirm}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Confirmar dirección
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
        Escribe la dirección o el nombre de tu establecimiento para autocompletar con Google Places.
        Guardará dirección y coordenadas GPS para compradores.
      </p>
    </div>
  );
};
