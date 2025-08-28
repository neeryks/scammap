"use client"

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Report } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Search, Filter, MapPin, DollarSign, Calendar } from 'lucide-react'

// Map component that loads only on client side
const MapComponent = ({ reports, onMarkerClick }: { reports: Report[]; onMarkerClick: (report: Report) => void }) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const mapIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current || !containerRef.current) return

    // Simple container preparation
    const container = containerRef.current
    container.id = mapIdRef.current
    
    // Only clear if there are obvious signs of previous initialization
    if (container.children.length > 0) {
      container.innerHTML = ''
    }

    // Dynamic import of Leaflet
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return // Double-check before proceeding
      
      // Fix Leaflet default markers
      delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      try {
        mapRef.current = L.map(containerRef.current!, {
          preferCanvas: false,
          attributionControl: true,
          zoomControl: true
        }).setView([20.5937, 78.9629], 5)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current)
        
      } catch (error) {
        console.warn('Map initialization failed:', error)
        // Don't retry aggressively, just log the error
        return
      }
    })

    return () => {
      // Clean up markers first - be gentle with Leaflet objects
      markersRef.current.forEach(marker => {
        try {
          if (marker && typeof marker.remove === 'function') {
            marker.remove()
          }
        } catch {
          // Silently ignore cleanup errors
        }
      })
      markersRef.current = []
      
      // Clean up map - let Leaflet handle its own cleanup
      if (mapRef.current) {
        try {
          if (typeof mapRef.current.remove === 'function') {
            mapRef.current.remove()
          }
        } catch {
          // Silently ignore cleanup errors
        }
        mapRef.current = null
      }
      
      // Minimal container cleanup - don't touch Leaflet's internal properties during cleanup
      if (containerRef.current) {
        // Only clear HTML content, let Leaflet manage its own properties
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
          }
        }, 100) // Small delay to let Leaflet finish its cleanup
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    import('leaflet').then((L) => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add markers for reports
      reports.forEach(report => {
        const coords = getReportCoordinates(report)
        if (!coords) return

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer ${getCategoryColor(report.category)} flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
              ${report.scam_meter_score > 90 ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>' : ''}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const marker = L.marker([coords.lat, coords.lon], { icon })
          .addTo(mapRef.current!)
          .on('click', () => onMarkerClick(report))

        markersRef.current.push(marker)
      })
    })
  }, [reports, onMarkerClick])

  const getReportCoordinates = (report: Report) => {
    if (typeof report.location === 'object' && report.location && 'lat' in report.location) {
      return { lat: (report.location as any).lat, lon: (report.location as any).lon }
    }
    if (typeof report.location === 'string' && report.location.includes(',')) {
      const [lat, lon] = report.location.split(',').map(s => parseFloat(s.trim()))
      if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }
    }
    return null
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dating': return 'bg-pink-500'
      case 'restaurant_overcharge': return 'bg-orange-500'
      case 'venue_scam': return 'bg-red-500'
      case 'online_money': return 'bg-blue-500'
      default: return 'bg-slate-500'
    }
  }

  return <div ref={containerRef} className="absolute inset-0 rounded-lg overflow-hidden z-10" />
}

interface Filters {
  searchQuery: string
  category: string
  riskRange: [number, number]
  dateRange: string
  showVerified: boolean
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    category: 'all',
    riskRange: [0, 100],
    dateRange: 'all',
    showVerified: false
  })

  // Fetch reports
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    fetch(`${baseUrl}/api/reports`)
      .then(r => r.json())
      .then((data) => {
        const reportsData = data.items || data || []
        setReports(reportsData)
        setFilteredReports(reportsData)
      })
      .catch(err => console.error('Failed to fetch reports:', err))
  }, [])

  // Filter reports based on filters
  useEffect(() => {
    const filtered = reports.filter(r => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          (r.venue_name || '').toLowerCase().includes(query) ||
          (r.city || '').toLowerCase().includes(query) ||
          (r.address || '').toLowerCase().includes(query) ||
          (r.description || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== 'all' && r.category !== filters.category) return false

  // Risk range
      const riskScore = r.risk_score || r.scam_meter_score || 0
      if (riskScore < filters.riskRange[0] || riskScore > filters.riskRange[1]) return false


      // Date range
      if (filters.dateRange !== 'all') {
        const reportDate = new Date(r.created_at)
        const now = new Date()
        const daysAgo = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (filters.dateRange) {
          case '7': if (daysAgo > 7) return false; break
          case '30': if (daysAgo > 30) return false; break
          case '90': if (daysAgo > 90) return false; break
        }
      }

      return true
    })

    setFilteredReports(filtered)
  }, [reports, filters])

  const formatCategory = (category: string) => {
    return category.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const uniqueCategories = [...new Set(reports.map(r => r.category))]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Incident Map</h1>
              <p className="text-slate-600 mt-1">Interactive dashboard showing reported incidents across India</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {filteredReports.length} of {reports.length} incidents
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search venue, city, description..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {formatCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                <div>
                  <label className="text-sm font-medium mb-3 block">Risk Score Range</label>
                  <Slider
                    value={filters.riskRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, riskRange: value as [number, number] }))}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{filters.riskRange[0]}</span>
                    <span>{filters.riskRange[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>



                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    searchQuery: '',
                    category: 'all',
                    riskRange: [0, 100],
                    dateRange: 'all',
                    showVerified: false
                  })}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="h-[70vh] w-full relative">
                  {typeof window !== 'undefined' && (
                    <MapComponent 
                      reports={filteredReports} 
                      onMarkerClick={setSelectedReport}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Report Details */}
            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Incident Details</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-black text-white">
                      {formatCategory(selectedReport.category)}
                    </Badge>
                    {selectedReport.risk_score ? (
                      <Badge className={`text-white ${
                        selectedReport.risk_score >= 80 ? 'bg-red-600' : 
                        selectedReport.risk_score >= 60 ? 'bg-orange-500' :
                        selectedReport.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        Risk: {selectedReport.risk_score}/100
                      </Badge>
                    ) : selectedReport.scam_meter_score ? (
                      <Badge className={`text-white ${
                        selectedReport.scam_meter_score >= 80 ? 'bg-red-600' : 
                        selectedReport.scam_meter_score >= 60 ? 'bg-orange-500' :
                        selectedReport.scam_meter_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        Risk: {selectedReport.scam_meter_score}/100
                      </Badge>
                    ) : null}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                        <MapPin className="h-4 w-4" />
                        Location
                      </h4>
                      <p className="text-sm text-slate-600">
                        {selectedReport.venue_name && `${selectedReport.venue_name} • `}
                        {selectedReport.city || 'Unknown City'}
                        {selectedReport.address && (
                          <span className="block text-xs text-slate-500 mt-1">
                            {selectedReport.address}
                          </span>
                        )}
                      </p>
                    </div>

                    {selectedReport.loss_amount_inr && (
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4" />
                          Financial Loss
                        </h4>
                        <p className="text-sm text-slate-600">₹{selectedReport.loss_amount_inr.toLocaleString()}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                        <Calendar className="h-4 w-4" />
                        Reported
                      </h4>
                      <p className="text-sm text-slate-600">
                        {new Date(selectedReport.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/incidents/${selectedReport.id}`, '_blank')}
                  >
                    View Full Report →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
