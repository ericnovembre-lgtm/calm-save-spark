import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

/**
 * Hook to handle achievement sharing on social media
 */
export const useShareAchievement = () => {
  const shareAchievement = useCallback(async () => {
    const shareData: ShareOptions = {
      title: '$ave+ Journey Started! 🎉',
      text: "I just completed my financial onboarding with $ave+! Ready to build my financial future. 💰✨",
      url: window.location.origin,
    };

    // Try Web Share API first (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Thanks for sharing!');
        return;
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return;
      }
    }

    // Fallback: Open share dialog with options
    showShareOptions(shareData);
  }, []);

  const showShareOptions = (data: ShareOptions) => {
    const encodedText = encodeURIComponent(data.text);
    const encodedUrl = encodeURIComponent(data.url || window.location.origin);
    const encodedTitle = encodeURIComponent(data.title);

    // Create share URLs for different platforms
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    };

    // For desktop, copy to clipboard and show toast with options
    const fullText = `${data.text}\n\n${data.url || window.location.origin}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      toast.success('Achievement copied to clipboard!', {
        description: 'Share it on your favorite social media platform.',
        action: {
          label: 'Share on Twitter',
          onClick: () => window.open(shareUrls.twitter, '_blank', 'width=600,height=400'),
        },
      });
    }).catch(() => {
      // If clipboard fails, just open Twitter
      window.open(shareUrls.twitter, '_blank', 'width=600,height=400');
    });
  };

  const copyToClipboard = useCallback(async () => {
    const text = "I just completed my financial onboarding with $ave+! Ready to build my financial future. 💰✨\n\n" + window.location.origin;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        description: 'Now you can paste it anywhere you want to share.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  return {
    shareAchievement,
    copyToClipboard,
  };
};
