"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Report } from '@/lib/types'

// Fix Leaflet default markers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface LeafletMapProps {
  reports: Report[]
  onMarkerClick: (report: Report) => void
}

export default function LeafletMap({ reports, onMarkerClick }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    
    mapRef.current = L.map(containerRef.current).setView([20.5937, 78.9629], 5)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update map markers
  useEffect(() => {
    if (!mapRef.current) return

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
            ${getRiskIndicator(report)}
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
      case 'dating-romance': return 'bg-pink-500'
      case 'investment-crypto': return 'bg-purple-500'
      case 'online-shopping': return 'bg-blue-500'
      case 'overcharging': return 'bg-orange-500'
      case 'phishing': return 'bg-red-500'
      case 'tech-support': return 'bg-yellow-500'
      case 'employment': return 'bg-green-500'
      case 'rental-real-estate': return 'bg-indigo-500'
      default: return 'bg-slate-500'
    }
  }

  const getRiskIndicator = (report: Report) => {
    const riskScore = report.risk_score || report.scam_meter_score
    if (!riskScore) return ''
    
    if (riskScore >= 80) {
      return '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white"></div>'
    } else if (riskScore >= 60) {
      return '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>'
    } else if (riskScore >= 40) {
      return '<div class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>'
    }
    return ''
  }

  return <div ref={containerRef} className="absolute inset-0 rounded-lg overflow-hidden" />
}
