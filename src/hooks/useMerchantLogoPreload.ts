import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { merchantKeys } from '@/lib/query-keys';
import { getClearbitLogoUrl } from '@/lib/merchant-utils';

/**
 * Preload merchant logos for visible transactions
 * Improves perceived performance by fetching logos before they're needed
 */
export function useMerchantLogoPreload(merchants: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!merchants.length) return;

    const preloadLogos = async () => {
      // Batch fetch cached logos
      const { data: cachedLogos } = await supabase
        .from('merchant_logos')
        .select('merchant_name, logo_url, source')
        .in('merchant_name', merchants);

      const cachedMap = new Map(
        cachedLogos?.map(logo => [logo.merchant_name, logo]) || []
      );

      // Preload images for merchants
      merchants.forEach(merchant => {
        const cached = cachedMap.get(merchant);
        
        // Prefetch query data
        queryClient.setQueryData(
          merchantKeys.logo(merchant),
          cached || null
        );

        // Preload image if we have a URL
        const logoUrl = cached?.logo_url || getClearbitLogoUrl(merchant);
        
        if (logoUrl) {
          const img = new Image();
          img.src = logoUrl;
          
          // Cache successful logos in DB
          img.onload = async () => {
            if (!cached) {
              await supabase.from('merchant_logos').upsert({
                merchant_name: merchant,
                logo_url: logoUrl,
                source: 'clearbit',
              }, {
                onConflict: 'merchant_name',
              });
            }
          };
        }
      });
    };

    preloadLogos();
  }, [merchants, queryClient]);
}
