'use client'

export interface UserProfile {
  business_name: string
  website: string
  industry: string
  tone: 'professional' | 'casual' | 'funny' | 'bold'
  products_services: string
  target_audience: string
  usp: string  // Unique Selling Point
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

// Content Mix Planner types and utilities
export type PostType = 'selling' | 'informational' | 'advice' | 'news';

export interface PlannerDay {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  type: PostType;
  enabled: boolean;
}

export interface Planner {
  version: 1;
  days: PlannerDay[];
}

// Default weekly schedule: 3 Advice, 3 Informational, 1 Selling
const DEFAULT_PLANNER: Planner = {
  version: 1,
  days: [
    { day: 'mon', type: 'informational', enabled: true },
    { day: 'tue', type: 'advice', enabled: true },
    { day: 'wed', type: 'informational', enabled: true },
    { day: 'thu', type: 'advice', enabled: true },
    { day: 'fri', type: 'selling', enabled: true },
    { day: 'sat', type: 'advice', enabled: true },
    { day: 'sun', type: 'informational', enabled: true },
  ]
};

export function getPlanner(): Planner | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('social-echo-planner');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate the structure
    if (parsed.version !== 1 || !Array.isArray(parsed.days) || parsed.days.length !== 7) {
      return null;
    }
    
    return parsed as Planner;
  } catch (error) {
    console.error('Error reading planner from localStorage:', error);
    return null;
  }
}

export function setPlanner(planner: Planner): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('social-echo-planner', JSON.stringify(planner));
  } catch (error) {
    console.error('Error saving planner to localStorage:', error);
  }
}

export function getOrCreatePlanner(): Planner {
  const existing = getPlanner();
  if (existing) return existing;
  
  // Seed with default schedule
  setPlanner(DEFAULT_PLANNER);
  return DEFAULT_PLANNER;
}

export function getTodayPostType(): { type: PostType; enabled: boolean } | null {
  const planner = getPlanner();
  if (!planner) return null;
  
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayMap[today] as PlannerDay['day'];
  
  const todayPlan = planner.days.find(d => d.day === todayKey);
  return todayPlan ? { type: todayPlan.type, enabled: todayPlan.enabled } : null;
}

export function resetToDefaultPlanner(): void {
  setPlanner(DEFAULT_PLANNER);
}
