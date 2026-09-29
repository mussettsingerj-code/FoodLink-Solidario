import React, { useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { PartnerOrganization } from '../../data/demoData';
import {
  MapPin,
  ShieldCheck,
  Phone,
  Clock,
  Navigation,
  Building2,
  HeartHandshake,
  Store,
  Utensils,
  ShoppingBag,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export interface OrganizationWithDistance extends PartnerOrganization {
  distanceKm?: number | null;
}

interface InteractiveOrganizationsMapProps {
  organizations: OrganizationWithDistance[];
  selectedOrg: OrganizationWithDistance | null;
  onSelectOrg: (org: OrganizationWithDistance | null) => void;
  onOpenFullProfile: (org: OrganizationWithDistance) => void;
  userLocation: { lat: number; lng: number; label: string } | null;
  centerCoords: { lat: number; lng: number };
  zoomLevel: number;
}

export const getOrgVisualStyle = (org: PartnerOrganization) => {
  switch (org.type) {
    case 'Supermercado':
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-800',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800',
        label: 'Supermercado',
        Icon: ShoppingBag,
      };
    case 'Tienda':
    case 'Fruver':
      return {
        bg: 'bg-teal-600',
        border: 'border-teal-800',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200 dark:border-teal-800',
        label: org.type === 'Fruver' ? 'Tienda / Fruver' : 'Tienda',
        Icon: Store,
      };
    case 'Restaurante':
    case 'Panadería':
      return {
        bg: 'bg-amber-600',
        border: 'border-amber-800',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
        badgeText: 'text-amber-700 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
        label: org.type,
        Icon: Utensils,
      };
    case 'Fundación':
      return {
        bg: 'bg-blue-600',
        border: 'border-blue-800',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
        badgeText: 'text-blue-700 dark:text-blue-300',
        badgeBorder: 'border-blue-200 dark:border-blue-800',
        label: 'Fundación',
        Icon: HeartHandshake,
      };
    case 'Comedor Comunitario':
    case 'Hogar Comunitario':
      return {
        bg: 'bg-indigo-600',
        border: 'border-indigo-800',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200 dark:border-indigo-800',
        label: 'Comedor Comunitario',
        Icon: HeartHandshake,
      };
    default:
      return {
        bg: 'bg-slate-700',
        border: 'border-slate-900',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300',
        badgeBorder: 'border-slate-300 dark:border-slate-700',
        label: org.type || 'Otra organización',
        Icon: org.type === 'Distribuidor' ? Truck : Building2,
      };
  }
};

interface OrgMarkerItemProps {
  org: OrganizationWithDistance;
  isSelected: boolean;
  onSelect: (org: OrganizationWithDistance) => void;
  onCloseInfo: () => void;
  onOpenFullProfile: (org: OrganizationWithDistance) => void;
}

const OrgMarkerItem: React.FC<OrgMarkerItemProps> = ({
  org,
  isSelected,
  onSelect,
  onCloseInfo,
  onOpenFullProfile,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const style = getOrgVisualStyle(org);
  const IconComponent = style.Icon;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: org.lat, lng: org.lng }}
        title={`${org.name} (${org.type})`}
        onClick={() => onSelect(org)}
        zIndex={isSelected ? 50 : 10}
      >
        <div
          className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-white shadow-lg border-2 transition-transform duration-150 cursor-pointer ${
            style.bg
          } ${style.border} ${
            isSelected ? 'scale-115 ring-4 ring-emerald-400/50' : 'hover:scale-105'
          }`}
        >
          <IconComponent className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-bold tracking-tight max-w-[125px] truncate hidden sm:inline">
            {org.name}
          </span>
          {org.activeListingsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-slate-900 font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0">
              {org.activeListingsCount}
            </span>
          )}
        </div>
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={320}
          onCloseClick={onCloseInfo}
          headerDisabled={false}
        >
          <div className="p-1 text-slate-800 space-y-2.5 font-sans min-w-[240px] max-w-[290px]">
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
              >
                <IconComponent className="w-3 h-3" />
                {style.label}
              </span>
              {org.distanceKm !== undefined && org.distanceKm !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                  <Navigation className="w-2.5 h-2.5" />
                  A {org.distanceKm.toFixed(1)} km
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {org.name}
                </h4>
                {org.verified && (
                  <ShieldCheck
                    className="w-4 h-4 text-emerald-600 shrink-0"
                    title="Entidad verificada en Publik Solidario"
                  />
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {org.description}
              </p>
            </div>

            <div className="space-y-1 pt-1.5 border-t border-slate-200 text-[11px] text-slate-600">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-800">{org.city}:</strong> {org.address}
                </span>
              </div>
              {org.schedule && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{org.schedule}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{org.phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="text-[11px]">
                <span className="font-mono font-bold text-emerald-700">
                  {org.totalKgRescued.toLocaleString('es-CO')} kg
                </span>{' '}
                <span className="text-slate-500">rescatados</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenFullProfile(org)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ver detalle</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapCameraController: React.FC<{
  centerCoords: { lat: number; lng: number };
  zoomLevel: number;
  selectedOrg: OrganizationWithDistance | null;
}> = ({ centerCoords, zoomLevel, selectedOrg }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedOrg) {
      map.panTo({ lat: selectedOrg.lat, lng: selectedOrg.lng });
      const currentZoom = map.getZoom() || 12;
      if (currentZoom < 13) {
        map.setZoom(14);
      }
    }
  }, [map, selectedOrg]);

  useEffect(() => {
    if (!map || selectedOrg) return;
    map.panTo(centerCoords);
    map.setZoom(zoomLevel);
  }, [map, centerCoords.lat, centerCoords.lng, zoomLevel]);

  return null;
};

export const InteractiveOrganizationsMap: React.FC<InteractiveOrganizationsMapProps> = ({
  organizations,
  selectedOrg,
  onSelectOrg,
  onOpenFullProfile,
  userLocation,
  centerCoords,
  zoomLevel,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-[460px] lg:h-[580px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Configuración de Google Maps Platform pendiente
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-1 leading-relaxed">
          Para visualizar el mapa interactivo en vivo, define la variable de entorno{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">
            VITE_GOOGLE_MAPS_API_KEY
          </code>{' '}
          con permisos para Maps JavaScript API.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[460px] lg:h-[580px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-100 dark:bg-slate-900">
      <APIProvider apiKey={apiKey} language="es" region="CO">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={centerCoords}
          defaultZoom={zoomLevel}
          gestureHandling="greedy"
          disableDefaultUI={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <MapCameraController
            centerCoords={centerCoords}
            zoomLevel={zoomLevel}
            selectedOrg={selectedOrg}
          />

          {/* Marcador de ubicación actual o punto de referencia del usuario */}
          {userLocation && (
            <AdvancedMarker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              title={`Punto de referencia: ${userLocation.label}`}
              zIndex={40}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping" />
                <div className="px-2.5 py-1 rounded-full bg-sky-600 text-white border-2 border-white shadow-md flex items-center gap-1 text-[10px] font-bold">
                  <Navigation className="w-3 h-3 fill-current" />
                  <span>{userLocation.label}</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Marcadores de establecimientos, supermercados, fundaciones y organizaciones */}
          {organizations.map((org) => (
            <OrgMarkerItem
              key={org.id}
              org={org}
              isSelected={selectedOrg?.id === org.id}
              onSelect={(o) => onSelectOrg(o)}
              onCloseInfo={() => onSelectOrg(null)}
              onOpenFullProfile={onOpenFullProfile}
            />
          ))}
        </Map>
      </APIProvider>

      {/* Leyenda flotante compacta */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-md flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">
          Convenciones:
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          Supermercados
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
          Tiendas / Fruver
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
          Restaurantes / Panaderías
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          Fundaciones
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
          Comedores
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
          Otras
        </span>
      </div>
    </div>
  );
};
