export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeTheme {
  name: string;
  cssVars: Record<string, string>;
  gradientOverlay?: string;
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function getTimeTheme(timeOfDay: TimeOfDay): TimeTheme {
  const themes: Record<TimeOfDay, TimeTheme> = {
    dawn: {
      name: 'Dawn',
      cssVars: {
        '--time-bg': '20 40% 96%',
        '--time-accent': '340 80% 70%',
        '--time-glow': '20 100% 80%',
      },
      gradientOverlay: 'linear-gradient(180deg, hsl(340, 80%, 95%) 0%, hsl(20, 80%, 95%) 100%)'
    },
    day: {
      name: 'Day',
      cssVars: {
        '--time-bg': '45 20% 97%',
        '--time-accent': '45 80% 60%',
        '--time-glow': '45 100% 70%',
      },
      gradientOverlay: 'linear-gradient(180deg, hsl(200, 30%, 98%) 0%, hsl(45, 30%, 95%) 100%)'
    },
    dusk: {
      name: 'Dusk',
      cssVars: {
        '--time-bg': '280 30% 20%',
        '--time-accent': '30 90% 60%',
        '--time-glow': '280 80% 60%',
      },
      gradientOverlay: 'linear-gradient(180deg, hsl(280, 40%, 30%) 0%, hsl(30, 70%, 40%) 100%)'
    },
    night: {
      name: 'Night',
      cssVars: {
        '--time-bg': '220 40% 15%',
        '--time-accent': '220 80% 60%',
        '--time-glow': '240 100% 70%',
      },
      gradientOverlay: 'linear-gradient(180deg, hsl(220, 60%, 10%) 0%, hsl(240, 50%, 20%) 100%)'
    }
  };

  return themes[timeOfDay];
}
