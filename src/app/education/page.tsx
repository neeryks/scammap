import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Education Hub
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn to identify and avoid common scams. Knowledge is your best defense against fraud and deception.
          </p>
        </div>

        {/* Education Cards */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Dating Scam Red Flags</CardTitle>
              <CardDescription>
                Warning signs to watch for in online relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Avoid moving to WhatsApp/Instagram quickly - legitimate connections don't rush off-platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Refuse "verification fees" and "gifts/customs" requests - these are always scams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Verify with live video calls - be aware of AI-generated voice and video technology</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Don't invest via private "exclusive" crypto tips from new connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Watch out for "accidental/wrong-number" introductions that lead to romance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700">Online & WhatsApp Scam Alerts</CardTitle>
              <CardDescription>
                Common digital fraud tactics targeting phone and app users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Instant loan apps demanding contacts/photos - avoid sharing personal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Voice-cloning calls from "bank/police" - hang up and call back on official numbers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Fake delivery asking for OTP - legitimate couriers don't need your verification codes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>"Digital arrest" intimidation - police don't arrest people over video calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Phishing for card/UPI details - never share payment information via phone or messages</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Restaurant Bill Checklist</CardTitle>
              <CardDescription>
                Protect yourself from overcharging and hidden fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Before ordering, ask if any "service charge/staff contribution" applies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Service charges cannot be mandatory - you have the right to refuse</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>If added without explicit consent, request removal from your bill</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Check GST calculations and verify menu prices match bill amounts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Alert className="border-slate-200">
            <AlertDescription className="text-slate-600">
              <strong>Research-backed information:</strong> Sources and detailed references for this educational content are provided in our research notes. For academic citations and detailed studies, please contact our research team.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
