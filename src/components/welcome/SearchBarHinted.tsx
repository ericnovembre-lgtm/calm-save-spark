import { useState } from "react";
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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={hints[hintIndex]}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-12 pr-4 h-14 bg-background border-border focus:border-foreground transition-colors text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};
