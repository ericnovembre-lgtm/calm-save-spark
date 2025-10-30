/**
 * Icon registry for $ave+ animated icons
 * 
 * Each icon has multiple format fallbacks in priority order:
 * 1. APNG (animated PNG with alpha) - best quality, limited browser support
 * 2. GIF (animated, widely supported)
 * 3. Static PNG/SVG (fallback for reduced motion)
 * 4. Emoji (ultimate fallback)
 */

export type SaveplusIconRecord = {
  key: string;
  label: string;
  emoji_static: string;    // fallback emoji
  static?: string;         // png/svg url
  gif?: string;            // animated gif
  apng?: string;           // animated png
};

/**
 * $ave+ Animated Icon Registry
 * 
 * To add new icons:
 * 1. Add assets to public/icons/saveplus/
 * 2. Register the icon here with all available formats
 * 3. Use the icon via <SaveplusAnimIcon icon="your-icon-key" />
 */
export const saveplusAnimMap: Record<string, SaveplusIconRecord> = {
  'piggy-bank': {
    key: 'piggy-bank',
    label: 'Savings piggy bank',
    emoji_static: '🐷',
    apng: '/icons/saveplus/piggy-bank.apng',
    gif: '/icons/saveplus/piggy-bank.gif',
    static: '/icons/saveplus/piggy-bank-static.png'
  },
  'money-growth': {
    key: 'money-growth',
    label: 'Money growing',
    emoji_static: '📈',
    apng: '/icons/saveplus/money-growth.apng',
    gif: '/icons/saveplus/money-growth.gif',
    static: '/icons/saveplus/money-growth-static.png'
  },
  'coin-stack': {
    key: 'coin-stack',
    label: 'Stacking coins',
    emoji_static: '💰',
    apng: '/icons/saveplus/coin-stack.apng',
    gif: '/icons/saveplus/coin-stack.gif',
    static: '/icons/saveplus/coin-stack-static.png'
  },
  'wallet': {
    key: 'wallet',
    label: 'Wallet',
    emoji_static: '👛',
    gif: '/icons/saveplus/wallet.gif',
    static: '/icons/saveplus/wallet-static.png'
  },
  'target': {
    key: 'target',
    label: 'Goal target',
    emoji_static: '🎯',
    gif: '/icons/saveplus/target.gif',
    static: '/icons/saveplus/target-static.png'
  },
  'rocket': {
    key: 'rocket',
    label: 'Growth rocket',
    emoji_static: '🚀',
    gif: '/icons/saveplus/rocket.gif',
    static: '/icons/saveplus/rocket-static.png'
  },
  'sparkles': {
    key: 'sparkles',
    label: 'Sparkles',
    emoji_static: '✨',
    gif: '/icons/saveplus/sparkles.gif',
    static: '/icons/saveplus/sparkles-static.png'
  },
  'shield': {
    key: 'shield',
    label: 'Security shield',
    emoji_static: '🛡️',
    gif: '/icons/saveplus/shield.gif',
    static: '/icons/saveplus/shield-static.png'
  },
  'chart-up': {
    key: 'chart-up',
    label: 'Chart trending up',
    emoji_static: '📊',
    gif: '/icons/saveplus/chart-up.gif',
    static: '/icons/saveplus/chart-up-static.png'
  },
  'lightbulb': {
    key: 'lightbulb',
    label: 'Idea lightbulb',
    emoji_static: '💡',
    gif: '/icons/saveplus/lightbulb.gif',
    static: '/icons/saveplus/lightbulb-static.png'
  }
};

/**
 * Get icon data by key
 */
export function getAnimIconData(name: string): SaveplusIconRecord | undefined {
  return saveplusAnimMap[name];
}

/**
 * @deprecated Use getAnimIconData instead
 */
export function getIconDefinition(name: string): SaveplusIconRecord | undefined {
  return getAnimIconData(name);
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
