import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Download,
  Users,
  DollarSign,
  Calendar,
  User,
  Tag,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MarketplaceTemplate, TemplateRating } from "@/hooks/useTemplateMarketplace";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TemplateDetailDialogProps {
  template: MarketplaceTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRating?: TemplateRating;
  onDownload: (id: string) => void;
  onRate: (id: string, rating: number, review?: string) => void;
}

export const TemplateDetailDialog: React.FC<TemplateDetailDialogProps> = ({
  template,
  open,
  onOpenChange,
  userRating,
  onDownload,
  onRate,
}) => {
  const [selectedRating, setSelectedRating] = useState(userRating?.rating || 0);
  const [review, setReview] = useState(userRating?.review || "");
  const [isApplied, setIsApplied] = useState(false);

  if (!template) return null;

  const handleApply = () => {
    onDownload(template.id);
    setIsApplied(true);
    toast.success("Template applied to your budgets!");
  };

  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    onRate(template.id, selectedRating, review || undefined);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setSelectedRating(star)}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer"
            )}
          >
            <Star
              className={cn(
                interactive ? "w-6 h-6" : "w-4 h-4",
                star <= (interactive ? selectedRating : Math.round(rating))
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{template.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <User className="w-3 h-3" />
            by {template.author_name || "Anonymous"}
            <span className="text-muted-foreground">•</span>
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(template.published_at), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {renderStars(template.rating_average)}
              <span className="text-sm text-muted-foreground">
                {template.rating_average.toFixed(1)} ({template.rating_count} ratings)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="w-4 h-4" />
              {template.downloads_count} downloads
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              {template.description || "No description provided."}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {template.household_type && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Household:</span>
                <Badge variant="secondary" className="capitalize">
                  {template.household_type}
                </Badge>
              </div>
            )}
            {template.income_level && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>Income:</span>
                <Badge variant="secondary" className="capitalize">
                  {template.income_level.replace("_", " ")}
                </Badge>
              </div>
            )}
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Preview */}
          {template.template?.category_mappings && (
            <div className="space-y-2">
              <h3 className="font-medium">Included Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(template.template.category_mappings).slice(0, 9).map((category) => (
                  <Badge key={category} variant="secondary" className="justify-start">
                    {category}
                  </Badge>
                ))}
                {Object.keys(template.template.category_mappings).length > 9 && (
                  <Badge variant="secondary">
                    +{Object.keys(template.template.category_mappings).length - 9} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Apply Button */}
          <div className="flex justify-end gap-3">
            {isApplied ? (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Applied successfully!</span>
              </div>
            ) : (
              <Button onClick={handleApply} className="gap-2">
                <Download className="w-4 h-4" />
                Apply Template
              </Button>
            )}
          </div>

          <Separator />

          {/* Rating Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Rate this template</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {renderStars(selectedRating, true)}
                {selectedRating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedRating === 1 && "Poor"}
                    {selectedRating === 2 && "Fair"}
                    {selectedRating === 3 && "Good"}
                    {selectedRating === 4 && "Very Good"}
                    {selectedRating === 5 && "Excellent"}
                  </span>
                )}
              </div>
              <Textarea
                placeholder="Write a review (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0}
                variant="outline"
              >
                {userRating ? "Update Rating" : "Submit Rating"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
