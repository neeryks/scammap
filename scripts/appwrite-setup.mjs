// Best-effort load of .env without requiring dotenv as a dependency
try {
  const { config } = await import('dotenv')
  if (typeof config === 'function') config()
} catch {}
import { Client, Databases, Storage } from 'node-appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT
const project = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
let databaseId = process.env.APPWRITE_DATABASE_ID
let collectionId = process.env.APPWRITE_COLLECTION_REPORTS_ID
let bucketId = process.env.APPWRITE_BUCKET_EVIDENCE_ID

if (!endpoint || !project || !apiKey) {
  console.error('Missing APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY in environment.')
  process.exit(1)
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
const databases = new Databases(client)
const storage = new Storage(client)

async function ensureDatabase() {
  if (databaseId) return databaseId
  const id = 'reportsdb'
  try {
    const db = await databases.create(id, 'ScamMap DB')
    databaseId = db.$id
  } catch (e) {
    databaseId = id
  }
  return databaseId
}

async function ensureCollection() {
  await ensureDatabase()
  // If an existing collection ID is provided, use it but still try to ensure attributes exist.
  const id = collectionId || 'reports'
  if (!collectionId) {
    try {
      const col = await databases.createCollection(databaseId, id, 'Reports', [
        'read("any")', 'create("any")', 'update("role:admin")', 'delete("role:admin")'
      ])
      collectionId = col.$id
    } catch (e) {
      // If the collection already exists, fall back to the provided/default ID
      collectionId = id
    }
  } else {
    // Optionally, we could validate the collection exists here; proceed to ensure attributes regardless
    collectionId = id
  }
  const addString = (key, size = 255, required = false, array = false) =>
    databases.createStringAttribute(databaseId, collectionId, key, size, required, undefined, array)
      .catch(() => {})
  const addInteger = (key, required = false, array = false) =>
    databases.createIntegerAttribute(databaseId, collectionId, key, required, undefined, undefined, array)
      .catch(() => {})
  const addDatetime = (key, required = false) =>
    databases.createDatetimeAttribute(databaseId, collectionId, key, required).catch(() => {})

  await Promise.all([
    addString('id', 64, true),
    addDatetime('created_at'),
    addString('category'),
    addString('location', 1024),
    addString('city'),
    addString('venue_name'),
    addString('address', 1024),
    addString('description', 8192),
    addString('reporter_user_id', 64),
    addString('loss_type'),
    addInteger('loss_amount_inr'),
    addString('emotional_impact'),
    addString('time_wasted'),
    addString('personal_data_compromised'),
    addString('payment_method'),
    addString('impact_types', 255, false, true),
    addString('impact_summary', 1024),
    addString('tactic_tags', 255, false, true),
    addString('date_time_of_incident', 128),
    addString('evidence_ids', 255, false, true),
    addString('indicators', 255, false, true),
    addString('outcome'),
    addString('verification_status'),
    addInteger('scam_meter_score'),
    addString('reporter_visibility')
  ])

  return collectionId
}

async function ensureBucket() {
  if (bucketId) return bucketId
  const id = 'evidence'
  try {
    const b = await storage.createBucket(id, 'Evidence', undefined, undefined, ['read("any")', 'create("any")'])
    bucketId = b.$id
  } catch (e) {
    bucketId = id
  }
  return bucketId
}

;(async () => {
  await ensureCollection()
  await ensureBucket()
  console.log('Appwrite resources ready:')
  console.log('APPWRITE_DATABASE_ID=', databaseId)
  console.log('APPWRITE_COLLECTION_REPORTS_ID=', collectionId)
  console.log('APPWRITE_BUCKET_EVIDENCE_ID=', bucketId)
  console.log('\nAdd these to your .env and set APPWRITE_ENABLED=true')
})().catch(err => {
  console.error('Setup failed:', err)
  process.exit(1)
})
