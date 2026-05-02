import type { VercelRequest, VercelResponse } from '@vercel/node'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from '../mcp-server/createServer.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Stateless mode: each request creates a fresh server + transport.
  // Required for Vercel Functions because there's no shared memory across invocations.
  const server = createServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  res.on('close', () => {
    transport.close().catch(() => undefined)
    server.close().catch(() => undefined)
  })

  try {
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: err instanceof Error ? err.message : 'Internal server error',
        },
        id: null,
      })
    }
  }
}
