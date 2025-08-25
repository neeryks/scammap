'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, MapPin, Clock, TrendingUp } from 'lucide-react'

interface SearchResult {
  id: string
  venue_name?: string
  city?: string
  address?: string
  category: string
  description: string
  loss_amount_inr?: number
  scam_meter_score: number
  created_at: string
}

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  className?: string
  size?: 'default' | 'large'
  showLiveResults?: boolean
}

export default function SearchBar({ 
  placeholder = "Search venues, cities, scam types...",
  defaultValue = "",
  className = "",
  size = 'large',
  showLiveResults = true
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Update query when defaultValue changes (for URL sync)
  useEffect(() => {
    setQuery(defaultValue)
  }, [defaultValue])

  // Live search with debouncing
  useEffect(() => {
    if (!query.trim() || !showLiveResults) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
        const response = await fetch(`${baseUrl}/api/reports`)
        if (response.ok) {
          const data = await response.json()
          const reports = data.items || data || []
          
          // Filter results based on query
          const filtered = reports.filter((report: SearchResult) => {
            const searchTerm = query.toLowerCase()
            return (
              (report.venue_name || '').toLowerCase().includes(searchTerm) ||
              (report.city || '').toLowerCase().includes(searchTerm) ||
              (report.address || '').toLowerCase().includes(searchTerm) ||
              (report.category || '').toLowerCase().includes(searchTerm) ||
              (report.description || '').toLowerCase().includes(searchTerm)
            )
          }).slice(0, 5) // Limit to 5 results for clean display
          
          setResults(filtered)
          setShowResults(filtered.length > 0)
        }
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, showLiveResults])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setShowResults(false)
    
    try {
      if (pathname === '/incidents') {
        // Update current incidents page URL while preserving other params
        const url = new URL(window.location.href)
        if (query.trim()) {
          url.searchParams.set('q', query.trim())
        } else {
          url.searchParams.delete('q')
        }
        router.push(url.toString())
      } else {
        // Navigate to incidents page with search
        router.push(`/incidents?q=${encodeURIComponent(query.trim())}`)
      }
    } finally {
      // Reset searching state after a short delay
      setTimeout(() => setIsSearching(false), 500)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (!result || !result.id) return
    
    setShowResults(false)
    setSelectedIndex(-1)
    setQuery(`${result.venue_name || result.city || 'Unknown'} - ${result.category}`)
    router.push(`/incidents/${result.id}`)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
    
    if (pathname === '/incidents' && defaultValue) {
      // Clear search on incidents page
      const url = new URL(window.location.href)
      url.searchParams.delete('q')
      router.push(url.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showResults && results.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          } else {
            handleSearch()
          }
          break
        case 'Escape':
          setShowResults(false)
          setSelectedIndex(-1)
          break
        default:
          break
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      handleClear()
    }
  }

  const formatCategory = (category: string) => {
    return category.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}m ago`
  }

  const isLarge = size === 'large'
  const inputHeight = isLarge ? 'h-14' : 'h-12'
  const buttonHeight = isLarge ? 'h-10' : 'h-8'
  const buttonTop = isLarge ? 'top-2' : 'top-2'
  const iconSize = isLarge ? 'h-5 w-5' : 'h-4 w-4'
  const paddingLeft = isLarge ? 'pl-12' : 'pl-10'
  const paddingRight = query ? (isLarge ? 'pr-24' : 'pr-20') : (isLarge ? 'pr-20' : 'pr-16')

  return (
    <div ref={searchRef} className={`relative z-50 overflow-visible ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className={`${iconSize} text-slate-400`} />
      </div>

      {/* Input Field */}
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0 && showLiveResults) setShowResults(true)
        }}
        placeholder={placeholder}
        className={`
          ${inputHeight} ${paddingLeft} ${paddingRight} 
          ${isLarge ? 'text-base' : 'text-sm'} 
          bg-white border-2 border-slate-200 shadow-lg 
          focus:border-slate-300 focus:ring-2 focus:ring-slate-200 
          transition-all duration-200
          placeholder:text-slate-400
        `}
      />

      {/* Clear Button (when there's text) */}
      {query && (
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className={`
            absolute right-${isLarge ? '20' : '16'} ${buttonTop} 
            ${buttonHeight} w-8 p-0 
            hover:bg-slate-100 text-slate-400 hover:text-slate-600
            transition-colors duration-200
          `}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!query.trim() || isSearching}
        className={`
          absolute right-2 ${buttonTop} ${buttonHeight} 
          ${isLarge ? 'px-6' : 'px-4'} 
          bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300
          transition-all duration-200 font-medium
          ${isLarge ? 'text-sm' : 'text-xs'}
        `}
        size="sm"
      >
        {isSearching ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            {isLarge && <span>Searching...</span>}
          </div>
        ) : (
          'Search'
        )}
      </Button>

      {/* Live Search Results */}
      {showResults && showLiveResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-[100] mt-2 border-2 border-slate-200 shadow-xl bg-white max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-slate-500 mb-2 font-medium px-1">
              Quick Results ({results.length})
            </div>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`
                    p-2 rounded-md cursor-pointer transition-all duration-150
                    ${selectedIndex === index 
                      ? 'bg-slate-100 border border-slate-200' 
                      : 'hover:bg-slate-50 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left side - Main content */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-slate-900 text-sm text-left mb-0.5">
                        {result.venue_name || result.city || 'Unknown location'}
                      </h4>
                      
                      <p className="text-xs text-slate-600 text-left mb-1">
                        {result.description.length > 50 
                          ? `${result.description.substring(0, 50)}...` 
                          : result.description
                        }
                      </p>
                      
                      <div className="flex items-center justify-start gap-2 text-xs text-slate-400">
                        {result.city && (
                          <div className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-20">{result.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Category badge and risk score */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 bg-slate-50"
                      >
                        {formatCategory(result.category)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">
                          {result.scam_meter_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Results Link */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <Button
                onClick={handleSearch}
                variant="ghost"
                className="w-full text-slate-600 hover:text-slate-900 text-xs py-1.5 h-auto"
              >
                View all results for "{query}" →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search Tips (show when focused and empty) */}
      {!query && !showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-slate-500 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 inline-block">
            Try: venue name, city, "dating scam", "overcharging"
          </div>
        </div>
      )}
    </div>
  )
}
