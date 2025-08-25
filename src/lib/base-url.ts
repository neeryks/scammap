import { headers } from 'next/headers'

export function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL
  if (env) return env.replace(/\/$/, '')
  try {
  const h = (headers() as unknown) as Headers
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('x-forwarded-host') || h.get('host')
    if (host) return `${proto}://${host}`
  } catch {
    // ignore, fallback below
  }
  return 'http://localhost:3000'
}
