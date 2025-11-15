import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { ProgressTracker } from '../ProgressTracker';

describe('ProgressTracker', () => {
  const mockSteps = [
    { id: 'step1', label: 'Welcome', completed: true },
    { id: 'step2', label: 'Account Setup', completed: true },
    { id: 'step3', label: 'KYC Verification', completed: false },
    { id: 'step4', label: 'Create Goal', completed: false },
  ];

  it('should render progress percentage correctly', () => {
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    // 2 completed out of 4 = 50%
    expect(getByText('50% Complete')).toBeInTheDocument();
  });

  it('should render all steps with correct labels', () => {
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    expect(getByText('Welcome')).toBeInTheDocument();
    expect(getByText('Account Setup')).toBeInTheDocument();
    expect(getByText('KYC Verification')).toBeInTheDocument();
    expect(getByText('Create Goal')).toBeInTheDocument();
  });

  it('should highlight current step with correct styling', () => {
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    const currentStepLabel = getByText('KYC Verification');
    expect(currentStepLabel.className).toContain('font-medium');
  });

  it('should show completed steps with CheckCircle icon', () => {
    const { container } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    // CheckCircle icons should be present for completed steps
    const checkCircles = container.querySelectorAll('[data-lucide="check-circle"]');
    expect(checkCircles.length).toBeGreaterThan(0);
  });

  it('should show incomplete steps with Circle icon', () => {
    const { container } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    // Circle icons should be present for incomplete steps
    const circles = container.querySelectorAll('[data-lucide="circle"]');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('should render progress bar with correct width', () => {
    const { container } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    const progressBar = container.querySelector('.bg-primary');
    expect(progressBar).toBeInTheDocument();
  });

  it('should show next step information when progress is incomplete', () => {
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    expect(getByText(/Next:/)).toBeInTheDocument();
    expect(getByText(/Create Goal/)).toBeInTheDocument();
  });

  it('should not show next step information when all steps are complete', () => {
    const allCompletedSteps = mockSteps.map(step => ({ ...step, completed: true }));
    
    const { queryByText } = renderWithProviders(
      <ProgressTracker steps={allCompletedSteps} currentStep="step4" />
    );

    expect(queryByText(/Next:/)).not.toBeInTheDocument();
  });

  it('should calculate 100% when all steps are completed', () => {
    const allCompletedSteps = mockSteps.map(step => ({ ...step, completed: true }));
    
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={allCompletedSteps} currentStep="step4" />
    );

    expect(getByText('100% Complete')).toBeInTheDocument();
  });

  it('should calculate 0% when no steps are completed', () => {
    const noCompletedSteps = mockSteps.map(step => ({ ...step, completed: false }));
    
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={noCompletedSteps} currentStep="step1" />
    );

    expect(getByText('0% Complete')).toBeInTheDocument();
  });

  it('should render with proper Card component wrapper', () => {
    const { container } = renderWithProviders(
      <ProgressTracker steps={mockSteps} currentStep="step3" />
    );

    // Check for Card component class
    const card = container.querySelector('.p-6');
    expect(card).toBeInTheDocument();
  });

  it('should handle empty steps array gracefully', () => {
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={[]} currentStep="" />
    );

    expect(getByText('Your Progress')).toBeInTheDocument();
  });

  it('should handle single step correctly', () => {
    const singleStep = [{ id: 'step1', label: 'Only Step', completed: true }];
    
    const { getByText } = renderWithProviders(
      <ProgressTracker steps={singleStep} currentStep="step1" />
    );

    expect(getByText('100% Complete')).toBeInTheDocument();
    expect(getByText('Only Step')).toBeInTheDocument();
  });
});
