-- Enable INSERT policy for users to create their own cache entries
CREATE POLICY "Users can create own cache"
ON public.api_response_cache
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Enable UPDATE policy for users to update their own cache entries
CREATE POLICY "Users can update own cache"
ON public.api_response_cache
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_api_response_cache_lookup 
ON public.api_response_cache(cache_key, cache_type, user_id);

-- Add index for TTL-based cleanup
CREATE INDEX IF NOT EXISTS idx_api_response_cache_expires
ON public.api_response_cache(expires_at);