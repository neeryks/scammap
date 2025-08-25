"use client"
import { useEffect, useRef } from 'react'

interface Props { lat: number; lon: number }

export default function MapClient({ lat, lon }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current || !containerRef.current) return

    // Simple container preparation
    const container = containerRef.current
    if (container.children.length > 0) {
      container.innerHTML = ''
    }

    // Dynamic import of Leaflet
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return // Double-check before proceeding
      // Fix Leaflet default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      try {
        // Create map
        mapRef.current = L.map(containerRef.current!).setView([lat, lon], 14)
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current)

        // Add marker for the incident location
        L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(mapRef.current)
        
      } catch (error) {
        console.warn('MapClient initialization failed:', error)
        return
      }
    })

    return () => {
      // Clean up map gently
      if (mapRef.current) {
        try {
          if (typeof mapRef.current.remove === 'function') {
            mapRef.current.remove()
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
        mapRef.current = null
      }
      
      // Minimal container cleanup with delay
      if (containerRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
          }
        }, 100)
      }
    }
  }, [lat, lon])

  return <div ref={containerRef} className="w-full h-full z-10" aria-label="Incident location map" />
}
