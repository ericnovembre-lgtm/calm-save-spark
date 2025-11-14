import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { X, HelpCircle, Search, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoExplainer } from "./VideoExplainer";
import { trackEvent } from "@/lib/analytics";

interface HelpTopic {
  id: string;
  question: string;
  answer: string;
  category: "general" | "goals" | "automation" | "security";
  videoUrl?: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: "what-is-roundup",
    question: "How do round-ups work?",
    answer: "Round-ups automatically round your purchases to the nearest dollar and save the difference. For example, a $3.50 purchase rounds up to $4.00, saving $0.50.",
    category: "automation",
  },
  {
    id: "goal-types",
    question: "What types of goals can I create?",
    answer: "You can create goals for emergency funds, vacations, home purchases, education, retirement, or general savings. Each goal can have its own target amount and timeline.",
    category: "goals",
  },
  {
    id: "security",
    question: "Is my financial data secure?",
    answer: "Yes! We use bank-level 256-bit encryption and never store your banking credentials. Your data is protected with the same security standards as major financial institutions.",
    category: "security",
  },
  {
    id: "automation-safe",
    question: "Can I trust automatic savings?",
    answer: "Absolutely. You're always in control. You can pause, adjust, or cancel automatic transfers at any time. We'll never move money without your permission.",
    category: "automation",
  },
  {
    id: "get-started",
    question: "How do I get started?",
    answer: "Complete this onboarding to set up your profile, create your first goal, and configure automation. It takes just 3 minutes!",
    category: "general",
  },
  {
    id: "minimum-balance",
    question: "Is there a minimum balance?",
    answer: "No minimum balance required! Start with any amount. Even small, consistent savings add up over time.",
    category: "general",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  general: "❓",
  goals: "🎯",
  automation: "⚡",
  security: "🔒",
};

export const HelpOverlay = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const filteredTopics = HELP_TOPICS.filter((topic) =>
    topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = () => {
    setIsOpen(true);
    trackEvent("help_overlay_opened", {});
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTopic(null);
    trackEvent("help_overlay_closed", {});
  };

  const handleTopicClick = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    trackEvent("help_topic_viewed", { topic_id: topic.id, question: topic.question });
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        onClick={handleOpen}
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
        animate={prefersReducedMotion ? {} : {
          boxShadow: [
            "0 4px 20px rgba(0,0,0,0.1)",
            "0 4px 30px rgba(var(--primary-rgb), 0.3)",
            "0 4px 20px rgba(0,0,0,0.1)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Open help overlay"
      >
        <HelpCircle className="w-6 h-6" />
        
        {/* Pulse animation */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>

      {/* Overlay Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
              initial={prefersReducedMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Need Help?</h2>
                      <p className="text-sm text-muted-foreground">We're here for you</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    aria-label="Close help overlay"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {!selectedTopic ? (
                  <div className="space-y-6">
                    {/* Video Tutorials */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Video Tutorials</h3>
                      <div className="space-y-3">
                        <VideoExplainer
                          title="How Round-ups Work"
                          description="See how we automatically save your spare change"
                          duration={10}
                        />
                        <VideoExplainer
                          title="Setting Goals"
                          description="Learn how to create and track your savings goals"
                          duration={12}
                        />
                      </div>
                    </div>

                    {/* FAQ List */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Frequently Asked</h3>
                      <div className="space-y-2">
                        {filteredTopics.map((topic) => (
                          <motion.button
                            key={topic.id}
                            className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                            onClick={() => handleTopicClick(topic)}
                            whileHover={prefersReducedMotion ? {} : { x: 4 }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-xl">
                                  {CATEGORY_ICONS[topic.category] || "❓"}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {topic.question}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Contact Support */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            Still need help?
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Our support team typically responds in under 2 hours
                          </p>
                          <Button size="sm" className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Chat with us
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Topic Detail View
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTopic(null)}
                      className="mb-4 gap-2"
                    >
                      ← Back to all topics
                    </Button>

                    <div className="space-y-4">
                      <div>
                        <span className="text-3xl mb-3 block">
                          {CATEGORY_ICONS[selectedTopic.category] || "❓"}
                        </span>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {selectedTopic.question}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {selectedTopic.answer}
                        </p>
                      </div>

                      {selectedTopic.videoUrl && (
                        <VideoExplainer
                          title={selectedTopic.question}
                          description="Watch this video for a detailed explanation"
                          videoSrc={selectedTopic.videoUrl}
                          duration={15}
                        />
                      )}

                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-sm text-muted-foreground">
                          Was this helpful?
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">👍 Yes</Button>
                          <Button size="sm" variant="outline">👎 No</Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-secondary/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Average response time: <strong className="text-foreground">2 hours</strong></span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
