import { useState, useEffect } from "react";
import { Bot, X, Send, Mic, Square, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useCoachConversation } from "@/hooks/useCoachConversation";
import { GenerativeChatMessage } from "./GenerativeChatMessage";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { ContextualSuggestions } from "./ContextualSuggestions";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { ModelIndicatorBadge } from "./ModelIndicatorBadge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CoachChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachChatDrawer({ isOpen, onClose }: CoachChatDrawerProps) {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [userId, setUserId] = useState<string>("");
  
  const { messages, sendMessage, isResponding, isSendingMessage, createConversation, currentModel } = useCoachConversation(conversationId);
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  const handleVoiceStart = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const handleVoiceStop = async () => {
    try {
      setIsTranscribing(true);
      const base64Audio = await stopRecording();

      const { data, error } = await supabase.functions.invoke("voice-to-text", {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.text) {
        setInput(data.text);
        toast.success("Voice captured! Click Send or press Enter.");
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSendingMessage) return;
    
    try {
      // Auto-create conversation if none exists
      if (!conversationId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please log in to chat");
          return;
        }
        
        const { data: newConv, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            agent_type: 'financial_coach',
            conversation_history: [],
            message_count: 0,
            title: input.slice(0, 50) // Use first 50 chars as title
          })
          .select()
          .single();
        
        if (error) throw error;
        setConversationId(newConv.id);
        
        // Small delay to ensure state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await sendMessage(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleNewChat = () => {
    setConversationId(undefined);
    setShowHistory(false);
  };

  const handleSelectConversation = (convId: string) => {
    setConversationId(convId);
    setShowHistory(false);
  };

  const handleDeleteConversation = (convId: string) => {
    if (convId === conversationId) {
      setConversationId(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[800px] bg-slate-950 border-l border-white/10 z-50 flex"
          >
            {/* History Panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="overflow-hidden"
                >
                  <ChatHistoryPanel
                    userId={userId}
                    currentConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onDeleteConversation={handleDeleteConversation}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Financial Coach</h3>
                    <p className="text-xs text-white/60">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-white/60 hover:text-white"
                  >
                    <History className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-white/40 py-12">
                      <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm">Start a conversation with your AI Coach</p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <GenerativeChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  
                  {/* Model Indicator */}
                  {currentModel && isResponding && (
                    <div className="flex justify-center py-2">
                      <ModelIndicatorBadge
                        model={currentModel.model}
                        modelName={currentModel.modelName}
                        queryType={currentModel.queryType}
                        isLoading={true}
                      />
                    </div>
                  )}
                  
                  {isResponding && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-cyan-500/20">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Contextual Suggestions */}
              {userId && (
                <ContextualSuggestions
                  userId={userId}
                  onSuggestionClick={handleSuggestionClick}
                  messageCount={messages.length}
                />
              )}

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? "Listening..." : "Ask your coach anything..."}
                    className="flex-1 bg-slate-900 border-white/10 text-white placeholder:text-white/40 resize-none"
                    rows={2}
                    disabled={isRecording || isTranscribing}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                      disabled={isSendingMessage || isTranscribing}
                      className={cn(
                        "border-white/10",
                        isRecording && "bg-red-500/20 border-red-500/50 animate-pulse"
                      )}
                      aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      {isRecording ? (
                        <Square className="w-4 h-4 text-red-400" />
                      ) : isTranscribing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-command-cyan" />
                      ) : (
                        <Mic className="w-4 h-4 text-command-cyan" />
                      )}
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isSendingMessage || isRecording || isTranscribing}
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
