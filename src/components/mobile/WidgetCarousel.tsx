import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, Target, PiggyBank, CreditCard, Receipt, Wallet } from 'lucide-react';

interface WidgetCarouselProps {
  widgetOrder: string[];
}

interface WidgetConfig {
  id: string;
  title: string;
  icon: typeof TrendingUp;
  color: string;
  value: string;
  subtitle: string;
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'balance', title: 'Balance', icon: Wallet, color: 'from-emerald-500 to-teal-500', value: '$12,450', subtitle: 'Available' },
  { id: 'spending', title: 'Spending', icon: Receipt, color: 'from-rose-500 to-pink-500', value: '$2,340', subtitle: 'This month' },
  { id: 'savings', title: 'Savings', icon: PiggyBank, color: 'from-violet-500 to-purple-500', value: '$5,200', subtitle: '3 goals active' },
  { id: 'investments', title: 'Investments', icon: TrendingUp, color: 'from-cyan-500 to-blue-500', value: '+12.4%', subtitle: 'Portfolio gain' },
  { id: 'goals', title: 'Goals', icon: Target, color: 'from-amber-500 to-orange-500', value: '68%', subtitle: 'Overall progress' },
  { id: 'credit', title: 'Credit', icon: CreditCard, color: 'from-slate-500 to-zinc-500', value: '742', subtitle: 'Credit score' }
];

export function WidgetCarousel({ widgetOrder }: WidgetCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Order widgets based on preference
  const orderedWidgets = widgetOrder.length > 0
    ? widgetOrder.map(id => defaultWidgets.find(w => w.id === id)).filter(Boolean) as WidgetConfig[]
    : defaultWidgets;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 280 + 16; // card width + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  return (
    <div className="relative">
      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {orderedWidgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="snap-center shrink-0"
          >
            <div
              className={cn(
                "w-[280px] h-[160px] rounded-2xl p-5",
                "bg-gradient-to-br",
                widget.color,
                "shadow-lg relative overflow-hidden"
              )}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <widget.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90 font-medium text-sm">{widget.title}</span>
                </div>

                <div>
                  <p className="text-3xl font-bold text-white">{widget.value}</p>
                  <p className="text-white/70 text-sm mt-1">{widget.subtitle}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {orderedWidgets.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              scrollRef.current?.scrollTo({
                left: index * (280 + 16),
                behavior: 'smooth'
              });
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === activeIndex 
                ? "w-6 bg-primary" 
                : "w-1.5 bg-muted-foreground/30"
            )}
            aria-label={`Go to widget ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
