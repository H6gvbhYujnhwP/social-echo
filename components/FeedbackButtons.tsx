'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { savePostFeedback } from '../lib/localstore'

interface FeedbackButtonsProps {
  postId: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackButtons({ postId, onFeedbackSubmitted }: FeedbackButtonsProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<'up' | 'down' | null>(null)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

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

  const submitFeedback = (feedback: 'up' | 'down', feedbackNote: string | null) => {
    const success = savePostFeedback(postId, feedback, feedbackNote)
    
    if (success) {
      setSubmitted(true)
      onFeedbackSubmitted?.()
      
      // Hide the feedback UI after 3 seconds
      setTimeout(() => {
        setShowNoteInput(false)
      }, 3000)
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

      {/* Optional Note Input (shown for downvotes) */}
      {showNoteInput && !submitted && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tell us why (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Too formal, add cash flow stats, remove hashtags..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-end">
            <Button
              onClick={handleSkipNote}
              variant="outline"
              size="sm"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitNote}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
