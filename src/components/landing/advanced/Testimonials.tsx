import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Animated3DCard from '@/components/pricing/advanced/Animated3DCard';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    avatar: '👩‍💼',
    rating: 5,
    text: 'I\'ve saved over $3,000 in 6 months without even thinking about it. The round-ups are genius!',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Software Engineer',
    avatar: '👨‍💻',
    rating: 5,
    text: 'The AI insights helped me identify $200/month in unnecessary subscriptions. Game changer.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Teacher',
    avatar: '👩‍🏫',
    rating: 5,
    text: 'Finally reached my vacation goal! The visual progress tracking kept me motivated every day.',
  },
];

export function Testimonials() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 px-4 md:px-20 bg-accent/5">
      <div className="container mx-auto">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by Savers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people transforming their financial lives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Animated3DCard intensity={0.3}>
                <div className="p-6 rounded-xl bg-card border border-border backdrop-blur-sm h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-accent text-accent"
                      />
                    ))}
                  </div>

                  <p className="text-foreground mb-6 flex-grow italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </Animated3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
