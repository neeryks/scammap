import { NextResponse } from 'next/server'
import { initDB, db } from '@/lib/db'

export async function GET() {
  await initDB()
  return NextResponse.json(db.data!.venues)
}
