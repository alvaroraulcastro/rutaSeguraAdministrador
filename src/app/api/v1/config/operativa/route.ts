import { NextResponse } from 'next/server';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';
import { getUmbralesGps, notificacionesPushHabilitadas } from '@/lib/configOperativa';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/** Umbrales y flags operativos (solo lectura; valores desde env del servidor). */
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const usuario = await validarApiKey(getApiKeyFromRequest(request));
  if (!usuario) {
    return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
  }

  const umbrales = getUmbralesGps();
  return NextResponse.json(
    {
      gps: {
        enCaminoMetros: umbrales.enCaminoMetros,
        enPuertaMetros: umbrales.enPuertaMetros,
        ubicacionIntervaloMinimoSegundos: 2,
      },
      notificaciones: {
        fcmConfigurado: notificacionesPushHabilitadas(),
      },
    },
    { headers: corsHeaders }
  );
}