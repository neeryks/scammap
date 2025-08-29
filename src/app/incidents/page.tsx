import Link from 'next/link'
import { Report } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import IncidentsSearch from '@/components/IncidentsSearch'
import PaginatedIncidents from '@/components/PaginatedIncidents'
import { Filter, AlertTriangle } from 'lucide-react'

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

function formatCategory(category: string): string {
  return category.split(/[-_]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Incident Reports
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-8">
                Browse and search through community-reported incidents to stay informed and protected
              </p>
            </div>
            
            {/* Search Component */}
            <div className="mx-auto max-w-2xl">
              <IncidentsSearch 
                defaultValue={searchQuery}
                category={category}
              />
            </div>
            
            {/* Active Filters */}
            {(category !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Active filters:</span>
                </div>
                {category !== 'all' && (
                  <Badge className="bg-slate-900 text-white px-3 py-1">
                    {formatCategory(category)}
                    <Link href="/incidents" className="ml-2 hover:text-slate-300 text-xs">✕</Link>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge className="bg-slate-900 text-white px-3 py-1">
                    "{searchQuery}"
                    <Link href="/incidents" className="ml-2 hover:text-slate-300 text-xs">✕</Link>
                  </Badge>
                )}
                <Link href="/incidents" className="text-sm text-slate-500 hover:text-slate-700 underline">
                  Clear all
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full shadow-sm border">
                <AlertTriangle className="w-10 h-10 text-slate-700" />
              </div>
              <div className="text-5xl font-bold text-slate-900 sm:text-6xl">{total}</div>
              <div className="text-xl text-slate-600 font-medium">Total Incidents</div>
              <div className="text-sm text-slate-500">Community reported cases</div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {filteredReports.length} incidents found
                  {category !== 'all' && ` in ${formatCategory(category)}`}
                </h2>
                <p className="text-slate-600">
                  Showing the most recent reports from the community
                </p>
              </div>
              <Link href="/report">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3">
                  Report New Incident
                </Button>
              </Link>
            </div>

            <Separator />

            {/* Paginated Results */}
            <PaginatedIncidents 
              reports={filteredReports}
              total={total}
              category={category}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
