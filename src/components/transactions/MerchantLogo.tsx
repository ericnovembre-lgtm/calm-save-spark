import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { merchantKeys } from "@/lib/query-keys";
import { generateMerchantAvatar, getClearbitLogoUrl } from "@/lib/merchant-utils";
import { Building2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MerchantLogoProps {
  merchant: string;
  size?: "sm" | "md" | "lg";
  fallback?: "initials" | "icon";
  showSkeleton?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function MerchantLogo({ 
  merchant, 
  size = "md", 
  fallback = "initials",
  showSkeleton = true,
  className = "" 
}: MerchantLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const { data: cachedLogo, isLoading } = useQuery({
    queryKey: merchantKeys.logo(merchant),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_logos')
        .select('logo_url, source')
        .eq('merchant_name', merchant)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days
    gcTime: 60 * 24 * 60 * 60 * 1000, // 60 days
  });

  const avatar = generateMerchantAvatar(merchant);
  const clearbitUrl = getClearbitLogoUrl(merchant);

  // Try cached logo first, then Clearbit
  const logoUrl = cachedLogo?.logo_url || (!imgError ? clearbitUrl : null);

  // Handle image loading and caching
  const handleImageLoad = async () => {
    setImgLoaded(true);
    
    // Cache successful Clearbit logo
    if (!cachedLogo && !imgError) {
      await supabase.from('merchant_logos').upsert({
        merchant_name: merchant,
        logo_url: clearbitUrl,
        source: 'clearbit',
      }, {
        onConflict: 'merchant_name',
      });
    }
  };

  const handleImageError = () => {
    setImgError(true);
    setImgLoaded(true);
  };

  // Show skeleton while loading
  if (showSkeleton && (isLoading || (!imgLoaded && logoUrl))) {
    return (
      <Skeleton className={`rounded-lg ${sizeMap[size]} ${className}`} />
    );
  }

  // Show logo if available
  if (logoUrl && !imgError) {
    return (
      <div className={`relative ${sizeMap[size]} ${className}`}>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm" />
        <img
          src={logoUrl}
          alt={merchant}
          className={`relative w-full h-full rounded-lg object-cover transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Icon or Initials with glassmorphism
  if (fallback === "icon") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-lg ${sizeMap[size]} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${avatar.bgColor}dd, ${avatar.bgColor}aa)`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Building2 className="w-1/2 h-1/2 text-white" />
      </div>
    );
  }

  // Fallback: Colored initials with enhanced glassmorphism
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg font-semibold ${sizeMap[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${avatar.bgColor}dd, ${avatar.bgColor}aa)`,
        color: avatar.textColor,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <span className="relative z-10">{avatar.initials}</span>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
