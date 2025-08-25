"use client"

interface Evidence {
  id: string
  type: string
  storage_url: string
  hash?: string
  exif_removed?: boolean
  redactions_applied?: boolean
  pii_flags?: string[]
  ocr_text?: string
}

interface EvidenceGalleryProps {
  evidence: Evidence[]
}

export default function EvidenceGallery({ evidence }: EvidenceGalleryProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 font-medium">No evidence attached</p>
        <p className="text-gray-500 text-sm mt-1">This incident report does not include supporting documentation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-700 font-medium">
        {evidence.length} piece{evidence.length !== 1 ? 's' : ''} of evidence attached
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map((item, index) => (
          <div key={item.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={item.storage_url}
                alt={`Evidence ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Evidence #{index + 1}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">{item.type}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                ID: {item.id}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
