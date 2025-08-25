import { NextRequest, NextResponse } from 'next/server'
import { listReports, createReport } from '@/lib/storage'
import { ReportSchema } from '@/lib/schemas'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const city = searchParams.get('city') || undefined
  const mine = searchParams.get('mine') === 'true'
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
  const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined
  let authUserId: string | undefined
  if (mine) {
    const authz = req.headers.get('authorization') || ''
    if (authz.startsWith('Bearer ')) {
      const jwt = authz.substring('Bearer '.length).trim()
      const verified = await validateAppwriteJWT(jwt)
      if (verified) authUserId = verified.userId
    }
  }
  const { items, total } = await listReports({ category, city, limit, offset, ...(authUserId ? { reporter_user_id: authUserId } : {}) })
  return NextResponse.json({ total, items, limit: limit ?? 50, offset: offset ?? 0 })
}

export async function POST(req: NextRequest) {
  // Require authentication via Appwrite JWT
  const authz = req.headers.get('authorization') || ''
  if (!authz.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const jwt = authz.substring('Bearer '.length).trim()
  const verified = await validateAppwriteJWT(jwt)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  let json: unknown
  try {
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      json = await req.json()
    } else {
      const form = await req.formData()
      json = Object.fromEntries(Array.from(form.entries())) as Record<string, unknown>
      const obj = json as Record<string, unknown>
      if (obj.loss_amount_inr) obj.loss_amount_inr = Number(obj.loss_amount_inr as string)
      if (obj.impact_types && typeof obj.impact_types === 'string') {
        try { obj.impact_types = JSON.parse(obj.impact_types as string) } catch {}
      }
      if (obj.tactic_tags && typeof obj.tactic_tags === 'string') {
        try { obj.tactic_tags = JSON.parse(obj.tactic_tags as string) } catch {}
      }
      if (obj.indicators && typeof obj.indicators === 'string') {
        try { obj.indicators = JSON.parse(obj.indicators as string) } catch {}
      }
      if (obj.evidence_ids && typeof obj.evidence_ids === 'string') {
        try { obj.evidence_ids = JSON.parse(obj.evidence_ids as string) } catch {}
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const parsed = ReportSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data
  // Auth guaranteed now
  const reporter_visibility = 'anonymous'
  const reporter_user_id = undefined
  const { report, scoring } = await createReport({ ...input, reporter_visibility, reporter_user_id })
  return NextResponse.json({ report, scoring })
}
