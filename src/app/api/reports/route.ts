import { NextRequest, NextResponse } from 'next/server'
import { initDB, db } from '@/lib/db'
import { Report } from '@/lib/types'
import { ReportSchema } from '@/lib/schemas'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { computeScamMeterScore } from '@/lib/scoring'

export async function GET() {
  await initDB()
  return NextResponse.json(db.data!.reports)
}

export async function POST(req: NextRequest) {
  await initDB()
  const json = await req.json()
  const parsed = ReportSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  const report: Report = {
    id: uuidv4(),
    created_at: dayjs().toISOString(),
    category: input.category,
    location: input.location,
    city: input.city,
    venue_name: input.venue_name,
    address: input.address,
    description: input.description,
    loss_amount_inr: input.loss_amount_inr,
    payment_method: input.payment_method,
  impact_types: input.impact_types ?? [],
  impact_summary: input.impact_summary,
    tactic_tags: input.tactic_tags ?? [],
    date_time_of_incident: input.date_time_of_incident,
    evidence_ids: input.evidence_ids ?? [],
    indicators: input.indicators ?? [],
    outcome: input.outcome,
    verification_status: 'unverified',
    scam_meter_score: 0,
    reporter_visibility: input.reporter_visibility ?? 'anonymous'
  }

  const corroborationCount = db.data!.reports.filter(r => r.venue_name && r.venue_name === report.venue_name).length
  const score = computeScamMeterScore(report, corroborationCount, false, false, false)
  report.scam_meter_score = score.score

  db.data!.reports.push(report)
  await db.write()
  return NextResponse.json({ report, scoring: score })
}
