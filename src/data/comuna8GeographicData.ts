/**
 * Fuente centralizada de datos geográficos oficiales para la Comuna 8 — Villa Hermosa, Medellín.
 * Departamento Administrativo de Planeación de Medellín / Alcaldía de Medellín.
 */

export const COMUNA_8_NAME = 'Comuna 8 — Villa Hermosa, Medellín';
export const COMUNA_8_SHORT_NAME = 'Comuna 8 — Villa Hermosa';
export const COMUNA_8_CODE = '08';
export const CITY_NAME = 'Medellín';
export const DEPARTAMENTO_NAME = 'Antioquia';
export const COUNTRY_NAME = 'Colombia';

/**
 * Los 18 barrios oficiales de la Comuna 8 — Villa Hermosa
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
  code: string;
  name: Comuna8Barrio;
  centroid: {
    lat: number;
    lng: number;
  };
  landmark: string;
  description: string;
}

/**
 * Metadatos oficiales y centroides aproximados de los 18 barrios de la Comuna 8
 */
export const COMUNA_8_BARRIOS_DATA: Record<Comuna8Barrio, BarrioMetadata> = {
  'Villa Hermosa': {
    code: '0801',
    name: 'Villa Hermosa',
    centroid: { lat: 6.2520, lng: -75.5490 },
    landmark: 'Parque de Villa Hermosa / Carrera 40 con Calle 64',
    description: 'Barrio fundacional y eje comercial central de la comuna.',
  },
  'La Mansión': {
    code: '0802',
    name: 'La Mansión',
    centroid: { lat: 6.2562, lng: -75.5532 },
    landmark: 'Sector Manicomio / Calle 65 con Carrera 44',
    description: 'Zona residencial histórica del noroccidente de la Comuna 8.',
  },
  'San Miguel': {
    code: '0803',
    name: 'San Miguel',
    centroid: { lat: 6.2528, lng: -75.5545 },
    landmark: 'Parroquia San Miguel Arcángel / Calle 62',
    description: 'Sector residencial y de comercio barrial adyacente a Prado.',
  },
  'La Ladera': {
    code: '0804',
    name: 'La Ladera',
    centroid: { lat: 6.2492, lng: -75.5528 },
    landmark: 'Parque Biblioteca León de Greiff (UVA La Ladera)',
    description: 'Nodo comunitario, cultural y social central de la comuna.',
  },
  'Batallón Girardot': {
    code: '0805',
    name: 'Batallón Girardot',
    centroid: { lat: 6.2555, lng: -75.5450 },
    landmark: 'Sede Batallón de Infantería N.º 32 Girardot',
    description: 'Zona institucional y de conexión vial hacia Llanaditas.',
  },
  'Llanaditas': {
    code: '0806',
    name: 'Llanaditas',
    centroid: { lat: 6.2585, lng: -75.5400 },
    landmark: 'Sector Las Brisas / Carrera 24 con Calle 65',
    description: 'Zona alta del nororiente de la comuna, con fuerte vida comunitaria.',
  },
  'Los Mangos': {
    code: '0807',
    name: 'Los Mangos',
    centroid: { lat: 6.2530, lng: -75.5420 },
    landmark: 'Canchas Los Mangos / Calle 61',
    description: 'Sector residencial céntrico y de economía popular.',
  },
  'Enciso': {
    code: '0808',
    name: 'Enciso',
    centroid: { lat: 6.2445, lng: -75.5475 },
    landmark: 'Parque de Enciso / Carrera 32 con Calle 58',
    description: 'Tradicional epicentro comercial, cultural y gastronómico barrial.',
  },
  'Sucre': {
    code: '0809',
    name: 'Sucre',
    centroid: { lat: 6.2468, lng: -75.5552 },
    landmark: 'Calle 56 con Carrera 38 / Límites con Boston',
    description: 'Barrio con alta densidad de tiendas de abarrotes y microempresas.',
  },
  'El Pinal': {
    code: '0810',
    name: 'El Pinal',
    centroid: { lat: 6.2475, lng: -75.5385 },
    landmark: 'Estación Trece de Noviembre Metrocable Línea M',
    description: 'Zona de ladera media con tiendas comunitarias y huertas.',
  },
  'Trece de Noviembre': {
    code: '0811',
    name: 'Trece de Noviembre',
    centroid: { lat: 6.2515, lng: -75.5340 },
    landmark: 'Ecoparque Pan de Azúcar / Calle 56H',
    description: 'Barrio de ladera nororiental con proceso de arraigo solidario.',
  },
  'La Libertad': {
    code: '0812',
    name: 'La Libertad',
    centroid: { lat: 6.2415, lng: -75.5380 },
    landmark: 'Sector El Mirador de La Libertad / Calle 54',
    description: 'Sector de amplia cooperación vecinal y comedores solidarios.',
  },
  'Villatina': {
    code: '0813',
    name: 'Villatina',
    centroid: { lat: 6.2410, lng: -75.5435 },
    landmark: 'Parroquia San Juan Bautista de la Salle / Campo de Paz',
    description: 'Comunidad histórica con organizaciones sociales activas.',
  },
  'San Antonio': {
    code: '0814',
    name: 'San Antonio',
    centroid: { lat: 6.2370, lng: -75.5410 },
    landmark: 'Sector Villatina Alta / Límites con Quebrada Santa Elena',
    description: 'Zona residencial alta y de abastecimiento alimentario.',
  },
  'Las Estancias': {
    code: '0815',
    name: 'Las Estancias',
    centroid: { lat: 6.2385, lng: -75.5350 },
    landmark: 'Estación Las Torres Metrocable Línea H',
    description: 'Corredor de transporte integrado y comercio de proximidad.',
  },
  'Villa Turbay': {
    code: '0816',
    name: 'Villa Turbay',
    centroid: { lat: 6.2345, lng: -75.5320 },
    landmark: 'Canchas Villa Turbay / Calle 50A',
    description: 'Comunidad de ladera con fuerte sentido de economía popular.',
  },
  'La Sierra': {
    code: '0817',
    name: 'La Sierra',
    centroid: { lat: 6.2310, lng: -75.5285 },
    landmark: 'Estación Villa Sierra Metrocable Línea H',
    description: 'Sector emblemático del oriente de la comuna con huertas agroecológicas.',
  },
  'Villa Liliam': {
    code: '0818',
    name: 'Villa Liliam',
    centroid: { lat: 6.2365, lng: -75.5265 },
    landmark: 'Límites con Santa Elena / Calle 51B',
    description: 'Zona de transición rural-urbana y organizaciones comunitarias.',
  },
};

/**
 * Bounding Box geográfico de la Comuna 8 (Villa Hermosa, Medellín)
 */
export const COMUNA_8_BOUNDS = {
  minLat: 6.2270,
  maxLat: 6.2640,
  minLng: -75.5600,
  maxLng: -75.5220,
};

/**
 * Centroide general de la Comuna 8 para vistas de mapas
 */
export const COMUNA_8_CENTER = {
  lat: 6.2465,
  lng: -75.5430,
  zoom: 14,
};

/**
 * Polígono cartográfico de delimitación oficial de la Comuna 8 (Medellín)
 * Fuente: Datos Abiertos Medellín / Planeación Municipal
 * Representado como pares [latitud, longitud] que delimitan el perímetro.
 */
export const COMUNA_8_POLYGON: Array<[number, number]> = [
  // Límite occidental (conectando con Comuna 10 y La Candelaria / Prado)
  [6.2575, -75.5535],
  [6.2545, -75.5555],
  [6.2510, -75.5562],
  [6.2470, -75.5560],
  [6.2430, -75.5540],
  // Límite sur (conectando con Comuna 9 - Buenos Aires / Quebrada Santa Elena)
  [6.2385, -75.5480],
  [6.2350, -75.5440],
  [6.2320, -75.5390],
  [6.2290, -75.5340],
  [6.2275, -75.5290],
  // Límite oriental (Pan de Azúcar / Límites rurales con Corregimiento Santa Elena)
  [6.2300, -75.5240],
  [6.2360, -75.5230],
  [6.2420, -75.5250],
  [6.2490, -75.5280],
  [6.2550, -75.5320],
  // Límite norte (conectando con Comuna 3 - Manrique y Comuna 1)
  [6.2610, -75.5370],
  [6.2635, -75.5430],
  [6.2620, -75.5490],
  [6.2590, -75.5515],
  [6.2575, -75.5535], // Cierre del polígono
];

/**
 * Algoritmo de Ray-Casting para determinar si unas coordenadas (lat, lng)
 * se encuentran dentro del polígono delimitador de la Comuna 8.
 */
export function isPointInsideComuna8(lat: number, lng: number): boolean {
  // 1. Verificación rápida de Bounding Box
  if (
    lat < COMUNA_8_BOUNDS.minLat ||
    lat > COMUNA_8_BOUNDS.maxLat ||
    lng < COMUNA_8_BOUNDS.minLng ||
    lng > COMUNA_8_BOUNDS.maxLng
  ) {
    return false;
  }

  // 2. Ray-casting point-in-polygon
  const polygon = COMUNA_8_POLYGON;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Valida si un nombre de barrio pertenece formalmente a la Comuna 8.
 */
export function isValidComuna8Barrio(barrioName: string): barrioName is Comuna8Barrio {
  return COMUNA_8_BARRIOS.includes(barrioName as Comuna8Barrio);
}

/**
 * Palabras clave prohibidas que denotan explícitamente otras comunas o municipios fuera de la Comuna 8.
 */
const FOREIGN_AREAS = [
  'poblado',
  'laureles',
  'belen',
  'belén',
  'castilla',
  'robledo',
  'aranjuez',
  'manrique',
  'popular',
  'santa cruz',
  'doce de octubre',
  'san javier',
  'la américa',
  'la america',
  'san cristobal',
  'san cristóbal',
  'altavista',
  'san antonio de prado',
  'palmitas',
  'envigado',
  'itagui',
  'itagüí',
  'sabaneta',
  'bello',
  'copacabana',
  'girardota',
  'barbosa',
  'la estrella',
  'caldas',
  'rionegro',
  'bogota',
  'bogotá',
  'cali',
];

/**
 * Valida un texto de dirección o referencia verificando que no mencione áreas foráneas
 * y que haga referencia a la Comuna 8 o a Medellín.
 */
export function validateAddressTextForComuna8(address: string, barrio: string): {
  isValid: boolean;
  reason?: string;
} {
  const normalized = address.toLowerCase();

  // 1. Detectar menciones explícitas de otras comunas o municipios
  for (const foreign of FOREIGN_AREAS) {
    // Excluir si es homónimo autorizado
    if (normalized.includes(foreign) && !normalized.includes('san antonio de villa hermosa')) {
      return {
        isValid: false,
        reason: `La dirección contiene "${foreign}", que corresponde a una zona fuera de la Comuna 8. Toda la operación de FoodLink Solidario está limitada a la Comuna 8 — Villa Hermosa.`,
      };
    }
  }

  // 2. Verificar que se haya seleccionado un barrio válido
  if (!isValidComuna8Barrio(barrio)) {
    return {
      isValid: false,
      reason: 'El barrio seleccionado no pertenece a la lista oficial de 18 barrios de la Comuna 8.',
    };
  }

  return { isValid: true };
}

/**
 * Obtiene el centroide de un barrio de la Comuna 8.
 */
export function getBarrioCentroid(barrio: Comuna8Barrio): { lat: number; lng: number } {
  const data = COMUNA_8_BARRIOS_DATA[barrio];
  return data ? data.centroid : COMUNA_8_CENTER;
}
