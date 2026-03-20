19:36:44.762 Running build in Washington, D.C., USA (East) – iad1
19:36:44.763 Build machine configuration: 2 cores, 8 GB
19:36:44.885 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: a89ee99)
19:36:45.114 Cloning completed: 229.000ms
19:36:46.100 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
19:36:46.497 Running "vercel build"
19:36:47.095 Vercel CLI 50.32.4
19:36:47.462 Installing dependencies...
19:36:54.753 
19:36:54.754 added 122 packages in 7s
19:36:54.754 
19:36:54.755 159 packages are looking for funding
19:36:54.755   run `npm fund` for details
19:36:54.801 Detected Next.js version: 16.1.7
19:36:54.807 Running "npm run build"
19:36:54.911 
19:36:54.911 > ruta-segura-admin@0.1.0 build
19:36:54.912 > next build
19:36:54.912 
19:36:56.035 ▲ Next.js 16.1.7 (Turbopack)
19:36:56.036 
19:36:56.043 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
19:36:56.076   Creating an optimized production build ...
19:37:20.921 ✓ Compiled successfully in 24.3s
19:37:20.924   Running TypeScript ...
19:37:26.694 Failed to compile.
19:37:26.694 
19:37:26.695 Type error: Type 'typeof import("/vercel/path0/src/app/api/v1/rutas/[rutaId]/paradas/route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/v1/rutas/[rutaId]/paradas">'.
19:37:26.695   Types of property 'GET' are incompatible.
19:37:26.695     Type '(request: Request, { params }: { params: Params; }) => Promise<NextResponse<any>>' is not assignable to type '(request: NextRequest, context: { params: Promise<{ rutaId: string; }>; }) => void | Response | Promise<void | Response>'.
19:37:26.695       Types of parameters '__1' and 'context' are incompatible.
19:37:26.695         Type '{ params: Promise<{ rutaId: string; }>; }' is not assignable to type '{ params: Params; }'.
19:37:26.695           Types of property 'params' are incompatible.
19:37:26.696             Property 'rutaId' is missing in type 'Promise<{ rutaId: string; }>' but required in type 'Params'.
19:37:26.696 
19:37:26.735 Next.js build worker exited with code: 1 and signal: null
19:37:26.784 Error: Command "npm run build" exited with 1