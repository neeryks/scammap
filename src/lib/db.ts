import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import type { Report, Venue, Indicator, Evidence, User, VerificationRecord } from './types'

export type DBData = {
  reports: Report[]
  venues: Venue[]
  indicators: Indicator[]
  evidence: Evidence[]
  users: User[]
  verificationRecords: VerificationRecord[]
}

const file = path.join(process.cwd(), 'data', 'db.json')
const adapter = new JSONFile<DBData>(file)
export const db = new Low<DBData>(adapter, {
  reports: [],
  venues: [],
  indicators: [],
  evidence: [],
  users: [],
  verificationRecords: []
})

export async function initDB() {
  await db.read()
  if (!db.data) {
    db.data = { reports: [], venues: [], indicators: [], evidence: [], users: [], verificationRecords: [] }
    await db.write()
  }
  return db
}
