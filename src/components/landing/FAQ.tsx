import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is $ave+ and how does it work?",
        a: "$ave+ is an all-in-one financial platform that helps you save smarter, grow wealth, and automate your finances. We connect to your bank accounts securely, track your spending, and use AI to help you reach your financial goals faster."
      },
      {
        q: "Is $ave+ really free to start?",
        a: "Yes! Our Free plan includes 3 connected accounts, basic budgeting, transaction tracking, and 1 savings goal. No credit card required. Upgrade to Pro ($9.99/month) for unlimited accounts, all AI agents, and advanced features."
      }
    ]
  },
  {
    category: "Security",
    questions: [
      {
        q: "How do you keep my data secure?",
        a: "We use bank-level 256-bit encryption, are SOC 2 Type II certified, and never store your bank credentials. We use Plaid for read-only access to your accounts, the same technology trusted by Venmo, Coinbase, and major financial institutions."
      },
      {
        q: "Can you move money from my accounts?",
        a: "No. We have read-only access to view your transactions and balances. We cannot move money, make purchases, or access your login credentials. All transfers are initiated by you through your bank's systems."
      }
    ]
  },
  {
    category: "Features",
    questions: [
      {
        q: "What banks do you support?",
        a: "We support 10,000+ financial institutions through our Plaid integration, including Chase, Bank of America, Wells Fargo, Capital One, and virtually all US banks and credit unions."
      },
      {
        q: "How does the AI Coach work?",
        a: "Our AI Coach uses advanced language models to answer your financial questions, provide personalized advice, and help you make smarter money decisions. Free users get 5 messages/month, Pro users get unlimited access."
      },
      {
        q: "What's a Digital Twin?",
        a: "Your Digital Twin is an AI-powered financial simulation that predicts your future financial situation based on your current habits, goals, and income. It helps you see the long-term impact of financial decisions before you make them."
      }
    ]
  },
  {
    category: "Pricing",
    questions: [
      {
        q: "Can I upgrade or downgrade anytime?",
        a: "Yes! You can upgrade, downgrade, or cancel your plan anytime. Changes take effect immediately, and we'll prorate any charges or refunds."
      },
      {
        q: "What's included in the Business plan?",
        a: "Business ($29.99/month) includes everything in Pro plus: business expense tracking, multi-entity management, QuickBooks integration, income stream analytics, tax optimization tools, team collaboration, and API access."
      }
    ]
  }
];

export const FAQ = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about $ave+
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4 text-primary">{section.category}</h3>
              <div className="space-y-4">
                {section.questions.map((item, itemIndex) => {
                  const itemId = `${sectionIndex}-${itemIndex}`;
                  const isOpen = openItems.has(itemId);

                  return (
                    <div
                      key={itemId}
                      className="rounded-2xl bg-background border border-border overflow-hidden transition-all hover:border-primary/50"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-semibold pr-4">{item.q}</span>
                        <div className="flex-shrink-0 p-1 rounded-full bg-primary/10">
                          {isOpen ? (
                            <Minus className="w-4 h-4 text-primary" />
                          ) : (
                            <Plus className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <motion.div
                          initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                          animate={prefersReducedMotion ? {} : { height: "auto", opacity: 1 }}
                          exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@saveplus.com"
            className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-all"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};
