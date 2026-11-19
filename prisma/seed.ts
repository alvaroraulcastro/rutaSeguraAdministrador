import { requireDatabaseUrl } from './loadSeedEnv';
import {
  PrismaClient,
  TipoRuta,
  EstadoViaje,
  CanalNotificacion,
  Rol,
  TipoInicioRuta,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import {
  CREDENCIALES_DEMO,
  FCM_TOKEN_DEMO,
  TRANSPORTISTAS,
  PASAJEROS,
  RUTAS,
} from './seed-data';

const databaseUrl = requireDatabaseUrl();
const pool = new pg.Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hoyManana(horas: number, minutos = 0): Date {
  const d = new Date();
  d.setHours(horas, minutos, 0, 0);
  return d;
}

function diasAtras(dias: number, horas: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(horas, 0, 0, 0);
  return d;
}

async function main() {
  console.log('Iniciando seeding con datos ficticios...');

  const destructivo = process.env.PRISMA_SEED_DESTRUCTIVE !== 'false';

  if (destructivo) {
    await prisma.logPeticion.deleteMany();
    await prisma.notificacionLog.deleteMany();
    await prisma.viaje.deleteMany();
    await prisma.parada.deleteMany();
    await prisma.ruta.deleteMany();
    await prisma.contactoNotificacion.deleteMany();
    await prisma.pasajero.deleteMany();
    await prisma.usuario.deleteMany();
  } else {
    const existente = await prisma.usuario.findFirst({ where: { email: 'admin@rutasegura.com' } });
    if (existente) {
      console.log('Seed omitido: ya hay datos y PRISMA_SEED_DESTRUCTIVE=false');
      return;
    }
  }

  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordDriver = await bcrypt.hash('driver123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin Sistema',
      email: 'admin@rutasegura.com',
      password: passwordAdmin,
      rol: Rol.ADMIN,
      telefono: '+56900000000',
    },
  });

  const driverIds: Record<string, string> = {};
  for (const d of TRANSPORTISTAS) {
    const u = await prisma.usuario.create({
      data: {
        nombre: d.nombre,
        email: d.email,
        password: passwordDriver,
        rol: Rol.TRANSPORTISTA,
        telefono: d.telefono,
        patente: d.patente,
        modelo: d.modelo,
        capacidad: d.capacidad,
      },
    });
    driverIds[d.key] = u.id;
  }

  const pasajeroIds: Record<string, string> = {};
  for (const p of PASAJEROS) {
    const transportistaId = driverIds[p.transportistaKey];
    const created = await prisma.pasajero.create({
      data: {
        nombre: p.nombre,
        telefono: p.telefono,
        activo: p.activo ?? true,
        direccionDomicilio: p.domicilio,
        numeroDepto: p.depto,
        latDomicilio: p.latDomicilio,
        lngDomicilio: p.lngDomicilio,
        instruccionesDomicilio: p.instrucciones,
        nombreDestino: p.nombreDestino,
        direccionDestino: p.direccionDestino,
        latDestino: p.latDestino,
        lngDestino: p.lngDestino,
        transportistaId,
        contactos: {
          create: p.contactos.map((c) => ({
            nombre: c.nombre,
            telefono: c.telefono,
            email: c.email,
            canal: c.canal as CanalNotificacion,
            fcmToken: c.conTokenFcm ? FCM_TOKEN_DEMO : null,
          })),
        },
      },
    });
    pasajeroIds[p.key] = created.id;
  }

  const rutaIds: Record<string, string> = {};
  for (const r of RUTAS) {
    const tipoMap: Record<string, TipoRuta> = {
      IDA: TipoRuta.IDA,
      VUELTA: TipoRuta.VUELTA,
      IDA_Y_VUELTA: TipoRuta.IDA_Y_VUELTA,
    };
    const route = await prisma.ruta.create({
      data: {
        nombre: r.nombre,
        tipo: tipoMap[r.tipo],
        transportistaId: driverIds[r.transportistaKey],
        inicioTipo: r.inicioTipo ? (r.inicioTipo as TipoInicioRuta) : undefined,
        inicioDireccion: 'inicioDireccion' in r ? r.inicioDireccion : undefined,
        inicioComuna: 'inicioComuna' in r ? r.inicioComuna : undefined,
        latInicio: 'latInicio' in r ? r.latInicio : undefined,
        lngInicio: 'lngInicio' in r ? r.lngInicio : undefined,
        paradas: {
          create: r.pasajeroKeys.map((pk, idx) => ({
            orden: idx + 1,
            pasajeroId: pasajeroIds[pk],
          })),
        },
      },
    });
    rutaIds[r.key] = route.id;
  }

  const viajeEnCurso = await prisma.viaje.create({
    data: {
      rutaId: rutaIds.vitacura_ida,
      fecha: hoyManana(7, 15),
      estado: EstadoViaje.EN_CURSO,
      ultimaLat: -33.43,
      ultimaLng: -70.605,
      ultimaUbicacionEn: new Date(),
      paradaActualOrden: 2,
    },
  });

  const viajePendiente = await prisma.viaje.create({
    data: {
      rutaId: rutaIds.condes_ida,
      fecha: hoyManana(7, 45),
      estado: EstadoViaje.PENDIENTE,
    },
  });

  const viajeCompletado = await prisma.viaje.create({
    data: {
      rutaId: rutaIds.carlos_am,
      fecha: diasAtras(0, 6),
      estado: EstadoViaje.COMPLETADO,
      paradaActualOrden: 3,
      ultimaLat: -33.385,
      ultimaLng: -70.51,
      ultimaUbicacionEn: diasAtras(0, 8),
    },
  });

  const viajeCancelado = await prisma.viaje.create({
    data: {
      rutaId: rutaIds.nunoa_vuelta,
      fecha: hoyManana(14, 0),
      estado: EstadoViaje.CANCELADO,
    },
  });

  await prisma.viaje.create({
    data: {
      rutaId: rutaIds.maria_ida_vuelta,
      fecha: diasAtras(1, 7),
      estado: EstadoViaje.COMPLETADO,
    },
  });

  await prisma.viaje.create({
    data: {
      rutaId: rutaIds.vitacura_ida,
      fecha: diasAtras(2, 7),
      estado: EstadoViaje.COMPLETADO,
    },
  });

  const notifPayload = [
    {
      viajeId: viajeEnCurso.id,
      pasajeroId: pasajeroIds.andres,
      tipo: 'EN_CAMINO',
      mensaje: 'El transporte se acerca a Andrés Soto (aprox. 320 m).',
      canal: CanalNotificacion.PUSH,
      destinatario: 'Pablo Soto (padre)',
      estado: 'ENVIADO',
      haceHoras: 0.2,
    },
    {
      viajeId: viajeEnCurso.id,
      pasajeroId: pasajeroIds.andres,
      tipo: 'EN_PUERTA',
      mensaje: 'El transporte ha llegado al punto de recogida de Andrés Soto.',
      canal: CanalNotificacion.WHATSAPP,
      destinatario: 'Pablo Soto (padre)',
      estado: 'ENVIADO',
      haceHoras: 0.1,
    },
    {
      viajeId: viajeEnCurso.id,
      pasajeroId: pasajeroIds.sofia,
      tipo: 'EN_CAMINO',
      mensaje: 'El transporte se acerca a Sofía Rojas (aprox. 180 m).',
      canal: CanalNotificacion.PUSH,
      destinatario: 'Carolina Rojas (madre)',
      estado: 'ENVIADO',
      haceHoras: 0.05,
    },
    {
      viajeId: viajeCompletado.id,
      pasajeroId: pasajeroIds.tomas,
      tipo: 'LLEGADA_DESTINO',
      mensaje: 'Tomás Figueroa ha llegado a Colegio Nataniel Cox.',
      canal: CanalNotificacion.PUSH,
      destinatario: 'Tutor Tomás',
      estado: 'ENVIADO',
      haceHoras: 4,
    },
    {
      viajeId: viajeCompletado.id,
      pasajeroId: pasajeroIds.catalina,
      tipo: 'EN_PUERTA',
      mensaje: 'El transporte ha llegado al punto de recogida de Catalina Morales.',
      canal: CanalNotificacion.SMS,
      destinatario: 'Cristina Morales',
      estado: 'FALLIDO',
      haceHoras: 5,
    },
  ] as const;

  for (const n of notifPayload) {
    const enviadoEn = new Date(Date.now() - n.haceHoras * 60 * 60 * 1000);
    await prisma.notificacionLog.create({
      data: {
        viajeId: n.viajeId,
        pasajeroId: n.pasajeroId,
        tipo: n.tipo,
        mensaje: n.mensaje,
        canal: n.canal,
        destinatario: n.destinatario,
        estado: n.estado,
        enviadoEn,
      },
    });
  }

  await prisma.logPeticion.createMany({
    data: [
      {
        metodo: 'POST',
        endpoint: '/api/v1/auth/login',
        ip: '192.168.1.10',
        usuarioId: driverIds.juan,
        statusCode: 200,
        payload: JSON.stringify({ email: 'juan.perez@example.com' }),
      },
      {
        metodo: 'POST',
        endpoint: `/api/v1/viajes/${viajeEnCurso.id}/location`,
        ip: '10.0.0.55',
        usuarioId: driverIds.juan,
        statusCode: 200,
        payload: JSON.stringify({ lat: -33.43, lng: -70.605 }),
      },
    ],
  });

  console.log({
    admin: admin.email,
    credenciales: CREDENCIALES_DEMO,
    transportistas: TRANSPORTISTAS.length,
    pasajeros: PASAJEROS.length,
    rutas: RUTAS.length,
    viajes: {
      enCurso: viajeEnCurso.id,
      pendiente: viajePendiente.id,
      completado: viajeCompletado.id,
      cancelado: viajeCancelado.id,
    },
    notificaciones: notifPayload.length,
    doc: 'docs/datos-demo-ficticios.md',
  });

  console.log('Seeding completado con éxito.');
}

main()
  .catch((e: unknown) => {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'ECONNREFUSED') {
      console.error(`
No se pudo conectar a PostgreSQL (${databaseUrl.replace(/:[^:@/]+@/, ':****@')}).

Comprueba que el servicio esté activo y que host/puerto en POSTGRES_URL sean correctos.
`);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });