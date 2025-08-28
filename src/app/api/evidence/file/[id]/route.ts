import { Client, Storage } from 'node-appwrite'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

function getStorage() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)
  return new Storage(client)
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (process.env.APPWRITE_ENABLED !== 'true') {
    return new Response('Appwrite disabled', { status: 500 })
  }
  const { id } = params
  try {
    const storage = getStorage()
    const meta: any = await storage.getFile(process.env.APPWRITE_BUCKET_EVIDENCE_ID!, id)
    const fileData: ArrayBuffer = await storage.getFileDownload(
      process.env.APPWRITE_BUCKET_EVIDENCE_ID!,
      id
    ) as unknown as ArrayBuffer
    const data = Buffer.from(fileData)
    const mime = meta?.mimeType || 'image/webp'
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (err: any) {
    return new Response(err?.message || 'Not found', { status: 404 })
  }
}