import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  videoUrl: string;
  amount: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Software Engineer, SF',
    quote: 'I saved $12,000 in 8 months without even thinking about it. The AI insights are incredible.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-typing-on-a-laptop-in-an-office-4904-large.mp4',
    amount: '$12,000 saved'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Designer, NYC',
    quote: 'Finally hit my emergency fund goal! $ave+ made it so easy with automated round-ups.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-working-on-his-computer-in-an-office-4909-large.mp4',
    amount: '$8,500 saved'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Marketing Manager, LA',
    quote: 'The ROI calculator convinced me to start. Now I\'m on track for early retirement.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-her-laptop-in-a-cafe-4907-large.mp4',
    amount: '$15,000 saved'
  }
];

export const VideoTestimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Auto-rotate testimonials every 8 seconds
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Play the active video
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeIndex]);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Videos */}
      <div className="absolute inset-0 z-0">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: activeIndex === index ? 0.2 : 0,
              scale: activeIndex === index ? 1 : 1.1
            }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            >
              <source src={testimonial.videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Real People. Real Results.
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands who've transformed their financial future
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="relative min-h-[400px] flex items-center justify-center">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: activeIndex === index ? 1 : 0,
                scale: activeIndex === index ? 1 : 0.9,
                y: activeIndex === index ? 0 : 20,
                zIndex: activeIndex === index ? 10 : 0
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute max-w-4xl w-full"
            >
              <div className="bg-glass backdrop-blur-glass border border-glass-border rounded-3xl p-12 shadow-glass">
                <Quote className="w-12 h-12 text-accent mb-6" />
                <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{testimonial.amount}</p>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="group relative"
              aria-label={`View testimonial ${index + 1}`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
