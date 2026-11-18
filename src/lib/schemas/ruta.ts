import { z } from 'zod';

export const rutaSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string(),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']),
  inicioTipo: z.enum(['DOMICILIO_TRANSPORTISTA', 'VEHICULO']).nullable().optional(),
  inicioDireccion: z.string().nullable().optional(),
  inicioComuna: z.string().nullable().optional(),
  latInicio: z.number().nullable().optional(),
  lngInicio: z.number().nullable().optional(),
  transportistaId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const crearRutaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']).optional(),
  pasajeroIds: z.array(z.string().cuid('El ID del pasajero no es válido')).optional(),
  inicioTipo: z.enum(['DOMICILIO_TRANSPORTISTA', 'VEHICULO']).optional(),
  inicioDireccion: z.string().min(2, 'La dirección de inicio es requerida').optional(),
  inicioComuna: z.string().min(2, 'La comuna de inicio es requerida').optional(),
  latInicio: z.number().optional(),
  lngInicio: z.number().optional(),
});

export const actualizarRutaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  tipo: z.enum(['IDA', 'VUELTA', 'IDA_Y_VUELTA']).optional(),
  inicioTipo: z.enum(['DOMICILIO_TRANSPORTISTA', 'VEHICULO']).optional(),
  inicioDireccion: z.string().min(2).optional(),
  inicioComuna: z.string().min(2).optional(),
  latInicio: z.number().optional(),
  lngInicio: z.number().optional(),
});
