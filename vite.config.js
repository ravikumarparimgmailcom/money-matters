import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Local adapter for the existing Vercel-style API handlers.
// This lets `npm run dev` serve both the React app and /api/* routes.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'money-matters-local-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const pathname = new URL(req.url || '/', 'http://localhost').pathname;
            let handler;
            let apiPath = '';

            if (pathname === '/api/auth/admin') {
              handler = (await import('./api/auth/admin.js')).default;
            } else if (pathname === '/api/auth/user') {
              handler = (await import('./api/auth/user.js')).default;
            } else if (pathname.startsWith('/api/data/')) {
              handler = (await import('./api/data/[...path].js')).default;
              apiPath = pathname.slice('/api/data/'.length);
            } else {
              return next();
            }

            try {
              const url = new URL(req.url || '/', 'http://localhost');
              const query = {};
              for (const [key, value] of url.searchParams.entries()) {
                query[key] = value;
              }
              if (apiPath) query.path = apiPath.split('/');

              let raw = '';
              for await (const chunk of req) raw += chunk;
              let parsedBody = {};
              if (raw) {
                try { parsedBody = JSON.parse(raw); }
                catch {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ message: 'Invalid JSON request body.' }));
                  return;
                }
              }

              const mockRes = {
                statusCode: 200,
                headers: {},
                setHeader(name, value) { this.headers[name] = value; },
                end(data = '') {
                  if (res.writableEnded) return;
                  res.statusCode = this.statusCode;
                  for (const [name, value] of Object.entries(this.headers)) {
                    res.setHeader(name, value);
                  }
                  res.end(data);
                }
              };
              const mockReq = {
                method: req.method,
                headers: req.headers,
                query,
                body: parsedBody
              };
              await handler(mockReq, mockRes);
              if (!res.writableEnded) mockRes.end();
            } catch (error) {
              console.error('[Money Matters API]', error);
              if (!res.writableEnded) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Local API error. Check the terminal for details.' }));
              }
            }
          });
        }
      }
    ],
    server: { host: '0.0.0.0' }
  };
});
