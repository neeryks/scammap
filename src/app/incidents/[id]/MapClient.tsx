"use client"
import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props { lat: number; lon: number }

export default function MapClient({ lat, lon }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const map = new maplibregl.Map({
      container: ref.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lon, lat],
      zoom: 14
    })
    const marker = new maplibregl.Marker({ color: '#334155' }).setLngLat([lon, lat]).addTo(map)
    return () => { marker.remove(); map.remove() }
  }, [lat, lon])
  return <div ref={ref} className="w-full h-full" aria-label="Incident location map" />
}
