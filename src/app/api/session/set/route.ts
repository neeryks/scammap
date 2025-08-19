import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { jwt } = await req.json().catch(() => ({ jwt: '' })) as { jwt?: string }
  if (!jwt) return NextResponse.json({ ok: false, error: 'Missing jwt' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('scammap_jwt', jwt, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 })
  return res
}
