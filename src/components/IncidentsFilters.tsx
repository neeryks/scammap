"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type Props = {
  categories: string[]
  cities: string[]
}

export default function IncidentsFilters({ categories, cities }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const category = sp.get('type') || sp.get('category') || 'all'
  const city = sp.get('city') || 'all'
  const from = sp.get('from') || ''
  const to = sp.get('to') || ''

  const update = useCallback((patch: Record<string,string|undefined>) => {
    const params = new URLSearchParams(sp.toString())
    Object.entries(patch).forEach(([k,v]) => {
      if (!v || v === 'all' || v === '') params.delete(k)
      else params.set(k, v)
    })
    if (params.has('category')) {
      params.set('type', params.get('category') as string)
      params.delete('category')
    }
    router.replace(`/incidents?${params.toString()}`)
  }, [sp, router])

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center">
      <div className="w-full sm:w-56">
        <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
        <Select value={category} onValueChange={v => update({ type: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c.replace(/-/g,' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-56">
        <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
        <Select value={city} onValueChange={v => update({ city: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 w-full sm:w-auto">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={e => update({ from: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={e => update({ to: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>
      </div>
      <div className="sm:self-center">
        <button
          type="button"
          onClick={() => update({ type: 'all', city: 'all', from: '', to: '', venue: undefined })}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}
