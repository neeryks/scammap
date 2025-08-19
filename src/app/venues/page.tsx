"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Venue } from '@/lib/types'

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  
  useEffect(() => { 
    fetch('/api/venues').then(r => r.json()).then(setVenues) 
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Reported Venues
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Browse venues and businesses that have been reported for scam incidents. This information helps travelers make informed decisions.
          </p>
        </div>

        {/* Venues Grid */}
        <div className="max-w-4xl mx-auto">
          {venues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No venues reported yet</h3>
                <p className="text-slate-500">
                  When incidents are reported, affected venues will appear here to help other travelers stay informed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {venues.map(venue => (
                <Card key={venue.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                          {venue.address}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Venue
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
