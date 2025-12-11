import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUnsplashSearch, UnsplashImage } from "@/hooks/useUnsplashImage";
import { Search, Loader2, ImageIcon, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface UnsplashImagePickerProps {
  value?: string;
  onChange: (url: string, attribution?: { photographer: string; photographer_url: string }) => void;
  defaultQuery?: string;
  className?: string;
}

export const UnsplashImagePicker = ({
  value,
  onChange,
  defaultQuery = "",
  className,
}: UnsplashImagePickerProps) => {
  const [query, setQuery] = useState(defaultQuery);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading, isFetching } = useUnsplashSearch(debouncedQuery, {
    orientation: 'landscape',
    count: 9,
  });

  // Update query when defaultQuery changes
  useEffect(() => {
    if (defaultQuery && !query) {
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  const handleSelect = useCallback((image: UnsplashImage) => {
    setSelectedImage(image);
    onChange(image.url, {
      photographer: image.photographer,
      photographer_url: image.photographer_url,
    });
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedImage(null);
    onChange("");
  }, [onChange]);

  const showLoading = isLoading || isFetching;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Search Images</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Unsplash for images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {showLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={selectedImage.thumb}
            alt={selectedImage.alt || "Selected image"}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <a
              href={selectedImage.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/90 hover:text-white flex items-center gap-1"
            >
              Photo by {selectedImage.photographer}
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {!selectedImage && debouncedQuery && (
        <div className="space-y-2">
          {data?.results && data.results.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                {data.total.toLocaleString()} results
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-lg">
                {data.results.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handleSelect(image)}
                    className={cn(
                      "relative aspect-video rounded-md overflow-hidden",
                      "ring-2 ring-transparent hover:ring-primary/50",
                      "transition-all focus:outline-none focus:ring-primary"
                    )}
                  >
                    <img
                      src={image.thumb}
                      alt={image.alt || "Unsplash image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Photos from{" "}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Unsplash
                </a>
              </p>
            </>
          ) : !showLoading ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No images found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Empty State */}
      {!selectedImage && !debouncedQuery && (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
          <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Search for an image above</p>
          <p className="text-xs">or leave empty for gradient</p>
        </div>
      )}
    </div>
  );
};
