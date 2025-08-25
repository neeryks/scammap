import { NextRequest } from 'next/server'

export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10) || 5, 10)
  if (!q) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' } })
  }
  try {
    // Photon (komoot) geocoding (open-source, OSM)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=en`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const resp = await fetch(url, { headers: { 'User-Agent': 'scammap/1.0 (https://scammap.local)' }, signal: controller.signal })
    clearTimeout(timeout)
    if (!resp.ok) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' } })
    }
    const data = await resp.json() as any
    const items = (data.features || []).map((f: any) => {
      const p = f.properties || {}
      const label = p.name || p.label || [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ')
      return {
        label,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
        address: label,
        city: p.city || p.town || p.village || p.state,
      }
    }).filter((x: any) => typeof x.lat === 'number' && typeof x.lon === 'number')
    return new Response(JSON.stringify(items), { status: 200, headers: { 'content-type': 'application/json', 'Cache-Control': 'public, max-age=60, s-maxage=60' } })
  } catch (e: any) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' } })
  }
}
