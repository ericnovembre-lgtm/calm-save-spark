import { useState, useEffect } from 'react';

const DREAM_EXAMPLES = [
  "A vintage Vespa scooter 🛵",
  "Trip to Japan 🗾",
  "New MacBook Pro 💻",
  "Wedding fund 💍",
  "Emergency fund cushion 🛡️",
  "Down payment for a house 🏡",
  "New camera gear 📸",
  "Vacation to Bali 🏝️",
  "Gaming setup upgrade 🎮",
  "College savings for kids 🎓",
  "New wardrobe refresh 👗",
  "Home renovation project 🔨",
];

export const useRotatingPlaceholder = (intervalMs = 3000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(DREAM_EXAMPLES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % DREAM_EXAMPLES.length;
        setPlaceholder(DREAM_EXAMPLES[next]);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return placeholder;
};
