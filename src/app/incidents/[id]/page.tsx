import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, CreditCard, FileText, ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import MapClient from './MapClient'
import EvidenceGalleryClient from '@/components/EvidenceGalleryClient'
import { calculateRiskScore, findNearbyIncidents } from '@/lib/risk'
import type { Report } from '@/lib/types'

interface Evidence {
  id: string
  type: string
  storage_url: string
  hash?: string
  exif_removed?: boolean
  redactions_applied?: boolean
  pii_flags?: string[]
  ocr_text?: string
}

async function getReport(id: string): Promise<Report | null> {
  try {
    console.log('Fetching report:', id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/reports/${id}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    const data = await res.json()
    console.log('Report fetched successfully')
    return data
  } catch (error) {
    console.error('Error fetching report:', error)
    return null
  }
}

async function getAllReports(): Promise<Report[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/reports?limit=1000`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.items || []
  } catch (error) {
    console.error('Error fetching all reports:', error)
    return []
  }
}

async function getEvidence(evidenceIds: string[]): Promise<Evidence[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const evidencePromises = evidenceIds.map(async (id) => {
      const res = await fetch(`${baseUrl}/api/evidence/${id}`, {
        cache: 'no-store'
      })
      if (!res.ok) return null
      return await res.json()
    })
    
    const evidenceData = await Promise.all(evidencePromises)
    return evidenceData.filter(Boolean) as Evidence[]
  } catch (error) {
    console.error('Error fetching evidence:', error)
    return []
  }
}

export default async function IncidentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log('Page rendering with ID:', id)
  const report = await getReport(id)

  if (!report) {
    notFound()
  }

  // Fetch evidence data if evidence IDs exist
  const evidenceData = report.evidence_ids && report.evidence_ids.length > 0 
    ? await getEvidence(report.evidence_ids)
    : []

  // Get all reports for risk calculation
  const allReports = await getAllReports()
  
  // Calculate risk score if not already present
  let riskData = null
  if (report.risk_score !== undefined && report.risk_components) {
    riskData = {
      score: report.risk_score,
      components: report.risk_components,
      level: (report.risk_score >= 80 ? 'critical' :
             report.risk_score >= 60 ? 'high' :
             report.risk_score >= 40 ? 'medium' : 'low') as 'critical' | 'high' | 'medium' | 'low',
      insights: []
    }
  } else {
    // Calculate risk score with proper type conversion
    const convertedReport: Report = {
      ...report,
      category: report.category as any, // Type conversion needed
      tactic_tags: [],
      evidence_ids: report.evidence_ids || [],
      indicators: [],
      scam_meter_score: report.scam_meter_score || 0,
      reporter_visibility: 'anonymous'
    }
    const nearbyIncidents = findNearbyIncidents(convertedReport, allReports)
    riskData = calculateRiskScore(convertedReport, nearbyIncidents)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskLevel = (score?: number) => {
    if (!score) return { level: 'Unknown', color: 'bg-gray-500', variant: 'secondary' as const }
    if (score >= 90) return { level: 'High Risk', color: 'bg-red-500', variant: 'destructive' as const }
    if (score >= 70) return { level: 'Medium Risk', color: 'bg-orange-500', variant: 'default' as const }
    return { level: 'Low Risk', color: 'bg-green-500', variant: 'secondary' as const }
  }

  const riskInfo = getRiskLevel(report.scam_meter_score)

  // Get location coordinates and display info
  const getLocationInfo = () => {
    // If location is an object with coordinates, use those coordinates
    if (typeof report.location === 'object' && report.location && report.location.lat && report.location.lon) {
      return {
        coordinates: { lat: report.location.lat, lon: report.location.lon },
        displayLocation: `${report.location.lat.toFixed(4)}, ${report.location.lon.toFixed(4)}`,
        hasCoordinates: true,
        showVenue: false // Don't show venue in coordinates section when we have coordinates
      }
    }
    
    // If location is a string with coordinates (lat,lon format)
    if (typeof report.location === 'string' && report.location.includes(',')) {
      const coords = report.location.split(',')
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim())
        const lon = parseFloat(coords[1].trim())
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            coordinates: { lat, lon },
            displayLocation: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            hasCoordinates: true,
            showVenue: false
          }
        }
      }
    }
    
    // If no coordinates, fall back to venue name or other location info
    const displayLocation = report.venue_name || report.city || report.address || 
                          (typeof report.location === 'string' ? report.location : 'Unknown location')
    
    return {
      coordinates: null,
      displayLocation,
      hasCoordinates: false,
      showVenue: true // Show venue in location section when no coordinates
    }
  }

  const locationInfo = getLocationInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Map</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Badge variant="outline" className="capitalize bg-black text-white border-black">
                {report.category.replace('_', ' ').replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-slate-50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
                      {report.venue_name || report.city || 'Incident Report'}
                    </CardTitle>
                    {(report.city || report.address) && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{report.address || report.city}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>
                        Reported on {new Date(report.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  {(riskData || report.scam_meter_score) && (
                    <div className="text-center">
                      {riskData ? (
                        <>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {riskData.score}
                          </div>
                          <Badge className="text-xs bg-black text-white">
                            {riskData.level.charAt(0).toUpperCase() + riskData.level.slice(1)} Risk
                          </Badge>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {report.scam_meter_score}
                          </div>
                          <Badge className="text-xs bg-black text-white">
                            {riskInfo.level}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Incident Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {report.description}
                </p>
              </CardContent>
            </Card>

            {/* Financial Impact */}
            {report.loss_amount_inr && (
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    <span>Financial Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-red-50 via-red-100 to-orange-50 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 rounded-full translate-y-12 -translate-x-12" />
                    <div className="relative text-center">
                      <div className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                        Total Financial Loss
                      </div>
                      <div className="text-6xl font-bold text-red-800 mb-3">
                        {formatCurrency(report.loss_amount_inr)}
                      </div>
                      {report.payment_method && (
                        <div className="flex items-center justify-center space-x-2 text-red-600">
                          <span className="text-sm">Payment Method:</span>
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            {report.payment_method}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evidence */}
            {report.evidence_ids && report.evidence_ids.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Evidence & Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EvidenceGalleryClient evidence={evidenceData} />
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Report Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {report.outcome && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Outcome</span>
                        <Badge className="capitalize bg-black text-white">
                          {report.outcome.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="h-px bg-gray-200" />
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <Badge className="capitalize bg-black text-white">
                      {report.category.replace('_', ' ').replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Map Section */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {locationInfo.hasCoordinates ? (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Coordinates</div>
                      <div className="text-sm text-gray-900 font-medium font-mono">
                        {locationInfo.displayLocation}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Location</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {locationInfo.displayLocation}
                      </div>
                    </div>
                  )}
                  
                  {/* Only show venue as separate section when we have coordinates */}
                  {locationInfo.hasCoordinates && (report.venue_name || report.city) && (
                    <>
                      <div className="h-px bg-gray-200" />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Venue</div>
                        <div className="text-sm text-gray-900">
                          {report.venue_name || report.city}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {report.address && (
                    <>
                      <div className="h-px bg-gray-200" />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Address</div>
                        <div className="text-sm text-gray-900">
                          {report.address}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="h-px bg-gray-200" />
                  
                  {locationInfo.hasCoordinates && locationInfo.coordinates ? (
                    <div className="space-y-3">
                      <div className="rounded-lg overflow-hidden shadow-md border h-48">
                        <MapClient 
                          lat={locationInfo.coordinates.lat} 
                          lon={locationInfo.coordinates.lon} 
                        />
                      </div>
                      <Link
                        href={`https://www.google.com/maps?q=${locationInfo.coordinates.lat},${locationInfo.coordinates.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open in Google Maps</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">Precise location unavailable</p>
                      <p className="text-xs text-gray-400 mb-3">Only general location information available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Report ID</div>
                    <div className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border">
                      {report.id}
                    </div>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Date & Time</div>
                    <div className="text-sm text-gray-900">
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/report"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Report Similar Incident</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
