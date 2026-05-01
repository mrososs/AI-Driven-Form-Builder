import type { Plugin, ViteDevServer } from 'vite'

export function aiBridgePlugin(): Plugin {
  return {
    name: 'formai-ai-bridge',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/generate-form', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        // Lazy-load so the dev-server config bundler doesn't try to inline
        // firebase-admin (a Node-only CJS package) into vite.config.ts.
        import('./handleGenerate')
          .then(({ handleGenerate }) => handleGenerate(req, res))
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[ai-bridge] unhandled error:', err)
            if (!res.headersSent) {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ error: 'Internal AI bridge error' }))
            } else {
              res.end()
            }
          })
      })
    },
  }
}
