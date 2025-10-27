'use client'

import React, { useState, useEffect } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './ui/Button'

interface Document {
  filename: string
  uploadedAt: string
  fileType: string
  contentLength?: number
}

export function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Load existing documents
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/profile/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only DOC, DOCX, and TXT files are allowed' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/profile/documents', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `${file.name} uploaded successfully!` })
        loadDocuments() // Reload documents list
        
        // Clear the input
        e.target.value = ''
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Failed to upload document' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return

    try {
      const res = await fetch(`/api/profile/documents?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Document deleted' })
        loadDocuments()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Delete failed' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Failed to delete document' })
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
        <input
          type="file"
          id="document-upload"
          className="hidden"
          accept=".doc,.docx,.txt"
          onChange={handleFileUpload}
          disabled={uploading || documents.length >= 10}
        />
        <label
          htmlFor="document-upload"
          className={`cursor-pointer ${uploading || documents.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            DOC, DOCX, or TXT (max 5MB)
          </p>
          {documents.length >= 10 && (
            <p className="text-xs text-red-600 mt-2">
              Maximum 10 documents reached
            </p>
          )}
        </label>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-start gap-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm flex-1">{message.text}</p>
          <button
            onClick={() => setMessage(null)}
            className="text-current hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="text-center text-gray-500 py-4">
          Loading documents...
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Documents ({documents.length}/10)
          </h3>
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.uploadedAt)} • {formatFileSize(doc.contentLength)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.filename)}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                title="Delete document"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4 text-sm">
          No documents uploaded yet
        </div>
      )}

      {/* Info Text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900">
          Upload technical documents, instruction manuals, or reference materials. 
          The AI will randomly incorporate relevant information from these documents 
          when generating your social media posts, ensuring variety and avoiding repetition.
        </p>
      </div>
    </div>
  )
}

