import { Client, Storage } from 'node-appwrite'
export const dynamic = 'force-dynamic'
function storage() { return new Storage(new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!).setKey(process.env.APPWRITE_API_KEY!)) }
export async function GET(req: Request) {
  if (process.env.APPWRITE_ENABLED !== 'true') return new Response('Appwrite disabled', { status: 500 })
  try {
    const id = req.url.split('/').pop()
    if (!id) return new Response('Missing id', { status: 400 })
    const s = storage()
    const meta: any = await s.getFile(process.env.APPWRITE_BUCKET_EVIDENCE_ID!, id)
    const fileData: ArrayBuffer = await s.getFileDownload(process.env.APPWRITE_BUCKET_EVIDENCE_ID!, id) as unknown as ArrayBuffer
    return new Response(Buffer.from(fileData), { headers: { 'Content-Type': meta?.mimeType || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } })
  } catch (e: any) {
    return new Response(e?.message || 'Not found', { status: 404 })
  }
}
