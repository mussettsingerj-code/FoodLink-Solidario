import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_ORGANIZATIONS, PartnerOrganization } from '../../data/demoData';
import { ProductCard } from '../catalog/ProductCard';
import { ProductDetailModal } from '../catalog/ProductDetailModal';
import { EmptyState } from '../common/EmptyState';
import {
  InteractiveOrganizationsMap,
  OrganizationWithDistance,
  getOrgVisualStyle,
} from './InteractiveOrganizationsMap';
import {
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  X,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  Navigation,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Medellín: { lat: 6.2308, lng: -75.5736, zoom: 12 },
  Bogotá: { lat: 4.6486, lng: -74.0841, zoom: 11 },
  Cali: { lat: 3.4372, lng: -76.5225, zoom: 12 },
  Barranquilla: { lat: 10.9878, lng: -74.7889, zoom: 12 },
  todas: { lat: 5.0689, lng: -75.5174, zoom: 6 },
};

const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const OrganizationsView: React.FC = () => {
  const {
    products,
    currentUser,
    selectedProductIdForDetail,
    setSelectedProductIdForDetail,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'todos' | 'empresa' | 'organizacion'>('todos');
  const [selectedCity, setSelectedCity] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split');

  // Estado de marcador seleccionado en el mapa vs Modal de perfil completo
  const [selectedMapOrgId, setSelectedMapOrgId] = useState<string | null>('user-est-01');
  const [profileModalOrg, setProfileModalOrg] = useState<OrganizationWithDistance | null>(null);

  // Estado para consulta de establecimientos cercanos
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(25);
  const [isLocating, setIsLocating] = useState(false);

  // Combinar organizaciones registradas dinámicamente desde productos con el directorio base
  const allOrganizations = useMemo(() => {
    const map = new Map<string, PartnerOrganization>();
    PARTNER_ORGANIZATIONS.forEach((org) => map.set(org.name, { ...org }));

    products.forEach((p, idx) => {
      const existing = map.get(p.sellerName);
      if (existing) {
        // Actualizar conteo real de publicaciones activas si aplica
        const activeCount = products.filter(
          (prod) =>
            (prod.sellerName === p.sellerName || prod.sellerId === p.sellerId) &&
            (prod.status === 'activa' || prod.status === 'proxima_a_finalizar')
        ).length;
        existing.activeListingsCount = activeCount;
      } else {
        const baseCity = CITY_COORDINATES[p.locationCity] || CITY_COORDINATES['Medellín'];
        const offsetLat = ((idx % 5) - 2) * 0.0085;
        const offsetLng = (((idx * 3) % 5) - 2) * 0.0085;
        map.set(p.sellerName, {
          id: p.sellerId,
          name: p.sellerName,
          type: p.sellerType || 'Supermercado',
          roleCategory: 'empresa',
          city: p.locationCity,
          address: p.locationAddress,
          nit: '900.410.220-1',
          phone: p.sellerPhone || '+57 300 000 0000',
          email: 'contacto@aliadosolidario.co',
          verified: p.sellerVerified,
          description:
            'Establecimiento comercial activo en la red de rescate alimentario de Publik Solidario.',
          totalKgRescued: p.quantity * 4,
          activeListingsCount: 1,
          completedOperations: 5,
          joinedDate: '2025',
          lat: baseCity.lat + offsetLat,
          lng: baseCity.lng + offsetLng,
          schedule: 'Lun - Sáb: 8:00 AM - 6:00 PM',
        });
      }
    });

    return Array.from(map.values());
  }, [products]);

  const cities = useMemo(() => {
    const set = new Set(allOrganizations.map((o) => o.city));
    return ['todas', ...Array.from(set)];
  }, [allOrganizations]);

  // Calcular distancia si el modo cercano está activo y aplicar filtros
  const filteredOrgs = useMemo<OrganizationWithDistance[]>(() => {
    const withDistance = allOrganizations.map((org) => {
      const distanceKm = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, org.lat, org.lng)
        : null;
      return { ...org, distanceKm };
    });

    const filtered = withDistance.filter((org) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          org.name.toLowerCase().includes(q) ||
          org.type.toLowerCase().includes(q) ||
          org.city.toLowerCase().includes(q) ||
          org.address.toLowerCase().includes(q) ||
          org.nit.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedCity !== 'todas' && org.city !== selectedCity) {
        return false;
      }

      if (selectedRoleFilter !== 'todos' && org.roleCategory !== selectedRoleFilter) {
        return false;
      }

      // Filtros específicos por tipo de organización solicitados
      if (selectedCategory === 'supermercados' && org.type !== 'Supermercado') return false;
      if (
        selectedCategory === 'tiendas' &&
        org.type !== 'Tienda' &&
        org.type !== 'Fruver'
      ) {
        return false;
      }
      if (
        selectedCategory === 'restaurantes' &&
        org.type !== 'Restaurante' &&
        org.type !== 'Panadería'
      ) {
        return false;
      }
      if (selectedCategory === 'fundaciones' && org.type !== 'Fundación') return false;
      if (
        selectedCategory === 'comedores' &&
        org.type !== 'Comedor Comunitario' &&
        org.type !== 'Hogar Comunitario'
      ) {
        return false;
      }
      if (
        selectedCategory === 'otras' &&
        org.type !== 'Distribuidor' &&
        org.type !== 'Empresa Solidaria'
      ) {
        return false;
      }

      // Filtro por radio de cercanía si hay ubicación activa y maxRadiusKm < 999
      if (userLocation && maxRadiusKm < 999 && org.distanceKm !== null) {
        if (org.distanceKm > maxRadiusKm) return false;
      }

      return true;
    });

    if (userLocation) {
      filtered.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return filtered;
  }, [
    allOrganizations,
    searchQuery,
    selectedCity,
    selectedRoleFilter,
    selectedCategory,
    userLocation,
    maxRadiusKm,
  ]);

  const selectedMapOrg = useMemo(
    () => filteredOrgs.find((o) => o.id === selectedMapOrgId) || null,
    [filteredOrgs, selectedMapOrgId]
  );

  // Coordenadas centrales y nivel de zoom del mapa
  const mapCamera = useMemo(() => {
    if (userLocation) {
      return {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: maxRadiusKm <= 10 ? 13 : maxRadiusKm <= 25 ? 12 : 10,
      };
    }
    if (selectedCity !== 'todas' && CITY_COORDINATES[selectedCity]) {
      return {
        center: {
          lat: CITY_COORDINATES[selectedCity].lat,
          lng: CITY_COORDINATES[selectedCity].lng,
        },
        zoom: CITY_COORDINATES[selectedCity].zoom,
      };
    }
    return {
      center: { lat: CITY_COORDINATES.todas.lat, lng: CITY_COORDINATES.todas.lng },
      zoom: CITY_COORDINATES.todas.zoom,
    };
  }, [userLocation, selectedCity, maxRadiusKm]);

  const handleFindNearby = () => {
    setIsLocating(true);

    const activateFallbackHub = (cityKey?: string) => {
      const targetCity =
        cityKey ||
        (selectedCity !== 'todas' ? selectedCity : currentUser?.city || 'Medellín');
      const coords = CITY_COORDINATES[targetCity] || CITY_COORDINATES['Medellín'];
      setUserLocation({
        lat: coords.lat,
        lng: coords.lng,
        label: `Sede ${targetCity}`,
      });
      setSelectedCity('todas');
      setMaxRadiusKm(25);
      setIsLocating(false);
      addToast(
        `Mostrando establecimientos y fundaciones cercanos a ${targetCity} (radio ${25} km).`,
        'info'
      );
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Tu ubicación GPS',
          });
          setSelectedCity('todas');
          setMaxRadiusKm(50);
          setIsLocating(false);
          addToast(
            'Ubicación detectada. Ordenando establecimientos por cercanía.',
            'success'
          );
        },
        () => {
          activateFallbackHub();
        },
        { timeout: 4500, enableHighAccuracy: false }
      );
    } else {
      activateFallbackHub();
    }
  };

  const handleSelectReferenceCity = (cityName: string) => {
    const coords = CITY_COORDINATES[cityName];
    if (!coords) return;
    setUserLocation({
      lat: coords.lat,
      lng: coords.lng,
      label: `Zona ${cityName}`,
    });
    setSelectedCity('todas');
    if (maxRadiusKm === 999) setMaxRadiusKm(25);
  };

  const handleClearNearby = () => {
    setUserLocation(null);
    setMaxRadiusKm(25);
  };

  const orgProducts = useMemo(() => {
    if (!profileModalOrg) return [];
    return products.filter(
      (p) => p.sellerName === profileModalOrg.name || p.sellerId === profileModalOrg.id
    );
  }, [profileModalOrg, products]);

  const categoryCounts = useMemo(() => {
    return {
      todas: allOrganizations.length,
      supermercados: allOrganizations.filter((o) => o.type === 'Supermercado').length,
      tiendas: allOrganizations.filter((o) => o.type === 'Tienda' || o.type === 'Fruver')
        .length,
      restaurantes: allOrganizations.filter(
        (o) => o.type === 'Restaurante' || o.type === 'Panadería'
      ).length,
      fundaciones: allOrganizations.filter((o) => o.type === 'Fundación').length,
      comedores: allOrganizations.filter(
        (o) => o.type === 'Comedor Comunitario' || o.type === 'Hogar Comunitario'
      ).length,
      otras: allOrganizations.filter(
        (o) => o.type === 'Distribuidor' || o.type === 'Empresa Solidaria'
      ).length,
    };
  }, [allOrganizations]);

  return (
    <div className="space-y-5">
      {/* Cabecera y Conmutador de Vista */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Geolocalización y Directorio Verificado</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mapa interactivo de establecimientos y organizaciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explora ubicaciones de supermercados, tiendas, restaurantes, fundaciones y comedores comunitarios participantes.
          </p>
        </div>

        {/* Selector de modo de visualización */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={userLocation ? handleClearNearby : handleFindNearby}
            disabled={isLocating}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
              userLocation
                ? 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>
              {isLocating
                ? 'Localizando...'
                : userLocation
                ? 'Desactivar cercanía'
                : 'Consultar cercanos'}
            </span>
          </button>

          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mapa + Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Mapa</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Directorio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de proximidad activa (cuando el usuario consulta establecimientos cercanos) */}
      {userLocation && (
        <div className="bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-sky-950 dark:text-sky-200">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                Filtro de cercanía activo: {userLocation.label}
              </span>
              <span className="text-sky-700 dark:text-sky-300 text-[11px]">
                Ordenando establecimientos y organizaciones según distancia en línea recta.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-sky-900 dark:text-sky-300">
              Punto base:
            </span>
            {(['Medellín', 'Bogotá', 'Cali'] as const).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelectReferenceCity(city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  userLocation.label.includes(city)
                    ? 'bg-sky-600 text-white border-sky-700'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-slate-700 hover:bg-sky-100'
                }`}
              >
                {city}
              </button>
            ))}

            <span className="text-[11px] font-semibold text-sky-900 dark:text-sky-300 ml-1">
              Radio:
            </span>
            <select
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
              aria-label="Seleccionar radio de distancia en kilómetros"
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] cursor-pointer"
            >
              <option value={5}>Hasta 5 km</option>
              <option value={10}>Hasta 10 km</option>
              <option value={25}>Hasta 25 km</option>
              <option value={50}>Hasta 50 km</option>
              <option value={999}>Todo el país (ordenar por distancia)</option>
            </select>

            <button
              type="button"
              onClick={handleClearNearby}
              className="p-1.5 rounded-lg text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 cursor-pointer"
              title="Salir del modo cercanía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Panel de Búsqueda y Filtros Categorizados */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Buscador por texto */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, dirección, barrio, NIT o ciudad..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-emerald-600"
            />
          </div>

          {/* Filtro por Rol en la Red */}
          <div className="md:col-span-3 flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <select
              value={selectedRoleFilter}
              onChange={(e) =>
                setSelectedRoleFilter(e.target.value as 'todos' | 'empresa' | 'organizacion')
              }
              aria-label="Filtrar por rol de participante"
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="todos" className="bg-white dark:bg-slate-800">
                Todos los roles ({allOrganizations.length})
              </option>
              <option value="empresa" className="bg-white dark:bg-slate-800">
                Establecimientos oferentes
              </option>
              <option value="organizacion" className="bg-white dark:bg-slate-800">
                Fundaciones y organizaciones
              </option>
            </select>
          </div>

          {/* Filtro por Ciudad */}
          <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                if (e.target.value !== 'todas') {
                  setUserLocation(null);
                }
              }}
              aria-label="Filtrar organizaciones por ciudad"
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800">
                  {c === 'todas' ? 'Todas las ciudades' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros por Tipo de Organización Solicitados */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'todas', label: 'Todos', count: categoryCounts.todas },
              {
                id: 'supermercados',
                label: 'Supermercados',
                count: categoryCounts.supermercados,
              },
              { id: 'tiendas', label: 'Tiendas', count: categoryCounts.tiendas },
              {
                id: 'restaurantes',
                label: 'Restaurantes',
                count: categoryCounts.restaurantes,
              },
              {
                id: 'fundaciones',
                label: 'Fundaciones',
                count: categoryCounts.fundaciones,
              },
              {
                id: 'comedores',
                label: 'Comedores comunitarios',
                count: categoryCounts.comedores,
              },
              {
                id: 'otras',
                label: 'Otras organizaciones',
                count: categoryCounts.otras,
              },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {(searchQuery ||
            selectedCategory !== 'todas' ||
            selectedRoleFilter !== 'todos' ||
            selectedCity !== 'todas' ||
            userLocation) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todas');
                setSelectedRoleFilter('todos');
                setSelectedCity('todas');
                setUserLocation(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido Principal: Mapa Interactivo + Directorio */}
      {filteredOrgs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <EmptyState
            icon={Building2}
            title="No se encontraron ubicaciones con ese filtro."
            description="Prueba ampliando el radio de búsqueda en kilómetros o seleccionando otra categoría de organización."
            actionLabel="Restablecer filtros y mapa"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('todas');
              setSelectedRoleFilter('todos');
              setSelectedCity('todas');
              setUserLocation(null);
            }}
          />
        </div>
      ) : (
        <div
          className={
            viewMode === 'split'
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
              : 'space-y-5'
          }
        >
          {/* Columna del Mapa Interactivo */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div
              className={
                viewMode === 'split'
                  ? 'lg:col-span-7 xl:col-span-7 lg:sticky lg:top-20 space-y-3'
                  : 'w-full space-y-3'
              }
            >
              <InteractiveOrganizationsMap
                organizations={filteredOrgs}
                selectedOrg={selectedMapOrg}
                onSelectOrg={(org) => setSelectedMapOrgId(org ? org.id : null)}
                onOpenFullProfile={(org) => setProfileModalOrg(org)}
                userLocation={userLocation}
                centerCoords={mapCamera.center}
                zoomLevel={mapCamera.zoom}
              />

              {/* Tarjeta rápida sincronizada con el marcador activo debajo del mapa */}
              {selectedMapOrg && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Marcador seleccionado
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {selectedMapOrg.type} en {selectedMapOrg.city}
                      </span>
                      {selectedMapOrg.distanceKm !== undefined &&
                        selectedMapOrg.distanceKm !== null && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[11px] font-mono font-semibold">
                            A {selectedMapOrg.distanceKm.toFixed(1)} km
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {selectedMapOrg.name}
                      </h3>
                      {selectedMapOrg.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedMapOrg.address} · Tel: {selectedMapOrg.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setProfileModalOrg(selectedMapOrg)}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Ver ficha completa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Columna / Grilla de Tarjetas de Establecimientos y Organizaciones */}
          {(viewMode === 'split' || viewMode === 'grid') && (
            <div
              className={
                viewMode === 'split'
                  ? 'lg:col-span-5 xl:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1 custom-scroll'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              }
            >
              {filteredOrgs.map((org) => {
                const style = getOrgVisualStyle(org);
                const IconComponent = style.Icon;
                const isSelectedOnMap = selectedMapOrg?.id === org.id;

                return (
                  <article
                    key={org.id}
                    onClick={() => {
                      setSelectedMapOrgId(org.id);
                      if (viewMode === 'grid') {
                        setProfileModalOrg(org);
                      }
                    }}
                    className={`bg-white dark:bg-slate-900 rounded-xl border p-4 flex flex-col justify-between gap-3.5 transition-all cursor-pointer group ${
                      isSelectedOnMap && viewMode === 'split'
                        ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl ${style.bg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate">
                                {org.name}
                              </h3>
                              {org.verified && (
                                <ShieldCheck
                                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                                  title="Organización verificada"
                                />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                              >
                                {org.type}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                · {org.city}
                              </span>
                            </div>
                          </div>
                        </div>

                        {org.distanceKm !== undefined && org.distanceKm !== null && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold shrink-0">
                            {org.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {org.description}
                      </p>

                      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{org.address}</span>
                        </div>
                        {org.schedule && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{org.schedule}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">
                          <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                            {org.totalKgRescued.toLocaleString('es-CO')} kg
                          </strong>{' '}
                          rescatados
                        </span>
                        {org.activeListingsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                            {org.activeListingsCount} lote(s)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {viewMode === 'grid' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMapOrgId(org.id);
                              setViewMode('split');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>Mapa</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileModalOrg(org);
                          }}
                          className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver perfil</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Perfil de Organización */}
      {profileModalOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {profileModalOrg.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{profileModalOrg.type}</span>
                    <span>·</span>
                    <span>NIT: {profileModalOrg.nit}</span>
                    {profileModalOrg.distanceKm !== undefined &&
                      profileModalOrg.distanceKm !== null && (
                        <>
                          <span>·</span>
                          <span className="text-sky-600 dark:text-sky-400 font-mono font-semibold">
                            A {profileModalOrg.distanceKm.toFixed(1)} km
                          </span>
                        </>
                      )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {profileModalOrg.name}
                    </h2>
                    {profileModalOrg.verified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileModalOrg(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scroll text-xs">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profileModalOrg.description}
              </p>

              {/* Métricas de la organización */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Alimento gestionado</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    {profileModalOrg.totalKgRescued.toLocaleString('es-CO')} kg
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Operaciones exitosas</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {profileModalOrg.completedOperations}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Miembro desde</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                    {profileModalOrg.joinedDate}
                  </span>
                </div>
              </div>

              {/* Datos de Contacto y Ubicación Geográfica */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Información de contacto y ubicación geográfica
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {profileModalOrg.lat.toFixed(4)}, {profileModalOrg.lng.toFixed(4)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {profileModalOrg.city} — {profileModalOrg.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums">{profileModalOrg.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profileModalOrg.email}</span>
                  </div>
                  {profileModalOrg.schedule && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{profileModalOrg.schedule}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Publicaciones activas de esta empresa */}
              {orgProducts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>
                      Lotes publicados por {profileModalOrg.name} ({orgProducts.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {orgProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelect={(p) => {
                          setProfileModalOrg(null);
                          setSelectedProductIdForDetail(p.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMapOrgId(profileModalOrg.id);
                  setProfileModalOrg(null);
                  if (viewMode === 'grid') setViewMode('split');
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Centrar en el mapa</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileModalOrg(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle si hacen clic en un producto desde el perfil */}
      <ProductDetailModal
        productId={selectedProductIdForDetail}
        onClose={() => setSelectedProductIdForDetail(null)}
      />
    </div>
  );
};
