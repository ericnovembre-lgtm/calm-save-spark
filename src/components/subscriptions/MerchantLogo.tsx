import { useState, useEffect } from 'react';
import { generateMerchantAvatar } from '@/lib/merchant-utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MerchantLogoProps {
  merchant: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MerchantLogo({ merchant, className = '', size = 'md' }: MerchantLogoProps) {
  const [logoError, setLogoError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  // Fetch logo from cache or enrich
  const { data: logoData } = useQuery({
    queryKey: ['merchant-logo', merchant],
    queryFn: async () => {
      // Check cache first
      const { data: cached } = await supabase
        .from('merchant_logos')
        .select('*')
        .eq('merchant_name', merchant)
        .maybeSingle();

      if (cached && cached.logo_url) {
        return cached;
      }

      // Enrich logo via edge function
      const { data, error } = await supabase.functions.invoke('enrich-merchant-logo', {
        body: { merchant }
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  const avatar = generateMerchantAvatar(merchant);

  if (logoData?.logo_url && !logoError) {
    return (
      <img
        src={logoData.logo_url}
        alt={merchant}
        className={`${sizeClasses[size]} rounded-lg object-contain ${className}`}
        onError={() => setLogoError(true)}
      />
    );
  }

  // Fallback to lettermark
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold ${className}`}
      style={{
        backgroundColor: avatar.bgColor,
        color: avatar.textColor,
      }}
    >
      {avatar.initials}
    </div>
  );
}
