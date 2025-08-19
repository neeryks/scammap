import { NextResponse } from 'next/server'

export async function GET() {
  const endpoint = process.env.APPWRITE_ENDPOINT
  const project = process.env.APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY
  if (!endpoint || !project) {
    return NextResponse.json({ ok: false, error: 'Missing APPWRITE_ENDPOINT/APPWRITE_PROJECT_ID' }, { status: 400 })
  }
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Missing APPWRITE_API_KEY on server' }, { status: 400 })
  }
  const url = `${endpoint.replace(/\/$/, '')}/health`
  const res = await fetch(url, {
    headers: {
      'X-Appwrite-Project': project,
      'X-Appwrite-Key': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })
  const text = await res.text()
  let data: unknown
  try { data = JSON.parse(text) } catch { data = text }
  return NextResponse.json({ ok: res.ok, status: res.status, data })
}
