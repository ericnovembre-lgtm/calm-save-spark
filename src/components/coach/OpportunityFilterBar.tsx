import { motion } from "framer-motion";
import { Filter, ArrowUpDown, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OpportunityFilterBarProps {
  filterType: "all" | "arbitrage" | "waste" | "optimization";
  onFilterChange: (type: "all" | "arbitrage" | "waste" | "optimization") => void;
  sortBy: "roi" | "type" | "recent";
  onSortChange: (sort: "roi" | "type" | "recent") => void;
  batchMode: boolean;
  onBatchModeToggle: () => void;
  selectedCount: number;
  totalCount: number;
}

export function OpportunityFilterBar({
  filterType,
  onFilterChange,
  sortBy,
  onSortChange,
  batchMode,
  onBatchModeToggle,
  selectedCount,
  totalCount,
}: OpportunityFilterBarProps) {
  const filterOptions = [
    { value: "all" as const, label: "All Types", count: totalCount },
    { value: "arbitrage" as const, label: "Arbitrage", icon: "💰" },
    { value: "waste" as const, label: "Waste", icon: "🗑️" },
    { value: "optimization" as const, label: "Optimization", icon: "⚡" },
  ];

  const sortOptions = [
    { value: "roi" as const, label: "ROI (High to Low)" },
    { value: "type" as const, label: "By Type" },
    { value: "recent" as const, label: "Most Recent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 mb-4"
    >
      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-mono"
          >
            <Filter className="w-3 h-3 mr-2" />
            {filterOptions.find((f) => f.value === filterType)?.label}
            <span className="ml-2 text-xs opacity-60">
              ({totalCount})
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-command-surface border-white/10">
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className="text-white hover:bg-white/10 font-mono text-sm"
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-mono"
          >
            <ArrowUpDown className="w-3 h-3 mr-2" />
            {sortOptions.find((s) => s.value === sortBy)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-command-surface border-white/10">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className="text-white hover:bg-white/10 font-mono text-sm"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Batch Mode Toggle */}
      <Button
        variant={batchMode ? "default" : "outline"}
        size="sm"
        onClick={onBatchModeToggle}
        className={`font-mono ${
          batchMode
            ? "bg-command-cyan text-black hover:bg-command-cyan/80"
            : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
        }`}
      >
        <CheckSquare className="w-3 h-3 mr-2" />
        Batch Mode
        {batchMode && selectedCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-xs">
            {selectedCount}
          </span>
        )}
      </Button>
    </motion.div>
  );
}
