/**
 * Privacy-focused hashing utilities for $ave+
 * Used to anonymize user data before sending to analytics
 */

/**
 * Simple hash function for user IDs (SHA-256)
 * Ensures user privacy in analytics without requiring server roundtrip
 */
export async function hashUserId(userId: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback for environments without Web Crypto API
    return simpleHash(userId);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16); // First 16 chars for brevity
  } catch (error) {
    console.warn('[Hash] Crypto API failed, using fallback:', error);
    return simpleHash(userId);
  }
}

/**
 * Simple fallback hash function
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Bucket monetary amounts into ranges for privacy
 * e.g., £156.78 → "100-250"
 */
export function bucketAmount(amount: number): string {
  const buckets = [
    { max: 10, label: '0-10' },
    { max: 25, label: '10-25' },
    { max: 50, label: '25-50' },
    { max: 100, label: '50-100' },
    { max: 250, label: '100-250' },
    { max: 500, label: '250-500' },
    { max: 1000, label: '500-1000' },
    { max: 2500, label: '1000-2500' },
    { max: 5000, label: '2500-5000' },
    { max: 10000, label: '5000-10000' },
    { max: Infinity, label: '10000+' },
  ];

  const bucket = buckets.find(b => amount < b.max);
  return bucket?.label || '10000+';
}
