"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type GeocodeItem = {
  label: string
  lat: number
  lon: number
  address?: string
  city?: string
}

export interface MapPickerProps {
  lat?: number
  lon?: number
  address?: string
  onChange?: (val: { lat: number; lon: number; address?: string; city?: string }) => void
  className?: string
  height?: number
}

// Map component that loads only on client side
const LeafletMapPicker = ({ lat, lon, address, onChange, height = 320 }: { lat?: number; lon?: number; address?: string; onChange?: (val: { lat: number; lon: number; address?: string; city?: string }) => void; height?: number }) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapIdRef = useRef<string>(`map-${Math.random().toString(36).substr(2, 9)}`)

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
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const initialLat = lat ?? 28.6139 // Delhi default
      const initialLon = lon ?? 77.209

      try {
        mapRef.current = L.map(containerRef.current!).setView([initialLat, initialLon], lat && lon ? 14 : 5)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current)

        // Create draggable marker
        markerRef.current = L.marker([initialLat, initialLon], { 
          draggable: true,
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

        // Handle marker drag
        markerRef.current.on('dragend', async (e: any) => {
          const { lat: newLat, lng: newLon } = e.target.getLatLng()
          await reverseGeocode(newLat, newLon)
        })

        // Handle map click
        mapRef.current.on('click', async (e: any) => {
          const { lat: newLat, lng: newLon } = e.latlng
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLon])
          }
          await reverseGeocode(newLat, newLon)
        })
        
      } catch (error) {
        console.warn('MapPicker initialization failed:', error)
        return
      }
    })

    return () => {
      // Clean up marker gently
      if (markerRef.current) {
        try {
          if (typeof markerRef.current.remove === 'function') {
            markerRef.current.remove()
          }
        } catch (e) {
          // Silently ignore cleanup errors
        }
        markerRef.current = null
      }
      
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
  }, [])

  // Update marker position when lat/lon props change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (typeof lat === 'number' && typeof lon === 'number') {
      markerRef.current.setLatLng([lat, lon])
      mapRef.current.setView([lat, lon], 14)
    }
  }, [lat, lon])

  const reverseGeocode = async (newLat: number, newLon: number) => {
    try {
      const resp = await fetch(`/api/geocode?lat=${newLat}&lon=${newLon}`)
      if (resp.ok) {
        const data = await resp.json()
        onChange?.({ lat: newLat, lon: newLon, address: data.address || data.label, city: data.city })
      } else {
        onChange?.({ lat: newLat, lon: newLon })
      }
    } catch {
      onChange?.({ lat: newLat, lon: newLon })
    }
  }

  return <div ref={containerRef} style={{ height }} className="w-full rounded-md overflow-hidden border border-slate-200 z-10" />
}

export default function MapPicker({ lat, lon, address, onChange, className, height = 320 }: MapPickerProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<GeocodeItem[]>([])

  // Debounced search
  useEffect(() => {
    if (!search.trim()) { 
      setResults([])
      setOpen(false)
      return 
    }
    const id = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/geocode?q=${encodeURIComponent(search)}`)
        if (resp.ok) {
          const items = await resp.json()
          setResults(Array.isArray(items) ? items : [])
          setOpen(true)
        } else {
          setResults([])
        }
      } catch (e) {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  const selectResult = (item: GeocodeItem) => {
    onChange?.({ lat: item.lat, lon: item.lon, address: item.address || item.label, city: item.city })
    setSearch(item.label)
    setOpen(false)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const newLat = pos.coords.latitude
      const newLon = pos.coords.longitude
      onChange?.({ lat: newLat, lon: newLon })
    })
  }

  return (
    <div className={className}>
      <div className="flex gap-2 items-center mb-2">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={address || 'Search for a place, address…'}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={useMyLocation}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          📍
        </Button>
      </div>
      
      {open && results.length > 0 && (
        <div className="relative z-20 mb-2 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {results.map((r, idx) => (
            <button
              key={`${r.lat}-${r.lon}-${idx}`}
              type="button"
              className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              onClick={() => selectResult(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      
      {typeof window !== 'undefined' && (
        <LeafletMapPicker 
          lat={lat} 
          lon={lon} 
          address={address} 
          onChange={onChange} 
          height={height}
        />
      )}
      
      <div className="mt-2 text-xs text-slate-500">
        Click on the map or drag the marker to set location. Map data © OpenStreetMap contributors
      </div>
    </div>
  )
}
