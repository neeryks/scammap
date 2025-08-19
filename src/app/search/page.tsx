import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Report } from '@/lib/types'

async function getReports(q: string, category?: string): Promise<Report[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reports`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  const data: Report[] = await res.json()
  const query = q.toLowerCase()
  return data.filter((r: Report) =>
    (!category || category === 'all' || r.category === category) && (
    (r.venue_name || '').toLowerCase().includes(query) ||
    (r.city || '').toLowerCase().includes(query) ||
    (r.tactic_tags || []).join(' ').toLowerCase().includes(query)
  ))
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const sp = await searchParams
  const q = sp.q || ''
  const category = sp.category || 'all'
  const results: Report[] = q ? await getReports(q, category) : []
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Results</h1>
          <p className="text-slate-600">
            {q ? (
              <>
                Showing results for "<span className="font-medium">{q}</span>"
                {category !== 'all' && <> in <span className="font-medium">{category.replace(/-/g, ' ')}</span></>}
              </>
            ) : (
              "Enter a search term to find incidents"
            )}
          </p>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          {q && results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
                <p className="text-slate-500">
                  Try adjusting your search terms or browse all incidents.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((report) => (
                <Link key={report.id} href={`/incidents/${report.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {report.venue_name || report.city || 'Unknown Location'}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {report.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge 
                              variant={report.scam_meter_score >= 8 ? "destructive" : 
                                     report.scam_meter_score >= 6 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              Risk Score: {report.scam_meter_score}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                        {report.description}
                      </p>
                      {report.tactic_tags && report.tactic_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {report.tactic_tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {report.tactic_tags.length > 3 && (
                            <span className="text-xs text-slate-500 px-2 py-1">
                              +{report.tactic_tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
