import { NextRequest, NextResponse } from 'next/server'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'

export async function GET(req: NextRequest) {
  const authz = req.headers.get('authorization') || ''
  if (!authz.startsWith('Bearer ')) return NextResponse.json({ user: null })
  const jwt = authz.substring('Bearer '.length).trim()
  const verified = await validateAppwriteJWT(jwt)
  if (!verified) return NextResponse.json({ user: null })
  return NextResponse.json({ user: { id: verified.userId } })
}
