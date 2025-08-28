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
  // Only Appwrite mode supported
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
  // Only Appwrite mode supported
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

  // Only Appwrite mode supported

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
      if (!allowed.has(k)) delete (retryPayload as Record<string, unknown>)[k]
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
  if (!useAppwrite) throw new Error('Appwrite disabled (APPWRITE_ENABLED != true)')
  if (!process.env.APPWRITE_BUCKET_EVIDENCE_ID) throw new Error('Missing APPWRITE_BUCKET_EVIDENCE_ID')
  // Diagnostic marker to ensure latest implementation is executing
  if (process.env.NODE_ENV !== 'production') {
    console.log('[evidence] createEvidenceFromBuffer v2 (REST multipart) size=', buf.length)
  }
  // Use direct REST multipart upload to avoid SDK InputFile incompatibility
  const endpoint = process.env.APPWRITE_ENDPOINT!.replace(/\/$/, '')
  const project = process.env.APPWRITE_PROJECT_ID!
  const apiKey = process.env.APPWRITE_API_KEY!
  const bucket = process.env.APPWRITE_BUCKET_EVIDENCE_ID!

  const form = new FormData()
  form.append('fileId', 'unique()')
  const filename = `evidence-${Date.now()}.webp`
  const uint8 = new Uint8Array(buf)
  const blob = new Blob([uint8], { type: 'image/webp' })
  form.append('file', blob, filename)

  const res = await fetch(`${endpoint}/storage/buckets/${bucket}/files`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': project,
      'X-Appwrite-Key': apiKey
    },
    body: form as any
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Appwrite upload failed (${res.status}): ${text}`)
  }
  const json: any = await res.json()
  const fileId = json?.$id
  if (!fileId) throw new Error('Appwrite response missing $id')
  if (process.env.NODE_ENV !== 'production') {
    console.log('[evidence] uploaded file id', fileId)
  }
  const proxyUrl = `/api/evidence/file/${fileId}`
  return {
    id: fileId,
    type: 'image',
    storage_url: proxyUrl,
    hash: '',
    exif_removed: true,
    redactions_applied: true,
    pii_flags: [],
    ocr_text: ''
  }
}
