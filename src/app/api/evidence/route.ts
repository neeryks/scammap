import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { processImage, detectPII } from '@/lib/moderation'
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

  if (process.env.APPWRITE_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Evidence upload requires Appwrite (APPWRITE_ENABLED=true)' }, { status: 500 })
  }

  // Parse multipart form
  const formData = await req.formData()
  const file = formData.get('file') as unknown as File | null
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 })

  // Validate file type - only images
  const mime = file.type || ''
  if (!mime.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Convert to WebP preserving original resolution and maximum quality
  const webpBuffer = await sharp(buffer)
    .webp({ quality: 100, effort: 6, lossless: true })
    .toBuffer()

  // Process without additional compression to maintain quality
  const processed = await processImage(webpBuffer, { blur: false })
  const hash = crypto.createHash('sha256').update(processed).digest('hex')

  // Store in Appwrite
  const record = await createEvidenceFromBuffer(processed)
  record.hash = hash

  // Basic OCR placeholder (skipped for speed); hook tesseract.js later
  record.ocr_text = ''
  record.pii_flags = detectPII('')

  return NextResponse.json(record)
}
