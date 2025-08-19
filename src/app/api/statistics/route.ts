import { NextResponse } from 'next/server'
import { listReports } from '@/lib/storage'

export async function GET() {
  const { items } = await listReports()
  const total_reports = items.length
  const total_financial_loss = items.reduce((sum, r) => sum + (r.loss_amount_inr || 0), 0)
  const avg_risk_score = items.length ? Math.round(items.reduce((s, r) => s + (r.scam_meter_score || 0), 0) / items.length) : 0
  const byCategory: Record<string, number> = {}
  const byCity: Record<string, number> = {}
  for (const r of items) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1
    if (r.city) byCity[r.city] = (byCity[r.city] || 0) + 1
  }
  const top_categories = Object.entries(byCategory).map(([category, count]) => ({ category, count })).sort((a,b)=>b.count-a.count).slice(0,5)
  const top_cities = Object.entries(byCity).map(([city, count]) => ({ city, count })).sort((a,b)=>b.count-a.count).slice(0,5)
  return NextResponse.json({
    success: true,
    data: {
      total_reports,
      total_financial_loss,
      avg_risk_score,
      top_categories,
      top_cities
    }
  })
}
