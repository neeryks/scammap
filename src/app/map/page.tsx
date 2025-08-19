"use client"
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { Report } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    fetch(`${baseUrl}/api/reports`)
      .then(r => r.json())
      .then(setReports)
      .catch(err => console.error('Failed to fetch reports:', err))
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dating': return 'bg-slate-500'
      case 'restaurant_overcharge': return 'bg-slate-500'
      case 'venue_scam': return 'bg-slate-600'
      case 'online_money': return 'bg-slate-500'
      default: return 'bg-slate-600'
    }
  }

  const formatCategory = (category: string) => {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Scam Map
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Interactive map showing reported incidents across India. Click on markers to view detailed incident information.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="h-[70vh] w-full overflow-hidden rounded-lg">
                  <Map
                    mapLib={maplibregl}
                    initialViewState={{ latitude: 20.5937, longitude: 78.9629, zoom: 4 }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="https://demotiles.maplibre.org/style.json"
                  >
                    <NavigationControl position="top-left" />
                    {reports
                      .filter(report => report.location && typeof report.location === 'object' && 'lat' in report.location)
                      .map((report) => (
                      <Marker 
                        key={report.id} 
                        latitude={(report.location as { lat: number; lon: number }).lat} 
                        longitude={(report.location as { lat: number; lon: number }).lon}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div 
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform ${getCategoryColor(report.category)}`}
                          title={`${formatCategory(report.category)} • Score: ${report.scam_meter_score}`}
                        />
                      </Marker>
                    ))}
                  </Map>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-sm">Dating/Romance Scams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-sm">Restaurant Overcharge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-sm">Venue Scams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-sm">Online/WhatsApp Scams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <span className="text-sm">Other</span>
                </div>
              </CardContent>
            </Card>
            
            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {formatCategory(selectedReport.category)}
                    </Badge>
                    <Badge variant="outline">
                      Score: {selectedReport.scam_meter_score}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Location</h4>
                    <p className="text-sm text-slate-600">
                      {selectedReport.city || 'Unknown City'}
                      {selectedReport.venue_name && ` • ${selectedReport.venue_name}`}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Description</h4>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {selectedReport.description}
                    </p>
                  </div>
                  {selectedReport.loss_amount_inr && (
                    <div>
                      <h4 className="font-medium text-sm">Financial Loss</h4>
                      <p className="text-sm text-slate-600">₹{selectedReport.loss_amount_inr.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
                  <div className="text-sm text-slate-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {reports.reduce((sum, r) => sum + (r.loss_amount_inr || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Total financial losses (₹)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round(reports.reduce((sum, r) => sum + r.scam_meter_score, 0) / reports.length) || 0}
                  </div>
                  <div className="text-sm text-slate-600">Avg Risk Score</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
