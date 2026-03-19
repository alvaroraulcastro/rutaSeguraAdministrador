17:30:44.608 Running build in Washington, D.C., USA (East) – iad1
17:30:44.609 Build machine configuration: 2 cores, 8 GB
17:30:44.734 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: df2e47d)
17:30:44.977 Cloning completed: 243.000ms
17:30:46.114 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
17:30:46.457 Running "vercel build"
17:30:47.026 Vercel CLI 50.32.4
17:30:47.336 Installing dependencies...
17:30:53.630 
17:30:53.631 added 122 packages in 6s
17:30:53.631 
17:30:53.631 159 packages are looking for funding
17:30:53.632   run `npm fund` for details
17:30:53.675 Detected Next.js version: 16.1.7
17:30:53.680 Running "npm run build"
17:30:53.777 
17:30:53.777 > ruta-segura-admin@0.1.0 build
17:30:53.777 > next build
17:30:53.777 
17:30:54.798 ▲ Next.js 16.1.7 (Turbopack)
17:30:54.799 
17:30:54.807 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
17:30:54.838   Creating an optimized production build ...
17:31:16.371 
17:31:16.372 > Build error occurred
17:31:16.375 Error: Turbopack build failed with 4 errors:
17:31:16.375 ./src/app/drivers/page.tsx:247:7
17:31:16.376 Parsing ecmascript source code failed
17:31:16.376 [0m [90m 245 |[39m         [33m/[39m[33m>[39m
17:31:16.376  [90m 246 |[39m       [33m<[39m[33m/[39m[33mCard[39m[33m>[39m
17:31:16.376 [31m[1m>[22m[39m[90m 247 |[39m     [33m<[39m[33m/[39m[33m>[39m
17:31:16.376  [90m     |[39m       [31m[1m^[22m[39m
17:31:16.376  [90m 248 |[39m   )[33m;[39m
17:31:16.377  [90m 249 |[39m }
17:31:16.377  [90m 250 |[39m[0m
17:31:16.377 
17:31:16.377 Expression expected
17:31:16.377 
17:31:16.377 
17:31:16.377 ./src/app/notifications/page.tsx:220:7
17:31:16.377 Parsing ecmascript source code failed
17:31:16.377 [0m [90m 218 |[39m         [33m/[39m[33m>[39m
17:31:16.377  [90m 219 |[39m       [33m<[39m[33m/[39m[33mCard[39m[33m>[39m
17:31:16.377 [31m[1m>[22m[39m[90m 220 |[39m     [33m<[39m[33m/[39m[33m>[39m
17:31:16.378  [90m     |[39m       [31m[1m^[22m[39m
17:31:16.378  [90m 221 |[39m   )[33m;[39m
17:31:16.378  [90m 222 |[39m }
17:31:16.378  [90m 223 |[39m[0m
17:31:16.378 
17:31:16.378 Expression expected
17:31:16.378 
17:31:16.378 
17:31:16.378 ./src/app/settings/page.tsx:217:7
17:31:16.378 Parsing ecmascript source code failed
17:31:16.378 [0m [90m 215 |[39m         [33m<[39m[33mTabs[39m items[33m=[39m{tabItems} [33m/[39m[33m>[39m
17:31:16.378  [90m 216 |[39m       [33m<[39m[33m/[39m[33mCard[39m[33m>[39m
17:31:16.378 [31m[1m>[22m[39m[90m 217 |[39m     [33m<[39m[33m/[39m[33m>[39m
17:31:16.379  [90m     |[39m       [31m[1m^[22m[39m
17:31:16.379  [90m 218 |[39m   )[33m;[39m
17:31:16.379  [90m 219 |[39m }
17:31:16.379  [90m 220 |[39m[0m
17:31:16.379 
17:31:16.379 Expression expected
17:31:16.379 
17:31:16.379 
17:31:16.379 ./node_modules/@prisma/client/default.js:2:6
17:31:16.379 Module not found: Can't resolve '.prisma/client/default'
17:31:16.379 [0m [90m 1 |[39m module[33m.[39mexports [33m=[39m {
17:31:16.383 [31m[1m>[22m[39m[90m 2 |[39m   [33m...[39mrequire([32m'.prisma/client/default'[39m)[33m,[39m
17:31:16.383  [90m   |[39m      [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
17:31:16.384  [90m 3 |[39m }
17:31:16.384  [90m 4 |[39m[0m
17:31:16.384 
17:31:16.384 
17:31:16.384 
17:31:16.384 Import traces:
17:31:16.384   Edge Middleware:
17:31:16.384     ./node_modules/@prisma/client/default.js
17:31:16.384     ./src/middleware.ts
17:31:16.384 
17:31:16.384   externals-tracing:
17:31:16.384     ./node_modules/@prisma/client/default.js [externals-tracing]
17:31:16.384     [externals]/@prisma/client [external]
17:31:16.384     ./src/lib/prisma.ts [App Route]
17:31:16.384     ./src/app/api/v1/auth/login/route.ts [App Route]
17:31:16.384 
17:31:16.384 https://nextjs.org/docs/messages/module-not-found
17:31:16.384 
17:31:16.384 
17:31:16.384     at <unknown> (./src/app/drivers/page.tsx:247:7)
17:31:16.384     at <unknown> (./src/app/notifications/page.tsx:220:7)
17:31:16.384     at <unknown> (./src/app/settings/page.tsx:217:7)
17:31:16.384     at ./node_modules/ (prisma/client/default.js:2:6)
17:31:16.384     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
17:31:16.448 Error: Command "npm run build" exited with 1