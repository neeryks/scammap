#!/usr/bin/env node
/**
 * Backfill script to calculate risk scores for existing reports
 * Run this once after implementing the risk score system
 */

import { listReports } from '../src/lib/storage'
import { calculateBatchRiskScores } from '../src/lib/risk'

async function backfillRiskScores() {
  console.log('🔄 Starting risk score backfill...')
  
  try {
    // Get all reports
    const { items: reports } = await listReports({ limit: 10000 })
    console.log(`📊 Found ${reports.length} reports to process`)
    
    if (reports.length === 0) {
      console.log('✅ No reports found. Nothing to process.')
      return
    }
    
    // Calculate risk scores in batch
    console.log('🧮 Calculating risk scores...')
    const riskScores = calculateBatchRiskScores(reports)
    
    console.log(`✅ Calculated risk scores for ${riskScores.size} reports`)
    
    // Display some statistics
    const scores = Array.from(riskScores.values()).map(r => r.score)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)
    
    const riskLevels = {
      critical: scores.filter(s => s >= 80).length,
      high: scores.filter(s => s >= 60 && s < 80).length,
      medium: scores.filter(s => s >= 40 && s < 60).length,
      low: scores.filter(s => s < 40).length
    }
    
    console.log('\n📈 Risk Score Statistics:')
    console.log(`   Average Score: ${avgScore.toFixed(1)}`)
    console.log(`   Range: ${minScore} - ${maxScore}`)
    console.log(`   Critical Risk (80-100): ${riskLevels.critical} reports`)
    console.log(`   High Risk (60-79): ${riskLevels.high} reports`)
    console.log(`   Medium Risk (40-59): ${riskLevels.medium} reports`)
    console.log(`   Low Risk (0-39): ${riskLevels.low} reports`)
    
    // TODO: Implement batch update to Appwrite database
    console.log('\n⚠️  Note: Risk scores calculated but not yet saved to database.')
    console.log('   Implement the updateReportRiskScore function in your storage layer.')
    
    // Show sample of high-risk incidents
    const highRiskReports = Array.from(riskScores.entries())
      .filter(([_, risk]) => risk.score >= 80)
      .sort(([_, a], [__, b]) => b.score - a.score)
      .slice(0, 5)
    
    if (highRiskReports.length > 0) {
      console.log('\n🚨 Top High-Risk Incidents:')
      highRiskReports.forEach(([reportId, risk]) => {
        const report = reports.find(r => r.id === reportId)
        console.log(`   ${risk.score}/100 - ${report?.category} at ${report?.venue_name || report?.city}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error during backfill:', error)
    process.exit(1)
  }
  
  console.log('\n✅ Backfill completed successfully!')
}

// Run the backfill if this script is executed directly
if (require.main === module) {
  backfillRiskScores()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Backfill failed:', error)
      process.exit(1)
    })
}

export { backfillRiskScores }
