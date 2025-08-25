"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type SearchSuggestion = { type: string; label: string; count: number; topRisk: number }

type Props = {
  initialQuery?: string
  extraParams?: Record<string, string | undefined>
}

export default function LiveSearch({ initialQuery, extraParams }: Props) {
  const [q, setQ] = useState(initialQuery ?? '')
  const [results, setResults] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // simple memoized debounce
  const debouncedFetch = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (val: string) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        if (!val.trim()) { setResults([]); return }
        if (abortRef.current) abortRef.current.abort()
        abortRef.current = new AbortController()
        setLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(val)}&limit=8`, { cache: 'no-store', signal: abortRef.current.signal })
          const data = await res.json()
          setResults(Array.isArray(data) ? data : [])
        } catch {
          // ignore aborted or network error
        } finally {
          setLoading(false)
        }
      }, 250)
    }
  }, [])

  useEffect(() => {
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [])

  const buildHref = (term: string) => {
    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        if (v !== undefined && v !== null) params.set(k, String(v))
      }
    }
    const qs = params.toString()
    return `/incidents${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="mx-auto max-w-xl relative">
      <div className="relative">
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); debouncedFetch(e.target.value) }}
          placeholder="Search by venue, city, or scam type..."
          className="h-14 pl-4 pr-20 text-base bg-white border-2 border-slate-200 shadow-lg"
        />
        <Link href={buildHref(q)}>
          <Button className="absolute right-2 top-2 h-10 px-6 bg-slate-900 hover:bg-slate-800" size="sm">
            Search
          </Button>
        </Link>
      </div>
      {q && (results.length > 0 || loading) && (
        <div className="absolute z-[100] mt-2 w-full rounded-xl border bg-white shadow-xl max-h-80 overflow-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
          )}
          {!loading && results.map((s, i) => (
            <Link key={`${s.type}-${s.label}-${i}`} href={buildHref(s.label)} className="block px-4 py-3 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px]">{s.type}</Badge>
                  <span className="text-sm text-slate-800">{s.label}</span>
                </div>
                <div className="text-xs text-slate-500">{s.count} matches • risk {s.topRisk}</div>
              </div>
            </Link>
          ))}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">No matches</div>
          )}
        </div>
      )}
    </div>
  )
}
