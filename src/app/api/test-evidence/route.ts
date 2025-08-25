import { NextRequest, NextResponse } from 'next/server'
import { validateAppwriteJWT } from '@/lib/appwriteAuth'

export async function POST(req: NextRequest) {
  console.log('=== TEST EVIDENCE API CALLED ===')
  
  try {
    // Check authentication
    const authz = req.headers.get('authorization') || ''
    console.log('Authorization header:', authz ? 'Present' : 'Missing')
    
    if (!authz.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const jwt = authz.substring('Bearer '.length).trim()
    console.log('JWT length:', jwt.length)
    
    const verified = await validateAppwriteJWT(jwt)
    console.log('JWT verification result:', verified ? 'Valid' : 'Invalid')
    
    if (!verified) {
      console.log('❌ JWT verification failed')
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }
    
    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as unknown as File | null
    console.log('File received:', file ? `${file.name} (${file.type}, ${file.size} bytes)` : 'None')
    
    if (!file) {
      console.log('❌ No file in form data')
      return NextResponse.json({ error: 'file missing' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }
    
    console.log('✅ All validations passed')
    return NextResponse.json({ 
      success: true, 
      message: 'File upload test successful',
      file: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    })
    
  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as Error).message 
    }, { status: 500 })
  }
}
