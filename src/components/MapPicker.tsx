"use client"

import { useEffect, useRef, useState } from 'react'
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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
  // onChange returns selected point (lat/lon) plus optional address/city from reverse geocode
  onChange?: (val: { lat: number; lon: number; address?: string; city?: string }) => void
  className?: string
  height?: number
}

// Minimal raster style using OpenStreetMap tiles
const osmRasterStyle: any = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export default function MapPicker({ lat, lon, address, onChange, className, height = 320 }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [center, setCenter] = useState<{ lat: number; lon: number }>(() => ({
    lat: lat ?? 28.6139, // Delhi default
    lon: lon ?? 77.209,
  }))
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<GeocodeItem[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: osmRasterStyle,
      center: [center.lon, center.lat],
      zoom: lat && lon ? 14 : 4,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.AttributionControl({ compact: true }))

  const marker = new maplibregl.Marker({ draggable: true, color: '#dc2626' })
      .setLngLat([center.lon, center.lat])
      .addTo(map)
    markerRef.current = marker

    const handleDragEnd = async () => {
      const lngLat = marker.getLngLat()
      const { lat: newLat, lng: newLon } = { lat: lngLat.lat, lng: lngLat.lng }
      await reverseGeocode(newLat, newLon)
    }
    marker.on('dragend', handleDragEnd)

    const handleClick = async (e: any) => {
      const [newLon, newLat] = [e.lngLat.lng, e.lngLat.lat]
      marker.setLngLat([newLon, newLat])
      await reverseGeocode(newLat, newLon)
    }
    map.on('click', handleClick)

    return () => {
      marker.remove()
      map.remove()
      markerRef.current = null
      mapRef.current = null
    }
  }, [])

  // External updates of lat/lon
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (typeof lat === 'number' && typeof lon === 'number') {
      markerRef.current.setLngLat([lon, lat])
      mapRef.current.setCenter([lon, lat])
    }
  }, [lat, lon])

  // Debounced search
  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
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

  const reverseGeocode = async (newLat: number, newLon: number) => {
    setCenter({ lat: newLat, lon: newLon })
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

  const selectResult = (item: GeocodeItem) => {
    if (!mapRef.current || !markerRef.current) return
    markerRef.current.setLngLat([item.lon, item.lat])
    mapRef.current.easeTo({ center: [item.lon, item.lat], zoom: 15 })
    onChange?.({ lat: item.lat, lon: item.lon, address: item.address || item.label, city: item.city })
    setSearch(item.label)
    setOpen(false)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const newLat = pos.coords.latitude
      const newLon = pos.coords.longitude
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLngLat([newLon, newLat])
        mapRef.current.easeTo({ center: [newLon, newLat], zoom: 15 })
      }
      await reverseGeocode(newLat, newLon)
    })
  }

  return (
    <div className={className}>
      <div className="flex gap-2 items-center mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={address || 'Search for a place, address…'}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950"
        />
        <button
          type="button"
          onClick={useMyLocation}
          className="h-10 shrink-0 rounded-md border border-slate-200 px-3 text-sm hover:bg-slate-50"
          title="Use my location"
        >
          📍
        </button>
      </div>
      {open && results.length > 0 && (
        <div className="z-20 mb-2 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow">
          {results.map((r, idx) => (
            <button
              key={`${r.lat}-${r.lon}-${idx}`}
              type="button"
              className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => selectResult(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      <div ref={mapContainerRef} style={{ height }} className="w-full rounded-md overflow-hidden border border-slate-200" />
      <div className="mt-2 text-xs text-slate-500">Map data © OpenStreetMap contributors</div>
    </div>
  )
}
