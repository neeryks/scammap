import { NextRequest, NextResponse } from 'next/server'
import { initDB, db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await initDB()
  
  const evidence = db.data!.evidence.find(e => e.id === id)
  if (!evidence) {
    return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
  }
  
  return NextResponse.json(evidence)
}
