import React, { useState, useEffect, useRef } from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Crosshair,
  Store,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { FoodProduct } from '../../types';
import {
  COMUNA_8_NAME,
  COMUNA_8_SHORT_NAME,
  COMUNA_8_CENTER,
  COMUNA_8_BOUNDS,
  COMUNA_8_POLYGON,
  COMUNA_8_BARRIOS_DATA,
  Comuna8Barrio,
  getBarrioCentroid,
} from '../../data/comuna8GeographicData';
import { useApp } from '../../context/AppContext';

interface Comuna8CatalogMapProps {
  products: FoodProduct[];
  selectedBarrio?: string;
  onSelectProduct: (product: FoodProduct) => void;
  className?: string;
}

/**
 * Capa cartográfica con el polígono oficial de la Comuna 8
 */
const Comuna8BoundaryPolygon: React.FC = () => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    if (!polygonRef.current) {
      polygonRef.current = new mapsLib.Polygon({
        paths: COMUNA_8_POLYGON,
        strokeColor: '#059669',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.08,
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

export const Comuna8CatalogMap: React.FC<Comuna8CatalogMapProps> = ({
  products,
  selectedBarrio,
  onSelectProduct,
  className = 'h-[500px]',
}) => {
  const { formatCOP } = useApp();
  const map = useMap();
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);

  // Filtrar productos con ubicación válida en Comuna 8
  const mappableProducts = products.map((p) => {
    // Si ya tiene coordenadas exactas las usa; si no, utiliza el centroide de su barrio oficial
    const coords =
      p.coordinates && typeof p.coordinates.lat === 'number'
        ? p.coordinates
        : p.barrio && COMUNA_8_BARRIOS_DATA[p.barrio as Comuna8Barrio]
        ? getBarrioCentroid(p.barrio as Comuna8Barrio)
        : COMUNA_8_CENTER;

    return {
      product: p,
      position: coords,
    };
  });

  // Ajustar encuadre del mapa según los productos o el barrio seleccionado
  const handleRecenter = () => {
    if (!map) return;

    if (selectedBarrio && selectedBarrio !== 'todos' && COMUNA_8_BARRIOS_DATA[selectedBarrio as Comuna8Barrio]) {
      const centroid = getBarrioCentroid(selectedBarrio as Comuna8Barrio);
      map.panTo(centroid);
      map.setZoom(15);
      return;
    }

    map.panTo(COMUNA_8_CENTER);
    map.setZoom(14);
  };

  useEffect(() => {
    handleRecenter();
  }, [selectedBarrio, map]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md ${className}`}>
      {/* Top Banner de Control del Mapa */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {selectedBarrio && selectedBarrio !== 'todos'
              ? `Barrio ${selectedBarrio}`
              : COMUNA_8_SHORT_NAME}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-700 pl-2">
            {mappableProducts.length} lotes ubicados
          </span>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 pointer-events-auto cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Centrar Comuna 8</span>
        </button>
      </div>

      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={COMUNA_8_CENTER}
        defaultZoom={14}
        minZoom={12}
        maxZoom={18}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        <Comuna8BoundaryPolygon />

        {/* Marcadores de productos con AdvancedMarkerElement */}
        {mappableProducts.map(({ product, position }) => {
          const isSelected = selectedProduct?.id === product.id;

          return (
            <AdvancedMarker
              key={product.id}
              position={position}
              onClick={() => setSelectedProduct(product)}
              title={`${product.name} en ${product.barrio || 'Comuna 8'}`}
            >
              <div
                className={`flex flex-col items-center group cursor-pointer transition-transform ${
                  isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                }`}
              >
                {/* Chip flotante con precio solidario */}
                <div className="px-2.5 py-1 rounded-full bg-slate-950/90 text-white text-[10px] font-extrabold shadow-md whitespace-nowrap mb-1 border border-emerald-400/40 flex items-center gap-1">
                  <span>{formatCOP(product.requestedPrice)}</span>
                </div>

                {/* Pin visual */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 ring-4 ring-emerald-300/50'
                      : 'bg-[#1B4332] group-hover:bg-emerald-700'
                  }`}
                >
                  <MapPin className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* InfoWindow al hacer clic en un marcador de producto */}
        {selectedProduct && (
          <InfoWindow
            position={
              selectedProduct.coordinates ||
              (selectedProduct.barrio &&
                getBarrioCentroid(selectedProduct.barrio as Comuna8Barrio)) ||
              COMUNA_8_CENTER
            }
            onCloseClick={() => setSelectedProduct(null)}
          >
            <div className="max-w-xs p-1 text-slate-900 font-sans">
              <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2 bg-slate-100">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white">
                  {selectedProduct.category}
                </span>
                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                  {selectedProduct.barrio || 'Comuna 8'}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1 mb-1">
                {selectedProduct.name}
              </h4>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600 font-medium">
                  {selectedProduct.quantity} {selectedProduct.unit}
                </span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {formatCOP(selectedProduct.requestedPrice)} COP
                </span>
              </div>

              <div className="text-[11px] text-slate-500 mb-3 flex items-center gap-1 truncate">
                <Store className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{selectedProduct.sellerName}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectProduct(selectedProduct)}
                className="w-full py-2 bg-[#1B4332] hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>Ver publicación completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Nota de pie del mapa */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm pointer-events-none">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Comuna 8 — Villa Hermosa: Límite Cartográfico Oficial</span>
      </div>
    </div>
  );
};
