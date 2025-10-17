import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, X, Check, AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'

interface FeedbackButtonsProps {
  postId: string
  resetKey?: number | string
  onFeedbackSubmitted?: () => void
}

type FeedbackMode = 'idle' | 'success' | 'error' | 'needsWorkInput'

export function FeedbackButtons({ postId, resetKey, onFeedbackSubmitted }: FeedbackButtonsProps) {
  const [mode, setMode] = useState<FeedbackMode>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Reset UI whenever postId or resetKey changes
  useEffect(() => {
    setMode('idle')
    setNote('')
    setErrorMessage('')
    setSuccessMessage('')
  }, [postId, resetKey])

  const submitFeedback = async (rating: 'up' | 'down', feedbackNote?: string) => {
    // Validate postId before submitting
    if (!postId || postId === '') {
      console.error('[FeedbackButtons] No postId available, postId:', postId)
      setErrorMessage('This post needs to be regenerated before you can provide feedback. Please click "Regenerate Post" to create a new version.')
      setMode('error')
      return
    }

    console.log('[FeedbackButtons] Submitting feedback:', { postId, rating, note: feedbackNote })
    
    setSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          rating,
          note: feedbackNote ?? ''
        })
      })
      
      const data = await response.json()
      console.log('[FeedbackButtons] API response:', { ok: response.ok, status: response.status, data })
      
      if (!response.ok) {
        // Use the detailed message from the API if available
        const errorMsg = data.message || data.error || 'Failed to save feedback'
        setErrorMessage(errorMsg)
        setMode('error')
      } else {
        // Store the success message from the API
        setSuccessMessage(data.message || 'Thanks! SOCIAL ECHO is learning from your feedback.')
        setMode('success')
        onFeedbackSubmitted?.()
      }
    } catch (err: any) {
      console.error('[FeedbackButtons] Feedback error:', err)
      setErrorMessage(err.message || 'Failed to save feedback')
      setMode('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoodClick = () => {
    submitFeedback('up', '')
  }

  const handleNeedsWorkClick = () => {
    setMode('needsWorkInput')
  }

  const handleSubmitNote = () => {
    submitFeedback('down', note.trim() || '')
  }

  const handleSkipNote = () => {
    submitFeedback('down', '')
  }

  const handleDismiss = () => {
    setMode('idle')
    setNote('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  // Success banner
  if (mode === 'success') {
    return (
      <div className="relative rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
        <button
          aria-label="Dismiss"
          className="absolute right-2 top-2 text-emerald-700/70 hover:text-emerald-900 transition-colors"
          onClick={handleDismiss}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-900">
              {successMessage}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error banner
  if (mode === 'error') {
    return (
      <div className="relative rounded-lg border-2 border-rose-300 bg-rose-50 p-4">
        <button
          aria-label="Dismiss"
          className="absolute right-2 top-2 text-rose-700/70 hover:text-rose-900 transition-colors"
          onClick={handleDismiss}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-900">
              {errorMessage || 'Something went wrong saving your feedback. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Needs Work input
  if (mode === 'needsWorkInput') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium">What could be better?</span>
        </div>
        
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., 'Too formal', 'Add more personality', 'Include statistics'..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
          disabled={submitting}
        />
        
        <div className="flex gap-2">
          <Button
            onClick={handleSubmitNote}
            disabled={submitting || !postId}
            className="flex-1"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
          <Button
            onClick={handleSkipNote}
            disabled={submitting || !postId}
            variant="secondary"
          >
            Skip Note
          </Button>
          <Button
            onClick={handleDismiss}
            disabled={submitting}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Idle mode - show the two buttons
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <span className="font-medium">How was this draft?</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleGoodClick}
          disabled={submitting || !postId}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Good
        </Button>
        <Button
          onClick={handleNeedsWorkClick}
          disabled={submitting || !postId}
          variant="secondary"
          className="flex-1"
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Needs Work
        </Button>
      </div>
      
      {!postId && (
        <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
          ⚠️ To provide feedback, please regenerate this post. Click "Regenerate Post" above.
        </p>
      )}
    </div>
  )
}

