import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { OnboardingGuideChat } from '../OnboardingGuideChat';

// Mock AgentChat component
vi.mock('@/components/ai-agents/AgentChat', () => ({
  AgentChat: ({ agentType, initialContext, placeholder, className }: any) => (
    <div data-testid="agent-chat" data-agent-type={agentType} className={className}>
      <div data-testid="agent-context">{JSON.stringify(initialContext)}</div>
      <div data-testid="agent-placeholder">{placeholder}</div>
    </div>
  ),
}));

describe('OnboardingGuideChat', () => {
  it('should render with correct header and description', () => {
    const { getByText } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" />
    );

    expect(getByText('Your Guide')).toBeInTheDocument();
    expect(getByText('Get help at any step')).toBeInTheDocument();
  });

  it('should pass correct agent type to AgentChat', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" />
    );

    const agentChat = getByTestId('agent-chat');
    expect(agentChat.getAttribute('data-agent-type')).toBe('onboarding_guide');
  });

  it('should pass correct context for welcome step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('welcome');
    expect(parsedContext.stepContext).toBe('User is on the welcome step of onboarding');
  });

  it('should pass correct context for account step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="account" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('account');
    expect(parsedContext.stepContext).toBe('User is setting up their account details');
  });

  it('should pass correct context for kyc step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="kyc" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('kyc');
    expect(parsedContext.stepContext).toBe('User is uploading KYC documents for verification');
  });

  it('should pass correct context for goal step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="goal" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('goal');
    expect(parsedContext.stepContext).toBe('User is creating their first savings goal');
  });

  it('should pass correct context for automation step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="automation" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('automation');
    expect(parsedContext.stepContext).toBe('User is setting up automation rules');
  });

  it('should pass default context for unknown step', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="unknown" />
    );

    const context = getByTestId('agent-context');
    const parsedContext = JSON.parse(context.textContent || '{}');
    
    expect(parsedContext.currentStep).toBe('unknown');
    expect(parsedContext.stepContext).toBe('User is in onboarding flow');
  });

  it('should pass correct placeholder text', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" />
    );

    expect(getByTestId('agent-placeholder')).toHaveTextContent('Ask me anything about this step...');
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should render AgentChat with full height', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingGuideChat currentStep="welcome" />
    );

    const agentChat = getByTestId('agent-chat');
    expect(agentChat.className).toContain('h-full');
  });
});
