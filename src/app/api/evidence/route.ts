import { NextRequest, NextResponse } from 'next/server'
import { initDB, db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { processImage, detectPII } from '@/lib/moderation'
import fs from 'fs/promises'
import path from 'path'
import { createEvidenceFromBuffer } from '@/lib/storage'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Require authentication
  const authz = req.headers.get('authorization') || ''
  if (!authz.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const jwt = authz.substring('Bearer '.length).trim()
  const verified = await validateAppwriteJWT(jwt)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  await initDB()

  // Parse multipart form
  const formData = await req.formData()
  const file = formData.get('file') as unknown as File | null
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 })

  // Validate file type - only images
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Convert to WebP preserving original resolution
  const webpBuffer = await sharp(buffer)
    .webp({ quality: 100, effort: 6, lossless: true })
    .toBuffer()

  const processed = await processImage(webpBuffer, { blur: true })
  const hash = crypto.createHash('sha256').update(processed).digest('hex')
  const useAppwrite = process.env.APPWRITE_ENABLED === 'true'
  
  // For now, always use local storage since Appwrite storage setup is incomplete
  // if (useAppwrite) {
  //   const record = await createEvidenceFromBuffer(processed)
  //   return NextResponse.json({ ...record, hash })
  // }
  
  const id = uuidv4()
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, `${id}.webp`)
  await fs.writeFile(filePath, processed)

  // Basic OCR placeholder (skipped for speed); hook tesseract.js later
  const ocr_text = ''
  const pii_flags = detectPII(ocr_text)

  const record: import('@/lib/types').Evidence = {
    id,
    type: 'image',
    storage_url: `/uploads/${id}.webp`,
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
