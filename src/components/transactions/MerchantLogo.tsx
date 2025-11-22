import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { merchantKeys } from "@/lib/query-keys";
import { generateMerchantAvatar, getClearbitLogoUrl, extractDomain } from "@/lib/merchant-utils";
import { Building2 } from "lucide-react";

interface MerchantLogoProps {
  merchant: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function MerchantLogo({ merchant, size = "md", className = "" }: MerchantLogoProps) {
  const [imgError, setImgError] = useState(false);
  
  const { data: cachedLogo } = useQuery({
    queryKey: merchantKeys.logo(merchant),
    queryFn: async () => {
      const { data } = await supabase
        .from('merchant_logos')
        .select('logo_url, source')
        .eq('merchant_name', merchant)
        .single();
      
      return data;
    },
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const avatar = generateMerchantAvatar(merchant);
  const clearbitUrl = getClearbitLogoUrl(merchant);

  // Try cached logo first, then Clearbit, then fallback to initials
  const logoUrl = cachedLogo?.logo_url || (!imgError ? clearbitUrl : null);

  if (logoUrl && !imgError) {
    return (
      <div className={`relative ${sizeMap[size]} ${className}`}>
        <img
          src={logoUrl}
          alt={merchant}
          className="w-full h-full rounded-lg object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: Colored initials with glassmorphism
  return (
    <div
      className={`relative flex items-center justify-center rounded-lg font-semibold ${sizeMap[size]} ${className}`}
      style={{
        backgroundColor: avatar.bgColor,
        color: avatar.textColor,
      }}
    >
      {avatar.initials}
    </div>
  );
}
