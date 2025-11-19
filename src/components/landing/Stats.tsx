import { TiltCard3D } from "@/components/welcome/advanced/TiltCard3D";
import { MorphingNumber } from "@/components/welcome/advanced/MorphingNumber";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const stats = [
  {
    id: 1,
    value: 250000,
    suffix: "+",
    label: "Active Savers",
    className: "text-foreground",
  },
  {
    id: 2,
    value: 127000000,
    prefix: "$",
    label: "Total Saved",
    className: "text-accent",
  },
  {
    id: 3,
    value: 63,
    suffix: "+",
    label: "Financial Tools",
    className: "text-foreground",
  },
  {
    id: 4,
    value: 4.9,
    suffix: "/5",
    decimals: 1,
    label: "User Rating",
    className: "text-accent",
  },
];

export const Stats = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 px-4 md:px-20 bg-accent/5">
      <div className="container mx-auto">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a community of smart savers building their financial future
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <TiltCard3D>
                <motion.div 
                  className="p-8 text-center rounded-xl bg-card border border-border backdrop-blur-sm relative overflow-hidden"
                  whileHover={!prefersReducedMotion ? {
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  } : {}}
                >
                  {!prefersReducedMotion && (
                    <motion.div
                      className="absolute inset-0 bg-accent/5 opacity-0 hover:opacity-100 transition-opacity"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                      style={{
                        background: 'linear-gradient(45deg, transparent, hsl(var(--accent) / 0.1), transparent)',
                        backgroundSize: '200% 200%',
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    <MorphingNumber
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                      className={`text-3xl md:text-4xl font-bold ${stat.className}`}
                      duration={2.5}
                      delay={index * 0.2}
                    />
                    <p className="text-muted-foreground mt-3 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              </TiltCard3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
