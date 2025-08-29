import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  CalendarDays, 
  CreditCard, 
  FileText, 
  ArrowLeft, 
  ExternalLink, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Clock,
  Building,
  IndianRupee,
  Hash
} from 'lucide-react'
import MapClient from './MapClient'
import EvidenceGalleryClient from '@/components/EvidenceGalleryClient'
import ShareButton from '@/components/ShareButton'
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCategory(category: string): string {
  return category.split(/[-_]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getRiskLevel(score: number) {
  if (score >= 80) return { label: 'High Risk', color: 'bg-red-500', textColor: 'text-red-700' }
  if (score >= 60) return { label: 'Medium Risk', color: 'bg-orange-500', textColor: 'text-orange-700' }
  if (score >= 40) return { label: 'Low Risk', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
  return { label: 'Very Low Risk', color: 'bg-green-500', textColor: 'text-green-700' }
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
      category: report.category as any,
      tactic_tags: [],
      evidence_ids: report.evidence_ids || [],
      indicators: [],
      scam_meter_score: report.scam_meter_score || 0,
      reporter_visibility: 'anonymous'
    }
    const nearbyIncidents = findNearbyIncidents(convertedReport, allReports)
    riskData = calculateRiskScore(convertedReport, nearbyIncidents)
  }

  // Get location coordinates and display info
  const getLocationInfo = () => {
    if (typeof report.location === 'object' && report.location && report.location.lat && report.location.lon) {
      return {
        coordinates: { lat: report.location.lat, lon: report.location.lon },
        displayLocation: `${report.location.lat.toFixed(4)}, ${report.location.lon.toFixed(4)}`,
        hasCoordinates: true
      }
    }
    
    if (typeof report.location === 'string' && report.location.includes(',')) {
      const coords = report.location.split(',')
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim())
        const lon = parseFloat(coords[1].trim())
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            coordinates: { lat, lon },
            displayLocation: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            hasCoordinates: true
          }
        }
      }
    }
    
    const displayLocation = report.venue_name || report.city || report.address || 
                          (typeof report.location === 'string' ? report.location : 'Unknown location')
    
    return {
      coordinates: null,
      displayLocation,
      hasCoordinates: false
    }
  }

  const locationInfo = getLocationInfo()
  const riskScore = riskData?.score || report.scam_meter_score || 0
  const riskLevel = getRiskLevel(riskScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
      
      {/* Navigation Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/incidents" 
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Incidents</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                <Building className="h-3 w-3 mr-1" />
                {formatCategory(report.category)}
              </Badge>
            </div>
            <ShareButton
              title="Incident Report - ScamMapper"
              text={`Check out this incident report: ${report.venue_name || 'Unknown location'}`}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Two-column layout: Main content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 bg-slate-100">
                    <AvatarFallback className="text-slate-600 font-semibold text-lg">
                      {(report.venue_name || report.city || 'IR').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl sm:text-3xl text-slate-900 leading-tight">
                      {report.venue_name || report.city || 'Incident Report'}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 mt-1">
                      {report.address || report.city || 'Location details unavailable'}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {formatCategory(report.category)}
                    </Badge>
                  </div>
                  {report.outcome && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <Badge variant="outline" className="border-slate-300">
                        {formatCategory(report.outcome)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Description Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Incident Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  {report.description}
                </p>
              </CardContent>
            </Card>

            {/* Financial Impact Card */}
            {report.loss_amount_inr && (
              <Card className="shadow-sm border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-red-800">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    Financial Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <IndianRupee className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-700">Total Loss Amount</div>
                        <div className="text-xl font-bold text-red-800">
                          {formatCurrency(report.loss_amount_inr)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {report.payment_method && (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="text-sm font-medium text-red-700 mb-2">Payment Method</div>
                      <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                        {report.payment_method}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evidence Card */}
            {evidenceData.length > 0 && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-slate-600" />
                    Evidence & Documentation
                  </CardTitle>
                  <CardDescription>
                    {evidenceData.length} item{evidenceData.length !== 1 ? 's' : ''} attached
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EvidenceGalleryClient evidence={evidenceData} />
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Risk Score Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {riskScore}
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${riskLevel.color}`} />
                  <span className="text-sm font-medium text-slate-600">
                    {riskLevel.label}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Location Details Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-1">
                    {locationInfo.hasCoordinates ? 'Coordinates' : 'Location'}
                  </div>
                  <div className="text-sm text-slate-900 font-mono">
                    {locationInfo.displayLocation}
                  </div>
                </div>
                
                {report.venue_name && locationInfo.hasCoordinates && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-700 mb-1">Venue</div>
                    <div className="text-sm text-slate-900">{report.venue_name}</div>
                  </div>
                )}
                
                {report.address && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-700 mb-1">Address</div>
                    <div className="text-sm text-slate-900">{report.address}</div>
                  </div>
                )}

                {locationInfo.hasCoordinates && locationInfo.coordinates ? (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border aspect-video bg-slate-100">
                      <MapClient 
                        lat={locationInfo.coordinates.lat} 
                        lon={locationInfo.coordinates.lon} 
                      />
                    </div>
                    <Link
                      href={`https://www.google.com/maps?q=${locationInfo.coordinates.lat},${locationInfo.coordinates.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Location unavailable</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Metadata Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-5 w-5 text-slate-600" />
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">Report ID</div>
                  <div className="text-xs font-mono bg-white p-2 rounded border break-all text-slate-700">
                    {report.id}
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-1">Created</div>
                  <div className="text-sm text-slate-900">
                    {new Date(report.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/report"
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Similar Incident
              </Link>
              <Link 
                href="/incidents"
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-300 font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                View All Incidents
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
