import { NextRequest, NextResponse } from 'next/server'
import { listReports } from '@/lib/storage'
import type { Report } from '@/lib/types'

// Shape per spec
// {
//   totalMatches: number,
//   groups: {
//     venues: [{id, name, count}],
//     cities: [{name, count}],
//     types: [{name, count}],
//     posts: [{id, title, city, type}]
//   }
// }

// Single GET handler (deduplicated) implementing grouped search contract
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  if (!q) {
    return NextResponse.json({
      totalMatches: 0,
      groups: { venues: [], cities: [], types: [], posts: [] }
    }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const { items } = await listReports({ limit: 500 })
  const reports = items as Report[]

  const matched: Report[] = []
  for (const r of reports) {
    const hay = [r.venue_name, r.city, r.category, r.description].filter(Boolean).join(' ').toLowerCase()
    if (hay.includes(q)) matched.push(r)
  }

  const venueMap = new Map<string, { id: string; name: string; count: number }>()
  const cityMap = new Map<string, { name: string; count: number }>()
  const typeMap = new Map<string, { name: string; count: number }>()

  matched.forEach(r => {
    if (r.venue_name) {
      const key = r.venue_name
      const existing = venueMap.get(key) || { id: key, name: key, count: 0 }
      existing.count++
      venueMap.set(key, existing)
    }
    if (r.city) {
      const key = r.city
      const existing = cityMap.get(key) || { name: key, count: 0 }
      existing.count++
      cityMap.set(key, existing)
    }
    if (r.category) {
      const key = r.category
      const existing = typeMap.get(key) || { name: key, count: 0 }
      existing.count++
      typeMap.set(key, existing)
    }
  })

  const venues = Array.from(venueMap.values()).sort((a,b)=>b.count-a.count).slice(0,5)
  const cities = Array.from(cityMap.values()).sort((a,b)=>b.count-a.count).slice(0,5)
  const types = Array.from(typeMap.values()).sort((a,b)=>b.count-a.count).slice(0,5)
  const posts = matched.slice(0,5).map(r => ({ id: r.id, title: r.venue_name || r.city || 'Report', city: r.city, type: r.category }))

  return NextResponse.json({
    totalMatches: matched.length,
    groups: { venues, cities, types, posts }
  }, { headers: { 'Cache-Control': 'no-store' } })
}
