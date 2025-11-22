import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { MessageBubble } from './MessageBubble';
import { UserResponseCard } from './UserResponseCard';
import { EnhancedTypewriter } from './EnhancedTypewriter';
import { NativePlaidConnect } from './NativePlaidConnect';
import { RetryIndicator } from './RetryIndicator';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useEdgeFunctionCall } from '@/hooks/useEdgeFunctionCall';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'question' | 'user_response' | 'system' | 'celebration';
  content: string;
  options?: { value: string; label: string; icon?: string; description?: string }[];
  inputType?: 'text' | 'number' | 'choice' | 'multi-choice' | 'plaid';
  metadata?: Record<string, any>;
  timestamp: number;
}

interface ConversationalOnboardingProps {
  userId: string;
}

export function ConversationalOnboarding({ userId }: ConversationalOnboardingProps) {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [persona, setPersona] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPlaid, setShowPlaid] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Edge function hook with retry logic
  const { invoke: generatePersonaEdge, loading: personaLoading } = 
    useEdgeFunctionCall<{ persona: any; fallbackPersona?: any; retryable?: boolean }>('generate-onboarding-persona');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = async () => {
    setIsTyping(true);
    
    // Get time of day for greeting
    const hour = new Date().getHours();
    let greeting = 'Hi';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else if (hour < 21) greeting = 'Good evening';

    await delay(800);
    addMessage({
      type: 'question',
      content: `${greeting}! I'm $ave+, your new savings companion 👋`,
      metadata: { skipResponse: true }
    });

    await delay(1500);
    addMessage({
      type: 'question',
      content: "Let's get to know each other...",
      metadata: { skipResponse: true }
    });

    await delay(1200);
    addMessage({
      type: 'question',
      content: 'What should I call you?',
      inputType: 'text',
      metadata: { key: 'name' }
    });
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMsg: Message = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(false);
  };

  const handleUserResponse = async (value: string, key?: string) => {
    triggerHaptic('light');

    // Add user's response to chat
    addMessage({
      type: 'user_response',
      content: value
    });

    // Save to userData
    const newData = { ...userData, [key || 'response']: value };
    setUserData(newData);

    // Auto-save draft
    await supabase
      .from('profiles')
      .update({ onboarding_draft_data: newData })
      .eq('id', userId);

    // Determine next question
    await askNextQuestion(key || '', value, newData);
  };

  const askNextQuestion = async (lastKey: string, lastValue: string, allData: Record<string, any>) => {
    setIsTyping(true);
    await delay(1000);

    switch (lastKey) {
      case 'name':
        addMessage({
          type: 'question',
          content: `Nice to meet you, ${lastValue}! What are you saving for?`,
          inputType: 'choice',
          options: [
            { value: 'home', label: 'Home Purchase', icon: '🏠', description: 'Down payment or home' },
            { value: 'vacation', label: 'Vacation', icon: '✈️', description: 'Travel and experiences' },
            { value: 'education', label: 'Education', icon: '🎓', description: 'Learning and growth' },
            { value: 'emergency', label: 'Emergency Fund', icon: '🛡️', description: 'Financial security' },
            { value: 'retirement', label: 'Retirement', icon: '🏖️', description: 'Long-term security' },
            { value: 'general', label: 'General Savings', icon: '💰', description: 'Build wealth' }
          ],
          metadata: { key: 'goalType' }
        });
        break;

      case 'goalType':
        // Generate persona with AI
        await generatePersona(allData);
        await delay(1500);
        
        const goalAmount = persona?.copyVariations?.suggestedAmount || 5000;
        addMessage({
          type: 'question',
          content: persona?.copyVariations?.goalAmountQuestion || 
                   `How much do you want to save for your ${lastValue}?`,
          inputType: 'number',
          metadata: { 
            key: 'goalAmount',
            suggestion: goalAmount
          }
        });
        break;

      case 'goalAmount':
        addMessage({
          type: 'question',
          content: 'What makes saving challenging for you?',
          inputType: 'multi-choice',
          options: [
            { value: 'low_income', label: 'Limited Income', description: 'Not enough left over' },
            { value: 'overspending', label: 'Overspending', description: 'Hard to control spending' },
            { value: 'motivation', label: 'Staying Motivated', description: 'Lose momentum' },
            { value: 'no_plan', label: 'No Clear Plan', description: "Don't know where to start" }
          ],
          metadata: { key: 'challenges' }
        });
        break;

      case 'challenges':
        addMessage({
          type: 'question',
          content: persona?.copyVariations?.automationPitch || 
                   'How hands-on do you want to be with your savings?',
          inputType: 'choice',
          options: [
            { value: 'automatic', label: 'Full Auto', icon: '🤖', description: 'Set it and forget it' },
            { value: 'hybrid', label: 'Hybrid', icon: '🤝', description: 'Mix of both' },
            { value: 'manual', label: 'Manual', icon: '👋', description: 'I decide each transfer' }
          ],
          metadata: { key: 'automationPref' }
        });
        break;

      case 'automationPref':
        addMessage({
          type: 'question',
          content: "Let's connect your bank securely to get started",
          metadata: { skipResponse: true }
        });
        await delay(1500);
        setShowPlaid(true);
        break;
    }
  };

  const generatePersona = async (data: Record<string, any>) => {
    try {
      setIsTyping(true);
      setRetryAttempt(1);
      
      // Show personalization message
      const tempMsgId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: tempMsgId,
        type: 'system',
        content: 'Personalizing your experience...',
        timestamp: Date.now(),
        metadata: { skipResponse: true, isTemporary: true }
      }]);

      const result = await generatePersonaEdge(
        {
          goalType: data.goalType,
          userName: data.name,
          challenges: data.challenges
        },
        {
          retries: 3,
          showSuccessToast: false
        }
      );

      // Remove temporary message
      setMessages(prev => prev.filter(m => m.id !== tempMsgId));

      if (result?.persona) {
        setPersona(result.persona);
      } else if (result?.fallbackPersona) {
        // Use fallback persona from edge function
        setPersona(result.fallbackPersona);
        toast.info('Using smart defaults for your goal', {
          description: 'Your experience will adapt as you use $ave+',
          duration: 3000
        });
      } else {
        // Client-side fallback
        const clientFallback = getClientFallbackPersona(data.goalType, data.name);
        setPersona(clientFallback);
        toast.info('Getting you started quickly...', {
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Persona generation failed:', error);
      
      // Use client-side fallback
      const clientFallback = getClientFallbackPersona(data.goalType, data.name);
      setPersona(clientFallback);
      
      // Silent fallback
      toast.info('Getting you started quickly...', {
        duration: 2000
      });
    } finally {
      setIsTyping(false);
      setRetryAttempt(0);
    }
  };

  const getClientFallbackPersona = (goalType: string, userName: string) => {
    const fallbacks: Record<string, any> = {
      home: {
        goalType: 'home',
        visualTheme: { primaryIcon: '🏠', accentColor: '#d6c8a2' },
        copyVariations: {
          welcomeMessage: `Great choice, ${userName}! Let's build your home savings plan.`,
          goalAmountQuestion: 'How much do you need for your down payment?',
          automationPitch: 'Automate your savings so you can focus on finding your dream home.',
          completionMessage: '🎉 You\'re on your way to homeownership!',
          goalSuggestions: ['Save 3.5% for FHA', 'Build closing cost fund', 'Track monthly progress']
        }
      },
      vacation: {
        goalType: 'vacation',
        visualTheme: { primaryIcon: '✈️', accentColor: '#d6c8a2' },
        copyVariations: {
          welcomeMessage: `Perfect, ${userName}! Let's make your travel dreams come true.`,
          goalAmountQuestion: 'How much do you want to save for your trip?',
          automationPitch: 'Set automatic savings and watch your travel fund grow.',
          completionMessage: '🎉 Your adventure awaits!',
          goalSuggestions: ['Save $200/month', 'Research destinations', 'Track progress weekly']
        }
      },
      emergency: {
        goalType: 'emergency',
        visualTheme: { primaryIcon: '🛡️', accentColor: '#d6c8a2' },
        copyVariations: {
          welcomeMessage: `Smart move, ${userName}! Let's build your financial safety net.`,
          goalAmountQuestion: 'How much do you want in your emergency fund?',
          automationPitch: 'Automate small transfers to build your security fund effortlessly.',
          completionMessage: '🎉 You\'re building financial security!',
          goalSuggestions: ['Aim for 3-6 months expenses', 'Start with $1000', 'Build gradually']
        }
      },
      general: {
        goalType: 'general',
        visualTheme: { primaryIcon: '💰', accentColor: '#d6c8a2' },
        copyVariations: {
          welcomeMessage: `Great choice, ${userName}! Let's build your savings plan.`,
          goalAmountQuestion: 'How much do you want to save?',
          automationPitch: 'Automated savings help you reach your goals faster without thinking about it.',
          completionMessage: '🎉 Your account is all set! Time to start saving.',
          goalSuggestions: ['Start small with $50/month', 'Set up automatic transfers', 'Track your progress weekly']
        }
      }
    };
    
    return fallbacks[goalType] || fallbacks.general;
  };

  const handlePlaidSuccess = async () => {
    setShowPlaid(false);
    triggerHaptic('success');
    
    addMessage({
      type: 'celebration',
      content: persona?.copyVariations?.completionMessage || 
               '🎉 Amazing! Your account is all set up. Time to start saving!',
      metadata: { skipResponse: true }
    });

    setIsTransitioning(true);

    // Execute everything in parallel for instant transition
    await Promise.all([
      // Save data optimistically
      supabase.from('goals').insert({
        user_id: userId,
        name: userData.goalType === 'home' ? 'Home Down Payment' : 
              userData.goalType === 'vacation' ? 'Dream Vacation' :
              userData.goalType === 'emergency' ? 'Emergency Fund' : 'Savings Goal',
        target_amount: Number(userData.goalAmount) || 5000,
        current_amount: 0,
        icon: 'target'
      }),
      
      // Update profile
      supabase
        .from('profiles')
        .update({
          full_name: userData.name,
          onboarding_step: 'complete',
          onboarding_quiz: {
            saving_goal: userData.goalType,
            biggest_challenge: userData.challenges,
            automation_preference: userData.automationPref
          }
        })
        .eq('id', userId),
      
      // Prefetch dashboard route chunk
      import('../../pages/Dashboard').catch(() => null),
      
      // Pre-warm goals query
      supabase.from('goals').select('*').eq('user_id', userId),
      
      // Pre-warm transactions query
      supabase.from('transactions').select('*').eq('user_id', userId).limit(50),
      
      // Pre-warm pots query
      supabase.from('pots').select('*').eq('user_id', userId),
    ]);

    console.log('[Prefetch] Dashboard fully pre-loaded, navigating...');

    // Instant navigation (data is already cached)
    await delay(1500);
    navigate('/dashboard');
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
        </div>

        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-6 md:p-8 min-h-[500px] max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-6 last:mb-0"
              >
                {msg.type === 'question' && (
                  <MessageBubble 
                    content={msg.content}
                    isLast={idx === messages.length - 1}
                  />
                )}
                
                {msg.type === 'user_response' && (
                  <UserResponseCard content={msg.content} />
                )}

                {msg.type === 'celebration' && (
                  <MessageBubble 
                    content={msg.content}
                    isLast={true}
                    celebration
                  />
                )}

                {/* Show input for the last question */}
                {msg.type === 'question' && 
                 idx === messages.length - 1 && 
                 !msg.metadata?.skipResponse &&
                 msg.inputType &&
                 msg.inputType !== 'plaid' && (
                  <div className="mt-4">
                    {msg.inputType === 'text' && (
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && currentInput.trim()) {
                            handleUserResponse(currentInput, msg.metadata?.key);
                            setCurrentInput('');
                          }
                        }}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 rounded-xl bg-muted border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                        autoFocus
                      />
                    )}

                    {msg.inputType === 'number' && (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                        <input
                          type="number"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && currentInput.trim()) {
                              handleUserResponse(currentInput, msg.metadata?.key);
                              setCurrentInput('');
                            }
                          }}
                          placeholder={msg.metadata?.suggestion?.toString() || '5000'}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-muted border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                          autoFocus
                        />
                      </div>
                    )}

                    {msg.inputType === 'choice' && msg.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.options.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleUserResponse(opt.label, msg.metadata?.key)}
                            className="p-4 rounded-xl bg-muted hover:bg-muted/80 border-2 border-border hover:border-primary transition-all text-left group"
                          >
                            {opt.icon && (
                              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                                {opt.icon}
                              </span>
                            )}
                            <div className="font-semibold">{opt.label}</div>
                            {opt.description && (
                              <div className="text-sm text-muted-foreground mt-1">{opt.description}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.inputType === 'multi-choice' && msg.options && (
                      <div className="space-y-3">
                        {msg.options.map(opt => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 border-2 border-border cursor-pointer transition-all"
                          >
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-2"
                              onChange={(e) => {
                                const current = userData[msg.metadata?.key || ''] || [];
                                if (e.target.checked) {
                                  setUserData({ ...userData, [msg.metadata?.key || '']: [...current, opt.value] });
                                } else {
                                  setUserData({ 
                                    ...userData, 
                                    [msg.metadata?.key || '']: current.filter((v: string) => v !== opt.value) 
                                  });
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-semibold">{opt.label}</div>
                              {opt.description && (
                                <div className="text-sm text-muted-foreground">{opt.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                        <button
                          onClick={() => {
                            const values = userData[msg.metadata?.key || ''] || [];
                            if (values.length > 0) {
                              handleUserResponse(values.join(', '), msg.metadata?.key);
                            }
                          }}
                          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && retryAttempt > 0 && (
              <RetryIndicator attempt={retryAttempt} maxAttempts={3} />
            )}

            {isTyping && retryAttempt === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">$ave+ is typing...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {showPlaid && (
          <NativePlaidConnect
            userId={userId}
            onSuccess={handlePlaidSuccess}
            onExit={() => setShowPlaid(false)}
          />
        )}
      </div>
    </div>
  );
}
