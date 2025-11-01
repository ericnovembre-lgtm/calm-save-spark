import { HelpCircle, Book, MessageCircle, Mail, FileText, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I create my first savings goal?",
    answer: "Navigate to the Goals page and click 'Create New Goal'. Enter your target amount, deadline, and choose an icon. The AI Coach will help you set realistic milestones.",
  },
  {
    category: "Getting Started",
    question: "What is a Smart Pot?",
    answer: "Smart Pots are dedicated savings accounts for specific goals. Each pot can have its own rules, automation, and tracking. They help you organize your savings efficiently.",
  },
  {
    category: "Automations",
    question: "How does round-up savings work?",
    answer: "Every time you make a purchase, we round up to the nearest pound and automatically save the difference. For example, a £4.30 purchase saves £0.70.",
  },
  {
    category: "Automations",
    question: "Can I pause my automated savings?",
    answer: "Yes! Go to Automations and toggle any rule on or off. You can also set spending caps and smart limits to prevent over-saving.",
  },
  {
    category: "Security",
    question: "Is my money safe with $ave+?",
    answer: "Absolutely. We use bank-level 256-bit encryption, and all funds are FDIC insured up to $250,000. We never store your banking credentials.",
  },
  {
    category: "Security",
    question: "How does two-factor authentication work?",
    answer: "Enable 2FA in Settings → Security. You'll need to verify your identity with a code sent to your phone or email every time you log in from a new device.",
  },
  {
    category: "Rewards",
    question: "How do I earn rewards points?",
    answer: "Complete savings challenges, maintain streaks, and hit milestones. Points can be redeemed for bonus interest rates, cashback boosts, or exclusive perks.",
  },
  {
    category: "Rewards",
    question: "What is the $ave+ Card?",
    answer: "Our premium debit card offers up to 5% cashback on purchases and automatically rounds up transactions to save the difference. No annual fee for active savers.",
  },
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

/**
 * Help Center page - Comprehensive support and FAQs
 * SEO optimized for help, support, and frequently asked questions
 */
const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery.trim() === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* SEO Meta */}
      <title>Help Center | $ave+</title>
      <meta 
        name="description" 
        content="Find answers to frequently asked questions about $ave+. Learn about savings goals, automations, security, rewards, and more." 
      />

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
          <HelpCircle className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          How can we help you?
        </h1>
        <p className="text-lg text-muted-foreground">
          Search our knowledge base or browse common questions
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Topics
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-3 gap-4 mb-12" aria-label="Quick help actions">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <MessageCircle className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Chat with Coach</CardTitle>
            <CardDescription>
              Get instant AI-powered answers to your questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/coach'}>
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Book className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">User Guide</CardTitle>
            <CardDescription>
              Comprehensive documentation and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Guides
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Mail className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Contact Support</CardTitle>
            <CardDescription>
              Reach out to our team for personalized help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Email Us
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Frequently Asked Questions
        </h2>

        {filteredFAQs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-3 text-left">
                    <Badge variant="outline" className="mt-1 text-xs">
                      {faq.category}
                    </Badge>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">
                No results found for "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Still Need Help */}
      <Card className="mt-12 bg-muted/50">
        <CardHeader className="text-center">
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Our support team is here to assist you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 justify-center">
          <Button onClick={() => window.location.href = '/coach'}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Now
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Missing import
import { Badge } from "@/components/ui/badge";

export default Help;
