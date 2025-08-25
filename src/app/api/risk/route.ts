import { NextRequest, NextResponse } from 'next/server'
import { calculateRiskScore, findNearbyIncidents, calculateBatchRiskScores } from '@/lib/risk'
import { listReports } from '@/lib/storage'
import { Report } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, batchMode = false } = body

    if (batchMode) {
      // Calculate risk scores for all reports
      const { items: reports } = await listReports({ limit: 1000 })
      const riskScores = calculateBatchRiskScores(reports)
      
      const results = Array.from(riskScores.entries()).map(([id, score]) => ({
        id,
        risk_score: score.score,
        risk_components: score.components,
        risk_level: score.level
      }))

      return NextResponse.json({ 
        success: true, 
        results,
        message: `Calculated risk scores for ${results.length} reports`
      })
    }

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required when not in batch mode' },
        { status: 400 }
      )
    }

    // Calculate risk score for single report
    const { items: allReports } = await listReports({ limit: 1000 })
    const targetReport = allReports.find((r: Report) => r.id === reportId)
    
    if (!targetReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const nearbyIncidents = findNearbyIncidents(targetReport, allReports)
    const riskScore = calculateRiskScore(targetReport, nearbyIncidents)

    return NextResponse.json({
      success: true,
      reportId,
      risk_score: riskScore.score,
      risk_components: riskScore.components,
      risk_level: riskScore.level,
      nearby_incidents_count: nearbyIncidents.length
    })

  } catch (error) {
    console.error('Risk calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risk score' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reportId = url.searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId parameter is required' },
        { status: 400 }
      )
    }

    // Get all reports for calculation context
    const { items: allReports } = await listReports({ limit: 1000 })
    const targetReport = allReports.find((r: Report) => r.id === reportId)
    
    if (!targetReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const nearbyIncidents = findNearbyIncidents(targetReport, allReports)
    const riskScore = calculateRiskScore(targetReport, nearbyIncidents)

    return NextResponse.json({
      success: true,
      reportId,
      risk_score: riskScore.score,
      risk_components: riskScore.components,
      risk_level: riskScore.level,
      nearby_incidents_count: nearbyIncidents.length,
      nearby_incidents: nearbyIncidents.map(incident => ({
        id: incident.id,
        category: incident.category,
        venue_name: incident.venue_name,
        created_at: incident.created_at,
        loss_amount_inr: incident.loss_amount_inr
      }))
    })

  } catch (error) {
    console.error('Risk score fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk score' },
      { status: 500 }
    )
  }
}
