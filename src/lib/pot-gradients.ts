/**
 * Gradient Palette System for Visual Vaults
 * Vibrant gradients for pot fill effects
 */

export const POT_GRADIENTS = {
  'cyber-grape': {
    from: 'hsl(258, 90%, 66%)', // violet-500
    to: 'hsl(188, 95%, 44%)',   // cyan-500
    name: 'Cyber Grape'
  },
  'neon-sunset': {
    from: 'hsl(38, 92%, 50%)',  // amber-500
    to: 'hsl(330, 81%, 60%)',   // pink-500
    name: 'Neon Sunset'
  },
  'ocean-depth': {
    from: 'hsl(199, 89%, 48%)', // sky-500
    to: 'hsl(239, 84%, 67%)',   // indigo-500
    name: 'Ocean Depth'
  },
  'emerald-dream': {
    from: 'hsl(160, 84%, 39%)', // emerald-500
    to: 'hsl(172, 66%, 50%)',   // teal-500
    name: 'Emerald Dream'
  },
  'fire-opal': {
    from: 'hsl(0, 84%, 60%)',   // red-500
    to: 'hsl(25, 95%, 53%)',    // orange-500
    name: 'Fire Opal'
  }
} as const;

export type GradientKey = keyof typeof POT_GRADIENTS;

export const getGradientStyle = (key: GradientKey | string) => {
  const gradient = POT_GRADIENTS[key as GradientKey];
  
  if (!gradient) {
    // Fallback for backward compatibility with hex colors
    return `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)`;
  }
  
  return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`;
};

export const getRandomGradient = (): GradientKey => {
  const keys = Object.keys(POT_GRADIENTS) as GradientKey[];
  return keys[Math.floor(Math.random() * keys.length)];
};
