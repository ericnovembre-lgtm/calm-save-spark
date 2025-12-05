import React from "react";
import { motion } from "framer-motion";
import { Star, Download, Users, DollarSign, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceTemplate } from "@/hooks/useTemplateMarketplace";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: MarketplaceTemplate;
  featured?: boolean;
  userRating?: number;
  onSelect: () => void;
  onDownload: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  featured = false,
  userRating,
  onSelect,
  onDownload,
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-3 h-3",
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
        featured && "border-primary/30 bg-primary/5"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate flex items-center gap-2">
              {template.title}
              {featured && (
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              by {template.author_name || "Anonymous"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description || "No description provided."}
        </p>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {template.household_type && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="capitalize">{template.household_type}</span>
            </div>
          )}
          {template.income_level && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="capitalize">{template.income_level.replace("_", " ")}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {renderStars(template.rating_average)}
              <span className="text-xs text-muted-foreground ml-1">
                ({template.rating_count})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              {template.downloads_count}
            </div>

            {/* Download Button */}
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="w-3 h-3" />
              Use
            </Button>
          </div>
        </div>

        {/* User's Rating */}
        {userRating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <span>Your rating:</span>
            {renderStars(userRating)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
