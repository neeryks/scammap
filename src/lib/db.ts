import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import type { Report, Venue, Indicator, Evidence, User } from './types'

interface DatabaseSchema {
  reports: Report[]
  venues: Venue[]
  indicators: Indicator[]
  evidence: Evidence[]
  users: User[]
}

const file = path.join(process.cwd(), 'data', 'db.json')
const adapter = new JSONFile<DatabaseSchema>(file)
export const db = new Low<DatabaseSchema>(adapter, {
  reports: [],
  venues: [],
  indicators: [],
  evidence: [],
  users: []
})

export async function initDB() {
  await db.read()
  if (!db.data) {
    db.data = { reports: [], venues: [], indicators: [], evidence: [], users: [] }
    await db.write()
  }
  return db
}
