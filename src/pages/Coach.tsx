import { useState, useEffect, useRef } from "react";
import { Bot, Send, Lightbulb, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationSidebar } from "@/components/coach/ConversationSidebar";
import { VoiceControls } from "@/components/coach/VoiceControls";
import { ProactiveNudges } from "@/components/coach/ProactiveNudges";
import { SmartReplies } from "@/components/coach/SmartReplies";
import { FinancialHealthDashboard } from "@/components/coach/FinancialHealthDashboard";
import { useCoachConversation } from "@/hooks/useCoachConversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

/**
 * Coach page - AI-powered financial coaching with conversation management
 * Enhanced with voice I/O, proactive nudges, and smart replies
 */
export default function Coach() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showInitialContent, setShowInitialContent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const {
    conversation,
    messages,
    isLoading,
    isResponding,
    sendMessage,
    createConversation,
    isSendingMessage
  } = useCoachConversation(activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Text-to-speech for assistant responses
  useEffect(() => {
    if (ttsEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isResponding) {
        speakText(lastMessage.content);
      }
    }
  }, [messages, isResponding, ttsEnabled]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Clean markdown and code blocks
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/[*_~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNewConversation = async () => {
    createConversation(undefined, {
      onSuccess: (newConvo: any) => {
        setActiveConversationId(newConvo.id);
        setShowInitialContent(true);
        queryClient.invalidateQueries({ queryKey: ['coach-conversations'] });
      }
    });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowInitialContent(false);
  };

  const handleSendMessage = (e?: React.FormEvent, messageOverride?: string) => {
    e?.preventDefault();
    const messageContent = messageOverride || input;
    
    if (!messageContent.trim() || !activeConversationId || isSendingMessage) return;

    setInput("");
    setShowInitialContent(false);
    sendMessage(messageContent);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    toast.success(`Captured: ${transcript}`);
  };

  const handleNudgeAction = (nudge: any) => {
    const actionMessage = `I'd like to ${nudge.suggested_action.action}`;
    handleSendMessage(undefined, actionMessage);
  };

  const handleSmartReply = (reply: string) => {
    handleSendMessage(undefined, reply);
  };

  const suggestionQuestions = [
    "What if I save an extra $100 per month?",
    "Analyze my spending patterns",
    "Help me create a budget",
    "What's my financial health score?",
    "Explain compound interest simply",
    "How can I build better money habits?"
  ];

  return (
    <AppLayout>
      <Helmet>
        <title>AI Financial Coach | $ave+</title>
        <meta 
          name="description" 
          content="Get personalized financial coaching powered by AI. Receive insights, tips, and recommendations to optimize your savings and reach your goals faster." 
        />
      </Helmet>

      <div className="h-[calc(100vh-10rem)] flex rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Conversation Sidebar */}
        <ConversationSidebar
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-foreground">
                      {conversation?.title || 'AI Financial Coach'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Powered by Lovable AI • {messages.length} messages
                    </p>
                  </div>
                </div>
                <VoiceControls
                  onTranscript={handleVoiceTranscript}
                  ttsEnabled={ttsEnabled}
                  onTtsToggle={() => {
                    if (ttsEnabled) window.speechSynthesis?.cancel();
                    setTtsEnabled(!ttsEnabled);
                  }}
                  disabled={isSendingMessage}
                />
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Initial Content */}
                  {showInitialContent && messages.length === 0 && user && (
                    <>
                      <FinancialHealthDashboard userId={user.id} />
                      
                      <Card className="p-6 text-center">
                        <Lightbulb className="w-12 h-12 text-primary mx-auto mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Ask Me Anything!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          I can help with budget optimization, debt payoff strategies, goal planning, and spending analysis.
                        </p>
                      </Card>

                      <div className="grid grid-cols-2 gap-3">
                        {suggestionQuestions.map((question, idx) => (
                          <Button
                            key={idx}
                            onClick={() => handleSendMessage(undefined, question)}
                            variant="outline"
                            className="h-auto p-3 text-left justify-start"
                          >
                            <TrendingUp className="w-4 h-4 mr-2 shrink-0 text-primary" />
                            <span className="text-sm">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Proactive Nudges */}
                  {user && messages.length > 0 && (
                    <ProactiveNudges userId={user.id} onNudgeAction={handleNudgeAction} />
                  )}

                  {/* Messages */}
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent/50 text-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>

                        {msg.role === 'user' && (
                          <div className="p-2 rounded-full bg-accent/50 h-8 w-8 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium">You</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Smart Replies */}
                  {messages.length > 0 && !isSendingMessage && (
                    <SmartReplies
                      lastMessage={messages[messages.length - 1]}
                      onReplySelect={handleSmartReply}
                      disabled={isSendingMessage}
                    />
                  )}

                  {/* Loading Indicator */}
                  {isSendingMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-accent/50 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-muted/30">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={isSendingMessage ? "Coach is thinking..." : "Ask me anything about your finances..."}
                    className="resize-none min-h-[60px] max-h-[120px]"
                    disabled={isSendingMessage}
                    aria-label="Message input"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSendingMessage || !input.trim()}
                    className="px-6"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                
                <div className="flex items-center justify-between mt-2">
                  <VoiceControls
                    onTranscript={handleVoiceTranscript}
                    ttsEnabled={ttsEnabled}
                    onTtsToggle={() => {
                      if (ttsEnabled) window.speechSynthesis?.cancel();
                      setTtsEnabled(!ttsEnabled);
                    }}
                    disabled={isSendingMessage}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shift + Enter for new line
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 rounded-full bg-primary/10 mb-6"
              >
                <Bot className="w-16 h-16 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Your AI Coach</h2>
              <p className="text-muted-foreground mb-4 max-w-md">
                Your next-gen financial assistant with comprehensive analysis, personalized recommendations, and voice support.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>📊 Complete financial health analysis</p>
                <p>💡 AI-powered personalized recommendations</p>
                <p>📈 Budget, debt, and goal optimization</p>
                <p>🎤 Voice commands and responses</p>
                <p>💬 Smart reply suggestions</p>
              </div>
              <Button onClick={handleNewConversation} size="lg" className="gap-2">
                <Bot className="w-5 h-5" />
                Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
