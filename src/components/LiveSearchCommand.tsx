"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command'

type SearchResponse = {
  totalMatches: number
  groups: {
    venues: { id: string; name: string; count: number }[]
    cities: { name: string; count: number }[]
    types: { name: string; count: number }[]
    posts: { id: string; title: string; city?: string; type: string }[]
  }
}

export default function LiveSearchCommand({ placeholder = 'Search…' }: { placeholder?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const perform = useCallback((value: string) => {
    if (!value.trim()) { setData(null); return }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(value.trim())}`)
      .then(r => r.json())
      .then((json: SearchResponse) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  function onInput(v: string) {
    setQuery(v)
    if (debounceTimer) clearTimeout(debounceTimer)
    const t = setTimeout(() => perform(v), 300)
    setDebounceTimer(t)
  }

  function navTo(params: Record<string,string>) {
    const usp = new URLSearchParams(params)
    router.push(`/incidents?${usp.toString()}`)
  }

  return (
    <Command className="w-full">
      <CommandInput
        value={query}
        onChange={e => onInput(e.target.value)}
        placeholder={placeholder}
        aria-label="Live search"
      />
      <CommandList>
        {query && (
          <div className="px-2 py-1 text-xs text-slate-500">Matches: {data ? data.totalMatches : (loading ? '…' : 0)}</div>
        )}
        {loading && <CommandEmpty>Searching…</CommandEmpty>}
        {!loading && query && data && data.totalMatches === 0 && (
          <CommandEmpty>No results</CommandEmpty>
        )}
        {!loading && data && data.totalMatches > 0 && (
          <>
            {data.groups.venues.length > 0 && (
              <CommandGroup heading="Venues">
                {data.groups.venues.map(v => (
                  <CommandItem key={v.id} onClick={() => navTo({ venue: v.name })}>
                    <span className="flex-1 truncate">{v.name}</span>
                    <span className="text-xs text-slate-500">{v.count}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.groups.cities.length > 0 && (
              <CommandGroup heading="Cities">
                {data.groups.cities.map(c => (
                  <CommandItem key={c.name} onClick={() => navTo({ city: c.name })}>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.count}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.groups.types.length > 0 && (
              <CommandGroup heading="Types">
                {data.groups.types.map(t => (
                  <CommandItem key={t.name} onClick={() => navTo({ type: t.name })}>
                    <span className="flex-1 truncate">{t.name.replace(/-/g,' ')}</span>
                    <span className="text-xs text-slate-500">{t.count}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.groups.posts.length > 0 && (
              <CommandGroup heading="Posts">
                {data.groups.posts.map(p => (
                  <CommandItem key={p.id} onClick={() => router.push(`/incidents/${p.id}`)}>
                    <span className="flex-1 truncate">{p.title}</span>
                    {p.city && <span className="text-xs text-slate-500">{p.city}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  )
}
