'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface CustomPhoto {
  id: string
  name: string
  base64: string
  uploadedAt: string
}

interface CustomPhotoUploadProps {
  onPhotoSelect?: (photoId: string) => void
  selectedPhotoId?: string
}

export default function CustomPhotoUpload({ onPhotoSelect, selectedPhotoId }: CustomPhotoUploadProps) {
  const [photos, setPhotos] = useState<CustomPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load photos on mount
  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    try {
      const response = await fetch('/api/profile/custom-photos')
      if (!response.ok) throw new Error('Failed to load photos')
      const data = await response.json()
      setPhotos(data.photos || [])
    } catch (err: any) {
      console.error('Error loading photos:', err)
      setError(err.message)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/profile/custom-photos', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload photo')
      }

      const data = await response.json()
      
      // Reload photos
      await loadPhotos()

      // Auto-select the newly uploaded photo
      if (onPhotoSelect) {
        onPhotoSelect(data.photoId)
      }

    } catch (err: any) {
      console.error('Error uploading photo:', err)
      setError(err.message)
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const response = await fetch(`/api/profile/custom-photos/${photoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete photo')

      // Reload photos
      await loadPhotos()

      // Deselect if this was the selected photo
      if (selectedPhotoId === photoId && onPhotoSelect) {
        onPhotoSelect('')
      }

    } catch (err: any) {
      console.error('Error deleting photo:', err)
      setError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Custom Photo</h3>
        <span className="text-xs text-gray-500">{photos.length > 0 ? '1 photo' : 'No photo'}</span>
      </div>

      {/* Upload Button */}
      <label className={`
        flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg
        cursor-pointer transition-colors
        ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:bg-purple-50'}
      `}>
        <Upload className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          {uploading ? 'Uploading...' : photos.length > 0 ? 'Replace Photo' : 'Upload Photo'}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Single Photo Display */}
      {photos.length > 0 ? (
        <div className="">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`
                relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                ${selectedPhotoId === photo.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'}
              `}
              onClick={() => onPhotoSelect?.(photo.id)}
            >
              <img
                src={photo.base64}
                alt={photo.name}
                className="w-full h-32 object-cover"
              />
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(photo.id)
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Selected Indicator */}
              {selectedPhotoId === photo.id && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Selected
                  </div>
                </div>
              )}

              {/* Photo Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                {photo.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Upload your product photo, team photo, or any image you want to use with AI-generated backdrops.
        {photos.length > 0 ? ' Uploading a new photo will replace the current one.' : ''}
        Max 5MB. Supported formats: PNG, JPG, WEBP.
      </p>
    </div>
  )
}
