/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { Report } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import IncidentsSearch from '@/components/IncidentsSearch'
import PaginatedIncidents from '@/components/PaginatedIncidents'

async function getReports(searchParams: { category?: string, q?: string, limit?: string, offset?: string }): Promise<{ items: Report[], total: number }> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const params = new URLSearchParams()
  
  // Set default limit to 36 for pagination
  params.set('limit', searchParams.limit || '36')
  params.set('offset', searchParams.offset || '0')
  
  if (searchParams.category && searchParams.category !== 'all') {
    params.set('category', searchParams.category)
  }
  if (searchParams.q) {
    params.set('q', searchParams.q)
  }
  
  const res = await fetch(`${base}/api/reports?${params}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  const data = await res.json()
  return { items: data.items ?? data, total: data.total ?? (data.items ?? data).length }
}

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, limit?: string, offset?: string }> }) {
  const sp = await searchParams
  const category = sp.category || 'all'
  const searchQuery = sp.q || ''
  
  const { items: reports, total } = await getReports(sp)
  
  // Client-side filtering for search (if needed)
  let filteredReports = reports
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredReports = reports.filter(r => 
      (r.venue_name || '').toLowerCase().includes(query) ||
      (r.city || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query) ||
      (r.tactic_tags || []).join(' ').toLowerCase().includes(query)
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - matching homepage style */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Incident Reports
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
                Browse and search through community-reported incidents across India
              </p>
            </div>
            
            {/* Enhanced Search Bar - matching homepage */}
            <div className="relative z-50">
              <IncidentsSearch 
                defaultValue={searchQuery}
                category={category}
              />
            </div>
            
            {/* Active Filters */}
            {(category !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-slate-600">Active filters:</span>
                {category !== 'all' && (
                  <Badge className="px-3 py-1 bg-black text-white">
                    Category: {category.replace('-', ' ')}
                    <Link href="/incidents" className="ml-2 hover:text-gray-300">×</Link>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge className="px-3 py-1 bg-black text-white">
                    Search: "{searchQuery}"
                    <Link href="/incidents" className="ml-2 hover:text-gray-300">×</Link>
                  </Badge>
                )}
                <Link href="/incidents" className="text-sm text-slate-500 hover:text-slate-700 underline">
                  Clear all
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="space-y-8">
            {/* Results Summary */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  {total} incidents found
                  {category !== 'all' && ` in ${category.replace('-', ' ')}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
                {filteredReports.length > 0 && (
                  <div className="text-lg text-slate-600">
                    Total losses: ₹{filteredReports.reduce((sum, r) => sum + (r.loss_amount_inr || 0), 0).toLocaleString()}
                  </div>
                )}
              </div>
              <Link href="/report">
                <Button className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                  Report Incident
                </Button>
              </Link>
            </div>

            {/* Paginated Incident Cards */}
            <PaginatedIncidents 
              reports={filteredReports}
              total={total}
              category={category}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
