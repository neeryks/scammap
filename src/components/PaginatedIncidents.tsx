"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Report } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginatedIncidentsProps {
  reports: Report[]
  total: number
  category: string
  searchQuery: string
}

const ITEMS_PER_PAGE = 36

export default function PaginatedIncidents({ reports: initialReports, total, category, searchQuery }: PaginatedIncidentsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [reports, setReports] = useState(initialReports)
  const [loading, setLoading] = useState(false)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  useEffect(() => {
    async function fetchPage() {
      if (currentPage === 1) {
        setReports(initialReports)
        return
      }

      setLoading(true)
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE
        const params = new URLSearchParams({
          limit: ITEMS_PER_PAGE.toString(),
          offset: offset.toString(),
        })
        
        if (category !== 'all') params.append('category', category)
        if (searchQuery) params.append('q', searchQuery)

        const response = await fetch(`/api/reports?${params}`)
        const data = await response.json()
        setReports(data.items || [])
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [currentPage, category, searchQuery, initialReports])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
    setReports(initialReports)
  }, [category, searchQuery, initialReports])

  const formatCategory = (cat: string) => cat.replace('-', ' ')

  return (
    <div className="space-y-8">
      {/* Incident Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: ITEMS_PER_PAGE }, (_, i) => (
            <Card key={i} className="border-0 bg-white shadow-lg animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 w-20 bg-slate-200 rounded mb-3"></div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reports.map(r => (
            <Link key={r.id} href={`/incidents/${r.id}`}>
              <Card className="group relative cursor-pointer overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                {/* Gradient overlay for high-risk incidents */}
                {(r.risk_score || r.scam_meter_score) > 90 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 pointer-events-none" />
                )}
                
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      className="text-xs font-semibold px-3 py-1 bg-black text-white"
                    >
                      {formatCategory(r.category)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-bold group-hover:text-slate-600 transition-colors line-clamp-2">
                      {r.venue_name || r.city || 'Unknown location'}
                    </CardTitle>
                    {r.address && (
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="inline-block w-2 h-2 bg-slate-400 rounded-full"></span>
                        {r.address}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${
                          (r.risk_score || r.scam_meter_score || 0) >= 80 ? 'bg-red-500' : 
                          (r.risk_score || r.scam_meter_score || 0) >= 60 ? 'bg-orange-500' : 
                          (r.risk_score || r.scam_meter_score || 0) >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="font-semibold text-slate-700">
                          Risk: {r.risk_score || r.scam_meter_score || 0}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardDescription className="line-clamp-3 text-sm leading-relaxed text-slate-600 mb-4">
                    {r.description}
                  </CardDescription>
                  
                  {r.tactic_tags && r.tactic_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {r.tactic_tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} className="text-xs px-2 py-1 bg-black text-white">
                          {tag}
                        </Badge>
                      ))}
                      {r.tactic_tags.length > 2 && (
                        <Badge className="text-xs px-2 py-1 bg-black text-white">
                          +{r.tactic_tags.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
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
      ) : (
        <Card className="border-0 bg-white shadow-lg p-16 text-center">
          <CardContent>
            <div className="space-y-6">
              <div className="text-6xl opacity-20">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-slate-900">No incidents found</CardTitle>
                <CardDescription className="text-lg max-w-md mx-auto text-slate-600">
                  {searchQuery || category !== 'all' 
                    ? "Try adjusting your search terms or clearing filters"
                    : "No incidents have been reported yet"
                  }
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(searchQuery || category !== 'all') && (
                  <Link href="/incidents">
                    <Button variant="outline" className="h-12 px-8 font-semibold border-2">
                      Clear Filters
                    </Button>
                  </Link>
                )}
                <Link href="/report">
                  <Button className="h-12 px-8 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
                    Report First Incident
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                />
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => setCurrentPage(1)}
                      isActive={currentPage === 1}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}
              
              {/* Current page and neighbors */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNumber > totalPages) return null
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => setCurrentPage(totalPages)}
                      isActive={currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Page info */}
      {total > 0 && (
        <div className="text-center text-sm text-slate-600">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} incidents
          {loading && <span className="ml-2">Loading...</span>}
        </div>
      )}
    </div>
  )
}
