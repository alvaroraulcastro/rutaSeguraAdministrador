09:39:57.834 Running build in Washington, D.C., USA (East) – iad1
09:39:57.835 Build machine configuration: 2 cores, 8 GB
09:39:58.031 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: 1db2db0)
09:39:58.315 Cloning completed: 284.000ms
09:39:59.115 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
09:39:59.375 Running "vercel build"
09:40:00.292 Vercel CLI 50.33.0
09:40:01.326 Installing dependencies...
09:40:07.734 
09:40:07.735 added 122 packages in 6s
09:40:07.736 
09:40:07.736 159 packages are looking for funding
09:40:07.736   run `npm fund` for details
09:40:07.780 Detected Next.js version: 16.1.7
09:40:07.785 Running "npm run build"
09:40:07.884 
09:40:07.885 > ruta-segura-admin@0.1.0 build
09:40:07.885 > prisma generate && next build
09:40:07.885 
09:40:08.911 Loaded Prisma config from prisma.config.ts.
09:40:08.912 
09:40:09.046 Prisma schema loaded from prisma/schema.prisma.
09:40:09.350 
09:40:09.351 ✔ Generated Prisma Client (v7.5.0) to ./node_modules/@prisma/client in 204ms
09:40:09.351 
09:40:09.351 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
09:40:09.351 
09:40:09.351 
09:40:10.419 ▲ Next.js 16.1.7 (Turbopack)
09:40:10.420 
09:40:10.427 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
09:40:10.456   Creating an optimized production build ...
09:40:32.885 ✓ Compiled successfully in 21.9s
09:40:32.888   Running TypeScript ...
09:40:38.710 Failed to compile.
09:40:38.710 
09:40:38.710 ./src/app/api/v1/pasajeros/[id]/route.ts:62:9
09:40:38.710 Type error: 'error' is of type 'unknown'.
09:40:38.710 
09:40:38.711 [0m [90m 60 |[39m       [36mreturn[39m [33mNextResponse[39m[33m.[39mjson({ error[33m:[39m error[33m.[39missues }[33m,[39m { status[33m:[39m [35m400[39m })[33m;[39m
09:40:38.711  [90m 61 |[39m     }
09:40:38.711 [31m[1m>[22m[39m[90m 62 |[39m     [36mif[39m (error[33m.[39mcode [33m===[39m [32m'P2025'[39m) {
09:40:38.711  [90m    |[39m         [31m[1m^[22m[39m
09:40:38.711  [90m 63 |[39m       [36mreturn[39m [33mNextResponse[39m[33m.[39mjson({ error[33m:[39m [32m'Pasajero no encontrado'[39m }[33m,[39m { status[33m:[39m [35m404[39m })[33m;[39m
09:40:38.712  [90m 64 |[39m     }
09:40:38.713  [90m 65 |[39m     console[33m.[39merror([32m'Error updating passenger:'[39m[33m,[39m error)[33m;[39m[0m
09:40:38.751 Next.js build worker exited with code: 1 and signal: null
09:40:38.798 Error: Command "npm run build" exited with 1