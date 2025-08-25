/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { Report } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import IncidentsSearch from '@/components/IncidentsSearch'

async function getReports(): Promise<Report[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/reports`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  const data = await res.json()
  return data.items ?? data
}

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const sp = await searchParams
  const category = sp.category || 'all'
  const searchQuery = sp.q || ''
  const all = await getReports()
  
  let list = all
  if (category !== 'all') {
    list = list.filter(r => r.category === category)
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    list = list.filter(r => 
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
                  <Badge variant="secondary" className="px-3 py-1">
                    Category: {category.replace('-', ' ')}
                    <Link href="/incidents" className="ml-2 hover:text-slate-700">×</Link>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Search: "{searchQuery}"
                    <Link href="/incidents" className="ml-2 hover:text-slate-700">×</Link>
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

      {/* Stats Section - Centered Total Reports */}
      <div className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-center">
            <Card className="border-0 bg-white shadow-xl max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="text-5xl font-bold text-slate-900 mb-3">{all.length}</div>
                <div className="text-lg text-slate-600 font-medium">Total Reports</div>
                <div className="text-sm text-slate-500 mt-2">
                  Community incidents across India
                </div>
              </CardContent>
            </Card>
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
                  Showing {list.length} of {all.length} incidents
                  {category !== 'all' && ` in ${category.replace('-', ' ')}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
                {list.length > 0 && (
                  <div className="text-lg text-slate-600">
                    Total losses: ₹{list.reduce((sum, r) => sum + (r.loss_amount_inr || 0), 0).toLocaleString()}
                  </div>
                )}
              </div>
              <Link href="/report">
                <Button className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                  Report Incident
                </Button>
              </Link>
            </div>

            
            {/* Incident Cards - matching homepage style */}
            {list.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map(r => (
                  <Link key={r.id} href={`/incidents/${r.id}`}>
                    <Card className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      {/* Gradient overlay for high-risk incidents */}
                      {r.scam_meter_score > 90 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 pointer-events-none" />
                      )}
                      
                      <CardHeader className="pb-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <Badge 
                            variant={r.scam_meter_score > 90 ? "default" : r.scam_meter_score > 80 ? "secondary" : "outline"}
                            className="text-xs font-semibold px-3 py-1"
                          >
                            {r.category.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <CardTitle className="text-lg font-bold group-hover:text-slate-600 transition-colors line-clamp-2">
                            {r.venue_name || r.city || 'Unknown location'}
                          </CardTitle>
                          {r.address && (
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                              <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                              {r.address}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${
                                r.scam_meter_score > 90 ? 'bg-slate-600' : 
                                r.scam_meter_score > 80 ? 'bg-slate-500' : 
                                'bg-slate-400'
                              }`} />
                              <span className="font-semibold text-slate-700">Risk: {r.scam_meter_score}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-slate-600 mb-4">
                          {r.description}
                        </CardDescription>
                        
                        {r.tactic_tags && r.tactic_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {r.tactic_tags.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs px-2 py-1">
                                {tag}
                              </Badge>
                            ))}
                            {r.tactic_tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                +{r.tactic_tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Impact:
                            <span className="ml-1 font-semibold text-slate-800">
                              {r.loss_amount_inr ? `₹${r.loss_amount_inr.toLocaleString()}` : 
                               r.loss_type === 'emotional' ? 'Emotional distress' :
                               r.loss_type === 'time' ? 'Time wasted' :
                               r.loss_type === 'personal-data' ? 'Data compromised' :
                               r.loss_type === 'harassment' ? 'Harassment' :
                               r.loss_type === 'reputation' ? 'Reputation damage' :
                               r.loss_type === 'privacy' ? 'Privacy violation' :
                               r.loss_type === 'multiple' ? 'Multiple impacts' :
                               'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                            <span className="text-xs">View details</span>
                            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-white shadow-lg p-16 text-center">
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-6xl opacity-20">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl text-slate-900">No incidents found</CardTitle>
                      <CardDescription className="text-lg max-w-md mx-auto text-slate-600">
                        {searchQuery || category !== 'all' 
                          ? "Try adjusting your search terms or clearing filters"
                          : "No incidents have been reported yet"
                        }
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {(searchQuery || category !== 'all') && (
                        <Link href="/incidents">
                          <Button variant="outline" className="h-12 px-8 font-semibold border-2">
                            Clear Filters
                          </Button>
                        </Link>
                      )}
                      <Link href="/report">
                        <Button className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                          Report First Incident
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
