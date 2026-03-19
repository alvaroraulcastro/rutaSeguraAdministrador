19:19:16.776 Running build in Washington, D.C., USA (East) – iad1
19:19:16.776 Build machine configuration: 2 cores, 8 GB
19:19:16.890 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: main, Commit: 5bf05d7)
19:19:17.125 Cloning completed: 234.000ms
19:19:18.017 Restored build cache from previous deployment (CofA36QWPUHgLCvBpo7aMqFSvpi4)
19:19:18.294 Running "vercel build"
19:19:18.871 Vercel CLI 50.32.4
19:19:19.275 Installing dependencies...
19:19:26.806 
19:19:26.807 added 122 packages in 7s
19:19:26.808 
19:19:26.808 159 packages are looking for funding
19:19:26.808   run `npm fund` for details
19:19:26.854 Detected Next.js version: 16.1.7
19:19:26.860 Running "npm run build"
19:19:26.961 
19:19:26.963 > ruta-segura-admin@0.1.0 build
19:19:26.963 > next build
19:19:26.964 
19:19:28.010 ▲ Next.js 16.1.7 (Turbopack)
19:19:28.011 
19:19:28.018 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
19:19:28.051   Creating an optimized production build ...
19:19:52.060 ✓ Compiled successfully in 23.3s
19:19:52.062   Running TypeScript ...
19:19:57.645 Failed to compile.
19:19:57.645 
19:19:57.646 Type error: Type 'typeof import("/vercel/path0/src/app/api/v1/pasajeros/[id]/route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/v1/pasajeros/[id]">'.
19:19:57.646   Types of property 'GET' are incompatible.
19:19:57.646     Type '(request: Request, { params }: { params: Params; }) => Promise<NextResponse<any>>' is not assignable to type '(request: NextRequest, context: { params: Promise<{ id: string; }>; }) => void | Response | Promise<void | Response>'.
19:19:57.646       Types of parameters '__1' and 'context' are incompatible.
19:19:57.646         Type '{ params: Promise<{ id: string; }>; }' is not assignable to type '{ params: Params; }'.
19:19:57.646           Types of property 'params' are incompatible.
19:19:57.647             Property 'id' is missing in type 'Promise<{ id: string; }>' but required in type 'Params'.
19:19:57.647 
19:19:57.686 Next.js build worker exited with code: 1 and signal: null
19:19:57.735 Error: Command "npm run build" exited with 1