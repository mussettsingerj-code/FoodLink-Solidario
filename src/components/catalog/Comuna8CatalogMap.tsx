import React, { useState, useMemo } from 'react';
import { Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { FoodProduct } from '../../types';
import {
  COMUNA_8_NAME,
  COMUNA_8_CENTER,
  COMUNA_8_BARRIOS,
  COMUNA_8_BARRIOS_DATA,
  Comuna8Barrio,
  getBarrioCentroid,
} from '../../data/comuna8GeographicData';
import { ProductImage } from '../common/ProductImage';
import {
  MapPin,
  ExternalLink,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Filter,
} from 'lucide-react';

interface Comuna8CatalogMapProps {
  products: FoodProduct[];
  selectedBarrio: string;
  onSelectProduct: (product: FoodProduct) => void;
  onSelectBarrio: (barrio: string) => void;
}

export const Comuna8CatalogMap: React.FC<Comuna8CatalogMapProps> = ({
  products,
  selectedBarrio,
  onSelectProduct,
  onSelectBarrio,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);
  const [hasMapError, setHasMapError] = useState(false);

  // Filtrar productos con coordenadas válidas dentro del filtro actual
  const mappableProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBarrio !== 'todas' && p.barrio !== selectedBarrio) {
        return false;
      }
      return Boolean(p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number');
    });
  }, [products, selectedBarrio]);

  // Centro dinámico del mapa según el barrio seleccionado o centro general de la Comuna 8
  const mapCenter = useMemo(() => {
    if (selectedBarrio !== 'todas' && selectedBarrio in COMUNA_8_BARRIOS_DATA) {
      const bCentroid = getBarrioCentroid(selectedBarrio as Comuna8Barrio);
      return { lat: bCentroid.lat, lng: bCentroid.lng };
    }
    return { lat: COMUNA_8_CENTER.lat, lng: COMUNA_8_CENTER.lng };
  }, [selectedBarrio]);

  const mapZoom = selectedBarrio !== 'todas' ? 15 : 14;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-3">
      {/* Cabecera del Mapa */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Cobertura Territorial Exclusiva
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                18 Barrios
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display">
              Mapa de Alimentos Disponibles · {COMUNA_8_NAME}
            </h3>
          </div>
        </div>

        {/* Selector rápido de Barrio en el Mapa */}
        <div className="flex items-center gap-2">
          <label htmlFor="map-barrio-filter" className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Barrio:
          </label>
          <select
            id="map-barrio-filter"
            value={selectedBarrio}
            onChange={(e) => onSelectBarrio(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-emerald-600 cursor-pointer shadow-2xs"
          >
            <option value="todas">Toda la Comuna 8 (18 barrios)</option>
            {COMUNA_8_BARRIOS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor del Mapa con Fallback integrado */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-100 dark:bg-slate-950">
        {!hasMapError ? (
          <Map
            defaultCenter={mapCenter}
            center={mapCenter}
            defaultZoom={mapZoom}
            zoom={mapZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Marcadores de productos con coordenadas reales */}
            {mappableProducts.map((p) => {
              if (!p.coordinates) return null;
              return (
                <Marker
                  key={p.id}
                  position={{ lat: p.coordinates.lat, lng: p.coordinates.lng }}
                  title={`${p.name} — ${p.sellerName}`}
                  onClick={() => setSelectedProduct(p)}
                />
              );
            })}

            {/* Ventana de información cuando se selecciona un marcador */}
            {selectedProduct && selectedProduct.coordinates && (
              <InfoWindow
                position={{
                  lat: selectedProduct.coordinates.lat,
                  lng: selectedProduct.coordinates.lng,
                }}
                onCloseClick={() => setSelectedProduct(null)}
              >
                <div className="p-1 max-w-xs text-slate-900 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ProductImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      category={selectedProduct.category}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        {selectedProduct.barrio || 'Comuna 8'}
                      </span>
                      <h4 className="font-bold text-xs truncate leading-snug">{selectedProduct.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{selectedProduct.sellerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="font-bold text-emerald-800">
                      ${selectedProduct.requestedPrice.toLocaleString('es-CO')} COP/{selectedProduct.unit}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600">
                      {selectedProduct.quantity} {selectedProduct.unit} disp.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectProduct(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ver publicación</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        ) : (
          // Vista alternativa territorial en caso de error o conexión
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Directorio Territorial Comuna 8 — Villa Hermosa
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Actualmente visualizando los productos de los 18 barrios oficiales de la Comuna 8.
            </p>
          </div>
        )}

        {/* Tarjeta flotante de ayuda / resumen */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-md text-xs max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold mb-1">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Resumen del Territorio</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {mappableProducts.length} lote(s) geolocalizado(s) en {selectedBarrio === 'todas' ? 'la Comuna 8' : `el barrio ${selectedBarrio}`}.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-mono">Límites: POT Medellín</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Comuna 8 Villa Hermosa Medellín Antioquia')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>Abrir Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Lista de accesos directos a los 18 Barrios de la Comuna 8 */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
          Explorar por Barrio Oficial de la Comuna 8:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectBarrio('todas')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBarrio === 'todas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            Toda la Comuna 8
          </button>
          {COMUNA_8_BARRIOS.map((barrio) => {
            const count = products.filter((p) => p.barrio === barrio).length;
            const isSelected = selectedBarrio === barrio;
            return (
              <button
                key={barrio}
                type="button"
                onClick={() => onSelectBarrio(barrio)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <span>{barrio}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
