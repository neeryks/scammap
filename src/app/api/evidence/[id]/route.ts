import { NextRequest, NextResponse } from 'next/server'
import { Client, Storage } from 'node-appwrite'

export const dynamic = 'force-dynamic'

function getStorage() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)
  return new Storage(client)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.APPWRITE_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Appwrite disabled' }, { status: 500 })
  }
  const { id } = await params
  try {
    const storage = getStorage()
    const file = await storage.getFile(
      process.env.APPWRITE_BUCKET_EVIDENCE_ID!,
      id
    )
    return NextResponse.json({
      id: file.$id,
      type: 'image',
      storage_url: `/api/evidence/file/${file.$id}`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Not found' }, { status: 404 })
  }
}
