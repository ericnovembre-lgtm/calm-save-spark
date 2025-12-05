import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Filter,
  Sparkles,
  Users,
  DollarSign,
  Tag,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTemplateMarketplace, MarketplaceTemplate } from "@/hooks/useTemplateMarketplace";
import { TemplateCard } from "@/components/marketplace/TemplateCard";
import { TemplateDetailDialog } from "@/components/marketplace/TemplateDetailDialog";
import { cn } from "@/lib/utils";

const HOUSEHOLD_TYPES = [
  { value: "single", label: "Single" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "roommates", label: "Roommates" },
];

const INCOME_LEVELS = [
  { value: "low", label: "Under $30k" },
  { value: "medium", label: "$30k - $75k" },
  { value: "high", label: "$75k - $150k" },
  { value: "very_high", label: "Over $150k" },
];

const TemplateMarketplace: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"downloads" | "rating" | "recent">("downloads");
  const [householdType, setHouseholdType] = useState<string>("");
  const [incomeLevel, setIncomeLevel] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);

  const {
    templates,
    featured,
    availableTags,
    isLoading,
    downloadTemplate,
    rateTemplate,
    userRatings,
  } = useTemplateMarketplace({
    search,
    tags: selectedTags,
    sortBy,
    householdType: householdType || undefined,
    incomeLevel: incomeLevel || undefined,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Template Marketplace</h1>
        <p className="text-muted-foreground">
          Discover community-created budget templates to jumpstart your financial planning.
        </p>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Featured Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                featured
                userRating={userRatings[template.id]?.rating}
                onSelect={() => setSelectedTemplate(template)}
                onDownload={() => downloadTemplate.mutate(template.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3">
            {/* Household Type */}
            <Select value={householdType} onValueChange={setHouseholdType}>
              <SelectTrigger className="w-36">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Household" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {HOUSEHOLD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Income Level */}
            <Select value={incomeLevel} onValueChange={setIncomeLevel}>
              <SelectTrigger className="w-36">
                <DollarSign className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Income" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {INCOME_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-64 overflow-y-auto">
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(selectedTags.length > 0 || householdType || incomeLevel) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTags([]);
                  setHouseholdType("");
                  setIncomeLevel("");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Active Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="ml-1 opacity-70">×</span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Templates</h2>
          <span className="text-sm text-muted-foreground">
            {templates.length} templates
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <Search className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TemplateCard
                  template={template}
                  userRating={userRatings[template.id]?.rating}
                  onSelect={() => setSelectedTemplate(template)}
                  onDownload={() => downloadTemplate.mutate(template.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Template Detail Dialog */}
      <TemplateDetailDialog
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
        userRating={selectedTemplate ? userRatings[selectedTemplate.id] : undefined}
        onDownload={(id) => downloadTemplate.mutate(id)}
        onRate={(id, rating, review) => rateTemplate.mutate({ marketplaceId: id, rating, review })}
      />
    </div>
  );
};

export default TemplateMarketplace;
