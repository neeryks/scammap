import { NextRequest, NextResponse } from 'next/server'
import { listReports, createReport } from '@/lib/storage'
import { ReportSchema } from '@/lib/schemas'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'
import { calculateRiskScore, findNearbyIncidents } from '@/lib/risk'

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
  
  // Calculate risk scores for items that don't have them
  try {
    const { items: allReports } = await listReports({ limit: 1000 })
    const itemsWithRisk = items.map(report => {
      if (report.risk_score !== undefined) {
        return report // Already has risk score
      }
      try {
        const nearbyIncidents = findNearbyIncidents(report, allReports)
        const riskData = calculateRiskScore(report, nearbyIncidents)
        return {
          ...report,
          risk_score: riskData.score,
          risk_components: riskData.components
        }
      } catch (error) {
        console.error(`Error calculating risk for report ${report.id}:`, error)
        return report // Return original if calculation fails
      }
    })
    
    return NextResponse.json({ total, items: itemsWithRisk, limit: limit ?? 50, offset: offset ?? 0 })
  } catch (error) {
    console.error('Error in risk calculation batch:', error)
    return NextResponse.json({ total, items, limit: limit ?? 50, offset: offset ?? 0 })
  }
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
  
  // Create the report first
  const { report, scoring } = await createReport({ ...input, reporter_visibility, reporter_user_id })
  
  // Calculate risk score for the new report
  try {
    // Get all reports for risk calculation context
    const { items: allReports } = await listReports({ limit: 1000 })
    const nearbyIncidents = findNearbyIncidents(report, allReports)
    const riskData = calculateRiskScore(report, nearbyIncidents)
    
    // Update the report with risk score (you may need to implement updateReport function)
    console.log(`Calculated risk score for report ${report.id}: ${riskData.score}`)
    
    return NextResponse.json({ 
      report: {
        ...report,
        risk_score: riskData.score,
        risk_components: riskData.components,
        risk_updated_at: new Date().toISOString()
      }, 
      scoring,
      risk_data: riskData
    })
  } catch (error) {
    console.error('Error calculating risk score:', error)
    // Still return the report even if risk calculation fails
    return NextResponse.json({ report, scoring })
  }
}
