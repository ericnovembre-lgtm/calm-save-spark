/**
 * Merchant Logo & Name Utilities
 */

/**
 * Generate consistent hash from string
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate colored avatar for merchant
 */
export function generateMerchantAvatar(merchant: string) {
  const words = merchant.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);

  const hue = hashCode(merchant) % 360;
  
  return {
    initials: initials || '?',
    bgColor: `hsl(${hue}, 65%, 50%)`,
    textColor: '#ffffff',
  };
}

/**
 * Get Clearbit logo URL for merchant
 */
export function getClearbitLogoUrl(merchant: string): string {
  // Extract domain from merchant name (basic heuristic)
  const cleanName = merchant.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://logo.clearbit.com/${cleanName}.com`;
}

/**
 * Extract domain from merchant name
 */
export function extractDomain(merchant: string): string | null {
  // Common patterns for merchant names
  const patterns = [
    /([a-z0-9-]+)\.(com|net|org|io)/i, // domain.com
    /([a-z0-9]+)(?:\s|$)/i, // first word
  ];

  for (const pattern of patterns) {
    const match = merchant.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return merchant.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
}
