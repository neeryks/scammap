import { NextRequest, NextResponse } from 'next/server'
import { initDB, db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { processImage, detectPII } from '@/lib/moderation'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  await initDB()

  // Parse multipart form
  const formData = await req.formData()
  const file = formData.get('file') as unknown as File | null
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const processed = await processImage(buffer, { blur: true })
  const hash = crypto.createHash('sha256').update(processed).digest('hex')

  const id = uuidv4()
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, `${id}.jpg`)
  await fs.writeFile(filePath, processed)

  // Basic OCR placeholder (skipped for speed); hook tesseract.js later
  const ocr_text = ''
  const pii_flags = detectPII(ocr_text)

  const record: import('@/lib/types').Evidence = {
    id,
    type: 'image',
    storage_url: `/uploads/${id}.jpg`,
    hash,
    exif_removed: true,
    redactions_applied: true,
    pii_flags,
    ocr_text
  }
  db.data!.evidence.push(record)
  await db.write()
  return NextResponse.json(record)
}
