import { NextRequest, NextResponse } from 'next/server'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'
import { Client, Databases } from 'node-appwrite'
import { getReport as getOne } from '@/lib/storage'

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() as string
  const authz = req.headers.get('authorization') || ''
  if (!authz.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const jwt = authz.substring('Bearer '.length).trim()
  const verified = await validateAppwriteJWT(jwt)
  if (!verified) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = verified.userId

  // Use Appwrite for all operations
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)
  const databases = new Databases(client)
  try {
    const doc = await databases.getDocument(process.env.APPWRITE_DATABASE_ID!, process.env.APPWRITE_COLLECTION_REPORTS_ID!, id)
    const owner = (doc as unknown as { reporter_user_id?: string }).reporter_user_id
    if (owner && owner !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await databases.deleteDocument(process.env.APPWRITE_DATABASE_ID!, process.env.APPWRITE_COLLECTION_REPORTS_ID!, id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() as string
  const report = await getOne(id)
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(report)
}
