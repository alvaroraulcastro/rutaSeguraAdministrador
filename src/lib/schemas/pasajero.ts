import { z } from 'zod';

export const contactoNotificacionSchema = z.object({
  nombre: z.string().min(3),
  telefono: z.string().optional(),
  email: z.string().email(),
  canal: z.enum(['EMAIL']).default('EMAIL'),
});

export const crearPasajeroSchema = z.object({
  nombre: z.string().min(3),
  telefono: z.string(),
  foto: z.string().url().optional(),
  direccionDomicilio: z.string(),
  numeroDepto: z.string().optional(),
  latDomicilio: z.number(),
  lngDomicilio: z.number(),
  instruccionesDomicilio: z.string().optional(),
  nombreDestino: z.string(),
  direccionDestino: z.string(),
  latDestino: z.number(),
  lngDestino: z.number(),
  contactos: z.array(contactoNotificacionSchema).optional(),
});

export const actualizarPasajeroSchema = crearPasajeroSchema.partial();
