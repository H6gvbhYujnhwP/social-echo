'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, RotateCcw, Save, CheckCircle, ArrowLeft } from 'lucide-react'
import { 
  getOrCreatePlanner, 
  setPlanner, 
  resetToDefaultPlanner,
  type Planner, 
  type PlannerDay, 
  type PostType 
} from '../../lib/localstore'

const dayLabels = {
  mon: 'Monday',
  tue: 'Tuesday', 
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday'
}

const postTypeLabels = {
  selling: 'Selling',
  informational: 'Info',
  advice: 'Advice',
  news: 'News'
}

const postTypeColors = {
  selling: 'bg-green-500/20 text-green-300 border-green-400/30',
  informational: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  advice: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  news: 'bg-orange-500/20 text-orange-300 border-orange-400/30'
}

export default function PlannerPage() {
  const router = useRouter()
  const [planner, setLocalPlanner] = useState<Planner | null>(null)
  const [showSaveToast, setShowSaveToast] = useState(false)

  useEffect(() => {
    // Load planner from database
    const loadPlanner = async () => {
      try {
        const response = await fetch('/api/planner')
        if (response.ok) {
          const data = await response.json()
          setLocalPlanner({ version: 1, days: data.days })
        } else {
          // Fallback to localStorage
          setLocalPlanner(getOrCreatePlanner())
        }
      } catch (error) {
        console.error('Failed to load planner:', error)
        // Fallback to localStorage
        setLocalPlanner(getOrCreatePlanner())
      }
    }
    
    loadPlanner()
  }, [])

  const updateDay = (dayKey: PlannerDay['day'], updates: Partial<PlannerDay>) => {
    if (!planner) return
    
    const updatedPlanner = {
      ...planner,
      days: planner.days.map(day => 
        day.day === dayKey ? { ...day, ...updates } : day
      )
    }
    setLocalPlanner(updatedPlanner)
  }

  const handleSave = async () => {
    if (!planner) return
    
    try {
      // Save to database via API
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planner.days)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save planner')
      }
      
      // Also save to localStorage for backward compatibility
      setPlanner(planner)
      
      setShowSaveToast(true)
      
      // Redirect to dashboard after a brief delay to show the toast
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Failed to save planner:', error)
      alert('Failed to save planner. Please try again.')
    }
  }

  const handleReset = () => {
    resetToDefaultPlanner()
    setLocalPlanner(getOrCreatePlanner())
  }

  if (!planner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading planner...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-white mr-3" />
            <h1 className="text-4xl font-bold text-white">Content Mix Planner</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Plan your weekly content mix to build authority, deliver value, and drive sales. 
            The perfect balance: 3 Advice, 3 Informational, 1 Selling post per week.
          </p>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {planner.days.map((day) => (
            <div
              key={day.day}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {dayLabels[day.day]}
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => updateDay(day.day, { enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    day.enabled 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-white/40 hover:border-white/60'
                  }`}>
                    {day.enabled && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                </label>
              </div>

              {/* Post Type Pills */}
              <div className="space-y-2 mb-4">
                {(['selling', 'informational', 'advice', 'news'] as PostType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateDay(day.day, { type })}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                      day.type === type
                        ? postTypeColors[type]
                        : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {postTypeLabels[type]}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="text-center">
                {day.enabled ? (
                  <span className="text-green-300 text-sm">
                    ✓ {postTypeLabels[day.type]} post
                  </span>
                ) : (
                  <span className="text-red-300 text-sm">
                    No post scheduled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleReset}
            className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset to recommended mix
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Planner
          </button>
        </div>

        {/* Weekly Summary */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            {(['advice', 'informational', 'selling', 'news'] as PostType[]).map((type) => {
              const count = planner.days.filter(d => d.enabled && d.type === type).length
              return (
                <div key={type} className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-white/70 capitalize">{type}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-in slide-in-from-bottom-2">
          <CheckCircle className="h-5 w-5 mr-2" />
          Planner updated successfully!
        </div>
      )}
    </div>
  )
}
