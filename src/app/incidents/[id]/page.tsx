import { Report } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

async function getReports(): Promise<Report[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/reports`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }
  return res.json()
}

export default async function IncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getReports()
  const r = all.find(x => x.id === id)
  
  if (!r) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center space-y-6">
            <div className="text-8xl opacity-20">
              <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900">Incident Not Found</h1>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                The incident you&apos;re looking for doesn&apos;t exist or has been removed from our database.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" href="/incidents" className="px-8">
                Browse All Incidents
              </Button>
              <Button href="/report" className="px-8">
                Report New Incident
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" href="/incidents" className="h-9 px-3 hover:bg-slate-100">
                ← Back to Incidents
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <Badge variant="outline" className="capitalize font-medium">
                {r.category.replace('-', ' ')}
              </Badge>
            </div>
            {r.verification_status === 'evidence_backed' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Verified Report</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                  {r.venue_name || r.city || 'Incident Report'}
                </h1>
                {(r.city || r.address) && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-base">{r.address || r.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Reported {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>Report ID: {r.id}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risk Score</div>
                    <div className="text-6xl font-bold text-slate-900">{r.scam_meter_score}</div>
                    <Badge 
                      variant={r.scam_meter_score > 90 ? "destructive" : r.scam_meter_score > 80 ? "default" : "secondary"}
                      className="text-sm px-4 py-1"
                    >
                      {r.scam_meter_score > 90 ? 'High Risk' : r.scam_meter_score > 80 ? 'Medium Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Primary Content */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Description */}
              <Card className="border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    What Happened
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg leading-relaxed text-slate-700">{r.description}</p>
                </CardContent>
              </Card>

              {/* Impact & Loss Information */}
              <Card className="border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    Impact & Losses
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-4">
                    {r.loss_amount_inr && (
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-red-700">Financial Loss</span>
                        <span className="text-lg font-bold text-red-900">₹{r.loss_amount_inr.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {r.loss_type && r.loss_type !== 'financial' && (
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Primary Impact</span>
                        <span className="text-sm font-semibold text-slate-900 capitalize">
                          {r.loss_type === 'emotional' ? 'Emotional Distress' :
                           r.loss_type === 'time' ? 'Time Wasted' :
                           r.loss_type === 'personal-data' ? 'Personal Data Compromised' :
                           r.loss_type === 'harassment' ? 'Harassment/Threats' :
                           r.loss_type === 'reputation' ? 'Reputation Damage' :
                           r.loss_type === 'privacy' ? 'Privacy Violation' :
                           r.loss_type === 'multiple' ? 'Multiple Types of Impact' :
                           r.loss_type.replace('-', ' ')}
                        </span>
                      </div>
                    )}

                    {r.emotional_impact && (
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium text-amber-700">Emotional Impact</span>
                        <span className="text-sm font-semibold text-amber-900 capitalize">
                          {r.emotional_impact.replace('-', ' ')}
                        </span>
                      </div>
                    )}

                    {r.time_wasted && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">Time Lost</span>
                        <span className="text-sm font-semibold text-blue-900 capitalize">
                          {r.time_wasted.replace('-', ' ')}
                        </span>
                      </div>
                    )}

                    {r.personal_data_compromised && (
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-purple-700">Data Compromised</span>
                        <span className="text-sm font-semibold text-purple-900 capitalize">
                          {r.personal_data_compromised.replace('-', ' ')}
                        </span>
                      </div>
                    )}

                    {!r.loss_amount_inr && !r.loss_type && (
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="text-sm text-slate-500">Impact information not specified</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tactics */}
              {r.tactic_tags && r.tactic_tags.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Tactics Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-3">
                      {r.tactic_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="px-4 py-2 text-sm font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warning Indicators */}
              {r.indicators && r.indicators.length > 0 && (
                <Card className="border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      Warning Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {r.indicators.map(indicator => (
                        <div key={indicator} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-slate-700">
                            {indicator.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Impact Card */}
              {((r.impact_types && r.impact_types.length > 0) || r.loss_amount_inr || r.impact_summary) && (
                <Card className="border-2 border-slate-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="h-6 w-6 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Impact Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Impact Types */}
                    {r.impact_types && r.impact_types.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Impact Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {r.impact_types.map(type => (
                            <Badge key={type} variant="outline" className="capitalize text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Impact Summary */}
                    {r.impact_summary && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Impact Summary</h4>
                        <Alert className="border-slate-200">
                          <AlertDescription className="text-sm leading-relaxed">
                            {r.impact_summary}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Financial Loss */}
                    {r.loss_amount_inr && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Financial Impact</h4>
                        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                          <div className="text-3xl font-bold text-red-600">
                            ₹{r.loss_amount_inr.toLocaleString()}
                          </div>
                          <div className="text-sm text-red-500 mt-1">Estimated Loss</div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    {r.payment_method && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Payment Method</span>
                        <Badge variant="secondary" className="capitalize">
                          {r.payment_method}
                        </Badge>
                      </div>
                    )}

                  </CardContent>
                </Card>
              )}

              {/* Report Details */}
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Report Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {r.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">Date Reported</span>
                      <span className="text-sm font-medium">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.outcome && (
                      <>
                        <div className="h-px bg-slate-100" />
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-500">Status</span>
                          <Badge 
                            variant={r.outcome === 'refund' ? 'default' : r.outcome === 'police_reported' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {r.outcome.replace('_', ' ')}
                          </Badge>
                        </div>
                      </>
                    )}
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">Verification</span>
                      <Badge 
                        variant={r.verification_status === 'evidence_backed' ? 'default' : 'outline'}
                        className={r.verification_status === 'evidence_backed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                      >
                        {r.verification_status === 'evidence_backed' ? 'Evidence Backed' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evidence */}
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-6 w-6 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </div>
                    Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {r.evidence_ids && r.evidence_ids.length > 0 ? (
                    <div className="space-y-3">
                      {r.evidence_ids.map(eid => (
                        <div key={eid} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-green-800">
                              Evidence Submitted
                            </span>
                            <div className="text-xs text-green-600 mt-1">
                              ID: {eid.slice(0,8)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription className="text-sm">
                        No public evidence available for this incident.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button href="/report" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium">
                  Report Similar Incident
                </Button>
                <Button variant="outline" href="/incidents" className="w-full h-12 border-2 font-medium">
                  Browse More Reports
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
