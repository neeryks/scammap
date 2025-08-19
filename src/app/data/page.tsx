import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Data & Research
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Access comprehensive data and insights about scam incidents worldwide. Our platform provides transparent data to help researchers, journalists, and organizations combat fraud.
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Programmatic access to anonymized incident data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Access our JSON API endpoint for real-time incident data:
              </p>
              <div className="bg-slate-100 rounded-md p-3 font-mono text-sm">
                /api/reports
              </div>
              <Button variant="outline" className="w-full">
                View API Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Dashboards</CardTitle>
              <CardDescription>
                Interactive visualizations and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Explore trends and patterns in scam incidents through our interactive dashboards.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" disabled>
                  Global Trends Dashboard (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Regional Analytics (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download datasets for research purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Download anonymized datasets in multiple formats for academic and research use.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" disabled>
                  Download CSV (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Download JSON (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Partnerships</CardTitle>
              <CardDescription>
                Collaborate with our research initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Partner with us for academic research, policy development, or fraud prevention initiatives.
              </p>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Contact Research Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
