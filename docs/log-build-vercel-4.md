21:33:06.351 Running build in Washington, D.C., USA (East) – iad1
21:33:06.351 Build machine configuration: 2 cores, 8 GB
21:33:06.473 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: 538f4cd)
21:33:06.726 Cloning completed: 253.000ms
21:33:08.261 Restored build cache from previous deployment (H1fiXejhRXR5FQAyeCXJ8vpk3Afb)
21:33:09.249 Running "vercel build"
21:33:09.891 Vercel CLI 50.42.0
21:33:10.151 Installing dependencies...
21:33:21.083 
21:33:21.084 added 2 packages, removed 45 packages, and changed 19 packages in 11s
21:33:21.084 
21:33:21.084 153 packages are looking for funding
21:33:21.085   run `npm fund` for details
21:33:21.120 Detected Next.js version: 16.2.3
21:33:21.125 Running "npm run build"
21:33:21.226 
21:33:21.226 > ruta-segura-admin@0.1.0 build
21:33:21.227 > prisma generate && next build
21:33:21.227 
21:33:22.940 warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
21:33:22.941 For more information, see: https://pris.ly/prisma-config
21:33:22.942 
21:33:22.942 Loaded Prisma config from prisma.config.ts.
21:33:22.942 
21:33:22.943 warn The Prisma config file in prisma.config.ts overrides the deprecated `package.json#prisma` property in package.json.
21:33:22.943   For more information, see: https://pris.ly/prisma-config
21:33:22.943 
21:33:23.169 Prisma config detected, skipping environment variable loading.
21:33:23.170 Prisma schema loaded from prisma/schema.prisma
21:33:23.173 Error: Prisma schema validation - (get-config wasm)
21:33:23.173 Error code: P1012
21:33:23.173 error: Argument "url" is missing in data source block "db".
21:33:23.174   -->  prisma/schema.prisma:5
21:33:23.174    | 
21:33:23.174  4 | 
21:33:23.174  5 | datasource db {
21:33:23.174  6 |   provider = "postgresql"
21:33:23.174  7 | }
21:33:23.174    | 
21:33:23.174 
21:33:23.174 Validation Error Count: 1
21:33:23.174 [Context: getConfig]
21:33:23.174 
21:33:23.174 Prisma CLI Version : 6.19.3
21:33:23.196 Error: Command "npm run build" exited with 1