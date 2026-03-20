12:43:45.836 Running build in Washington, D.C., USA (East) – iad1
12:43:45.836 Build machine configuration: 2 cores, 8 GB
12:43:45.960 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: 76e6f5e)
12:43:46.346 Cloning completed: 386.000ms
12:43:47.780 Restored build cache from previous deployment (6iV23JcdkAedmkoGw3tRU8bpP4wP)
12:43:48.046 Running "vercel build"
12:43:49.036 Vercel CLI 50.33.0
12:43:49.428 Installing dependencies...
12:43:51.044 
12:43:51.045 up to date in 1s
12:43:51.046 
12:43:51.046 159 packages are looking for funding
12:43:51.046   run `npm fund` for details
12:43:51.095 Detected Next.js version: 16.1.7
12:43:51.103 Running "npm run build"
12:43:51.204 
12:43:51.205 > ruta-segura-admin@0.1.0 build
12:43:51.205 > prisma generate && next build
12:43:51.205 
12:43:52.200 Loaded Prisma config from prisma.config.ts.
12:43:52.200 
12:43:52.272 Prisma schema loaded from prisma/schema.prisma.
12:43:52.619 
12:43:52.620 ✔ Generated Prisma Client (v7.5.0) to ./node_modules/@prisma/client in 211ms
12:43:52.620 
12:43:52.620 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
12:43:52.621 
12:43:52.621 
12:43:53.622 ▲ Next.js 16.1.7 (Turbopack)
12:43:53.622 
12:43:53.630 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
12:43:53.660   Creating an optimized production build ...
12:44:17.538 ✓ Compiled successfully in 23.3s
12:44:17.539   Running TypeScript ...
12:44:23.744 Failed to compile.
12:44:23.745 
12:44:23.745 ./src/app/passengers/[id]/edit/page.tsx:14:30
12:44:23.746 Type error: Type '{ pasajeroId: string; }' is not assignable to type 'IntrinsicAttributes & EditarPasajeroFormProps'.
12:44:23.746   Property 'pasajeroId' does not exist on type 'IntrinsicAttributes & EditarPasajeroFormProps'.
12:44:23.746 
12:44:23.746 [0m [90m 12 |[39m   }
12:44:23.746  [90m 13 |[39m
12:44:23.746 [31m[1m>[22m[39m[90m 14 |[39m   [36mreturn[39m [33m<[39m[33mEditarPasajeroForm[39m pasajeroId[33m=[39m{id} [33m/[39m[33m>[39m[33m;[39m
12:44:23.746  [90m    |[39m                              [31m[1m^[22m[39m
12:44:23.746  [90m 15 |[39m }
12:44:23.747  [90m 16 |[39m[0m
12:44:23.787 Next.js build worker exited with code: 1 and signal: null
12:44:23.835 Error: Command "npm run build" exited with 1