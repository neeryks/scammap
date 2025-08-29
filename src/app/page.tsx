import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SearchBar from '@/components/SearchBar'
import { AlertTriangle } from 'lucide-react'

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
  risk_score?: number
  tactic_tags?: string[]
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

function getRiskLevel(score: number) {
  if (score >= 80) return { label: 'High Risk', color: 'bg-red-500' }
  if (score >= 60) return { label: 'Medium Risk', color: 'bg-orange-500' }
  if (score >= 40) return { label: 'Low Risk', color: 'bg-yellow-500' }
  return { label: 'Very Low Risk', color: 'bg-green-500' }
}

export default async function Home() {
  const reports = await getRecentReports()
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                ScamMapper
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-8">
                Community-powered platform for reporting and tracking scams, unsafe venues, and consumer issues across India
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <SearchBar 
                placeholder="Search venues, cities, or scam types..."
                showLiveResults={true}
                size="large"
              />
            </div>
            
            {/* Single Total Cases Stat */}
            <div className="flex justify-center">
              <div className="text-center space-y-3 mt-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-slate-100 rounded-full">
                  <AlertTriangle className="w-10 h-10 text-slate-700" />
                </div>
                <div className="text-5xl font-bold text-slate-900 sm:text-6xl">{reports.length}</div>
                <div className="text-xl text-slate-600 font-medium">Total Cases Reported</div>
                <div className="text-sm text-slate-500">Help protect your community</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Recent Incident Reports
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Learn from community experiences and stay informed about the latest scam reports
              </p>
            </div>
            
            {/* Reports Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reports.length > 0 ? reports.map((report) => {
                const riskScore = report.risk_score || report.scam_meter_score || 0
                const riskLevel = getRiskLevel(riskScore)
                
                return (
                  <Link key={report.id} href={`/incidents/${report.id}`}>
                    <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 bg-white shadow-sm">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge className="bg-slate-900 text-white">
                            {formatCategory(report.category)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${riskLevel.color}`} />
                            <span className="text-xs text-slate-500">{riskScore}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <CardTitle className="text-lg leading-tight group-hover:text-slate-600 transition-colors line-clamp-2">
                            {report.venue_name || report.city || 'Unknown Location'}
                          </CardTitle>
                          {report.address && (
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {report.address}
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {report.description}
                        </p>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          {report.loss_amount_inr && (
                            <span className="font-medium text-red-600">
                              ₹{(report.loss_amount_inr / 1000).toFixed(0)}K loss
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }) : (
                Array.from({ length: 8 }, (_, i) => (
                  <Card key={i} className="h-full animate-pulse">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="h-6 w-20 bg-slate-200 rounded" />
                        <div className="h-4 w-8 bg-slate-200 rounded" />
                      </div>
                      <div className="h-6 w-3/4 bg-slate-200 rounded" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-2/3 bg-slate-200 rounded" />
                      </div>
                      <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            
            {/* View All Button */}
            <div className="text-center pt-8">
              <Link href="/incidents">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3">
                  View All Incidents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border p-8 sm:p-12 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-slate-900 rounded-full">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Help Protect Your Community
              </h2>
              <p className="text-lg text-slate-600">
                Report incidents to help others avoid scams and unsafe situations. Your contribution makes a difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/report">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3">
                    Report an Incident
                  </Button>
                </Link>
                <Link href="/map">
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    View Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
