/**
 * @fileoverview User Activity Detection Hook
 * Detects when user is actively engaged to prevent interrupting with AI insights
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UserActivityState {
  isScrolling: boolean;
  isTyping: boolean;
  isInModal: boolean;
  isIdle: boolean;
  lastActivityTime: number;
  isUserBusy: boolean;
}

interface UseUserActivityOptions {
  scrollDebounceMs?: number;
  typingDebounceMs?: number;
  idleThresholdMs?: number;
}

export function useUserActivity(options: UseUserActivityOptions = {}): UserActivityState {
  const {
    scrollDebounceMs = 500,
    typingDebounceMs = 1000,
    idleThresholdMs = 30000, // 30 seconds
  } = options;

  const [isScrolling, setIsScrolling] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInModal, setIsInModal] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Update last activity time
  const recordActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      recordActivity();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollDebounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [scrollDebounceMs, recordActivity]);

  // Typing detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isInputElement) {
        setIsTyping(true);
        recordActivity();

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, typingDebounceMs);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typingDebounceMs, recordActivity]);

  // Modal detection via DOM observation
  useEffect(() => {
    const checkForModals = () => {
      // Check for Radix UI dialogs, sheets, and other modal elements
      const modalSelectors = [
        '[role="dialog"]',
        '[role="alertdialog"]',
        '[data-state="open"][data-radix-dialog-content]',
        '[data-state="open"][data-radix-alert-dialog-content]',
        '[data-vaul-drawer]',
        '.fixed.inset-0', // Common modal overlay pattern
      ];

      const hasOpenModal = modalSelectors.some(selector => 
        document.querySelector(selector) !== null
      );

      setIsInModal(hasOpenModal);
    };

    // Initial check
    checkForModals();

    // Observe DOM changes for modal state
    const observer = new MutationObserver(() => {
      checkForModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'role', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  // General activity tracking (mouse, touch)
  useEffect(() => {
    const handleActivity = () => recordActivity();

    document.addEventListener('mousemove', handleActivity, { passive: true });
    document.addEventListener('touchstart', handleActivity, { passive: true });
    document.addEventListener('click', handleActivity, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [recordActivity]);

  // Calculate idle state
  const isIdle = Date.now() - lastActivityTime > idleThresholdMs;

  // User is "busy" if actively scrolling, typing, or in a modal
  const isUserBusy = isScrolling || isTyping || isInModal;

  return {
    isScrolling,
    isTyping,
    isInModal,
    isIdle,
    lastActivityTime,
    isUserBusy,
  };
}
