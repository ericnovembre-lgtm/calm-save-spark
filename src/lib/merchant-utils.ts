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
 * Extract domain from merchant name with enhanced patterns
 */
export function extractDomain(merchant: string): string {
  const lower = merchant.toLowerCase();
  
  // Known merchant mappings
  const knownDomains: Record<string, string> = {
    'amazon': 'amazon.com',
    'walmart': 'walmart.com',
    'target': 'target.com',
    'starbucks': 'starbucks.com',
    'mcdonalds': 'mcdonalds.com',
    'uber': 'uber.com',
    'lyft': 'lyft.com',
    'spotify': 'spotify.com',
    'netflix': 'netflix.com',
    'apple': 'apple.com',
    'google': 'google.com',
    'microsoft': 'microsoft.com',
  };

  // Check for known merchants
  for (const [key, domain] of Object.entries(knownDomains)) {
    if (lower.includes(key)) {
      return domain;
    }
  }

  // Try to extract domain pattern
  const domainMatch = lower.match(/([a-z0-9-]+)\.(com|net|org|io|co)/i);
  if (domainMatch) {
    return domainMatch[0];
  }

  // Clean name and add .com
  const cleanName = lower.replace(/[^a-z0-9]/g, '').slice(0, 20);
  return `${cleanName}.com`;
}

/**
 * Get Clearbit logo URL for merchant
 */
export function getClearbitLogoUrl(merchant: string): string {
  const domain = extractDomain(merchant);
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Check if logo URL is accessible
 */
export async function checkLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
