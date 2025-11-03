'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rss, Plus, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

type RssFeed = {
  id: string
  url: string
  name: string | null
  createdAt: string
}

export function RssFeedManager() {
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newFeedName, setNewFeedName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load feeds on mount
  useEffect(() => {
    loadFeeds()
  }, [])

  const loadFeeds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile/rss-feeds')
      
      if (!response.ok) {
        throw new Error('Failed to load RSS feeds')
      }
      
      const data = await response.json()
      setFeeds(data.feeds || [])
    } catch (err: any) {
      console.error('Error loading RSS feeds:', err)
      setError(err.message || 'Failed to load RSS feeds')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newFeedUrl.trim()) {
      setError('Please enter an RSS feed URL')
      return
    }

    try {
      setIsAdding(true)
      setError(null)
      
      const response = await fetch('/api/profile/rss-feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: newFeedUrl.trim(),
          name: newFeedName.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add RSS feed')
      }

      // Success - add to list and reset form
      setFeeds([data.feed, ...feeds])
      setNewFeedUrl('')
      setNewFeedName('')
      setSuccessMessage('RSS feed added successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Error adding RSS feed:', err)
      setError(err.message || 'Failed to add RSS feed')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to remove this RSS feed?')) {
      return
    }

    try {
      const response = await fetch(`/api/profile/rss-feeds?id=${feedId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete RSS feed')
      }

      // Remove from list
      setFeeds(feeds.filter(f => f.id !== feedId))
      setSuccessMessage('RSS feed removed successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Error deleting RSS feed:', err)
      setError(err.message || 'Failed to delete RSS feed')
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Rss className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Custom RSS Feeds</h3>
          <p className="text-sm text-white/60">
            Add industry news sources to inspire AI-generated content
          </p>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-300 hover:text-red-100 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <p className="text-sm text-green-200">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Feed Form */}
      <form onSubmit={handleAddFeed} className="mb-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              RSS Feed URL *
            </label>
            <input
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isAdding}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Feed Name (optional)
            </label>
            <input
              type="text"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              placeholder="e.g., Industry News, FCA Updates"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isAdding}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isAdding || !newFeedUrl.trim()}
          className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding Feed...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add RSS Feed
            </>
          )}
        </button>
      </form>

      {/* Feeds List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white/80">
            Your RSS Feeds ({feeds.length}/20)
          </h4>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Rss className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No RSS feeds added yet</p>
            <p className="text-xs mt-1">Add your first feed above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {feeds.map((feed) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-white mb-1 truncate">
                        {feed.name || 'RSS Feed'}
                      </h5>
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{feed.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <p className="text-xs text-white/40 mt-1">
                        Added {new Date(feed.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      title="Remove feed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-200">
          <strong>How it works:</strong> The AI has a 40% chance of using an article from your RSS feeds 
          when generating posts. This adds timely, industry-specific context to your content while 
          maintaining variety through randomization.
        </p>
      </div>
    </div>
  )
}
