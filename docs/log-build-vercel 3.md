10:40:45.942 Running build in Washington, D.C., USA (East) – iad1
10:40:45.943 Build machine configuration: 2 cores, 8 GB
10:40:46.209 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: 3549735)
10:40:46.854 Cloning completed: 645.000ms
10:40:47.741 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
10:40:49.923 Running "vercel build"
10:40:50.458 Vercel CLI 50.33.0
10:40:50.744 Installing dependencies...
10:40:57.630 
10:40:57.631 added 122 packages in 7s
10:40:57.632 
10:40:57.632 159 packages are looking for funding
10:40:57.633   run `npm fund` for details
10:40:57.677 Detected Next.js version: 16.1.7
10:40:57.682 Running "npm run build"
10:40:57.786 
10:40:57.787 > ruta-segura-admin@0.1.0 build
10:40:57.787 > prisma generate && next build
10:40:57.787 
10:40:58.734 Loaded Prisma config from prisma.config.ts.
10:40:58.735 
10:40:58.881 Prisma schema loaded from prisma/schema.prisma.
10:40:59.133 
10:40:59.134 ✔ Generated Prisma Client (v7.5.0) to ./node_modules/@prisma/client in 160ms
10:40:59.134 
10:40:59.134 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
10:40:59.134 
10:40:59.135 
10:41:00.209 ▲ Next.js 16.1.7 (Turbopack)
10:41:00.210 
10:41:00.227 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
10:41:00.256   Creating an optimized production build ...
10:41:23.697 ✓ Compiled successfully in 23.0s
10:41:23.699   Running TypeScript ...
10:41:29.868   Collecting page data using 1 worker ...
10:41:30.229 Error [PrismaClientInitializationError]: `PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions`:
10:41:30.229 
10:41:30.230 ```
10:41:30.230 new PrismaClient({
10:41:30.231   ...
10:41:30.231 })
10:41:30.231 ```
10:41:30.231 
10:41:30.231 or
10:41:30.231 
10:41:30.231 ```
10:41:30.231 constructor() {
10:41:30.231   super({ ... });
10:41:30.231 }
10:41:30.231 ```
10:41:30.231           
10:41:30.231     at module evaluation (.next/server/chunks/[root-of-the-server]__be942447._.js:1:228)
10:41:30.231     at instantiateModule (.next/server/chunks/[turbopack]_runtime.js:740:9)
10:41:30.232     at getOrInstantiateModuleFromParent (.next/server/chunks/[turbopack]_runtime.js:763:12)
10:41:30.232     at Context.esmImport [as i] (.next/server/chunks/[turbopack]_runtime.js:228:20)
10:41:30.232     at module evaluation (.next/server/chunks/[root-of-the-server]__98f530cf._.js:1:1267)
10:41:30.232     at instantiateModule (.next/server/chunks/[turbopack]_runtime.js:740:9)
10:41:30.232     at instantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:768:12)
10:41:30.232     at getOrInstantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:781:12)
10:41:30.232     at Object.m (.next/server/chunks/[turbopack]_runtime.js:790:18) {
10:41:30.232   clientVersion: '7.5.0',
10:41:30.232   errorCode: undefined,
10:41:30.232   retryable: undefined
10:41:30.232 }
10:41:30.733 
10:41:30.733 > Build error occurred
10:41:30.736 Error: Failed to collect page data for /api/v1/auth/login
10:41:30.736     at ignore-listed frames {
10:41:30.736   type: 'Error'
10:41:30.736 }
10:41:30.785 Error: Command "npm run build" exited with 1