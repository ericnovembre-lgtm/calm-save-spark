/**
 * Icon registry for $ave+ animated icons
 * 
 * Each icon has multiple format fallbacks in priority order:
 * 1. APNG (animated PNG with alpha) - best quality, limited browser support
 * 2. GIF (animated, widely supported)
 * 3. Static PNG (fallback for reduced motion)
 * 4. SVG (vector fallback)
 * 5. Emoji (ultimate fallback)
 */

export interface IconAsset {
  apng?: string;
  gif?: string;
  png?: string;
  svg?: string;
  emoji: string;
}

export interface IconDefinition {
  id: string;
  label: string;
  assets: IconAsset;
}

/**
 * $ave+ Animated Icon Registry
 * 
 * To add new icons:
 * 1. Add assets to public/icons/saveplus/
 * 2. Register the icon here with all available formats
 * 3. Use the icon via <SaveplusAnimIcon icon="your-icon-id" />
 */
export const saveplusAnimMap: Record<string, IconDefinition> = {
  'piggy-bank': {
    id: 'piggy-bank',
    label: 'Savings piggy bank',
    assets: {
      apng: '/icons/saveplus/piggy-bank.apng',
      gif: '/icons/saveplus/piggy-bank.gif',
      png: '/icons/saveplus/piggy-bank-static.png',
      emoji: '🐷'
    }
  },
  'money-growth': {
    id: 'money-growth',
    label: 'Money growing',
    assets: {
      apng: '/icons/saveplus/money-growth.apng',
      gif: '/icons/saveplus/money-growth.gif',
      png: '/icons/saveplus/money-growth-static.png',
      emoji: '📈'
    }
  },
  'coin-stack': {
    id: 'coin-stack',
    label: 'Stacking coins',
    assets: {
      apng: '/icons/saveplus/coin-stack.apng',
      gif: '/icons/saveplus/coin-stack.gif',
      png: '/icons/saveplus/coin-stack-static.png',
      emoji: '💰'
    }
  },
  'wallet': {
    id: 'wallet',
    label: 'Wallet',
    assets: {
      gif: '/icons/saveplus/wallet.gif',
      png: '/icons/saveplus/wallet-static.png',
      emoji: '👛'
    }
  },
  'target': {
    id: 'target',
    label: 'Goal target',
    assets: {
      gif: '/icons/saveplus/target.gif',
      png: '/icons/saveplus/target-static.png',
      emoji: '🎯'
    }
  },
  'rocket': {
    id: 'rocket',
    label: 'Growth rocket',
    assets: {
      gif: '/icons/saveplus/rocket.gif',
      png: '/icons/saveplus/rocket-static.png',
      emoji: '🚀'
    }
  },
  'sparkles': {
    id: 'sparkles',
    label: 'Sparkles',
    assets: {
      gif: '/icons/saveplus/sparkles.gif',
      png: '/icons/saveplus/sparkles-static.png',
      emoji: '✨'
    }
  },
  'shield': {
    id: 'shield',
    label: 'Security shield',
    assets: {
      gif: '/icons/saveplus/shield.gif',
      png: '/icons/saveplus/shield-static.png',
      emoji: '🛡️'
    }
  },
  'chart-up': {
    id: 'chart-up',
    label: 'Chart trending up',
    assets: {
      gif: '/icons/saveplus/chart-up.gif',
      png: '/icons/saveplus/chart-up-static.png',
      emoji: '📊'
    }
  },
  'lightbulb': {
    id: 'lightbulb',
    label: 'Idea lightbulb',
    assets: {
      gif: '/icons/saveplus/lightbulb.gif',
      png: '/icons/saveplus/lightbulb-static.png',
      emoji: '💡'
    }
  }
};

/**
 * Get icon definition by ID
 */
export function getIconDefinition(iconId: string): IconDefinition | undefined {
  return saveplusAnimMap[iconId];
}

/**
 * Get all available icon IDs
 */
export function getAvailableIcons(): string[] {
  return Object.keys(saveplusAnimMap);
}

/**
 * Check if an icon ID exists
 */
export function hasIcon(iconId: string): boolean {
  return iconId in saveplusAnimMap;
}
