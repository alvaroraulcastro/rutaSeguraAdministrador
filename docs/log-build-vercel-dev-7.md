17:44:36.710 Running build in Washington, D.C., USA (East) – iad1
17:44:36.710 Build machine configuration: 2 cores, 8 GB
17:44:36.824 Cloning github.com/alvaroraulcastro/rutaSeguraAdministrador (Branch: dev, Commit: 92919f0)
17:44:37.083 Cloning completed: 259.000ms
17:44:38.318 Restored build cache from previous deployment (A6YWuDzVaW6hNWYihKjzjcymC6Vd)
17:44:39.005 Running "vercel build"
17:44:39.821 Vercel CLI 50.43.0
17:44:40.633 Installing dependencies...
17:44:41.854 
17:44:41.854 up to date in 1s
17:44:41.854 
17:44:41.854 162 packages are looking for funding
17:44:41.854   run `npm fund` for details
17:44:41.883 Detected Next.js version: 16.2.3
17:44:41.888 Running "npm run build"
17:44:41.984 
17:44:41.985 > ruta-segura-admin@0.1.0 build
17:44:41.985 > prisma generate && next build
17:44:41.985 
17:44:42.860 Loaded Prisma config from prisma.config.ts.
17:44:42.860 
17:44:42.921 Prisma schema loaded from prisma/schema.prisma.
17:44:43.264 
17:44:43.265 ✔ Generated Prisma Client (v7.7.0) to ./node_modules/@prisma/client in 209ms
17:44:43.265 
17:44:43.265 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
17:44:43.265 
17:44:43.265 
17:44:43.936 ▲ Next.js 16.2.3 (Turbopack)
17:44:43.937 
17:44:43.946 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
17:44:43.973   Creating an optimized production build ...
17:45:00.549 ✓ Compiled successfully in 16.3s
17:45:00.550   Running TypeScript ...
17:45:06.765 Failed to type check.
17:45:06.765 
17:45:06.765 ./src/components/ProfileClient.tsx:72:44
17:45:06.765 Type error: Property 'foto' does not exist on type 'User'.
17:45:06.766 
17:45:06.766   [90m70 |[0m           <[33mCard[0m title={<[33mSpace[0m><[33mUserOutlined[0m /> [33mInformación[0m [33mPersonal[0m</[33mSpace[0m>}>
17:45:06.766   [90m71 |[0m             <div style={{ textAlign: [32m"center"[0m, marginBottom: [35m24[0m }}>
17:45:06.766 [31m[1m>[0m [90m72 |[0m               <[33mAvatar[0m size={[35m100[0m} src={user.foto} icon={<[33mUserOutlined[0m />} />
17:45:06.766   [90m   |[0m                                            [31m[1m^[0m
17:45:06.767   [90m73 |[0m               <div style={{ marginTop: [35m8[0m }}>
17:45:06.767   [90m74 |[0m                 <[33mText[0m strong>{user.nombre}</[33mText[0m>
17:45:06.767   [90m75 |[0m                 <br />
17:45:06.802 Next.js build worker exited with code: 1 and signal: null
17:45:06.844 Error: Command "npm run build" exited with 1