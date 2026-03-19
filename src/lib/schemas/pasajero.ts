import { z } from 'zod';

export const contactoNotificacionSchema = z.object({
  nombre: z.string().min(3),
  telefono: z.string(),
  email: z.string().email().optional(),
  canal: z.enum(['PUSH', 'SMS', 'WHATSAPP']).default('PUSH'),
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
