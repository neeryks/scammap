import { NextRequest, NextResponse } from 'next/server'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'
import { initDB, db } from '@/lib/db'
import { Client, Databases } from 'node-appwrite'
import { getReport as getOne } from '@/lib/storage'

const useAppwrite = process.env.APPWRITE_ENABLED === 'true'

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() as string
  const authz = req.headers.get('authorization') || ''
  if (!authz.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const jwt = authz.substring('Bearer '.length).trim()
  const verified = await validateAppwriteJWT(jwt)
  if (!verified) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = verified.userId

  if (!useAppwrite) {
    await initDB()
    const idx = db.data!.reports.findIndex(r => r.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const report = db.data!.reports[idx]
    if (report.reporter_user_id && report.reporter_user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    db.data!.reports.splice(idx, 1)
    await db.write()
    return NextResponse.json({ ok: true })
  }

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
