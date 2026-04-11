21:41:18.116 Running build in Washington, D.C., USA (East) – iad1
21:41:18.117 Build machine configuration: 2 cores, 8 GB
21:41:18.248 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: bc008d8)
21:41:18.472 Cloning completed: 224.000ms
21:41:20.584 Restored build cache from previous deployment (H1fiXejhRXR5FQAyeCXJ8vpk3Afb)
21:41:20.863 Running "vercel build"
21:41:21.476 Vercel CLI 50.42.0
21:41:21.711 Installing dependencies...
21:41:32.071 
21:41:32.072 added 2 packages, removed 45 packages, and changed 19 packages in 10s
21:41:32.072 
21:41:32.072 153 packages are looking for funding
21:41:32.073   run `npm fund` for details
21:41:32.107 Detected Next.js version: 16.2.3
21:41:32.113 Running "npm run build"
21:41:32.264 
21:41:32.264 > ruta-segura-admin@0.1.0 build
21:41:32.264 > prisma generate && next build
21:41:32.265 
21:41:32.968 warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
21:41:32.969 For more information, see: https://pris.ly/prisma-config
21:41:32.969 
21:41:32.970 Loaded Prisma config from prisma.config.ts.
21:41:32.970 
21:41:32.970 warn The Prisma config file in prisma.config.ts overrides the deprecated `package.json#prisma` property in package.json.
21:41:32.970   For more information, see: https://pris.ly/prisma-config
21:41:32.971 
21:41:33.193 Prisma config detected, skipping environment variable loading.
21:41:33.194 Prisma schema loaded from prisma/schema.prisma
21:41:33.398 Error: 
21:41:33.399 Cannot find module '/vercel/path0/node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js'
21:41:33.399 Require stack:
21:41:33.399 - /vercel/path0/node_modules/prisma/build/index.js
21:41:33.399 
21:41:33.399 
21:41:33.421 Error: Command "npm run build" exited with 1