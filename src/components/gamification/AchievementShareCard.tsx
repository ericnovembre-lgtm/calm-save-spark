import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Share2, Download, Loader2, Twitter, Facebook, Linkedin } from "lucide-react";

interface AchievementShareCardProps {
  achievementName: string;
  achievementDescription: string;
  points: number;
  earnedAt: string;
}

export function AchievementShareCard({
  achievementName,
  achievementDescription,
  points,
  earnedAt,
}: AchievementShareCardProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const generateImageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content: `Create a beautiful social media share card for a savings achievement. The design should be clean, modern, and celebratory with a calm color palette (off-white #faf8f2, black #0a0a0a, light beige #d6c8a2). Include these details prominently:

Achievement: "${achievementName}"
Description: "${achievementDescription}"
Points Earned: ${points} pts
Date: ${new Date(earnedAt).toLocaleDateString()}

Add the $ave+ logo/branding at the top. Include decorative elements like subtle confetti, stars, or achievement badges. Make it Instagram/Twitter friendly (1080x1080px square format). The overall aesthetic should feel premium and accomplishment-focused.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        throw new Error("No image generated");
      }

      return imageUrl;
    },
    onSuccess: (imageUrl) => {
      setGeneratedImage(imageUrl);
      toast({
        title: "Share Card Generated",
        description: "Your achievement card is ready to share!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `saveplus-achievement-${achievementName.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "Your achievement card has been downloaded!",
    });
  };

  const shareToSocial = (platform: "twitter" | "facebook" | "linkedin") => {
    const text = `I just unlocked the "${achievementName}" achievement on $ave+! 🎉 ${points} points earned!`;
    const url = window.location.origin;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>
            Generate a beautiful share card for social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedImage ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {achievementName}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {achievementDescription}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="font-semibold text-primary">{points} pts</span>
                  <span className="text-muted-foreground">
                    {new Date(earnedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => generateImageMutation.mutate()}
                disabled={generateImageMutation.isPending}
                className="w-full"
              >
                {generateImageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Share Card"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={generatedImage}
                  alt="Achievement Share Card"
                  className="w-full h-auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={downloadImage} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => generateImageMutation.mutate()}
                  variant="outline"
                  disabled={generateImageMutation.isPending}
                >
                  Regenerate
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Share to Social Media</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => shareToSocial("twitter")}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => shareToSocial("facebook")}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial("linkedin")}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
