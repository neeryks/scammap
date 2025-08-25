import sharp from 'sharp'

// Simple EXIF strip and optional blur faces/plates placeholder
export async function processImage(buffer: Buffer, options?: { blur?: boolean }) {
  let img = sharp(buffer)
  if (options?.blur) {
    img = img.blur(8)
  }
  // Re-encode to WebP to strip metadata and compress better
  const output = await img.webp({ quality: 85, effort: 4 }).toBuffer()
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
