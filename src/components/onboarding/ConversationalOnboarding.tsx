import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { MessageBubble } from './MessageBubble';
import { UserResponseCard } from './UserResponseCard';
import { EnhancedTypewriter } from './EnhancedTypewriter';
import { NativePlaidConnect } from './NativePlaidConnect';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-onboarding-persona`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goalType: data.goalType,
            userName: data.name,
            challenges: data.challenges
          })
        }
      );

      if (response.ok) {
        const { persona: newPersona } = await response.json();
        setPersona(newPersona);
      }
    } catch (error) {
      console.error('Error generating persona:', error);
    }
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

    // Create first goal
    await supabase.from('goals').insert({
      user_id: userId,
      name: userData.goalType === 'home' ? 'Home Down Payment' : 
            userData.goalType === 'vacation' ? 'Dream Vacation' :
            userData.goalType === 'emergency' ? 'Emergency Fund' : 'Savings Goal',
      target_amount: Number(userData.goalAmount) || 5000,
      current_amount: 0,
      icon: 'target'
    });

    // Update profile
    await supabase
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
      .eq('id', userId);

    // Prefetch dashboard (instant transition)
    setIsTransitioning(true);
    await delay(2000);
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

            {isTyping && (
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
