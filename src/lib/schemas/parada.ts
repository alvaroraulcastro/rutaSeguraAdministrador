import { z } from 'zod';

export const paradaSchema = z.object({
  id: z.string().cuid(),
  orden: z.number().int().positive(),
  rutaId: z.string().cuid(),
  pasajeroId: z.string().cuid(),
});

export const crearParadaSchema = z.object({
  pasajeroId: z.string().cuid('El ID del pasajero no es válido'),
  orden: z.number().int().positive('El orden debe ser un número positivo'),
});

// Para reordenar, esperamos un array de paradas con su nuevo orden
export const reordenarParadasSchema = z.array(
  z.object({
    id: z.string().cuid(),
    orden: z.number().int().positive(),
  })
);
