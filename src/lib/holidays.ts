export type Holiday = {
  name: string;
  icon: string;
  particles: 'hearts' | 'snowflakes' | 'fireworks' | 'leaves' | 'pi' | 'ghosts' | 'cake';
  colors: string[];
};

export function getHoliday(): Holiday | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // New Year's Day
  if (month === 1 && day === 1) {
    return {
      name: "New Year's Day",
      icon: "🎆",
      particles: 'fireworks',
      colors: ['hsl(45, 100%, 60%)', 'hsl(200, 100%, 60%)', 'hsl(330, 100%, 60%)']
    };
  }

  // Valentine's Day
  if (month === 2 && day === 14) {
    return {
      name: "Valentine's Day",
      icon: "💝",
      particles: 'hearts',
      colors: ['hsl(350, 100%, 70%)', 'hsl(330, 100%, 80%)']
    };
  }

  // Pi Day
  if (month === 3 && day === 14) {
    return {
      name: "Pi Day",
      icon: "π",
      particles: 'pi',
      colors: ['hsl(210, 100%, 60%)', 'hsl(270, 100%, 60%)']
    };
  }

  // Earth Day
  if (month === 4 && day === 22) {
    return {
      name: "Earth Day",
      icon: "🌍",
      particles: 'leaves',
      colors: ['hsl(120, 60%, 50%)', 'hsl(140, 60%, 40%)']
    };
  }

  // Halloween
  if (month === 10 && day === 31) {
    return {
      name: "Halloween",
      icon: "👻",
      particles: 'ghosts',
      colors: ['hsl(30, 100%, 50%)', 'hsl(0, 0%, 10%)']
    };
  }

  // Thanksgiving (4th Thursday of November - approximate)
  if (month === 11 && day >= 22 && day <= 28 && now.getDay() === 4) {
    return {
      name: "Thanksgiving",
      icon: "🦃",
      particles: 'leaves',
      colors: ['hsl(30, 80%, 50%)', 'hsl(40, 70%, 40%)', 'hsl(15, 80%, 45%)']
    };
  }

  // Christmas
  if (month === 12 && day === 25) {
    return {
      name: "Christmas",
      icon: "🎄",
      particles: 'snowflakes',
      colors: ['hsl(0, 80%, 50%)', 'hsl(140, 50%, 40%)']
    };
  }

  return null;
}

export function getHolidayThemeOverrides(holiday: Holiday): Record<string, string> {
  const overrides: Record<string, string> = {};

  switch (holiday.particles) {
    case 'hearts':
      overrides['--accent'] = '350 100% 70%';
      break;
    case 'snowflakes':
      overrides['--accent'] = '200 100% 80%';
      break;
    case 'leaves':
      overrides['--accent'] = '120 60% 50%';
      break;
    case 'ghosts':
      overrides['--accent'] = '30 100% 50%';
      break;
    default:
      break;
  }

  return overrides;
}
