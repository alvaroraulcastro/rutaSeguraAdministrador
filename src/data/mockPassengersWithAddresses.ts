/**
 * Mock: pasajeros del sistema, cada uno con una o varias direcciones.
 * El transportista elige qué dirección usar como parada en la ruta.
 */

export type PassengerAddress = {
  id: string;
  label: string;
  address: string;
  comuna?: string;
};

export type PassengerWithAddresses = {
  id: string;
  name: string;
  contact: string;
  addresses: PassengerAddress[];
};

export const MOCK_PASSENGERS_WITH_ADDRESSES: PassengerWithAddresses[] = [
  {
    id: "p1",
    name: "Ana Gómez",
    contact: "+56 9 1234 5678",
    addresses: [
      { id: "a1", label: "Casa", address: "Los Olmos 456, Depto 201", comuna: "Providencia" },
      { id: "a2", label: "Casa de abuelos", address: "Av. Tobalaba 1200, Depto 501", comuna: "Las Condes" },
    ],
  },
  {
    id: "p2",
    name: "Luis Ramírez",
    contact: "+56 9 8765 4321",
    addresses: [
      { id: "a3", label: "Domicilio", address: "Av. Las Condes 1234", comuna: "Las Condes" },
      { id: "a4", label: "Oficina", address: "Av. Apoquindo 4800, Piso 12", comuna: "Las Condes" },
    ],
  },
  {
    id: "p3",
    name: "Sofía Castro",
    contact: "+56 9 5555 1111",
    addresses: [
      { id: "a5", label: "Casa", address: "Av. Kennedy 7890", comuna: "Vitacura" },
      { id: "a6", label: "Depto verano", address: "Camino El Alba 1234", comuna: "Las Condes" },
    ],
  },
  {
    id: "p4",
    name: "Martín Fernández",
    contact: "+56 9 4444 2222",
    addresses: [
      { id: "a7", label: "Casa", address: "El Bosque Norte 0123", comuna: "Las Condes" },
    ],
  },
  {
    id: "p5",
    name: "Valentina Muñoz",
    contact: "+56 9 3333 9999",
    addresses: [
      { id: "a8", label: "Providencia", address: "Providencia 2345, Depto 501", comuna: "Providencia" },
      { id: "a9", label: "Casa nueva", address: "Luis Pasteur 5500", comuna: "Vitacura" },
    ],
  },
  {
    id: "p6",
    name: "Joaquín Torres",
    contact: "+56 9 2222 8888",
    addresses: [
      { id: "a10", label: "Casa", address: "Av. Manquehue Norte 123", comuna: "Vitacura" },
      { id: "a11", label: "Trabajo", address: "Av. Andrés Bello 2711", comuna: "Providencia" },
    ],
  },
];
