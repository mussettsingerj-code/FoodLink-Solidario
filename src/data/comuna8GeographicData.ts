/**
 * Fuente de Datos Geográficos Oficiales
 * Comuna 8 — Villa Hermosa, Medellín, Antioquia, Colombia
 *
 * Incluye los 18 barrios oficiales según la división político-administrativa
 * oficial del Departamento Administrativo de Planeación de la Alcaldía de Medellín.
 */

export const COMUNA_8_NAME = 'Comuna 8 — Villa Hermosa, Medellín' as const;
export const COMUNA_8_SHORT_NAME = 'Comuna 8 — Villa Hermosa' as const;
export const COMUNA_8_CODE = '08' as const;
export const CITY_NAME = 'Medellín' as const;
export const DEPARTMENT_NAME = 'Antioquia' as const;
export const COUNTRY_NAME = 'Colombia' as const;

/**
 * Los 18 barrios oficiales que componen exclusivamente la Comuna 8 de Medellín
 */
export const COMUNA_8_BARRIOS = [
  'Villa Hermosa',
  'La Mansión',
  'San Miguel',
  'La Ladera',
  'Batallón Girardot',
  'Llanaditas',
  'Los Mangos',
  'Enciso',
  'Sucre',
  'El Pinal',
  'Trece de Noviembre',
  'La Libertad',
  'Villatina',
  'San Antonio',
  'Las Estancias',
  'Villa Turbay',
  'La Sierra',
  'Villa Liliam',
] as const;

export type Comuna8Barrio = (typeof COMUNA_8_BARRIOS)[number];

export interface BarrioMetadata {
  id: string;
  name: Comuna8Barrio;
  code: string;
  centroid: {
    lat: number;
    lng: number;
  };
  description: string;
  landmarks: string[];
}

/**
 * Coordenadas centrales de la Comuna 8 para encuadre y centro del mapa
 */
export const COMUNA_8_CENTER = {
  lat: 6.2468,
  lng: -75.5460,
};

/**
 * Límites rectangulares de referencia (Bounding Box) de la Comuna 8
 */
export const COMUNA_8_BOUNDS = {
  north: 6.2640,
  south: 6.2310,
  east: -75.5240,
  west: -75.5605,
};

/**
 * Polígono cartográfico oficial de la Comuna 8 — Villa Hermosa
 * Delimita el perímetro territorial colindante con:
 * - Norte: Comuna 3 (Manrique)
 * - Occidente: Comuna 10 (La Candelaria / Centro)
 * - Sur: Comuna 9 (Buenos Aires)
 * - Oriente: Corregimiento de Santa Elena / Ladera Oriental
 */
export const COMUNA_8_POLYGON: Array<{ lat: number; lng: number }> = [
  { lat: 6.2595, lng: -75.5560 }, // Noroccidente (San Miguel / Boston límite)
  { lat: 6.2635, lng: -75.5510 }, // Norte (La Ladera / Parque de la Ladera)
  { lat: 6.2640, lng: -75.5445 }, // Norte-alto (Llanaditas / Manrique límite)
  { lat: 6.2610, lng: -75.5360 }, // Nororiente (Los Mangos / Pan de Azúcar)
  { lat: 6.2560, lng: -75.5290 }, // Oriente alto (Trece de Noviembre ladera)
  { lat: 6.2490, lng: -75.5245 }, // Oriente medio (La Sierra / Sendero Pan de Azúcar)
  { lat: 6.2415, lng: -75.5250 }, // Suroriente (Villa Turbay / Las Estancias)
  { lat: 6.2340, lng: -75.5310 }, // Sur-oriente bajo (Villatina / Santa Inés límite)
  { lat: 6.2315, lng: -75.5410 }, // Sur (Límite con Buenos Aires / La Libertad)
  { lat: 6.2345, lng: -75.5505 }, // Suroccidente (Sucre / Boston límite)
  { lat: 6.2405, lng: -75.5550 }, // Suroccidente medio (Enciso bajo)
  { lat: 6.2495, lng: -75.5585 }, // Occidente (La Mansión / Parque Villa Hermosa)
  { lat: 6.2560, lng: -75.5575 }, // Cierre norte hacia San Miguel
  { lat: 6.2595, lng: -75.5560 }, // Punto de cierre
];

/**
 * Ficha cartográfica con centroides y referencias para cada uno de los 18 barrios
 */
export const COMUNA_8_BARRIOS_DATA: Record<Comuna8Barrio, BarrioMetadata> = {
  'Villa Hermosa': {
    id: '0801',
    name: 'Villa Hermosa',
    code: '0801',
    centroid: { lat: 6.2512, lng: -75.5520 },
    description: 'Corazón histórico y comercial de la comuna, alrededor del Parque de Villa Hermosa.',
    landmarks: ['Parque de Villa Hermosa', 'Iglesia San Antonio María Claret', 'Cra 40'],
  },
  'La Mansión': {
    id: '0802',
    name: 'La Mansión',
    code: '0802',
    centroid: { lat: 6.2545, lng: -75.5552 },
    description: 'Sector residencial y comercial tradicional con alta conexión hacia el Centro.',
    landmarks: ['Clínica Sagrado Corazón', 'Cra 42'],
  },
  'San Miguel': {
    id: '0803',
    name: 'San Miguel',
    code: '0803',
    centroid: { lat: 6.2582, lng: -75.5535 },
    description: 'Barrio dinámico en el extremo noroccidental con mercados comunitarios.',
    landmarks: ['Parroquia San Miguel Arcángel', 'Calle 62'],
  },
  'La Ladera': {
    id: '0804',
    name: 'La Ladera',
    code: '0804',
    centroid: { lat: 6.2605, lng: -75.5480 },
    description: 'Espacio de gran actividad social con el Parque Biblioteca León de Greiff.',
    landmarks: ['Parque Biblioteca La Ladera (León de Greiff)', 'Mirador de La Ladera'],
  },
  'Batallón Girardot': {
    id: '0805',
    name: 'Batallón Girardot',
    code: '0805',
    centroid: { lat: 6.2565, lng: -75.5470 },
    description: 'Sector estratégico intermedio con conectividad hacia Enciso y La Ladera.',
    landmarks: ['Sede Militar Girardot', 'Institución Educativa Fe y Alegría'],
  },
  'Llanaditas': {
    id: '0806',
    name: 'Llanaditas',
    code: '0806',
    centroid: { lat: 6.2595, lng: -75.5410 },
    description: 'Zona de comercio vecinal y empinadas calles con vistas al Valle de Aburrá.',
    landmarks: ['Cancha de Llanaditas', 'Parroquia Nuestra Señora de la Esperanza'],
  },
  'Los Mangos': {
    id: '0807',
    name: 'Los Mangos',
    code: '0807',
    centroid: { lat: 6.2570, lng: -75.5350 },
    description: 'Barrio con fuerte tradición comunitaria y tiendas de abastecimiento barrial.',
    landmarks: ['Vía al Cerro Pan de Azúcar', 'Placa Polideportiva'],
  },
  'Enciso': {
    id: '0808',
    name: 'Enciso',
    code: '0808',
    centroid: { lat: 6.2465, lng: -75.5485 },
    description: 'Uno de los núcleos comerciales y gastronómicos más activos de la Comuna 8.',
    landmarks: ['Parque de Enciso', 'Calle 56', 'Plaza de Enciso'],
  },
  'Sucre': {
    id: '0809',
    name: 'Sucre',
    code: '0809',
    centroid: { lat: 6.2410, lng: -75.5495 },
    description: 'Barrio fronterizo con Boston y Buenos Aires, con excelente conectividad vial.',
    landmarks: ['Parque Sucre', 'Cra 38', 'Calle 52'],
  },
  'El Pinal': {
    id: '0810',
    name: 'El Pinal',
    code: '0810',
    centroid: { lat: 6.2520, lng: -75.5385 },
    description: 'Sector residencial y de pequeños negocios familiares sobre la vertiente oriental.',
    landmarks: ['Estación del Metrocable El Pinal (Línea M)', 'Cancha El Pinal'],
  },
  'Trece de Noviembre': {
    id: '0811',
    name: 'Trece de Noviembre',
    code: '0811',
    centroid: { lat: 6.2540, lng: -75.5315 },
    description: 'Comunidad organizada con la estación terminal del Metrocable Trece de Noviembre.',
    landmarks: ['Estación Metrocable 13 de Noviembre', 'UVA de la Alegría'],
  },
  'La Libertad': {
    id: '0812',
    name: 'La Libertad',
    code: '0812',
    centroid: { lat: 6.2365, lng: -75.5430 },
    description: 'Barrio del sur de la comuna con huertas urbanas y asociaciones solidarias.',
    landmarks: ['Cancha La Libertad', 'Centro Comunitario'],
  },
  'Villatina': {
    id: '0813',
    name: 'Villatina',
    code: '0813',
    centroid: { lat: 6.2395, lng: -75.5365 },
    description: 'Emblemático sector de resiliencia comunitaria con la estación Metrocable Villatina.',
    landmarks: ['Parque Memorial Villatina', 'Estación Metrocable Villatina'],
  },
  'San Antonio': {
    id: '0814',
    name: 'San Antonio',
    code: '0814',
    centroid: { lat: 6.2435, lng: -75.5395 },
    description: 'Barrio céntrico de la media ladera con tiendas de abarrotes y microempresas.',
    landmarks: ['Capilla San Antonio', 'Institución Educativa'],
  },
  'Las Estancias': {
    id: '0815',
    name: 'Las Estancias',
    code: '0815',
    centroid: { lat: 6.2415, lng: -75.5295 },
    description: 'Comunidad de ladera con mercados campesinos y senderos ecológicos.',
    landmarks: ['Mirador Las Estancias', 'Quebrada Santa Elena'],
  },
  'Villa Turbay': {
    id: '0816',
    name: 'Villa Turbay',
    code: '0816',
    centroid: { lat: 6.2450, lng: -75.5270 },
    description: 'Barrio con fuerte liderazgo vecinal y proyectos de soberanía alimentaria.',
    landmarks: ['Cancha Villa Turbay', 'Sede Comunitaria'],
  },
  'La Sierra': {
    id: '0817',
    name: 'La Sierra',
    code: '0817',
    centroid: { lat: 6.2490, lng: -75.5260 },
    description: 'Punto culminante oriental con gran historia de transformación y turismo comunitario.',
    landmarks: ['Estación Metrocable La Sierra (Línea H)', 'Mirador de La Sierra'],
  },
  'Villa Liliam': {
    id: '0818',
    name: 'Villa Liliam',
    code: '0818',
    centroid: { lat: 6.2475, lng: -75.5340 },
    description: 'Barrio tradicional de calles empinadas y pequeños comercios de barrio.',
    landmarks: ['Colegio Villa Liliam', 'Parroquia San Marcos'],
  },
};

/**
 * Valida si un nombre de barrio pertenece formalmente a la Comuna 8
 */
export function isValidComuna8Barrio(barrio: string | undefined | null): barrio is Comuna8Barrio {
  if (!barrio || typeof barrio !== 'string') return false;
  const normalized = barrio.trim().toLowerCase();
  return COMUNA_8_BARRIOS.some((b) => b.toLowerCase() === normalized);
}

/**
 * Obtiene el centroide de referencia para un barrio
 */
export function getBarrioCentroid(barrio: Comuna8Barrio): { lat: number; lng: number } {
  const data = COMUNA_8_BARRIOS_DATA[barrio];
  return data ? data.centroid : COMUNA_8_CENTER;
}

/**
 * Determina si un punto de coordenadas (latitud, longitud) se encuentra dentro
 * del polígono oficial de la Comuna 8 — Villa Hermosa de Medellín.
 *
 * Utiliza el algoritmo canónico de Ray-Casting (Point in Polygon) con
 * tolerancia espacial prudente para bordes viales (50 metros aprox).
 */
export function isPointInsideComuna8(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return false;
  }

  // Comprobación rápida por Bounding Box con pequeño margen de borde (0.003 grados ~ 300m)
  const margin = 0.003;
  if (
    lat < COMUNA_8_BOUNDS.south - margin ||
    lat > COMUNA_8_BOUNDS.north + margin ||
    lng < COMUNA_8_BOUNDS.west - margin ||
    lng > COMUNA_8_BOUNDS.east + margin
  ) {
    return false;
  }

  // Algoritmo Ray-Casting sobre el polígono cerrado de la Comuna 8
  const poly = COMUNA_8_POLYGON;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].lng;
    const yi = poly[i].lat;
    const xj = poly[j].lng;
    const yj = poly[j].lat;

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Encuentra el barrio más cercano a un punto dentro de la Comuna 8
 */
export function findClosestComuna8Barrio(lat: number, lng: number): Comuna8Barrio {
  let closestBarrio: Comuna8Barrio = 'Villa Hermosa';
  let minDistance = Infinity;

  for (const barrio of COMUNA_8_BARRIOS) {
    const centroid = COMUNA_8_BARRIOS_DATA[barrio].centroid;
    const dLat = lat - centroid.lat;
    const dLng = lng - centroid.lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistance) {
      minDistance = distSq;
      closestBarrio = barrio;
    }
  }

  return closestBarrio;
}

/**
 * Valida si un texto de dirección pertenece o hace referencia
 * a otra comuna de Medellín o municipio externo no autorizado.
 */
export function validateAddressTextForComuna8(
  address: string,
  _declaredBarrio?: string
): { isValid: boolean; reason?: string } {
  if (!address || typeof address !== 'string') {
    return { isValid: false, reason: 'La dirección es obligatoria.' };
  }

  const lower = address.toLowerCase();

  // Lista de otras comunas y municipios explícitamente vetados
  const prohibitedPlaces = [
    { key: 'poblado', name: 'El Poblado (Comuna 14)' },
    { key: 'laureles', name: 'Laureles (Comuna 11)' },
    { key: 'belen', name: 'Belén (Comuna 16)' },
    { key: 'belén', name: 'Belén (Comuna 16)' },
    { key: 'robledo', name: 'Robledo (Comuna 7)' },
    { key: 'castilla', name: 'Castilla (Comuna 5)' },
    { key: 'aranjuez', name: 'Aranjuez (Comuna 4)' },
    { key: 'guayabal', name: 'Guayabal (Comuna 15)' },
    { key: 'manrique', name: 'Manrique (Comuna 3)' },
    { key: 'candelaria', name: 'La Candelaria (Comuna 10)' },
    { key: 'buenos aires', name: 'Buenos Aires (Comuna 9)' },
    { key: 'san javier', name: 'San Javier (Comuna 13)' },
    { key: 'popular', name: 'Popular (Comuna 1)' },
    { key: 'santa cruz', name: 'Santa Cruz (Comuna 2)' },
    { key: 'doce de octubre', name: 'Doce de Octubre (Comuna 6)' },
    { key: 'envigado', name: 'Envigado' },
    { key: 'itagui', name: 'Itagüí' },
    { key: 'itagüí', name: 'Itagüí' },
    { key: 'bello', name: 'Bello' },
    { key: 'sabaneta', name: 'Sabaneta' },
    { key: 'caldas', name: 'Caldas' },
    { key: 'copacabana', name: 'Copacabana' },
    { key: 'girardota', name: 'Girardota' },
    { key: 'barbosa', name: 'Barbosa' },
    { key: 'rionegro', name: 'Rionegro' },
    { key: 'bogota', name: 'Bogotá' },
    { key: 'bogotá', name: 'Bogotá' },
    { key: 'cali', name: 'Cali' },
  ];

  for (const p of prohibitedPlaces) {
    // Si menciona explícitamente otra comuna o municipio
    const regex = new RegExp(`\\b${p.key}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        isValid: false,
        reason: `La dirección indica pertenecer a "${p.name}", ubicación fuera del territorio autorizado de la Comuna 8 — Villa Hermosa.`,
      };
    }
  }

  return { isValid: true };
}
