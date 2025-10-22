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
  country?: string  // User's country for localized content (optional)
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
// v8.8 canonical post types (legacy types normalized at runtime)
export type PostType = 'selling' | 'information_advice' | 'random' | 'news'

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

// Feedback System types and utilities
export interface PostFeedback {
  postId: string;
  feedback: 'up' | 'down';
  note: string | null;
  timestamp: number;
  postType: PostType;
  tone: UserProfile['tone'];
  keywords: string[];
  hashtags: string[];
}

export interface PostHistory {
  postId: string;
  date: string; // YYYY-MM-DD
  postType: PostType;
  tone: UserProfile['tone'];
  headlineOptions: string[];
  postText: string;
  hashtags: string[];
  visualPrompt: string;
  feedback?: PostFeedback;
  createdAt: number;
}

export function savePostHistory(post: Omit<PostHistory, 'postId' | 'createdAt'>): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const postHistory: PostHistory = {
      ...post,
      postId,
      createdAt: Date.now()
    };
    
    const history = getPostHistory();
    history.push(postHistory);
    
    // Keep only last 100 posts
    const trimmed = history.slice(-100);
    localStorage.setItem('social-echo-post-history', JSON.stringify(trimmed));
    
    return postId;
  } catch (error) {
    console.error('Error saving post history:', error);
    return '';
  }
}

export function getPostHistory(): PostHistory[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('social-echo-post-history');
    if (!stored) return [];
    return JSON.parse(stored) as PostHistory[];
  } catch (error) {
    console.error('Error reading post history:', error);
    return [];
  }
}

export function savePostFeedback(postId: string, feedback: 'up' | 'down', note: string | null): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const history = getPostHistory();
    const postIndex = history.findIndex(p => p.postId === postId);
    
    if (postIndex === -1) {
      console.error('Post not found:', postId);
      return false;
    }
    
    const post = history[postIndex];
    const feedbackData: PostFeedback = {
      postId,
      feedback,
      note,
      timestamp: Date.now(),
      postType: post.postType,
      tone: post.tone,
      keywords: [], // Will be populated from profile at time of feedback
      hashtags: post.hashtags
    };
    
    history[postIndex].feedback = feedbackData;
    localStorage.setItem('social-echo-post-history', JSON.stringify(history));
    
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return false;
  }
}

export function getPostById(postId: string): PostHistory | null {
  const history = getPostHistory();
  return history.find(p => p.postId === postId) || null;
}

export function getFeedbackStats(): {
  totalFeedback: number;
  upvotes: number;
  downvotes: number;
  byPostType: Record<PostType, { up: number; down: number }>;
  byTone: Record<UserProfile['tone'], { up: number; down: number }>;
} {
  const history = getPostHistory();
  const withFeedback = history.filter(p => p.feedback);
  
  const stats = {
    totalFeedback: withFeedback.length,
    upvotes: withFeedback.filter(p => p.feedback?.feedback === 'up').length,
    downvotes: withFeedback.filter(p => p.feedback?.feedback === 'down').length,
    byPostType: {
      selling: { up: 0, down: 0 },
      informational: { up: 0, down: 0 },
      advice: { up: 0, down: 0 },
      news: { up: 0, down: 0 }
    } as Record<PostType, { up: number; down: number }>,
    byTone: {
      professional: { up: 0, down: 0 },
      casual: { up: 0, down: 0 },
      funny: { up: 0, down: 0 },
      bold: { up: 0, down: 0 }
    } as Record<UserProfile['tone'], { up: number; down: 0 }>
  };
  
  withFeedback.forEach(post => {
    if (!post.feedback) return;
    
    const feedbackType = post.feedback.feedback;
    if (feedbackType === 'up') {
      stats.byPostType[post.postType].up++;
      stats.byTone[post.tone].up++;
    } else {
      stats.byPostType[post.postType].down++;
      stats.byTone[post.tone].down++;
    }
  });
  
  return stats;
}
