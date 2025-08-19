import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved spacing */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
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
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Input 
                  placeholder="Search by venue, city, or scam type..." 
                  className="h-14 pl-4 pr-20 text-base bg-white border-2 border-slate-200 shadow-lg"
                />
                <Button 
                  className="absolute right-2 top-2 h-10 px-6 bg-slate-900 hover:bg-slate-800"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </div>
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
                Learn from community experiences. These are the latest verified scam reports from across India.
              </p>
            </div>
            
            {/* Enhanced 12-Card Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                {
                  title: "TradePro Investment Solutions",
                  location: "Andheri East, Mumbai",
                  category: "Investment Fraud",
                  score: 95,
                  loss: 250000,
                  date: "2 days ago"
                },
                {
                  title: "ElectroDeals Online",
                  location: "Online Platform",
                  category: "Online Shopping",
                  score: 88,
                  loss: 75000,
                  date: "3 days ago"
                },
                {
                  title: "Global HR Solutions",
                  location: "Connaught Place, Delhi",
                  category: "Job Fraud",
                  score: 82,
                  loss: 15000,
                  date: "4 days ago"
                },
                {
                  title: "HDFC Bank (Impersonation)",
                  location: "Phone Call",
                  category: "Banking Fraud",
                  score: 92,
                  loss: 45000,
                  date: "5 days ago"
                },
                {
                  title: "International Lottery Commission",
                  location: "Email Communication",
                  category: "Lottery Fraud",
                  score: 78,
                  loss: 25000,
                  date: "6 days ago"
                },
                {
                  title: "Dating App Romance Scam",
                  location: "Online Dating Platform", 
                  category: "Dating/Romance Scam",
                  score: 85,
                  loss: 80000,
                  date: "1 week ago"
                },
                {
                  title: "Microsoft Tech Support Scam",
                  location: "Phone Call",
                  category: "Tech Support Scam",
                  score: 89,
                  loss: 35000,
                  date: "1 week ago"
                },
                {
                  title: "CryptoPro Investment Fraud",
                  location: "Online Platform",
                  category: "Investment/Crypto Scam",
                  score: 94,
                  loss: 120000,
                  date: "1 week ago"
                },
                {
                  title: "QuickCash Loans",
                  location: "Online Application",
                  category: "Fake Loan",
                  score: 86,
                  loss: 50000,
                  date: "1 week ago"
                },
                {
                  title: "BrandHub Store",
                  location: "Facebook Marketplace",
                  category: "Online Shopping",
                  score: 75,
                  loss: 12000,
                  date: "2 weeks ago"
                },
                {
                  title: "StockGenius Advisory",
                  location: "WhatsApp Group",
                  category: "Investment Fraud",
                  score: 96,
                  loss: 300000,
                  date: "2 weeks ago"
                },
                {
                  title: "Kerala State Lottery (Fake)",
                  location: "SMS & Phone Call",
                  category: "Lottery Fraud",
                  score: 83,
                  loss: 30000,
                  date: "2 weeks ago"
                }
              ].map((item, i) => (
                <Link key={i} href={`/incidents/${i + 1}`}>
                  <Card className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    {/* Gradient overlay for high-risk incidents */}
                    {item.score > 90 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 pointer-events-none" />
                    )}
                    
                    <CardHeader className="pb-4 relative">
                      <div className="flex items-start justify-between mb-3">
                        <Badge 
                          variant={item.score > 90 ? "default" : item.score > 80 ? "secondary" : "outline"}
                          className="text-xs font-semibold px-3 py-1"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <CardTitle className="text-lg font-bold group-hover:text-slate-600 transition-colors line-clamp-2">
                          {item.title}
                        </CardTitle>
                        <p className="text-slate-600 text-sm flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                          {item.location}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${
                              item.score > 90 ? 'bg-slate-600' : 
                              item.score > 80 ? 'bg-slate-500' : 
                              'bg-slate-400'
                            }`} />
                            <span className="font-semibold text-slate-700">Risk: {item.score}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          Impact:
                          <span className="ml-1 font-semibold text-slate-800">₹{item.loss.toLocaleString()}</span>
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
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/report">
                <Button className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                  Report Incident
                </Button>
              </Link>
              <Link href="/incidents">
                <Button variant="outline" className="h-12 px-8 font-semibold border-2">
                  Browse All Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
