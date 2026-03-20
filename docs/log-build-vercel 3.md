10:47:50.003 Running build in Washington, D.C., USA (East) – iad1
10:47:50.004 Build machine configuration: 2 cores, 8 GB
10:47:50.134 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: e49e68c)
10:47:50.375 Cloning completed: 239.000ms
10:47:51.495 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
10:47:51.741 Running "vercel build"
10:47:52.278 Vercel CLI 50.33.0
10:47:52.560 Installing dependencies...
10:47:58.617 
10:47:58.618 added 122 packages in 6s
10:47:58.618 
10:47:58.618 159 packages are looking for funding
10:47:58.619   run `npm fund` for details
10:47:58.662 Detected Next.js version: 16.1.7
10:47:58.667 Running "npm run build"
10:47:58.761 
10:47:58.761 > ruta-segura-admin@0.1.0 build
10:47:58.762 > prisma generate && next build
10:47:58.762 
10:47:59.684 Loaded Prisma config from prisma.config.ts.
10:47:59.685 
10:47:59.822 Prisma schema loaded from prisma/schema.prisma.
10:47:59.825 Error: Prisma schema validation - (get-config wasm)
10:47:59.825 Error code: P1012
10:47:59.825 error: The datasource property `url` is no longer supported in schema files. Move connection URLs for Migrate to `prisma.config.ts` and pass either `adapter` for a direct database connection or `accelerateUrl` for Accelerate to the `PrismaClient` constructor. See https://pris.ly/d/config-datasource and https://pris.ly/d/prisma7-client-config
10:47:59.825   -->  prisma/schema.prisma:7
10:47:59.825    | 
10:47:59.825  6 |   provider = "postgresql"
10:47:59.825  7 |   url      = env("POSTGRES_URL")
10:47:59.826    | 
10:47:59.826 
10:47:59.826 Validation Error Count: 1
10:47:59.826 [Context: getConfig]
10:47:59.826 
10:47:59.826 Prisma CLI Version : 7.5.0
10:47:59.849 Error: Command "npm run build" exited with 1