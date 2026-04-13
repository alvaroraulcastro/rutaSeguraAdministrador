13:26:06.676 Running build in Washington, D.C., USA (East) – iad1
13:26:06.676 Build machine configuration: 2 cores, 8 GB
13:26:06.862 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: c3e4687)
13:26:07.270 Cloning completed: 408.000ms
13:26:08.766 Restored build cache from previous deployment (A6YWuDzVaW6hNWYihKjzjcymC6Vd)
13:26:09.334 Running "vercel build"
13:26:10.001 Vercel CLI 50.43.0
13:26:10.268 Installing dependencies...
13:26:11.527 
13:26:11.527 up to date in 1s
13:26:11.528 
13:26:11.528 162 packages are looking for funding
13:26:11.528   run `npm fund` for details
13:26:11.557 Detected Next.js version: 16.2.3
13:26:11.562 Running "npm run build"
13:26:11.662 
13:26:11.663 > ruta-segura-admin@0.1.0 build
13:26:11.663 > prisma generate && next build
13:26:11.663 
13:26:12.608 Loaded Prisma config from prisma.config.ts.
13:26:12.608 
13:26:12.685 Prisma schema loaded from prisma/schema.prisma.
13:26:13.028 
13:26:13.029 ✔ Generated Prisma Client (v7.7.0) to ./node_modules/@prisma/client in 197ms
13:26:13.029 
13:26:13.029 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
13:26:13.029 
13:26:13.029 
13:26:13.882 ▲ Next.js 16.2.3 (Turbopack)
13:26:13.883 
13:26:13.890 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
13:26:13.920   Creating an optimized production build ...
13:26:33.212 ✓ Compiled successfully in 19.0s
13:26:33.214   Running TypeScript ...
13:26:40.150 Failed to type check.
13:26:40.150 
13:26:40.151 ./src/app/api/v1/pasajeros/route.ts:43:7
13:26:40.151 Type error: Type '{ contactos: { create: { nombre: string; telefono: string; canal: "PUSH" | "SMS" | "WHATSAPP"; email?: string | undefined; }[] | undefined; }; nombre: string; telefono: string; direccionDomicilio: string; ... 8 more ...; instruccionesDomicilio?: string | undefined; }' is not assignable to type '(Without<PasajeroCreateInput, PasajeroUncheckedCreateInput> & PasajeroUncheckedCreateInput) | (Without<...> & PasajeroCreateInput)'.
13:26:40.152   Type '{ contactos: { create: { nombre: string; telefono: string; canal: "PUSH" | "SMS" | "WHATSAPP"; email?: string | undefined; }[] | undefined; }; nombre: string; telefono: string; direccionDomicilio: string; ... 8 more ...; instruccionesDomicilio?: string | undefined; }' is not assignable to type 'Without<PasajeroUncheckedCreateInput, PasajeroCreateInput> & PasajeroCreateInput'.
13:26:40.152     Property 'transportista' is missing in type '{ contactos: { create: { nombre: string; telefono: string; canal: "PUSH" | "SMS" | "WHATSAPP"; email?: string | undefined; }[] | undefined; }; nombre: string; telefono: string; direccionDomicilio: string; ... 8 more ...; instruccionesDomicilio?: string | undefined; }' but required in type 'PasajeroCreateInput'.
13:26:40.152 
13:26:40.153   [90m41 |[0m
13:26:40.153   [90m42 |[0m     [36mconst[0m nuevoPasajero = [36mawait[0m prisma.pasajero.create({
13:26:40.153 [31m[1m>[0m [90m43 |[0m       data: {
13:26:40.153   [90m   |[0m       [31m[1m^[0m
13:26:40.153   [90m44 |[0m         ...pasajeroData,
13:26:40.154   [90m45 |[0m         contactos: {
13:26:40.154   [90m46 |[0m           create: contactos,
13:26:40.191 Next.js build worker exited with code: 1 and signal: null
13:26:40.234 Error: Command "npm run build" exited with 1