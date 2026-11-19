-- Sincronización manual (PostgreSQL) si no puedes ejecutar `prisma db push` en producción.
-- Seguro para re-ejecutar: usa IF NOT EXISTS donde aplica.

DO $$ BEGIN
  CREATE TYPE "TipoInicioRuta" AS ENUM ('DOMICILIO_TRANSPORTISTA', 'VEHICULO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Pasajero" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Ruta" ADD COLUMN IF NOT EXISTS "inicioTipo" "TipoInicioRuta" DEFAULT 'VEHICULO';
ALTER TABLE "Ruta" ADD COLUMN IF NOT EXISTS "inicioDireccion" TEXT;
ALTER TABLE "Ruta" ADD COLUMN IF NOT EXISTS "inicioComuna" TEXT;
ALTER TABLE "Ruta" ADD COLUMN IF NOT EXISTS "latInicio" DOUBLE PRECISION;
ALTER TABLE "Ruta" ADD COLUMN IF NOT EXISTS "lngInicio" DOUBLE PRECISION;

ALTER TABLE "Viaje" ADD COLUMN IF NOT EXISTS "ultimaLat" DOUBLE PRECISION;
ALTER TABLE "Viaje" ADD COLUMN IF NOT EXISTS "ultimaLng" DOUBLE PRECISION;
ALTER TABLE "Viaje" ADD COLUMN IF NOT EXISTS "ultimaUbicacionEn" TIMESTAMP(3);
ALTER TABLE "Viaje" ADD COLUMN IF NOT EXISTS "paradaActualOrden" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "NotificacionLog" ADD COLUMN IF NOT EXISTS "tipo" TEXT;
ALTER TABLE "NotificacionLog" ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT 'ENVIADO';
ALTER TABLE "NotificacionLog" ADD COLUMN IF NOT EXISTS "destinatario" TEXT;

UPDATE "NotificacionLog" SET "tipo" = 'LEGACY' WHERE "tipo" IS NULL;
UPDATE "NotificacionLog" SET "estado" = 'ENVIADO' WHERE "estado" IS NULL;

ALTER TABLE "ContactoNotificacion" ADD COLUMN IF NOT EXISTS "fcmToken" TEXT;

CREATE INDEX IF NOT EXISTS "Viaje_estado_fecha_idx" ON "Viaje" ("estado", "fecha");
CREATE INDEX IF NOT EXISTS "Pasajero_transportistaId_idx" ON "Pasajero" ("transportistaId");
CREATE INDEX IF NOT EXISTS "NotificacionLog_enviadoEn_idx" ON "NotificacionLog" ("enviadoEn");