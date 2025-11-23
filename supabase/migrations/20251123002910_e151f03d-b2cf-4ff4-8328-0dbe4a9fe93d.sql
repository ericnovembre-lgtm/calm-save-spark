-- Add image_url column for Visual Vaults background images
ALTER TABLE public.pots ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.pots.image_url IS 'Background image URL for visual vault effect (Unsplash integration)';

COMMENT ON COLUMN public.pots.color IS 'Gradient palette key (cyber-grape, neon-sunset, ocean-depth, emerald-dream, fire-opal) or hex color for backward compatibility';