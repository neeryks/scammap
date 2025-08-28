"use client"

import { useState } from 'react'
import { account } from '@/lib/appwrite.client'

export default function TestUploadPage() {
  const [uploadStatus, setUploadStatus] = useState<string>('idle')
  const [result, setResult] = useState<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)
    setUploadStatus('uploading')
    setResult(null)

    try {
      // Create JWT for authentication
      const jwt = await account.createJWT()
      console.log('JWT created successfully')

      const formData = new FormData()
      formData.append('file', file)

    console.log('Uploading to /api/evidence...')
    const response = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt.jwt}`
        },
        body: formData,
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (response.ok) {
        const result = JSON.parse(responseText)
        setResult(result)
        setUploadStatus('success')
        console.log('Upload successful:', result)
      } else {
        setUploadStatus('error')
        setResult({ error: responseText })
        console.error('Upload failed:', responseText)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setResult({ error: (error as Error).message || 'Unknown error' })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Test Upload</h1>
      
      <div className="space-y-4">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <div className="mt-4">
          <p><strong>Status:</strong> {uploadStatus}</p>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <strong>Result:</strong>
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
