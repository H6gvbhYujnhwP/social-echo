'use client'

export interface UserProfile {
  business_name: string
  industry: string
  tone: 'professional' | 'casual' | 'funny' | 'bold'
  products_services: string
  target_audience: string
  keywords: string[]
  rotation: 'serious' | 'quirky'
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  
  try {
    const profile = localStorage.getItem('profile')
    return profile ? JSON.parse(profile) : null
  } catch (error) {
    console.error('Error reading profile from localStorage:', error)
    return null
  }
}

export function setProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('profile', JSON.stringify(profile))
  } catch (error) {
    console.error('Error saving profile to localStorage:', error)
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('profile')
  } catch (error) {
    console.error('Error clearing profile from localStorage:', error)
  }
}
