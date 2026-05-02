import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {}

  try {
    await import('@modelcontextprotocol/sdk/server/streamableHttp.js')
    results['mcp-streamable'] = 'ok'
  } catch (e) {
    results['mcp-streamable'] = String(e)
  }

  try {
    await import('@modelcontextprotocol/sdk/server/index.js')
    results['mcp-server'] = 'ok'
  } catch (e) {
    results['mcp-server'] = String(e)
  }

  try {
    await import('firebase-admin/app')
    results['firebase-admin/app'] = 'ok'
  } catch (e) {
    results['firebase-admin/app'] = String(e)
  }

  try {
    await import('@google/genai')
    results['@google/genai'] = 'ok'
  } catch (e) {
    results['@google/genai'] = String(e)
  }

  try {
    const { createServer } = await import('../mcp-server/createServer.js')
    results['createServer'] = typeof createServer === 'function' ? 'ok' : 'not a function'
  } catch (e) {
    results['createServer'] = String(e)
  }

  res.json(results)
}
