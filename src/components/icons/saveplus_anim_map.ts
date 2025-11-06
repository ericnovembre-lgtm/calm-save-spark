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
 * 1. Add assets to public/icons/
 * 2. Register the icon here with all available formats
 * 3. Use the icon via <SaveplusAnimIcon name="your-icon-key" />
 */
const REGISTRY: Record<string, SaveplusIconRecord> = {
  logo: { key:'logo', label:'$ave+ logo', emoji_static:'💠', static:'/icons/logo.svg', apng:'/icons/logo.apng' },
  home: { key:'home', label:'Home', emoji_static:'🏠', static:'/icons/home.svg' },
  dashboard: { key:'dashboard', label:'Dashboard', emoji_static:'📊', static:'/icons/dashboard.svg', gif:'/icons/dashboard.gif' },
  goals: { key:'goals', label:'Goals', emoji_static:'🎯', static:'/icons/goals.svg' },
  pots: { key:'pots', label:'Pots', emoji_static:'🏺', static:'/icons/pots.svg' },
  automations: { key:'automations', label:'Automations', emoji_static:'⚙️', static:'/icons/automations.svg' },
  rewards: { key:'rewards', label:'Rewards', emoji_static:'🏆', static:'/icons/rewards.svg' },
  card: { key:'card', label:'Credit Card', emoji_static:'💳', static:'/icons/card.svg' },
  insights: { key:'insights', label:'Insights', emoji_static:'📈', static:'/icons/insights.svg' },
  bot: { key:'bot', label:'AI Bot', emoji_static:'🤖', static:'/icons/bot.svg' },
  shield: { key:'shield', label:'Security', emoji_static:'🛡️', static:'/icons/shield.svg' },
  'trending-up': { key:'trending-up', label:'Trending Up', emoji_static:'📈', static:'/icons/trending-up.svg' },
  users: { key:'users', label:'Users', emoji_static:'👥', static:'/icons/users.svg' },
  money: { key:'money', label:'Money', emoji_static:'💰', static:'/icons/money.svg' },
};

/**
 * Get icon data by name
 * Returns a default fallback if icon not found
 */
export function getAnimIconData(name: string): SaveplusIconRecord {
  return REGISTRY[name] ?? { key:name, label:name, emoji_static:'✨' };
}

/**
 * @deprecated Use getAnimIconData instead
 */
export function getIconDefinition(name: string): SaveplusIconRecord {
  return getAnimIconData(name);
}

/**
 * Get all available icon names
 */
export function getAvailableIcons(): string[] {
  return Object.keys(REGISTRY);
}

/**
 * Check if an icon name exists
 */
export function hasIcon(name: string): boolean {
  return name in REGISTRY;
}
