'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/Button'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  logoPosition?: string
  logoSize?: string
  logoEnabled?: boolean
  onLogoUpdate: () => void
}

export function LogoUpload({
  currentLogoUrl,
  logoPosition = 'bottom-right',
  logoSize = 'medium',
  logoEnabled = true,
  onLogoUpdate
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [position, setPosition] = useState(logoPosition)
  const [size, setSize] = useState(logoSize)
  const [enabled, setEnabled] = useState(logoEnabled)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/profile/logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload logo')
      }

      setSuccess('Logo uploaded successfully!')
      onLogoUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('Are you sure you want to delete your logo?')) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/profile/logo', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete logo')
      }

      setSuccess('Logo deleted successfully!')
      onLogoUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to delete logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSettingsUpdate = async () => {
    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/profile/logo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoPosition: position,
          logoSize: size,
          logoEnabled: enabled
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      setSuccess('Settings updated successfully!')
      onLogoUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Logo */}
      {currentLogoUrl && (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
          <img
            src={currentLogoUrl}
            alt="Company logo"
            className="h-16 w-16 object-contain bg-white/10 rounded"
          />
          <div className="flex-1">
            <p className="text-white/80 text-sm">Current logo</p>
          </div>
          <Button
            onClick={handleDeleteLogo}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Upload */}
      <div>
        <label className="block text-white/80 text-sm mb-2">
          {currentLogoUrl ? 'Replace Logo' : 'Upload Logo'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">{uploading ? 'Uploading...' : 'Choose File'}</span>
          </label>
        </div>
        <p className="text-white/50 text-xs mt-1">PNG or JPG, max 5MB</p>
      </div>

      {/* Settings */}
      {currentLogoUrl && (
        <div className="space-y-3 p-4 bg-white/5 rounded-lg">
          <div>
            <label className="block text-white/80 text-sm mb-2">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="center">Center</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white/80 text-sm">Apply by default</label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <Button
            onClick={handleSettingsUpdate}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
          {success}
        </div>
      )}
    </div>
  )
}
