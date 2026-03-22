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

export const LANGUAGE_OPTIONS = ['English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sesotho', 'Setswana']

export const SCHOOL_OPTIONS = [
  'Amabali Primary',
  'Greenfield Primary',
  'Sunnydale Primary',
  'Other',
]

export const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// Types
export interface LeaderboardEntry {
  student_name: string
  school: string | null
  grade: number | null
  language: string | null
  review_count: number
  total_words: number
  earnings_cents: number
  avg_rating: number
  quality_score: number
}

export interface BookReview {
  id: string
  session_id: string
  review_title: string | null
  book_title: string
  book_author: string | null
  student_name: string
  school: string | null
  grade: number | null
  language: string
  content: string
  star_rating: number
  word_count: number
  earnings_cents: number
  avg_external_rating: number
  external_rating_count: number
  is_approved: boolean
  created_at: string
}

export interface Story {
  id: string
  title: string
  content: string
  author_name: string
  school: string | null
  grade: number | null
  category: string
  word_count: number
  avg_external_rating: number
  external_rating_count: number
  created_at: string
}

export interface StoryComment {
  id: string
  session_id: string
  story_id: string
  content: string
  commenter_name: string | null
  approval_status: string
  created_at: string
}

// Utility functions
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function calcEarnings(wordCount: number): number {
  return wordCount * RATE_PER_WORD
}

export function calculateEarnings(wordCount: number): number {
  return calcEarnings(wordCount)
}

export function formatRands(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`
}

export function formatCurrency(cents: number): string {
  return formatRands(cents)
}

export function getMilestone(wordCount: number) {
  return [...MILESTONES].reverse().find(m => wordCount >= m.words) || null
}

// Generate a session ID from browser fingerprint
export function generateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const stored = sessionStorage.getItem('amabali_session_id')
  if (stored) return stored
  
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  sessionStorage.setItem('amabali_session_id', id)
  return id
}

// Database functions
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_student_leaderboard')

  if (error) {
    console.error('Error fetching leaderboard:', error)
    // Fallback to manual aggregation
    return getLeaderboardFallback()
  }
  return (data || []) as LeaderboardEntry[]
}

async function getLeaderboardFallback(): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('book_reviews')
    .select('student_name, school, grade, language, word_count, earnings_cents, avg_external_rating, external_rating_count')
    .eq('is_approved', true)

  if (error) {
    console.error('Error in leaderboard fallback:', error)
    return []
  }

  // Aggregate by student name (case-insensitive)
  const leaderboardMap = new Map<string, LeaderboardEntry>()
  for (const review of data || []) {
    const key = review.student_name.toLowerCase().trim()
    const existing = leaderboardMap.get(key)
    if (existing) {
      existing.review_count++
      existing.total_words += review.word_count
      existing.earnings_cents += review.earnings_cents
      // Recalculate averages
      const totalRatingCount = existing.review_count
      existing.avg_rating = ((existing.avg_rating * (totalRatingCount - 1)) + (review.avg_external_rating || 0)) / totalRatingCount
    } else {
      leaderboardMap.set(key, {
        student_name: review.student_name,
        school: review.school,
        grade: review.grade,
        language: review.language,
        review_count: 1,
        total_words: review.word_count,
        earnings_cents: review.earnings_cents,
        avg_rating: review.avg_external_rating || 0,
        quality_score: 0,
      })
    }
  }

  // Calculate quality scores and sort
  const entries = Array.from(leaderboardMap.values())
  for (const entry of entries) {
    entry.quality_score = entry.avg_rating * 0.7 + Math.min(entry.review_count / 10, 1) * 5 * 0.3
  }

  return entries.sort((a, b) => b.quality_score - a.quality_score || b.avg_rating - a.avg_rating || b.earnings_cents - a.earnings_cents)
}

export async function getReviews(limit = 50): Promise<BookReview[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('book_reviews')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return (data || []) as BookReview[]
}

export async function submitReview(review: {
  session_id: string
  book_title: string
  book_author: string
  student_name: string
  school: string
  grade: number
  language: string
  content: string
  star_rating: number
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

export async function submitExternalRating(
  sessionId: string,
  targetId: string,
  targetType: 'review' | 'story',
  rating: number
): Promise<boolean> {
  const supabase = createClient()
  
  // Try to insert the rating (will fail if duplicate due to unique constraint)
  const { error } = await supabase
    .from('external_ratings')
    .insert({
      session_id: sessionId,
      target_id: targetId,
      target_type: targetType,
      rating,
    })

  if (error) {
    if (error.code === '23505') {
      // Duplicate - user already rated
      return false
    }
    throw new Error(error.message)
  }

  // Update the target's average rating
  const { data: ratings } = await supabase
    .from('external_ratings')
    .select('rating')
    .eq('target_id', targetId)

  if (ratings && ratings.length > 0) {
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    const table = targetType === 'review' ? 'book_reviews' : 'stories'
    
    await supabase
      .from(table)
      .update({
        avg_external_rating: avgRating,
        external_rating_count: ratings.length,
      })
      .eq('id', targetId)
  }

  return true
}

export async function getStories(limit = 50): Promise<Story[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching stories:', error)
    return []
  }
  return (data || []) as Story[]
}

export async function submitStory(story: {
  title: string
  content: string
  author_name: string
  school: string
  grade: number
  category: string
  word_count: number
}): Promise<Story> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('stories')
    .insert(story)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Story
}

export async function getStoryComments(storyId: string): Promise<StoryComment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('story_comments')
    .select('*')
    .eq('story_id', storyId)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  return (data || []) as StoryComment[]
}

export async function submitComment(comment: {
  session_id: string
  story_id: string
  content: string
  commenter_name: string
}): Promise<StoryComment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('story_comments')
    .insert(comment)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as StoryComment
}
