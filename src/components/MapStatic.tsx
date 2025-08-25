"use client"

import { useEffect, useRef } from 'react'
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl'

export interface MapStaticProps {
  lat: number
  lon: number
  height?: number
  zoom?: number
  className?: string
}

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
    { id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
  ],
}

export default function MapStatic({ lat, lon, height = 200, zoom = 14, className }: MapStaticProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: ref.current,
      style: osmRasterStyle,
      center: [lon, lat],
      zoom,
      attributionControl: false,
      interactive: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.AttributionControl({ compact: true }))
    const marker = new maplibregl.Marker().setLngLat([lon, lat]).addTo(map)
    markerRef.current = marker
    return () => {
      marker.remove()
      map.remove()
      markerRef.current = null
      mapRef.current = null
    }
  }, [lat, lon, zoom])

  return <div ref={ref} style={{ height }} className={className || 'w-full rounded-md overflow-hidden border border-slate-200'} />
}
