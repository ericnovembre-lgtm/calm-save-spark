import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const hints = [
  "How much have I saved this month?",
  "Show my investment goals",
  "What's my current APY?",
  "Track my spending habits"
];

export const SearchBarHinted = () => {
  const [searchValue, setSearchValue] = useState("");
  const [hintIndex] = useState(Math.floor(Math.random() * hints.length));
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 to-secondary/20 blur-xl"
          animate={{
            opacity: isFocused ? 0.6 : 0.3,
            scale: isFocused ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder={hints[hintIndex]}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="relative w-full pl-12 pr-4 h-14 md:h-16 bg-card/80 backdrop-blur-sm border-border/50 focus:border-foreground transition-all text-foreground placeholder:text-muted-foreground rounded-xl shadow-[var(--shadow-soft)] focus:shadow-[var(--shadow-card)]"
        />
      </motion.div>
    </motion.div>
  );
};
