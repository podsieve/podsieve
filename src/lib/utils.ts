// Rate limiting utility
interface RateLimitInfo {
  count: number;
  firstAttempt: number;
}

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5; // Max 5 submissions per hour

// Simple in-memory storage for rate limiting
// In a production app, you would use Redis or another persistent store
const rateLimitMap = new Map<string, RateLimitInfo>();

export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userRateLimit = rateLimitMap.get(identifier);

  if (!userRateLimit) {
    // First attempt
    rateLimitMap.set(identifier, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - userRateLimit.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset the window
    rateLimitMap.set(identifier, { count: 1, firstAttempt: now });
    return true;
  }

  if (userRateLimit.count >= MAX_ATTEMPTS) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  rateLimitMap.set(identifier, {
    count: userRateLimit.count + 1,
    firstAttempt: userRateLimit.firstAttempt
  });
  return true;
};

// Simple content validation to check for spam or abuse
export const isValidMessage = (message: string): boolean => {
  // Check for common spam indicators
  const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|prize|winner|loan|credit|mortgage)\b/i,
    /\b(free|offer|discount|unlimited|amazing|money|cash|dollar|investment)\b/i,
    /\b(https?:\/\/|www\.)/i // URLs - may want to allow some but restrict volume
  ];

  // Check content against patterns
  const spamScore = spamPatterns.reduce((score, pattern) => {
    return score + (pattern.test(message) ? 1 : 0);
  }, 0);

  // If too many spam indicators, reject the message
  return spamScore < 2;
};