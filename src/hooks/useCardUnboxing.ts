import { useState, useEffect } from 'react';

const UNBOXING_STORAGE_KEY = 'saveplus-card-unboxing-seen';

export function useCardUnboxing() {
  const [hasSeenUnboxing, setHasSeenUnboxing] = useState<boolean>(true);
  const [isUnboxing, setIsUnboxing] = useState(false);

  useEffect(() => {
    // Check if user has seen the unboxing animation
    const seen = localStorage.getItem(UNBOXING_STORAGE_KEY);
    setHasSeenUnboxing(seen === 'true');
  }, []);

  const markUnboxingAsSeen = () => {
    localStorage.setItem(UNBOXING_STORAGE_KEY, 'true');
    setHasSeenUnboxing(true);
  };

  const startUnboxing = () => {
    setIsUnboxing(true);
  };

  const completeUnboxing = () => {
    setIsUnboxing(false);
    markUnboxingAsSeen();
  };

  const replayUnboxing = () => {
    startUnboxing();
  };

  return {
    hasSeenUnboxing,
    isUnboxing,
    startUnboxing,
    completeUnboxing,
    replayUnboxing,
  };
}
