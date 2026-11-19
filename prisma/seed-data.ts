/**
 * Datos ficticios para demo / desarrollo (Santiago y alrededores).
 * No son personas reales; teléfonos y tokens son de ejemplo.
 */

export const CREDENCIALES_DEMO = [
  { email: 'admin@rutasegura.com', password: 'admin123', rol: 'ADMIN' },
  { email: 'juan.perez@example.com', password: 'driver123', rol: 'TRANSPORTISTA' },
  { email: 'maria.gonzalez@example.com', password: 'driver123', rol: 'TRANSPORTISTA' },
  { email: 'carlos.vega@example.com', password: 'driver123', rol: 'TRANSPORTISTA' },
] as const;

/** Token FCM ficticio (no envía push real). */
export const FCM_TOKEN_DEMO =
  'eXaMpLeFcMtOkEnRutaSeguraDemO123456789abcdefghijklmnopqrstuvwxyz';

export const TRANSPORTISTAS = [
  {
    key: 'juan',
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: '+56912345678',
    patente: 'ABCD-12',
    modelo: 'Hyundai H1',
    capacidad: 12,
  },
  {
    key: 'maria',
    nombre: 'María González',
    email: 'maria.gonzalez@example.com',
    telefono: '+56987654321',
    patente: 'FGHI-34',
    modelo: 'Mercedes Sprinter',
    capacidad: 15,
  },
  {
    key: 'carlos',
    nombre: 'Carlos Vega',
    email: 'carlos.vega@example.com',
    telefono: '+56944445555',
    patente: 'JKLM-56',
    modelo: 'Toyota Hiace',
    capacidad: 14,
  },
] as const;

type PasajeroSeed = {
  key: string;
  transportistaKey: (typeof TRANSPORTISTAS)[number]['key'];
  nombre: string;
  telefono: string;
  domicilio: string;
  depto?: string;
  latDomicilio: number;
  lngDomicilio: number;
  instrucciones?: string;
  nombreDestino: string;
  direccionDestino: string;
  latDestino: number;
  lngDestino: number;
  activo?: boolean;
  contactos: {
    nombre: string;
    telefono: string;
    email?: string;
    canal: 'PUSH' | 'SMS' | 'WHATSAPP';
    conTokenFcm?: boolean;
  }[];
};

export const PASAJEROS: PasajeroSeed[] = [
  {
    key: 'andres',
    transportistaKey: 'juan',
    nombre: 'Andrés Soto',
    telefono: '+56955554444',
    domicilio: 'Av. Providencia 1234, Providencia',
    latDomicilio: -33.4372,
    lngDomicilio: -70.6072,
    nombreDestino: 'Colegio Saint George',
    direccionDestino: 'Av. Santa María 5800, Vitacura',
    latDestino: -33.3989,
    lngDestino: -70.5894,
    contactos: [
      { nombre: 'Pablo Soto (padre)', telefono: '+56911112222', canal: 'WHATSAPP' },
    ],
  },
  {
    key: 'sofia',
    transportistaKey: 'juan',
    nombre: 'Sofía Rojas',
    telefono: '+56966667777',
    domicilio: 'Calle Los Leones 500, Providencia',
    latDomicilio: -33.4255,
    lngDomicilio: -70.6022,
    nombreDestino: 'Colegio Sagrados Corazones',
    direccionDestino: 'Av. Colón 4567, Las Condes',
    latDestino: -33.4123,
    lngDestino: -70.5789,
    contactos: [
      { nombre: 'Carolina Rojas (madre)', telefono: '+56933334444', canal: 'PUSH', conTokenFcm: true },
    ],
  },
  {
    key: 'matias',
    transportistaKey: 'juan',
    nombre: 'Matías Herrera',
    telefono: '+56977778888',
    domicilio: 'Av. Irarrázaval 3200, Ñuñoa',
    depto: '502',
    latDomicilio: -33.4561,
    lngDomicilio: -70.5988,
    instrucciones: 'Timbre 502, edificio azul.',
    nombreDestino: 'Liceo Alemán',
    direccionDestino: 'Av. Grecia 1270, Ñuñoa',
    latDestino: -33.4642,
    lngDestino: -70.6101,
    contactos: [
      { nombre: 'Abuela Rosa', telefono: '+56922223333', canal: 'SMS' },
      { nombre: 'Felipe Herrera', telefono: '+56988889999', email: 'felipe.demo@example.com', canal: 'PUSH' },
    ],
  },
  {
    key: 'valentina',
    transportistaKey: 'maria',
    nombre: 'Valentina Muñoz',
    telefono: '+56910101010',
    domicilio: 'Av. Apoquindo 4500, Las Condes',
    latDomicilio: -33.4088,
    lngDomicilio: -70.5672,
    nombreDestino: 'Colegio Santiago College',
    direccionDestino: 'Camino Huechuraba 1360, Huechuraba',
    latDestino: -33.3655,
    lngDestino: -70.6355,
    contactos: [
      { nombre: 'Marcela Muñoz', telefono: '+56920202020', canal: 'PUSH', conTokenFcm: true },
    ],
  },
  {
    key: 'benjamin',
    transportistaKey: 'maria',
    nombre: 'Benjamín Araya',
    telefono: '+56930303030',
    domicilio: 'Los Militares 5890, Las Condes',
    latDomicilio: -33.4012,
    lngDomicilio: -70.5521,
    nombreDestino: 'The Grange School',
    direccionDestino: 'Calle La Colonia 141, La Reina',
    latDestino: -33.4445,
    lngDestino: -70.5355,
    contactos: [
      { nombre: 'Padre Benjamín', telefono: '+56940404040', canal: 'WHATSAPP' },
    ],
  },
  {
    key: 'isidora',
    transportistaKey: 'maria',
    nombre: 'Isidora Campos',
    telefono: '+56950505050',
    domicilio: 'Av. Vicuña Mackenna 4860, Macul',
    latDomicilio: -33.4892,
    lngDomicilio: -70.6011,
    nombreDestino: 'Universidad Técnica (cursillo)',
    direccionDestino: 'Av. Matta 829, Santiago Centro',
    latDestino: -33.4567,
    lngDestino: -70.6478,
    activo: true,
    contactos: [
      { nombre: 'Mamá Isidora', telefono: '+56960606060', canal: 'PUSH', conTokenFcm: true },
    ],
  },
  {
    key: 'tomas',
    transportistaKey: 'carlos',
    nombre: 'Tomás Figueroa',
    telefono: '+56970707070',
    domicilio: 'Av. Pedro de Valdivia 2200, Providencia',
    latDomicilio: -33.4289,
    lngDomicilio: -70.6155,
    nombreDestino: 'Colegio Nataniel Cox',
    direccionDestino: 'Av. San Diego 1306, Santiago',
    latDestino: -33.4569,
    lngDestino: -70.6522,
    contactos: [{ nombre: 'Tutor Tomás', telefono: '+56980808080', canal: 'PUSH' }],
  },
  {
    key: 'catalina',
    transportistaKey: 'carlos',
    nombre: 'Catalina Morales',
    telefono: '+56990909090',
    domicilio: 'Av. Bilbao 1200, Providencia',
    latDomicilio: -33.4311,
    lngDomicilio: -70.5912,
    nombreDestino: 'Saint Rose School',
    direccionDestino: 'Av. Las Condes 12350, Lo Barnechea',
    latDestino: -33.3844,
    lngDestino: -70.5122,
    contactos: [
      { nombre: 'Cristina Morales', telefono: '+56912121212', canal: 'SMS' },
    ],
  },
  {
    key: 'lucas_inactivo',
    transportistaKey: 'juan',
    nombre: 'Lucas Pino (inactivo)',
    telefono: '+56913131313',
    domicilio: 'Demo cancelado — sin uso',
    latDomicilio: -33.45,
    lngDomicilio: -70.65,
    nombreDestino: 'N/A',
    direccionDestino: 'N/A',
    latDestino: -33.45,
    lngDestino: -70.65,
    activo: false,
    contactos: [{ nombre: 'Contacto demo', telefono: '+56914141414', canal: 'PUSH' }],
  },
];

export const RUTAS = [
  {
    key: 'vitacura_ida',
    transportistaKey: 'juan' as const,
    nombre: 'Ruta Mañana Vitacura',
    tipo: 'IDA' as const,
    pasajeroKeys: ['andres', 'sofia', 'matias'] as const,
    inicioTipo: 'VEHICULO' as const,
    inicioComuna: 'Providencia',
    latInicio: -33.442,
    lngInicio: -70.635,
  },
  {
    key: 'nunoa_vuelta',
    transportistaKey: 'juan' as const,
    nombre: 'Ruta Tarde Ñuñoa',
    tipo: 'VUELTA' as const,
    pasajeroKeys: ['matias', 'sofia', 'andres'] as const,
  },
  {
    key: 'condes_ida',
    transportistaKey: 'maria' as const,
    nombre: 'Ruta Oriente Las Condes',
    tipo: 'IDA' as const,
    pasajeroKeys: ['valentina', 'benjamin', 'isidora'] as const,
    inicioDireccion: 'Av. Manquehue Norte 1560',
    inicioComuna: 'Las Condes',
    latInicio: -33.397,
    lngInicio: -70.542,
  },
  {
    key: 'maria_ida_vuelta',
    transportistaKey: 'maria' as const,
    nombre: 'Circuito Macul ida y vuelta',
    tipo: 'IDA_Y_VUELTA' as const,
    pasajeroKeys: ['isidora', 'benjamin'] as const,
  },
  {
    key: 'carlos_am',
    transportistaKey: 'carlos' as const,
    nombre: 'Ruta Carlos — Providencia centro',
    tipo: 'IDA' as const,
    pasajeroKeys: ['tomas', 'catalina'] as const,
  },
];