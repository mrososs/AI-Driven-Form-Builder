import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleGenerate } from '../server/handleGenerate'

export const config = {
  runtime: 'nodejs',
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  await handleGenerate(req, res)
}
