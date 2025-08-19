"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { account } from '@/lib/appwrite.client'
import { useAuth } from '@/contexts/AuthContext'

interface FormData {
  venue: string
  address: string
  scamType: string
  lossType: string
  monetaryAmount: string
  emotionalImpact: string
  timeWasted: string
  personalDataCompromised: string
  description: string
  evidence?: File
}

export default function ReportPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    venue: "",
    address: "",
    scamType: "",
    lossType: "",
    monetaryAmount: "",
    emotionalImpact: "",
    timeWasted: "",
    personalDataCompromised: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, evidence: file }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) {
      window.location.href = '/auth/login?next=/report'
      return
    }
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const payload = {
        category: formData.scamType,
        venue_name: formData.venue,
        address: formData.address,
        city: formData.address.split(',').slice(-2)[0]?.trim() || formData.address.split(',')[0]?.trim() || 'Unknown',
        description: formData.description,
        loss_type: formData.lossType || undefined,
        loss_amount_inr: formData.monetaryAmount ? Number(String(formData.monetaryAmount).replace(/[^0-9]/g,'')) : undefined,
        emotional_impact: formData.emotionalImpact || undefined,
        time_wasted: formData.timeWasted || undefined,
        personal_data_compromised: formData.personalDataCompromised || undefined,
        impact_types: [],
        tactic_tags: [],
        evidence_ids: [],
        indicators: []
      }

      let authHeader: Record<string,string> = {}
      try {
        const jwt = await account.createJWT()
        authHeader = { Authorization: `Bearer ${jwt.jwt}` }
      } catch (error) {
        console.error('Failed to get session. Please sign in again.')
        window.location.href = '/auth/login?next=/report'
        return
      }
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      })

  if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          venue: "",
          address: "",
          scamType: "",
          lossType: "",
          monetaryAmount: "",
          emotionalImpact: "",
          timeWasted: "",
          personalDataCompromised: "",
          description: ""
        })
      } else if (response.status === 401) {
        setSubmitStatus('error')
        window.location.href = '/auth/login?next=/report'
        return
      } else {
        try {
          const errorData = await response.json()
          console.error('API Error:', errorData)
        } catch {
          console.error('API Error: Non-JSON response, status:', response.status)
        }
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Report a Scam Incident
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Help protect others by sharing your experience. Your report will be reviewed and added to our database to warn other travelers.
          </p>
        </div>

    {/* Report Form */}
    <div className="max-w-2xl mx-auto">
          {/* User Status */}
          {mounted && (
            <div className="mb-6 p-4 rounded-lg border bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
      {user ? (
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Reporting as: {user.name || user.email}
                      </p>
                      <p className="text-xs text-slate-600">
                        Your report will be linked to your account
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-900">
        Please sign in to report an incident
                      </p>
                      <p className="text-xs text-slate-600">
        <a href="/auth/login?next=/report" className="text-slate-800 underline">Sign in</a> to continue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
      <Card aria-disabled={!user} className={!user ? 'opacity-50 pointer-events-none select-none' : ''}>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>
        {user ? 'Please provide as much detail as possible about the scam incident.' : 'Sign in to fill and submit the form.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Venue Name */}
                <div className="space-y-2">
                  <label htmlFor="venue" className="text-sm font-medium text-slate-700">
                    Venue Name *
                  </label>
                  <Input
                    id="venue"
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Enter the name of the business or location"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-slate-700">
                    Address *
                  </label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address including city and country"
                    required
                  />
                </div>

                {/* Scam Type */}
                <div className="space-y-2">
                  <label htmlFor="scamType" className="text-sm font-medium text-slate-700">
                    Type of Scam *
                  </label>
                  <Select 
                    value={formData.scamType} 
                    onValueChange={(value) => handleInputChange('scamType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of scam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dating-romance">Dating/Romance Scam</SelectItem>
                      <SelectItem value="online-shopping">Online Shopping Fraud</SelectItem>
                      <SelectItem value="investment-crypto">Investment/Cryptocurrency Scam</SelectItem>
                      <SelectItem value="employment">Employment/Job Scam</SelectItem>
                      <SelectItem value="tech-support">Tech Support Scam</SelectItem>
                      <SelectItem value="phishing">Phishing/Identity Theft</SelectItem>
                      <SelectItem value="loan-advance-fee">Loan/Advance Fee Fraud</SelectItem>
                      <SelectItem value="lottery-prize">Lottery/Prize Scam</SelectItem>
                      <SelectItem value="rental-real-estate">Rental/Real Estate Fraud</SelectItem>
                      <SelectItem value="overcharging">Restaurant/Service Overcharging</SelectItem>
                      <SelectItem value="fake-products">Fake Products/Services</SelectItem>
                      <SelectItem value="payment-fraud">Payment Fraud</SelectItem>
                      <SelectItem value="tourist-trap">Tourist Trap</SelectItem>
                      <SelectItem value="currency-exchange">Currency Exchange Fraud</SelectItem>
                      <SelectItem value="accommodation">Accommodation Scam</SelectItem>
                      <SelectItem value="transportation">Transportation Scam</SelectItem>
                      <SelectItem value="harassment-extortion">Harassment/Extortion</SelectItem>
                      <SelectItem value="catfishing">Catfishing</SelectItem>
                      <SelectItem value="social-media">Social Media Scam</SelectItem>
                      <SelectItem value="business-email">Business Email Compromise</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type of Loss/Impact */}
                <div className="space-y-2">
                  <label htmlFor="lossType" className="text-sm font-medium text-slate-700">
                    Type of Impact/Loss *
                  </label>
                  <Select 
                    value={formData.lossType} 
                    onValueChange={(value) => handleInputChange('lossType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of impact you experienced" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Loss</SelectItem>
                      <SelectItem value="emotional">Emotional Distress</SelectItem>
                      <SelectItem value="time">Time Wasted</SelectItem>
                      <SelectItem value="personal-data">Personal Data Compromised</SelectItem>
                      <SelectItem value="harassment">Harassment/Threats</SelectItem>
                      <SelectItem value="reputation">Reputation Damage</SelectItem>
                      <SelectItem value="privacy">Privacy Violation</SelectItem>
                      <SelectItem value="multiple">Multiple Types</SelectItem>
                      <SelectItem value="other-impact">Other Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields Based on Loss Type */}
                {(formData.lossType === 'financial' || formData.lossType === 'multiple') && (
                  <div className="space-y-2">
                    <label htmlFor="monetaryAmount" className="text-sm font-medium text-slate-700">
                      Financial Loss Amount
                    </label>
                    <Input
                      id="monetaryAmount"
                      type="text"
                      value={formData.monetaryAmount}
                      onChange={(e) => handleInputChange('monetaryAmount', e.target.value)}
                      placeholder="e.g., $50 USD, ₹2000 INR, €100 EUR"
                    />
                  </div>
                )}

                {(formData.lossType === 'emotional' || formData.lossType === 'multiple') && (
                  <div className="space-y-2">
                    <label htmlFor="emotionalImpact" className="text-sm font-medium text-slate-700">
                      Emotional Impact
                    </label>
                    <Select 
                      value={formData.emotionalImpact} 
                      onValueChange={(value) => handleInputChange('emotionalImpact', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Describe the emotional impact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild-stress">Mild Stress/Annoyance</SelectItem>
                        <SelectItem value="moderate-distress">Moderate Distress</SelectItem>
                        <SelectItem value="severe-distress">Severe Emotional Distress</SelectItem>
                        <SelectItem value="anxiety-depression">Anxiety/Depression</SelectItem>
                        <SelectItem value="trust-issues">Trust Issues</SelectItem>
                        <SelectItem value="relationship-impact">Relationship Impact</SelectItem>
                        <SelectItem value="other-emotional">Other Emotional Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(formData.lossType === 'time' || formData.lossType === 'multiple') && (
                  <div className="space-y-2">
                    <label htmlFor="timeWasted" className="text-sm font-medium text-slate-700">
                      Time Investment Lost
                    </label>
                    <Select 
                      value={formData.timeWasted} 
                      onValueChange={(value) => handleInputChange('timeWasted', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estimate time spent/wasted" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="few-hours">A few hours</SelectItem>
                        <SelectItem value="few-days">A few days</SelectItem>
                        <SelectItem value="few-weeks">A few weeks</SelectItem>
                        <SelectItem value="few-months">A few months</SelectItem>
                        <SelectItem value="over-year">Over a year</SelectItem>
                        <SelectItem value="ongoing">Ongoing time impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(formData.lossType === 'personal-data' || formData.lossType === 'multiple') && (
                  <div className="space-y-2">
                    <label htmlFor="personalDataCompromised" className="text-sm font-medium text-slate-700">
                      Personal Data Compromised
                    </label>
                    <Select 
                      value={formData.personalDataCompromised} 
                      onValueChange={(value) => handleInputChange('personalDataCompromised', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="What type of data was compromised?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact-info">Contact Information</SelectItem>
                        <SelectItem value="financial-info">Financial Information</SelectItem>
                        <SelectItem value="identity-documents">Identity Documents</SelectItem>
                        <SelectItem value="photos-videos">Photos/Videos</SelectItem>
                        <SelectItem value="passwords">Passwords/Account Access</SelectItem>
                        <SelectItem value="social-media">Social Media Accounts</SelectItem>
                        <SelectItem value="work-info">Work/Professional Information</SelectItem>
                        <SelectItem value="family-info">Family/Personal Details</SelectItem>
                        <SelectItem value="other-data">Other Personal Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what happened, how the scam worked, and any other relevant details..."
                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={4}
                    required
                  />
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                  <label htmlFor="evidence" className="text-sm font-medium text-slate-700">
                    Evidence (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <input
                      id="evidence"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                    <label
                      htmlFor="evidence"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-slate-600">
                        {formData.evidence ? formData.evidence.name : 'Upload receipts, photos, or documents'}
                      </span>
                      <span className="text-xs text-slate-400">
                        PNG, JPG, PDF up to 10MB
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Status */}
                {submitStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Report submitted successfully! Thank you for helping protect other travelers.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      There was an error submitting your report. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!user || isSubmitting || !formData.venue || !formData.address || !formData.scamType || !formData.lossType || !formData.description}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
