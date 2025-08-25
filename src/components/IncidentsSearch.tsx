'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import SearchBar from './SearchBar'

interface IncidentsSearchProps {
  defaultValue?: string
  category?: string
}

export default function IncidentsSearch({ defaultValue = "", category = "all" }: IncidentsSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="mx-auto max-w-xl">
      <SearchBar 
        placeholder="Search by venue, city, or scam type..."
        defaultValue={defaultValue}
        size="default"
        showLiveResults={true}
      />
    </div>
  )
}
