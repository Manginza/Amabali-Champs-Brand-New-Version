import { createClient } from '@/lib/supabase/client'

// Constants
export const RATE_PER_WORD = 2 // R0.02 per word (in cents)
export const MIN_WORDS = 20

export const AVATAR_OPTIONS = [
  '📚', '🦁', '🐯', '🦊', '🐸', '🦉', '🐝', '🦋',
  '🌟', '🚀', '🎯', '🏆', '💎', '🔥', '⚡', '🌈'
]

export const MILESTONES = [
  { words: 50, message: 'Great start! Keep writing!' },
  { words: 100, message: 'Wow! 100 words - you are on fire!' },
  { words: 200, message: 'Amazing! 200 words - true champion!' },
  { words: 300, message: 'Incredible! 300 words - unstoppable!' },
  { words: 500, message: 'LEGENDARY! 500+ words - you are a superstar!' },
]

// Types
export interface LeaderboardEntry {
  learner_id: string
  learner_name: string
  avatar_emoji: string
  session_id: string
  review_count: number
  total_words: number
  total_earnings: number
  avg_rating: number
}

export interface ReadingSession {
  id: string
  name: string
  description: string | null
  start_time: string
  end_time: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface BookReview {
  id: string
  session_id: string
  learner_id: string
  learner_name: string
  avatar_emoji: string
  book_title: string
  book_author: string | null
  star_rating: number
  review_text: string
  word_count: number
  earnings_cents: number
  submitted_at: string
}

// Utility functions
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function calcEarnings(wordCount: number): number {
  return wordCount * RATE_PER_WORD
}

// Alias for calcEarnings (used by components)
export function calculateEarnings(wordCount: number): number {
  return calcEarnings(wordCount)
}

export function formatRands(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`
}

// Alias for formatRands (used by components)
export function formatCurrency(cents: number): string {
  return formatRands(cents)
}

export function getMilestone(wordCount: number) {
  return [...MILESTONES].reverse().find(m => wordCount >= m.words) || null
}

// Database functions
export async function getActiveSession(): Promise<ReadingSession | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as ReadingSession
}

export async function getLeaderboard(sessionId: string): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('session_id', sessionId)
    .order('total_words', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  return (data || []) as LeaderboardEntry[]
}

export async function getSessionReviews(sessionId: string): Promise<BookReview[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('book_reviews')
    .select('*')
    .eq('session_id', sessionId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return (data || []) as BookReview[]
}

export async function submitReview(review: {
  session_id: string
  learner_id: string
  learner_name: string
  avatar_emoji: string
  book_title: string
  book_author: string
  star_rating: number
  review_text: string
  word_count: number
  earnings_cents: number
}): Promise<BookReview> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('book_reviews')
    .insert(review)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BookReview
}
