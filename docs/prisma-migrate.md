# Migraciones Prisma (plan A1)

Hoy el deploy en Vercel usa `prisma db push` en `vercel-build`, lo cual es válido para MVP pero no deja historial versionado.

## Recomendación staging/prod

```bash
npx prisma migrate dev --name init_operativo
# En CI/prod:
npx prisma migrate deploy
```

Sustituir `db push` en `vercel-build` solo cuando exista una carpeta `prisma/migrations` estable y probada en staging.

Mientras tanto, usar [`prisma/sql/sync_schema_operativo.sql`](../prisma/sql/sync_schema_operativo.sql) como rescate manual.