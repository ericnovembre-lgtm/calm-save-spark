/**
 * Phase 9 Accessibility Components Test Suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

beforeEach(() => { document.body.innerHTML = ''; });
afterEach(() => { vi.restoreAllMocks(); });

describe('Phase 9 Accessibility Components', () => {
  describe('VisuallyHidden', () => {
    it('should render content for screen readers', async () => {
      const { VisuallyHidden } = await import('@/components/accessibility/VisuallyHidden');
      render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
      expect(screen.getByText('Screen reader text')).toBeInTheDocument();
    });
  });

  describe('FocusIndicator', () => {
    it('should render without errors', async () => {
      const { FocusIndicator } = await import('@/components/accessibility/FocusIndicator');
      const { container } = render(<FocusIndicator />);
      expect(container).toBeDefined();
    });
  });

  describe('ARIAAuditPanel', () => {
    it('should render audit controls', async () => {
      const { ARIAAuditPanel } = await import('@/components/accessibility/ARIAAuditPanel');
      render(<ARIAAuditPanel />);
      expect(screen.getByText(/ARIA Audit/i)).toBeInTheDocument();
    });
  });

  describe('FormFieldWrapper', () => {
    it('should wrap form fields', async () => {
      const { FormFieldWrapper } = await import('@/components/accessibility/FormFieldWrapper');
      render(
        <FormFieldWrapper label="Test Label" required>
          <input type="text" />
        </FormFieldWrapper>
      );
      expect(screen.getByText(/Test Label/i)).toBeInTheDocument();
    });
  });

  describe('LiveRegionAnnouncer', () => {
    it('should create live region', async () => {
      const { LiveRegionAnnouncer } = await import('@/components/accessibility/LiveRegionAnnouncer');
      render(<LiveRegionAnnouncer message="Test" />);
      expect(document.querySelector('[aria-live]')).toBeTruthy();
    });
  });

  describe('SkipLinks', () => {
    it('should render skip links', async () => {
      const { SkipLinks } = await import('@/components/accessibility/SkipLinks');
      render(<SkipLinks />);
      expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    });
  });

  describe('KeyboardNavigationHints', () => {
    it('should render when visible', async () => {
      const { KeyboardNavigationHints } = await import('@/components/accessibility/KeyboardNavigationHints');
      render(<KeyboardNavigationHints visible />);
      expect(screen.getByText(/Tab/i)).toBeInTheDocument();
    });
  });

  describe('ContrastChecker', () => {
    it('should render color inputs', async () => {
      const { ContrastChecker } = await import('@/components/accessibility/ContrastChecker');
      render(<ContrastChecker />);
      expect(screen.getByLabelText(/foreground/i)).toBeInTheDocument();
    });
  });

  describe('ScreenReaderSimulator', () => {
    it('should render controls', async () => {
      const { ScreenReaderSimulator } = await import('@/components/accessibility/ScreenReaderSimulator');
      render(<ScreenReaderSimulator />);
      expect(screen.getByText(/Screen Reader/i)).toBeInTheDocument();
    });
  });
});
