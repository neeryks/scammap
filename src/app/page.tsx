import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SearchBar from '@/components/SearchBar'

interface Report {
  id: string
  created_at: string
  category: string
  description: string
  loss_amount_inr?: number
  venue_name?: string
  city?: string
  address?: string
  scam_meter_score?: number
}

async function getRecentReports(): Promise<Report[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/reports?limit=12`, { 
      cache: 'no-store' 
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return []
  }
}

function formatCategory(category: string): string {
  return category.split(/[-_]/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default async function Home() {
  const reports = await getRecentReports()
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved spacing */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                ScamMapper
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
                Community-powered platform to report and track dating scams, venue traps, and restaurant overcharging across India
              </p>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="mx-auto max-w-xl relative z-50">
              <SearchBar 
                placeholder="Search by venue, city, or scam type..."
                showLiveResults={true}
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Centered Total Reports */}
      <div className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-center">
            <Card className="border-0 bg-white shadow-xl max-w-md w-full">
              <CardContent className="p-12 text-center">
                <div className="text-6xl font-bold text-slate-900 mb-4">{reports.length}</div>
                <div className="text-xl text-slate-600 font-medium">Total Reports</div>
                <div className="text-sm text-slate-500 mt-2">
                  Community incidents across India
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Reports Section */}
      <div className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Recent Incident Reports
          </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Learn from community experiences. These are the latest scam reports from across India.
              </p>
            </div>
            
            {/* Enhanced 12-Card Grid - matching incidents page style */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reports.length > 0 ? reports.map((report) => (
                <Link key={report.id} href={`/incidents/${report.id}`}>
                  <Card className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    {/* Gradient overlay for high-risk incidents */}
                    {report.scam_meter_score && report.scam_meter_score > 90 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 pointer-events-none" />
                    )}
                    
                    <CardHeader className="pb-4 relative">
                      <div className="flex items-start justify-between mb-3">
                        <Badge 
                          variant={
                            report.scam_meter_score && report.scam_meter_score > 90 ? "default" : 
                            report.scam_meter_score && report.scam_meter_score > 80 ? "secondary" : 
                            "outline"
                          }
                          className="text-xs font-semibold px-3 py-1"
                        >
                          {formatCategory(report.category)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-bold group-hover:text-slate-600 transition-colors line-clamp-2">
                          {report.venue_name || report.city || 'Unknown location'}
                        </CardTitle>
                        {report.address && (
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                            {report.address}
                          </div>
                        )}
                        {report.scam_meter_score && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${
                                report.scam_meter_score > 90 ? 'bg-slate-600' : 
                                report.scam_meter_score > 80 ? 'bg-slate-500' : 
                                'bg-slate-400'
                              }`} />
                              <span className="font-semibold text-slate-700">Risk: {report.scam_meter_score}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Impact:
                            <span className="ml-1 font-semibold text-slate-800">
                              {report.loss_amount_inr ? `₹${report.loss_amount_inr.toLocaleString()}` : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                            <span className="text-xs">View details</span>
                            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )) : (
                // Fallback placeholder cards if no data
                Array.from({ length: 12 }, (_, i) => (
                  <Card key={i} className="border-0 bg-white shadow-lg">
                    <CardHeader className="pb-4">
                      <Badge variant="outline" className="text-xs font-semibold px-3 py-1 w-fit">
                        Loading...
                      </Badge>
                      <CardTitle className="text-lg font-bold text-slate-400">
                        Loading incident data...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-slate-400">
                        Please wait while we load the latest reports
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            {/* View All Button - only shows when there are 12 or more reports */}
            {reports.length >= 12 && (
              <div className="text-center pt-8">
                <Link href="/incidents">
                  <Button 
                    size="lg"
                    className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    View All Incidents
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
