'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  Calendar,
  Trash2,
  Edit3,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface LearningSignals {
  preferredTerms: string[]
  avoidedTerms: string[]
  preferredTone: string | null
  preferredPostTypes: string[]
  confidence: number
  totalFeedback: number
  upvoteRate: number
  lastCalculated: string
  feedbackSince: string | null
}

interface FeedbackItem {
  id: string
  postId: string
  feedback: 'up' | 'down'
  note: string | null
  postType: string
  tone: string
  keywords: string[]
  hashtags: string[]
  createdAt: string
  post: {
    id: string
    post_text: string
    headlineOptions: string[]
  }
}

interface FeedbackHistory {
  feedback: FeedbackItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function LearningProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [signals, setSignals] = useState<LearningSignals | null>(null)
  const [history, setHistory] = useState<FeedbackHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingFeedback, setEditingFeedback] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])
  
  // Load learning signals and feedback history
  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status, currentPage])
  
  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      
      // Load learning signals
      const signalsRes = await fetch('/api/learning-signals')
      if (!signalsRes.ok) throw new Error('Failed to load learning signals')
      const signalsData = await signalsRes.json()
      setSignals(signalsData)
      
      // Load feedback history
      const historyRes = await fetch(`/api/feedback/history?page=${currentPage}&limit=10`)
      if (!historyRes.ok) throw new Error('Failed to load feedback history')
      const historyData = await signalsRes.json()
      setHistory(historyData)
      
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load learning profile')
    } finally {
      setLoading(false)
    }
  }
  
  async function deleteFeedback(feedbackId: string) {
    if (!confirm('Are you sure you want to delete this feedback? This will affect your AI\'s learning.')) {
      return
    }
    
    try {
      const res = await fetch('/api/feedback/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId })
      })
      
      if (!res.ok) throw new Error('Failed to delete feedback')
      
      setBanner({ type: 'success', message: 'Feedback deleted successfully' })
      loadData() // Reload data
      
    } catch (err: any) {
      setBanner({ type: 'error', message: err.message || 'Failed to delete feedback' })
    }
  }
  
  async function updateFeedback(feedbackId: string, rating: 'up' | 'down', note?: string | null) {
    try {
      const res = await fetch('/api/feedback/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, rating, note })
      })
      
      if (!res.ok) throw new Error('Failed to update feedback')
      
      setBanner({ type: 'success', message: 'Feedback updated successfully' })
      setEditingFeedback(null)
      loadData() // Reload data
      
    } catch (err: any) {
      setBanner({ type: 'error', message: err.message || 'Failed to update feedback' })
    }
  }
  
  function exportLearningProfile() {
    if (!signals || !history) return
    
    const exportData = {
      signals,
      history: history.feedback,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learning-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your learning profile...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-center">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Banner */}
        {banner && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            banner.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{banner.message}</span>
            </div>
            <button onClick={() => setBanner(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              My Learning Profile
            </h1>
            <p className="text-gray-400">
              Track how your AI learns from your feedback and customize its behavior
            </p>
          </div>
          <button
            onClick={exportLearningProfile}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Profile
          </button>
        </div>
        
        {/* Learning Signals Overview */}
        {signals && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                AI Learning Status
              </h2>
              {signals.confidence >= 30 && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Learning Active
                </span>
              )}
            </div>
            
            {/* Confidence Meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">AI Confidence</span>
                <span className="text-white font-bold text-lg">{signals.confidence}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    signals.confidence >= 70 ? 'bg-green-500' :
                    signals.confidence >= 40 ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${signals.confidence}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {signals.confidence >= 70 && 'Your AI has strong confidence in your preferences'}
                {signals.confidence >= 40 && signals.confidence < 70 && 'Your AI is learning your style'}
                {signals.confidence < 40 && 'Provide more feedback to help your AI learn'}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300 text-sm">Success Rate</span>
                </div>
                <p className="text-white text-2xl font-bold">{Math.round(signals.upvoteRate)}%</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">Total Feedback</span>
                </div>
                <p className="text-white text-2xl font-bold">{signals.totalFeedback}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300 text-sm">Learning Since</span>
                </div>
                <p className="text-white text-lg font-bold">
                  {signals.feedbackSince 
                    ? new Date(signals.feedbackSince).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            {/* Preferred Terms */}
            {signals.preferredTerms.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  Preferred Terms (from 👍 feedback)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {signals.preferredTerms.map((term, idx) => (
                    <span 
                      key={idx}
                      className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Avoided Terms */}
            {signals.avoidedTerms.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                  Avoided Terms (from 👎 feedback)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {signals.avoidedTerms.map((term, idx) => (
                    <span 
                      key={idx}
                      className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm line-through"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Preferred Tone & Post Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.preferredTone && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Preferred Tone</h3>
                  <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg inline-block capitalize">
                    {signals.preferredTone}
                  </span>
                </div>
              )}
              
              {signals.preferredPostTypes.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Preferred Post Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {signals.preferredPostTypes.map((type, idx) => (
                      <span 
                        key={idx}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm capitalize"
                      >
                        {type.replace('_', ' & ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {signals.confidence >= 30 && (
              <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Your feedback is now influencing post generation! The AI will prioritize your preferred terms and tone.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Feedback History */}
        {history && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Feedback History
            </h2>
            
            {history.feedback.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No feedback yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start generating posts and provide feedback to help your AI learn!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {history.feedback.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {item.feedback === 'up' ? (
                            <ThumbsUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                          ) : (
                            <ThumbsDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {item.post.headlineOptions?.[0] || 'Post'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFeedback(item.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Edit feedback"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFeedback(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete feedback"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {item.post.post_text}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white/10 text-gray-300 px-2 py-1 rounded capitalize">
                          {item.postType.replace('_', ' & ')}
                        </span>
                        <span className="bg-white/10 text-gray-300 px-2 py-1 rounded capitalize">
                          {item.tone}
                        </span>
                        {item.keywords.slice(0, 3).map((kw, idx) => (
                          <span key={idx} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                      
                      {item.note && (
                        <div className="mt-3 bg-white/5 rounded p-2">
                          <p className="text-gray-300 text-sm italic">"{item.note}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {history.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-gray-300">
                      Page {history.pagination.page} of {history.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(history.pagination.totalPages, p + 1))}
                      disabled={currentPage === history.pagination.totalPages}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
