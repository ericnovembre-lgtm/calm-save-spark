import { useEffect, useState } from "react";

export type MoodTheme = "energetic" | "calm" | "neutral";

export function useMoodBasedTheme() {
  const [mood, setMood] = useState<MoodTheme>("neutral");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if mood-based theme is enabled
    const enabled = localStorage.getItem("mood-theme-enabled") === "true";
    setIsEnabled(enabled);

    if (!enabled) return;

    const updateMood = () => {
      const hour = new Date().getHours();

      // Morning (6am-12pm): Energetic
      if (hour >= 6 && hour < 12) {
        setMood("energetic");
      }
      // Afternoon (12pm-6pm): Neutral
      else if (hour >= 12 && hour < 18) {
        setMood("neutral");
      }
      // Evening/Night (6pm-6am): Calm
      else {
        setMood("calm");
      }
    };

    updateMood();

    // Update every hour
    const interval = setInterval(updateMood, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  const toggleMoodTheme = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem("mood-theme-enabled", String(newEnabled));
    
    if (!newEnabled) {
      setMood("neutral");
    }
  };

  // Apply theme colors based on mood
  useEffect(() => {
    if (!isEnabled) return;

    const root = document.documentElement;

    switch (mood) {
      case "energetic":
        // Brighter, more saturated
        root.style.setProperty("--mood-saturation", "1.2");
        root.style.setProperty("--mood-brightness", "1.1");
        break;
      case "calm":
        // Warmer, softer
        root.style.setProperty("--mood-saturation", "0.8");
        root.style.setProperty("--mood-brightness", "0.9");
        break;
      default:
        // Reset to normal
        root.style.setProperty("--mood-saturation", "1");
        root.style.setProperty("--mood-brightness", "1");
    }

    return () => {
      root.style.setProperty("--mood-saturation", "1");
      root.style.setProperty("--mood-brightness", "1");
    };
  }, [mood, isEnabled]);

  return {
    mood,
    isEnabled,
    toggleMoodTheme,
  };
}
