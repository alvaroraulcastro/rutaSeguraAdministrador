import "dotenv/config";
import { PrismaClient, TipoRuta, EstadoViaje, CanalNotificacion, Rol } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL ?? process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seeding...')

  // 1. Limpiar la base de datos
  await prisma.logPeticion.deleteMany()
  await prisma.notificacionLog.deleteMany()
  await prisma.viaje.deleteMany()
  await prisma.parada.deleteMany()
  await prisma.ruta.deleteMany()
  await prisma.contactoNotificacion.deleteMany()
  await prisma.pasajero.deleteMany()
  await prisma.usuario.deleteMany()

  // 2. Crear Usuarios (Transportistas y Admin)
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin Sistema',
      email: 'admin@rutasegura.com',
      password: adminPasswordHash,
      rol: Rol.ADMIN,
      telefono: '+56900000000',
    },
  })

  const driverPasswordHash = await bcrypt.hash('driver123', 10)
  const driver1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: driverPasswordHash,
      rol: Rol.TRANSPORTISTA,
      telefono: '+56912345678',
      patente: 'ABCD-12',
      modelo: 'Hyundai H1',
      capacidad: 12,
    },
  })

  const driver2 = await prisma.usuario.create({
    data: {
      nombre: 'María González',
      email: 'maria.gonzalez@example.com',
      password: driverPasswordHash,
      rol: Rol.TRANSPORTISTA,
      telefono: '+56987654321',
      patente: 'FGHI-34',
      modelo: 'Mercedes Sprinter',
      capacidad: 15,
    },
  })

  // 3. Crear Pasajeros
  const passenger1 = await prisma.pasajero.create({
    data: {
      nombre: 'Andrés Soto',
      telefono: '+56955554444',
      direccionDomicilio: 'Av. Providencia 1234, Providencia',
      latDomicilio: -33.4372,
      lngDomicilio: -70.6072,
      nombreDestino: 'Colegio Saint George',
      direccionDestino: 'Av. Santa María 5800, Vitacura',
      latDestino: -33.3989,
      lngDestino: -70.5894,
      contactos: {
        create: [
          {
            nombre: 'Papá de Andrés',
            email: 'papa.andres@example.com',
            canal: CanalNotificacion.EMAIL,
          },
        ],
      },
    },
  })

  const passenger2 = await prisma.pasajero.create({
    data: {
      nombre: 'Sofía Rojas',
      telefono: '+56966667777',
      direccionDomicilio: 'Calle Los Leones 500, Providencia',
      latDomicilio: -33.4255,
      lngDomicilio: -70.6022,
      nombreDestino: 'Colegio Sagrados Corazones',
      direccionDestino: 'Av. Colón 4567, Las Condes',
      latDestino: -33.4123,
      lngDestino: -70.5789,
      contactos: {
        create: [
          {
            nombre: 'Mamá de Sofía',
            email: 'mama.sofia@example.com',
            canal: CanalNotificacion.EMAIL,
          },
        ],
      },
    },
  })

  // 4. Crear Rutas
  const route1 = await prisma.ruta.create({
    data: {
      nombre: 'Ruta Mañana Vitacura',
      tipo: TipoRuta.IDA,
      transportistaId: driver1.id,
      paradas: {
        create: [
          { orden: 1, pasajeroId: passenger1.id },
          { orden: 2, pasajeroId: passenger2.id },
        ],
      },
    },
  })

  // 5. Crear un Viaje
  const trip1 = await prisma.viaje.create({
    data: {
      rutaId: route1.id,
      estado: EstadoViaje.PENDIENTE,
    },
  })

  // 6. Crear Logs de Petición (Ejemplo)
  await prisma.logPeticion.create({
    data: {
      metodo: 'POST',
      endpoint: '/api/login',
      ip: '127.0.0.1',
      usuarioId: driver1.id,
      payload: JSON.stringify({ email: driver1.email }),
    },
  })

  console.log({
    usuarios: [admin.nombre, driver1.nombre, driver2.nombre],
    pasajeros: [passenger1.nombre, passenger2.nombre],
    rutas: [route1.nombre],
    viajes: [trip1.id],
  })

  console.log('Seeding completado con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
