import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Eye, UserCheck, AlertTriangle } from 'lucide-react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/" className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">Legal Information</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Our commitment to privacy, transparency, and responsible reporting
            </p>
            <p className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          
          {/* Privacy Policy */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Shield className="h-6 w-6 text-blue-600" />
                <span>Privacy Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Data Collection</h3>
                <p className="text-slate-700 leading-relaxed">
                  ScamMapper collects only the information necessary to provide our community reporting service. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Incident location data (coordinates, venue names, addresses)</li>
                  <li>Incident descriptions and details you choose to share</li>
                  <li>Evidence files (images, documents) with automatic PII redaction</li>
                  <li>Basic account information for registered users</li>
                  <li>Usage analytics to improve our platform</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Data Protection</h3>
                <p className="text-slate-700 leading-relaxed">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>All uploads are automatically scanned for personal information and redacted</li>
                  <li>Secure cloud storage with encryption at rest and in transit</li>
                  <li>Anonymous reporting options available</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Data Sharing</h3>
                <p className="text-slate-700 leading-relaxed">
                  Your privacy is paramount. We never sell your personal data. We may share anonymized, aggregated data for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Research and public safety initiatives</li>
                  <li>Government agencies for law enforcement purposes (when legally required)</li>
                  <li>Academic institutions studying fraud patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <UserCheck className="h-6 w-6 text-green-600" />
                <span>Terms of Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">User Responsibilities</h3>
                <p className="text-slate-700 leading-relaxed">
                  By using ScamMapper, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Provide truthful and accurate information about incidents</li>
                  <li>Respect the privacy and rights of others</li>
                  <li>Not use the platform for defamatory or malicious purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Report incidents in good faith to help protect the community</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Content Guidelines</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Focus on factual incident reporting</li>
                  <li>Avoid personal attacks or inflammatory language</li>
                  <li>Do not share others' personal information without consent</li>
                  <li>Use appropriate categories and accurate descriptions</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Platform Disclaimer</h3>
                <p className="text-slate-700 leading-relaxed">
                  ScamMapper is a community reporting platform. We provide tools for sharing experiences but cannot verify all reports. 
                  Users should exercise their own judgment when interpreting information on our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="shadow-lg border-0 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl text-amber-800">
                <AlertTriangle className="h-6 w-6" />
                <span>Important Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-800 leading-relaxed font-medium">
                ScamMapper is a community-driven platform for sharing experiences and information. We do not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-amber-700">
                <li>Investigate or verify all reported incidents</li>
                <li>Provide legal advice or recommendations</li>
                <li>Guarantee the accuracy of user-submitted content</li>
                <li>Take responsibility for actions taken based on platform information</li>
              </ul>
              <p className="text-amber-800 leading-relaxed">
                Always exercise your own judgment and consider multiple sources when making decisions based on information found on our platform.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Contact & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                If you have questions about these policies, need to report content violations, or require support:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">
                  <strong>Email:</strong> legal@scammapper.com<br />
                  <strong>Response Time:</strong> 48-72 hours<br />
                  <strong>Emergency Issues:</strong> Use the report function within the platform
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Link href="/report">
                  <Button className="bg-slate-900 hover:bg-slate-800">
                    Report an Incident
                  </Button>
                </Link>
                <Link href="/incidents">
                  <Button variant="outline">
                    Browse Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
