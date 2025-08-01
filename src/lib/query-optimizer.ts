// Query optimization utilities for Giphy API
// Handles smart truncation and keyword prioritization

interface KeywordScore {
  word: string;
  score: number;
  category: 'emotion' | 'action' | 'descriptive' | 'generic' | 'film';
}

// Giphy API has a practical limit of ~100 characters for query parameter
// This accounts for URL encoding where spaces become '+' and special chars are encoded
const MAX_QUERY_LENGTH = 80;
const MIN_QUERY_LENGTH = 3;

// Keyword categories with priority scores
const EMOTION_WORDS = new Set([
  'happy', 'sad', 'angry', 'excited', 'nervous', 'confused', 'surprised',
  'disappointed', 'frustrated', 'anxious', 'worried', 'scared', 'afraid',
  'love', 'hate', 'joy', 'fear', 'anger', 'disgust', 'contempt', 'pride',
  'shame', 'guilt', 'envy', 'jealousy', 'hope', 'despair', 'relief',
  'betrayal', 'trust', 'doubt', 'confidence', 'insecurity', 'loneliness',
  'isolation', 'connection', 'belonging', 'rejection', 'acceptance',
  'crisis', 'panic', 'calm', 'peace', 'chaos', 'stress', 'tension'
]);

const ACTION_WORDS = new Set([
  'running', 'walking', 'jumping', 'dancing', 'fighting', 'crying',
  'laughing', 'screaming', 'whispering', 'talking', 'singing', 'eating',
  'drinking', 'sleeping', 'working', 'playing', 'studying', 'reading',
  'writing', 'driving', 'flying', 'falling', 'climbing', 'swimming',
  'cooking', 'cleaning', 'shopping', 'traveling', 'meeting', 'leaving',
  'arriving', 'waiting', 'searching', 'finding', 'losing', 'winning',
  'failing', 'succeeding', 'trying', 'giving', 'taking', 'helping',
  'hurting', 'healing', 'breaking', 'fixing', 'building', 'destroying',
  'creating', 'discovering', 'exploring', 'hiding', 'revealing',
  'escaping', 'chasing', 'catching', 'throwing', 'catching'
]);

const FILM_WORDS = new Set([
  'movie', 'film', 'cinema', 'scene', 'actor', 'actress', 'director',
  'character', 'plot', 'story', 'drama', 'comedy', 'action', 'thriller',
  'horror', 'romance', 'adventure', 'fantasy', 'scifi', 'documentary',
  'animation', 'musical', 'western', 'noir', 'indie', 'blockbuster'
]);

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'her', 'its', 'our', 'their', 'myself', 'yourself', 'himself', 'herself',
  'itself', 'ourselves', 'yourselves', 'themselves'
]);

function categorizeWord(word: string): KeywordScore['category'] {
  const lowerWord = word.toLowerCase();
  
  if (EMOTION_WORDS.has(lowerWord)) return 'emotion';
  if (ACTION_WORDS.has(lowerWord)) return 'action';
  if (FILM_WORDS.has(lowerWord)) return 'film';
  
  // Simple heuristics for descriptive words
  if (word.endsWith('ing') || word.endsWith('ed') || word.endsWith('ly')) {
    return 'descriptive';
  }
  
  return 'generic';
}

function getWordScore(word: string, category: KeywordScore['category']): number {
  const baseScores = {
    emotion: 10,
    action: 7,
    film: 6,
    descriptive: 5,
    generic: 2
  };
  
  let score = baseScores[category];
  
  // Boost score for longer, more specific words
  if (word.length > 6) score += 1;
  if (word.length > 8) score += 1;
  
  return score;
}

function preprocessQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function scoreKeywords(words: string[]): KeywordScore[] {
  return words
    .filter(word => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()))
    .map(word => {
      const category = categorizeWord(word);
      const score = getWordScore(word, category);
      return { word, score, category };
    })
    .sort((a, b) => b.score - a.score); // Sort by score descending
}

export function optimizeQuery(originalQuery: string, addFilmContext: boolean = true): string {
  console.log(`[Query Optimizer] Original query: "${originalQuery}"`);
  
  // Preprocess the query
  const cleanQuery = preprocessQuery(originalQuery);
  const words = cleanQuery.split(' ').filter(word => word.length > 0);
  
  // If query is already short enough, just add film context if needed
  const potentialQuery = addFilmContext ? `${cleanQuery} movie` : cleanQuery;
  if (potentialQuery.length <= MAX_QUERY_LENGTH) {
    console.log(`[Query Optimizer] Query within limits: "${potentialQuery}"`);
    return potentialQuery;
  }
  
  // Score and prioritize keywords
  const scoredKeywords = scoreKeywords(words);
  console.log(`[Query Optimizer] Scored keywords:`, scoredKeywords.map(k => `${k.word}(${k.score})`));
  
  // Build optimized query by adding highest-scoring words until we hit the limit
  let optimizedWords: string[] = [];
  let currentLength = 0;
  
  // Always try to include at least one film context word if requested
  if (addFilmContext) {
    optimizedWords.push('movie');
    currentLength = 5; // 'movie' length
  }
  
  for (const keyword of scoredKeywords) {
    const wordWithSpace = optimizedWords.length > 0 ? ` ${keyword.word}` : keyword.word;
    const newLength = currentLength + wordWithSpace.length;
    
    if (newLength <= MAX_QUERY_LENGTH) {
      optimizedWords.push(keyword.word);
      currentLength = newLength;
    } else {
      break;
    }
  }
  
  const finalQuery = optimizedWords.join(' ');
  
  // Fallback if we couldn't build a reasonable query
  if (finalQuery.length < MIN_QUERY_LENGTH) {
    const fallback = addFilmContext ? 'movie scene' : (scoredKeywords[0]?.word || 'emotion');
    console.log(`[Query Optimizer] Using fallback query: "${fallback}"`);
    return fallback;
  }
  
  console.log(`[Query Optimizer] Optimized query: "${finalQuery}" (${finalQuery.length} chars)`);
  return finalQuery;
}

export function validateQueryLength(query: string): { isValid: boolean; length: number; maxLength: number } {
  return {
    isValid: query.length <= MAX_QUERY_LENGTH && query.length >= MIN_QUERY_LENGTH,
    length: query.length,
    maxLength: MAX_QUERY_LENGTH
  };
}

export function createFallbackQuery(originalQuery: string): string {
  const words = preprocessQuery(originalQuery).split(' ');
  const scoredKeywords = scoreKeywords(words);
  
  // Use top 2 keywords + movie
  const topWords = scoredKeywords.slice(0, 2).map(k => k.word);
  const fallback = [...topWords, 'movie'].join(' ');
  
  console.log(`[Query Optimizer] Created fallback: "${fallback}"`);
  return fallback;
}