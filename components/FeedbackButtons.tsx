'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react'
import { Button } from './ui/Button'

interface FeedbackButtonsProps {
  postId: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackButtons({ postId, onFeedbackSubmitted }: FeedbackButtonsProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<'up' | 'down' | null>(null)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFeedback = (feedback: 'up' | 'down') => {
    setSelectedFeedback(feedback)
    
    if (feedback === 'down') {
      // For downvotes, show note input
      setShowNoteInput(true)
    } else {
      // For upvotes, submit immediately without note
      submitFeedback(feedback, null)
    }
  }

  const submitFeedback = async (feedback: 'up' | 'down', feedbackNote: string | null) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          rating: feedback,
          note: feedbackNote
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save feedback')
      }
      
      setSubmitted(true)
      onFeedbackSubmitted?.()
      
      // Hide the feedback UI after 3 seconds
      setTimeout(() => {
        setShowNoteInput(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNote = () => {
    if (selectedFeedback) {
      submitFeedback(selectedFeedback, note.trim() || null)
    }
  }

  const handleSkipNote = () => {
    if (selectedFeedback) {
      submitFeedback(selectedFeedback, null)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">
          Thanks! SOCIAL ECHO is learning from your feedback.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Feedback Buttons */}
      {!showNoteInput && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">How was this draft?</span>
          <Button
            onClick={() => handleFeedback('up')}
            variant="outline"
            size="sm"
            disabled={loading}
            className={`flex items-center gap-1.5 ${
              selectedFeedback === 'up'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Good</span>
          </Button>
          <Button
            onClick={() => handleFeedback('down')}
            variant="outline"
            size="sm"
            disabled={loading}
            className={`flex items-center gap-1.5 ${
              selectedFeedback === 'down'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'hover:bg-red-50 hover:border-red-300'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Needs Work</span>
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Optional Note Input (shown for downvotes) */}
      {showNoteInput && !submitted && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Give SOCIAL ECHO your feedback so it learns to give you a better experience!
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Too formal, add cash flow stats, remove hashtags..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={handleSkipNote}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitNote}
              size="sm"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Saving...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
