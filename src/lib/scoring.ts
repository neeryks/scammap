import { Report } from './types'

export function computeScamMeterScore(r: Report, corroborationCount: number, hasModReview: boolean, consistencyBonus: boolean, hasActiveDispute: boolean): { score: number; label: string; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // base for complete form
  score += 20
  reasons.push('Base form completeness (+20)')

  // evidence
  if (r.evidence_ids && r.evidence_ids.length > 0) {
    score += 20
    reasons.push('Evidence present (+20)')
  }

  // corroboration up to +30
  const corroboration = Math.min(2, Math.max(0, corroborationCount))
  if (corroboration > 0) {
    const add = corroboration * 15
    score += add
    reasons.push(`Corroboration x${corroboration} (+${add})`)
  }

  if (hasModReview) {
    score += 10
    reasons.push('Moderator review passed (+10)')
  }

  if (consistencyBonus) {
    score += 5
    reasons.push('Consistency across details (+5)')
  }

  if (hasActiveDispute) {
    score -= 15
    reasons.push('Active dispute/flags (-15)')
  }

  score = Math.max(0, Math.min(100, score))

  const label = score < 30 ? 'Low' : score < 50 ? 'Medium' : score < 70 ? 'High' : 'Critical'
  return { score, label, reasons }
}
