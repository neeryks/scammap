import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LegalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Legal Notice & Disclaimer</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            User-generated content. Informational use only. No warranties. No legal advice.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. User-Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                This website hosts incident reports and comments submitted by users. We do not author, endorse, or verify
                the accuracy of user submissions before publication. Content is provided “as is” for public awareness and
                research.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. No Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                To the maximum extent permitted by law, the site owners, operators, and contributors shall not be liable for
                any loss, damage, or claims arising from or in connection with the use of this site or reliance on any content
                herein. Your use of the site is at your sole risk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. No Legal Advice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                Information on this site is for general information only and does not constitute legal advice. For legal concerns,
                consult with a qualified attorney or contact local law enforcement as appropriate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Takedown & Right of Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                If you believe content violates your rights or is inaccurate, please submit a takedown or correction request.
                We will review submissions promptly and take appropriate action per our policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                Any disputes arising out of or related to this site will be subject to the laws and courts of the operator’s
                principal place of business, unless superseded by mandatory local consumer protections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
