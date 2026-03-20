09:27:46.311 Running build in Washington, D.C., USA (East) – iad1
09:27:46.311 Build machine configuration: 2 cores, 8 GB
09:27:46.480 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: 0e15bb3)
09:27:46.841 Cloning completed: 359.000ms
09:27:47.524 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
09:27:48.214 Running "vercel build"
09:27:48.766 Vercel CLI 50.33.0
09:27:49.050 Installing dependencies...
09:27:55.689 
09:27:55.690 added 122 packages in 6s
09:27:55.690 
09:27:55.690 159 packages are looking for funding
09:27:55.691   run `npm fund` for details
09:27:55.734 Detected Next.js version: 16.1.7
09:27:55.739 Running "npm run build"
09:27:55.837 
09:27:55.838 > ruta-segura-admin@0.1.0 build
09:27:55.838 > next build
09:27:55.838 
09:27:56.855 ▲ Next.js 16.1.7 (Turbopack)
09:27:56.856 
09:27:56.863 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
09:27:56.895   Creating an optimized production build ...
09:28:20.829 ✓ Compiled successfully in 23.4s
09:28:20.829   Running TypeScript ...
09:28:26.430 Failed to compile.
09:28:26.430 
09:28:26.430 ./prisma/seed.ts:2:10
09:28:26.430 Type error: Module '"@prisma/client"' has no exported member 'PrismaClient'.
09:28:26.430 
09:28:26.430 [0m [90m 1 |[39m [36mimport[39m [32m"dotenv/config"[39m[33m;[39m
09:28:26.430 [31m[1m>[22m[39m[90m 2 |[39m [36mimport[39m { [33mPrismaClient[39m[33m,[39m [33mTipoRuta[39m[33m,[39m [33mEstadoViaje[39m[33m,[39m [33mCanalNotificacion[39m[33m,[39m [33mRol[39m } [36mfrom[39m [32m'@prisma/client'[39m
09:28:26.430  [90m   |[39m          [31m[1m^[22m[39m
09:28:26.431  [90m 3 |[39m [36mimport[39m { [33mPrismaPg[39m } [36mfrom[39m [32m'@prisma/adapter-pg'[39m
09:28:26.431  [90m 4 |[39m [36mimport[39m pg [36mfrom[39m [32m'pg'[39m
09:28:26.431  [90m 5 |[39m[0m
09:28:26.469 Next.js build worker exited with code: 1 and signal: null
09:28:26.516 Error: Command "npm run build" exited with 1