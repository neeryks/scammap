import { Report, Category } from './types'

export interface RiskComponents {
  category: number
  proximity: number
  recency: number
  financial: number
  volume: number
}

export interface RiskScore {
  score: number
  components: RiskComponents
  level: 'low' | 'medium' | 'high' | 'critical'
  insights: string[]
}

// Category risk weights (0-1 scale) - Updated to match actual categories
const CATEGORY_WEIGHTS: Record<Category, number> = {
  'dating-romance': 0.9,        // Dating scams (highest risk)
  'investment-crypto': 0.85,    // Investment and crypto scams
  'phishing': 0.8,              // Phishing attacks
  'business-email': 0.8,        // Business email compromise
  'payment-fraud': 0.85,        // Payment fraud
  'harassment-extortion': 0.9,  // Harassment and extortion
  'catfishing': 0.85,           // Catfishing
  'tech-support': 0.75,         // Tech support scams
  'loan-advance-fee': 0.8,      // Loan advance fee scams
  'lottery-prize': 0.75,        // Lottery/prize scams
  'online-shopping': 0.7,       // Online shopping scams
  'employment': 0.7,            // Employment scams
  'rental-real-estate': 0.65,   // Rental/real estate scams
  'social-media': 0.6,          // Social media scams
  'currency-exchange': 0.6,     // Currency exchange scams
  'fake-products': 0.5,         // Fake products
  'accommodation': 0.45,        // Accommodation scams
  'tourist-trap': 0.4,          // Tourist traps
  'transportation': 0.4,        // Transportation scams
  'overcharging': 0.35,         // Overcharging
  'other': 0.4                  // Fallback for uncategorized
}

// Component weights for final score calculation
const COMPONENT_WEIGHTS = {
  category: 0.20,    // 20%
  proximity: 0.30,   // 30% - most important
  recency: 0.20,     // 20%
  financial: 0.15,   // 15%
  volume: 0.15       // 15%
}

/**
 * Calculate haversine distance between two points in kilometers
 */
export function haversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const toRad = (value: number) => value * Math.PI / 180
  const R = 6371 // Earth radius in km
  
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Extract coordinates from various location formats
 */
export function getCoordinates(location: any): { lat: number; lon: number } | null {
  if (!location) return null
  
  if (typeof location === 'object' && 'lat' in location && 'lon' in location) {
    return { lat: location.lat, lon: location.lon }
  }
  
  if (typeof location === 'string' && location.includes(',')) {
    const [lat, lon] = location.split(',').map(s => parseFloat(s.trim()))
    if (!isNaN(lat) && !isNaN(lon)) {
      return { lat, lon }
    }
  }
  
  return null
}

/**
 * Calculate category risk component (0-1 scale)
 */
function calculateCategoryRisk(category: Category): number {
  return CATEGORY_WEIGHTS[category] || CATEGORY_WEIGHTS.other
}

/**
 * Calculate proximity risk based on nearby incidents
 */
function calculateProximityRisk(
  incident: Report, 
  nearbyIncidents: Report[]
): number {
  const coords = getCoordinates(incident.location)
  if (!coords) return 0
  
  // Multi-radius approach with distance decay
  const radiusWeights = [
    { radius: 0.2, weight: 0.5 },  // 200m: immediate vicinity
    { radius: 1.0, weight: 0.3 },  // 1km: neighborhood  
    { radius: 5.0, weight: 0.2 }   // 5km: district/area
  ]
  
  let totalScore = 0
  let totalWeight = 0
  
  radiusWeights.forEach(({ radius, weight }) => {
    const countInRadius = nearbyIncidents.filter(other => {
      const otherCoords = getCoordinates(other.location)
      if (!otherCoords || other.id === incident.id) return false
      
      const distance = haversineDistance(
        coords.lat, coords.lon,
        otherCoords.lat, otherCoords.lon
      )
      
      return distance <= radius
    }).length
    
    // Normalize count (saturate at 10 incidents per radius)
    const normalizedCount = Math.min(1, countInRadius / 10)
    totalScore += normalizedCount * weight
    totalWeight += weight
  })
  
  return totalWeight > 0 ? totalScore / totalWeight : 0
}

/**
 * Calculate recency risk with exponential decay
 */
function calculateRecencyRisk(createdAt: string): number {
  const now = new Date()
  const reportDate = new Date(createdAt)
  const ageInDays = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
  
  // Exponential decay with half-life of ~30 days
  return Math.exp(-ageInDays / 30)
}

/**
 * Calculate financial impact risk using logarithmic scaling
 */
function calculateFinancialRisk(lossAmount?: number): number {
  if (!lossAmount || lossAmount <= 0) return 0
  
  // Log scaling to handle wide range (₹100 to ₹10,000,000)
  const MAX_EXPECTED_LOSS = 1000000 // ₹10 lakh
  return Math.min(1, Math.log10(lossAmount + 1) / Math.log10(MAX_EXPECTED_LOSS + 1))
}

/**
 * Calculate volume risk based on duplicate/similar reports
 */
function calculateVolumeRisk(incident: Report, allIncidents: Report[]): number {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90) // Look back 90 days
  
  const sameVenueCount = allIncidents.filter(other => 
    other.id !== incident.id &&
    other.venue_name === incident.venue_name &&
    other.venue_name && // Must have venue name
    new Date(other.created_at) >= cutoffDate
  ).length
  
  // Normalize: 3+ reports of same venue is max risk
  return Math.min(1, sameVenueCount / 3)
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/**
 * Main function to calculate risk score for an incident
 */
export function calculateRiskScore(
  incident: Report, 
  nearbyIncidents: Report[] = []
): RiskScore {
  // Calculate individual components (0-1 scale)
  const components: RiskComponents = {
    category: calculateCategoryRisk(incident.category),
    proximity: calculateProximityRisk(incident, nearbyIncidents),
    recency: calculateRecencyRisk(incident.created_at),
    financial: calculateFinancialRisk(incident.loss_amount_inr),
    volume: calculateVolumeRisk(incident, nearbyIncidents)
  }
  
  // Calculate weighted final score
  const rawScore = 
    COMPONENT_WEIGHTS.category * components.category +
    COMPONENT_WEIGHTS.proximity * components.proximity +
    COMPONENT_WEIGHTS.recency * components.recency +
    COMPONENT_WEIGHTS.financial * components.financial +
    COMPONENT_WEIGHTS.volume * components.volume
  
  // Convert to 0-100 scale
  const score = Math.round(Math.max(0, Math.min(100, rawScore * 100)))
  
  // Generate insights
  const insights = generateRiskInsights(components, nearbyIncidents.length)
  
  return {
    score,
    components,
    level: getRiskLevel(score),
    insights
  }
}

/**
 * Generate risk insights based on components
 */
function generateRiskInsights(components: RiskComponents, nearbyCount: number): string[] {
  const insights: string[] = []
  
  if (components.category > 0.8) {
    insights.push('High-risk scam category')
  }
  
  if (components.proximity > 0.6 && nearbyCount > 0) {
    insights.push(`${nearbyCount} similar incidents in area`)
  }
  
  if (components.recency > 0.8) {
    insights.push('Very recent incident')
  } else if (components.recency > 0.5) {
    insights.push('Recent incident')
  }
  
  if (components.financial > 0.7) {
    insights.push('High financial impact')
  }
  
  if (components.volume > 0.5) {
    insights.push('Multiple reports from same location')
  }
  
  if (insights.length === 0) {
    insights.push('Standard risk profile')
  }
  
  return insights
}

/**
 * Find nearby incidents for proximity calculation
 */
export function findNearbyIncidents(
  incident: Report,
  allIncidents: Report[],
  maxDistanceKm = 5
): Report[] {
  const coords = getCoordinates(incident.location)
  if (!coords) return []
  
  return allIncidents.filter(other => {
    if (other.id === incident.id) return false
    
    const otherCoords = getCoordinates(other.location)
    if (!otherCoords) return false
    
    const distance = haversineDistance(
      coords.lat, coords.lon,
      otherCoords.lat, otherCoords.lon
    )
    
    return distance <= maxDistanceKm
  })
}

/**
 * Batch calculate risk scores for multiple incidents
 */
export function calculateBatchRiskScores(incidents: Report[]): Map<string, RiskScore> {
  const results = new Map<string, RiskScore>()
  
  incidents.forEach(incident => {
    const nearbyIncidents = findNearbyIncidents(incident, incidents)
    const riskScore = calculateRiskScore(incident, nearbyIncidents)
    results.set(incident.id, riskScore)
  })
  
  return results
}

/**
 * Get risk color for UI display
 */
export function getRiskColor(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-600 text-white'
    case 'high': return 'bg-red-500 text-white'
    case 'medium': return 'bg-yellow-500 text-white'
    case 'low': return 'bg-green-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
  return `${score}/100`
}
