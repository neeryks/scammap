import { NextRequest, NextResponse } from 'next/server'

// Simple proxy to Nominatim for forward & reverse geocoding
// Rate limiting simplistic (in-memory) to avoid abuse during development
const windowMs = 60_000
const maxPerWindow = 30
let hits: Array<{ ts: number }> = []

export async function GET(req: NextRequest) {
  const now = Date.now()
  hits = hits.filter(h => now - h.ts < windowMs)
  if (hits.length >= maxPerWindow) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  hits.push({ ts: now })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  let url: string | null = null
  if (q) {
    url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`
  } else if (lat && lon) {
    url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
  } else {
    return NextResponse.json({ error: 'Provide q or lat & lon' }, { status: 400 })
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ScamMap/1.0 (+contact)' } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
    }
    const data = await res.json()
    
    // Transform for consistent API
    if (lat && lon) {
      // Reverse geocode - return single item with standardized fields
      return NextResponse.json({ 
        label: data.display_name || 'Unknown location',
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown'
      })
    } else {
      // Forward search - return array with standardized fields
      const items = Array.isArray(data) ? data.map((item: any) => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name,
        city: item.display_name.split(',')[0]?.trim() || 'Unknown'
      })) : []
      return NextResponse.json(items)
    }
  } catch (e) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
