"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { X, Eye, FileText } from 'lucide-react'

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

interface EvidenceGalleryClientProps {
  evidence: Evidence[]
}

export default function EvidenceGalleryClient({ evidence }: EvidenceGalleryClientProps) {
  const [selectedImage, setSelectedImage] = useState<Evidence | null>(null)

  const handleImageClick = (evidenceItem: Evidence) => {
    setSelectedImage(evidenceItem)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No evidence attached</p>
        <p className="text-gray-500 text-sm mt-1">This incident report does not include supporting documentation.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map((item, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleImageClick(item)}
          >
            <div className="aspect-square bg-gray-100 relative group">
              <img
                src={item.storage_url}
                alt={`Evidence ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {/* Security badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {item.exif_removed && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    EXIF Removed
                  </Badge>
                )}
                {item.redactions_applied && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    Redacted
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Evidence #{index + 1}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                ID: {item.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-6xl max-h-[95vh] w-full bg-white rounded-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Evidence Details</h3>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-4 max-h-[calc(95vh-80px)] overflow-y-auto">
              <div className="relative aspect-auto max-h-[60vh] bg-gray-50 rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedImage.storage_url}
                  alt="Evidence"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Evidence Information</h4>
                  <div className="flex gap-2">
                    {selectedImage.exif_removed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <FileText className="h-3 w-3 mr-1" />
                        EXIF Removed
                      </Badge>
                    )}
                    {selectedImage.redactions_applied && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <FileText className="h-3 w-3 mr-1" />
                        Redacted
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="ml-2">{selectedImage.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedImage.id}</span>
                  </div>
                  {selectedImage.hash && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Hash:</span>
                      <span className="ml-2 font-mono text-xs break-all">{selectedImage.hash}</span>
                    </div>
                  )}
                  {selectedImage.ocr_text && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Extracted Text:</span>
                      <p className="ml-2 mt-1 p-2 bg-gray-50 rounded text-sm">{selectedImage.ocr_text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
