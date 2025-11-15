import { InteractiveSavingsCalculator } from "@/components/welcome/advanced/InteractiveSavingsCalculator";
import { motion } from "framer-motion";

export const Calculator = () => {
  return (
    <section className="py-20 px-4 md:px-20" id="calculator">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            See Your Potential
          </h2>
          <p className="text-lg text-muted-foreground">
            Calculate how much you could save with compound interest
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InteractiveSavingsCalculator />
        </motion.div>
      </div>
    </section>
  );
};
