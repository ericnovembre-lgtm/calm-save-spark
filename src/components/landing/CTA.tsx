import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/welcome/advanced/MagneticButton";
import { motion } from "framer-motion";

export const CTA = () => {
  return (
    <section className="py-20 px-4 md:px-20">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">
            Ready to Start Saving?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of smart savers. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding" className="inline-block">
              <MagneticButton variant="default" className="group px-8 py-4 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
            </Link>
            
            <Link to="/pricing" className="inline-block">
              <MagneticButton variant="outline" className="px-8 py-4 text-lg">
                View Pricing
              </MagneticButton>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            ✓ Free forever plan available • ✓ No credit card required • ✓ Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};
