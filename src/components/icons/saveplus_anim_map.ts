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
  
  // Onboarding-specific animated icons
  'piggy-bank': { key:'piggy-bank', label:'Piggy Bank', emoji_static:'🐷', static:'/icons/piggy-bank.svg' },
  'rocket': { key:'rocket', label:'Rocket Launch', emoji_static:'🚀', static:'/icons/rocket.svg' },
  'shield-check': { key:'shield-check', label:'Security Check', emoji_static:'✅', static:'/icons/shield-check.svg' },
  'sparkles': { key:'sparkles', label:'Sparkles', emoji_static:'✨', static:'/icons/sparkles.svg' },
  'chart-up': { key:'chart-up', label:'Growth Chart', emoji_static:'📈', static:'/icons/chart-up.svg' },
  'handshake': { key:'handshake', label:'Handshake', emoji_static:'🤝', static:'/icons/handshake.svg' },
  'target-arrow': { key:'target-arrow', label:'Target Achievement', emoji_static:'🎯', static:'/icons/target-arrow.svg' },
  'coin-stack': { key:'coin-stack', label:'Coin Stack', emoji_static:'🪙', static:'/icons/coin-stack.svg' },
  'lightning-bolt': { key:'lightning-bolt', label:'Lightning', emoji_static:'⚡', static:'/icons/lightning-bolt.svg' },
  'calendar-check': { key:'calendar-check', label:'Calendar Check', emoji_static:'📅', static:'/icons/calendar-check.svg' },
  'trophy': { key:'trophy', label:'Trophy', emoji_static:'🏆', static:'/icons/trophy.svg' },
  'gift': { key:'gift', label:'Gift', emoji_static:'🎁', static:'/icons/gift.svg' },
  'star': { key:'star', label:'Star', emoji_static:'⭐', static:'/icons/star.svg' },
  'heart': { key:'heart', label:'Heart', emoji_static:'❤️', static:'/icons/heart.svg' },
  'fire': { key:'fire', label:'Fire', emoji_static:'🔥', static:'/icons/fire.svg' },
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
