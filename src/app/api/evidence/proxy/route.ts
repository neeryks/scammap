import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'missing id' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const endpoint = process.env.APPWRITE_ENDPOINT
  const project = process.env.APPWRITE_PROJECT_ID
  const key = process.env.APPWRITE_API_KEY
  const bucket = process.env.APPWRITE_BUCKET_EVIDENCE_ID
  const enabled = process.env.APPWRITE_ENABLED === 'true'

  if (!enabled || !endpoint || !project || !key || !bucket) {
    return new Response(JSON.stringify({ error: 'appwrite not configured' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }

  const upstream = await fetch(`${endpoint}/storage/buckets/${bucket}/files/${id}/view`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': project!,
      'X-Appwrite-Key': key!,
    },
  })

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    return new Response(text || JSON.stringify({ error: 'failed to fetch file' }), { status: upstream.status, headers: { 'content-type': 'application/json' } })
  }

  const contentType = upstream.headers.get('content-type') || 'image/webp'
  const headers: HeadersInit = {
    'content-type': contentType,
    'cache-control': 'public, max-age=300, s-maxage=300',
  }
  return new Response(upstream.body, { status: 200, headers })
}
