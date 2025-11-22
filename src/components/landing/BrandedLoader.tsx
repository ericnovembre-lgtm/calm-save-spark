import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";

export const BrandedLoader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <DollarSign className="w-6 h-6 text-accent" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export const BrandedSkeletonCard = () => {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <TrendingUp className="w-6 h-6 m-3 text-accent/50" />
      </motion.div>
      <div className="space-y-2">
        <motion.div
          className="h-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.div
          className="h-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded w-3/4"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
      </div>
    </motion.div>
  );
};

export const BrandedProgressLoader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-accent/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <DollarSign className="w-10 h-10 text-accent" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-sm text-muted-foreground font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};
