import sharp from 'sharp'

// Simple EXIF strip and optional blur faces/plates placeholder
export async function processImage(buffer: Buffer, options?: { blur?: boolean }) {
  let img = sharp(buffer)
  if (options?.blur) {
    img = img.blur(8)
  }
  // Re-encode to strip metadata
  const output = await img.jpeg({ quality: 85 }).toBuffer()
  return output
}

// Naive PII flags and OCR helpers (placeholder)
export function detectPII(text: string): string[] {
  const flags: string[] = []
  if (/\b\d{10}\b/.test(text)) flags.push('phone')
  if (/\b[A-Z]{5}\d{4}[A-Z]\b/i.test(text)) flags.push('pan_like')
  if (/\b\d{12}\b/.test(text)) flags.push('aadhaar_like')
  return flags
}
