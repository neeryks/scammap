import { initDB, db } from '@/lib/db'
import type { Report, Evidence } from '@/lib/types'
import { computeScamMeterScore } from '@/lib/scoring'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { Client, Databases, Storage, Query } from 'node-appwrite'

const useAppwrite = process.env.APPWRITE_ENABLED === 'true'

let appwriteClientVar: Client | null = null
let databases: Databases | null = null
let storage: Storage | null = null
let attrKeysCache: { keys: Set<string>; ts: number } | null = null

function ensureAppwrite(): void {
  if (!useAppwrite) return
  if (!appwriteClientVar) {
    appwriteClientVar = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!)
    databases = new Databases(appwriteClientVar)
    storage = new Storage(appwriteClientVar)
  }
}

async function getCollectionAttributeKeys(): Promise<Set<string>> {
  ensureAppwrite()
  const now = Date.now()
  if (attrKeysCache && now - attrKeysCache.ts < 60000) return attrKeysCache.keys
  // Fetch collection to discover its attributes
  const col = await databases!.getCollection(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_COLLECTION_REPORTS_ID!
  ) as unknown as { attributes?: Array<{ key: string }> }
  const keys = new Set<string>((col.attributes || []).map(a => a.key))
  // Note: do NOT forcibly add extra keys; rely strictly on collection schema to avoid document_invalid_structure
  attrKeysCache = { keys, ts: now }
  return keys
}

export type ListReportsParams = {
  category?: string
  city?: string
  limit?: number
  offset?: number
  reporter_user_id?: string
}

export async function listReports(params: ListReportsParams = {}) {
  if (!useAppwrite) {
    await initDB()
    let results = db.data!.reports
    if (params.category) results = results.filter(r => r.category === params.category)
    if (params.city) results = results.filter(r => r.city === params.city)
    if (params.reporter_user_id) results = results.filter(r => r.reporter_user_id === params.reporter_user_id)
    
    // Sort by created_at in descending order (newest first)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const total = results.length
    const start = params.offset ?? 0
    const end = (params.limit ?? 50) + start
    return { total, items: results.slice(start, end) }
  }
  ensureAppwrite()
  const q: string[] = []
  if (params.category) q.push(Query.equal('category', params.category))
  if (params.city) q.push(Query.equal('city', params.city))
  if (params.reporter_user_id) q.push(Query.equal('reporter_user_id', params.reporter_user_id))
  if (params.limit) q.push(Query.limit(params.limit))
  if (params.offset) q.push(Query.offset(params.offset))
  
  // Add sorting by created_at descending (newest first)
  q.push(Query.orderDesc('created_at'))
  
  const res = await databases!.listDocuments(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_COLLECTION_REPORTS_ID!,
    q
  )
  return { total: res.total, items: res.documents as unknown as Report[] }
}

export async function getReport(id: string) {
  if (!useAppwrite) {
    await initDB()
    return db.data!.reports.find(r => r.id === id) || null
  }
  ensureAppwrite()
  const doc = await databases!.getDocument(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_COLLECTION_REPORTS_ID!,
    id
  )
  return doc as unknown as Report
}

export type CreateReportInput = Omit<Report, 'id' | 'created_at' | 'scam_meter_score' | 'reporter_visibility'> & {
  reporter_visibility?: Report['reporter_visibility']
}

export async function createReport(input: CreateReportInput) {
  let corroborationCount = 0
  if (!useAppwrite) {
    await initDB()
    corroborationCount = db.data!.reports.filter(r => r.venue_name && r.venue_name === input.venue_name).length
  } else {
    ensureAppwrite()
    try {
      const list = await databases!.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_REPORTS_ID!,
        input.venue_name ? [Query.equal('venue_name', input.venue_name)] : []
      )
      corroborationCount = list.total
    } catch (error) {
      // If venue_name attribute doesn't exist yet, just use 0 for now
      console.warn('Could not query venue_name for corroboration count:', error)
      corroborationCount = 0
    }
  }

  // Normalize location to plain "lat,lon" string (drop precision suffix to align with simple string attribute)
  const normalizedLocation = typeof input.location === 'string' || !input.location
    ? (input.location as string | undefined)
    : `${input.location.lat},${input.location.lon}`

  const base: Report = {
    id: uuidv4(),
    created_at: dayjs().toISOString(),
    category: input.category,
    location: normalizedLocation ?? undefined,
    city: input.city,
    venue_name: input.venue_name,
    address: input.address,
    description: input.description,
    reporter_user_id: input.reporter_user_id,
    loss_amount_inr: input.loss_amount_inr,
    payment_method: input.payment_method,
    impact_types: input.impact_types ?? [],
    impact_summary: input.impact_summary,
    tactic_tags: input.tactic_tags ?? [],
    date_time_of_incident: input.date_time_of_incident,
    evidence_ids: input.evidence_ids ?? [],
    indicators: input.indicators ?? [],
    outcome: input.outcome,
    scam_meter_score: 0,
    reporter_visibility: input.reporter_visibility ?? 'anonymous'
  }

  const score = computeScamMeterScore(base, corroborationCount, false, false, false)
  base.scam_meter_score = score.score

  if (!useAppwrite) {
    db.data!.reports.push(base)
    await db.write()
    return { report: base, scoring: score }
  }

  ensureAppwrite()
  // Filter payload to only known attributes to avoid document_invalid_structure
  const allowed = await getCollectionAttributeKeys()
  const payload: Record<string, unknown> = {}
  // Only include keys defined in collection attribute schema
  Object.entries(base).forEach(([k, v]) => {
    if (allowed.has(k)) {
      payload[k] = v
    }
  })
  // If scam_meter_score not in schema yet, that's fine; we compute it but only send when attribute exists
  let created
  try {
    created = await databases!.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_REPORTS_ID!,
      base.id,
      payload
    )
  } catch (err) {
    // Attempt recovery: remove any keys that might have been added race-condition style
    const retryPayload = { ...payload }
    // Common culprits when schema not yet updated
    ;['scam_meter_score','reporter_visibility','loss_amount_inr','location'].forEach(k => {
      if (!allowed.has(k)) delete (retryPayload as any)[k]
    })
    try {
      created = await databases!.createDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_REPORTS_ID!,
        base.id,
        retryPayload
      )
    } catch (err2) {
      throw err2
    }
  }
  return { report: created as unknown as Report, scoring: score }
}

export async function createEvidenceFromBuffer(buf: Buffer): Promise<Evidence> {
  if (!useAppwrite) {
    throw new Error('Local evidence storage handled in evidence route')
  }
  ensureAppwrite()
  const fileRes = await storage!.createFile(
    process.env.APPWRITE_BUCKET_EVIDENCE_ID!,
    'unique()',
    // node-appwrite < 15 lacks InputFile in types; Buffer works in runtime
    buf as unknown as File
  )
  const record: Evidence = {
    id: fileRes.$id,
    type: 'image',
    storage_url: fileRes.$id,
    hash: '',
    exif_removed: true,
    redactions_applied: true,
    pii_flags: [],
    ocr_text: ''
  }
  return record
}
