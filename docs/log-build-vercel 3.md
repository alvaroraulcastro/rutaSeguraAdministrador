10:03:27.658 Running build in Washington, D.C., USA (East) – iad1
10:03:27.660 Build machine configuration: 2 cores, 8 GB
10:03:27.868 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: 8ae838b)
10:03:28.210 Cloning completed: 341.000ms
10:03:29.305 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
10:03:30.304 Running "vercel build"
10:03:30.847 Vercel CLI 50.33.0
10:03:31.126 Installing dependencies...
10:03:37.209 
10:03:37.209 added 122 packages in 6s
10:03:37.210 
10:03:37.210 159 packages are looking for funding
10:03:37.210   run `npm fund` for details
10:03:37.255 Detected Next.js version: 16.1.7
10:03:37.259 Running "npm run build"
10:03:37.356 
10:03:37.356 > ruta-segura-admin@0.1.0 build
10:03:37.356 > prisma generate && next build
10:03:37.357 
10:03:38.370 Loaded Prisma config from prisma.config.ts.
10:03:38.371 
10:03:38.508 Prisma schema loaded from prisma/schema.prisma.
10:03:38.755 
10:03:38.756 ✔ Generated Prisma Client (v7.5.0) to ./node_modules/@prisma/client in 147ms
10:03:38.756 
10:03:38.756 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
10:03:38.756 
10:03:38.756 
10:03:39.860 ▲ Next.js 16.1.7 (Turbopack)
10:03:39.861 
10:03:39.868 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
10:03:39.897   Creating an optimized production build ...
10:04:01.446 ✓ Compiled successfully in 21.0s
10:04:01.447   Running TypeScript ...
10:04:07.216 Failed to compile.
10:04:07.216 
10:04:07.216 ./src/app/settings/page.tsx:92:20
10:04:07.217 Type error: Type '"left"' is not assignable to type 'Orientation | undefined'.
10:04:07.217 
10:04:07.217 [0m [90m 90 |[39m       children[33m:[39m (
10:04:07.217  [90m 91 |[39m         [33m<[39m[33m>[39m
10:04:07.217 [31m[1m>[22m[39m[90m 92 |[39m           [33m<[39m[33mDivider[39m orientation[33m=[39m[32m"left"[39m[33m>[39m[33mAlertas[39m automáticas[33m<[39m[33m/[39m[33mDivider[39m[33m>[39m
10:04:07.217  [90m    |[39m                    [31m[1m^[22m[39m
10:04:07.217  [90m 93 |[39m           [33m<[39m[33mSpace[39m orientation[33m=[39m[32m"vertical"[39m style[33m=[39m{{ width[33m:[39m [32m"100%"[39m[33m,[39m marginBottom[33m:[39m [35m24[39m }} size[33m=[39m[32m"middle"[39m[33m>[39m
10:04:07.218  [90m 94 |[39m             [33m<[39m[33mdiv[39m style[33m=[39m{{ display[33m:[39m [32m"flex"[39m[33m,[39m justifyContent[33m:[39m [32m"space-between"[39m[33m,[39m alignItems[33m:[39m [32m"center"[39m }}[33m>[39m
10:04:07.218  [90m 95 |[39m               [33m<[39m[33mdiv[39m[33m>[39m[0m
10:04:07.256 Next.js build worker exited with code: 1 and signal: null
10:04:07.304 Error: Command "npm run build" exited with 1