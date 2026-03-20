import { z } from 'zod';

export const viajeSchema = z.object({
  id: z.string().cuid(),
  rutaId: z.string().cuid(),
  fecha: z.date(),
  estado: z.enum(['PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']),
});

export const crearViajeSchema = z.object({
  rutaId: z.string().cuid('El ID de la ruta no es válido'),
  fecha: z.string().datetime().optional(), // La fecha puede ser opcional si se toma la actual por defecto
});

export const actualizarViajeSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'], {
    message: 'El estado proporcionado no es válido',
  }),
});
