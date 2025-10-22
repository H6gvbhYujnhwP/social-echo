'use client'

import { useState, useEffect } from 'react'
import { X, Clock, RotateCcw, Eye, Loader2 } from 'lucide-react'
import { postTypeDisplay, getPostTypeIcon } from '@/lib/post-type-mapping'

interface HistoryItem {
  id: string
  createdAt: string
  headlineOptions: string[]
  postText: string
  hashtags: string[]
  imageUrl?: string | null
  imageStyle?: string | null
  postType: string
  tone: string
  visualPrompt: string
  customisationsUsed?: number
}

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (item: HistoryItem) => void
  onPreview: (item: HistoryItem) => void
}

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  onRestore,
  onPreview 
}: HistoryDrawerProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch history when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen])

  const fetchHistory = async (cursor?: string) => {
    const isInitialLoad = !cursor
    if (isInitialLoad) {
      setLoading(true)
      setHistoryItems([])
    } else {
      setLoadingMore(true)
    }
    
    setError(null)

    try {
      const url = cursor 
        ? `/api/history?limit=20&cursor=${cursor}`
        : '/api/history?limit=20'
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        if (isInitialLoad) {
          setHistoryItems(data.items || [])
        } else {
          setHistoryItems(prev => [...prev, ...(data.items || [])])
        }
        
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore || false)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch history:', errorText)
        setError('Failed to load history')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      setError('Failed to load history')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchHistory(nextCursor)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 0) return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer - Desktop: Right panel, Mobile: Bottom sheet */}
      <div
        className={`
          fixed z-50 bg-white dark:bg-gray-800 shadow-2xl
          transition-transform duration-300 ease-in-out
          
          /* Desktop: Right panel */
          lg:top-0 lg:right-0 lg:h-full lg:w-96
          ${isOpen ? 'lg:translate-x-0' : 'lg:translate-x-full'}
          
          /* Mobile: Bottom sheet */
          bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          lg:translate-y-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Draft History
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({historyItems.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
          <p className="text-xs text-purple-700 dark:text-purple-300">
            ✨ All your drafts are saved automatically
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchHistory()}
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No history yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Generate a post to see your drafts here
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {historyItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Image thumbnail (if exists) */}
                    {item.imageUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={item.imageUrl}
                          alt="Draft image"
                          className="w-full h-32 object-cover"
                        />
                        {item.imageStyle && (
                          <div className="px-2 py-1 bg-black/50 text-white text-xs">
                            {item.imageStyle}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Headline */}
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {item.headlineOptions[0] || 'Untitled'}
                    </h4>

                    {/* Post text preview */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {truncateText(item.postText, 80)}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{getPostTypeIcon(item.postType)} {postTypeDisplay(item.postType)}</span>
                      <span>•</span>
                      <span className="capitalize">{item.tone}</span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onPreview(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => onRestore(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

