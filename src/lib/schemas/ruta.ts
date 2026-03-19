import { z } from 'zod';

export const rutaSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string(),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']),
  transportistaId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const crearRutaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']).optional(),
  transportistaId: z.string().cuid('El ID del transportista no es válido'),
});

export const actualizarRutaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']).optional(),
  transportistaId: z.string().cuid('El ID del transportista no es válido').optional(),
});
