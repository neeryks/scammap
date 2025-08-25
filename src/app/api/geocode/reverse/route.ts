import { NextRequest } from 'next/server'

export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lon = parseFloat(searchParams.get('lon') || '')
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return new Response(JSON.stringify({ error: 'invalid_coords' }), { status: 400 })
  }
  try {
    // Photon reverse geocoding
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`;
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const resp = await fetch(url, { headers: { 'User-Agent': 'scammap/1.0 (https://scammap.local)' }, signal: controller.signal })
    clearTimeout(timeout)
    if (!resp.ok) {
      return new Response(JSON.stringify({ label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`, lat, lon }), { status: 200 })
    }
    const data = await resp.json() as any
    const f = data.features?.[0]
    const p = f?.properties || {}
    const label = p.name || p.label || [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ')
    const result = {
      label: label || `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      lat,
      lon,
      address: label,
      city: p.city || p.town || p.village || p.state,
    }
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json', 'Cache-Control': 'public, max-age=300, s-maxage=300' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`, lat, lon }), { status: 200 })
  }
}
