import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  full: string;
  photographer: string;
  photographer_username: string;
  photographer_url: string;
  download_location: string;
  alt: string | null;
}

interface SearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

interface UseUnsplashImageOptions {
  orientation?: 'landscape' | 'portrait' | 'squarish';
  count?: number;
}

export const useUnsplashSearch = (
  query: string,
  options: UseUnsplashImageOptions = {}
) => {
  const { orientation = 'landscape', count = 9 } = options;

  return useQuery({
    queryKey: ['unsplash-search', query, orientation, count],
    queryFn: async (): Promise<SearchResponse> => {
      if (!query.trim()) {
        return { total: 0, total_pages: 0, results: [] };
      }

      const { data, error } = await supabase.functions.invoke('fetch-unsplash-image', {
        body: { query, orientation, count, action: 'search' },
      });

      if (error) throw error;
      return data;
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};

export const useRandomUnsplashImage = (
  query: string,
  options: UseUnsplashImageOptions = {}
) => {
  const { orientation = 'landscape' } = options;

  return useQuery({
    queryKey: ['unsplash-random', query, orientation],
    queryFn: async (): Promise<UnsplashImage | null> => {
      if (!query.trim()) return null;

      const { data, error } = await supabase.functions.invoke('fetch-unsplash-image', {
        body: { query, orientation, action: 'random' },
      });

      if (error) throw error;
      return data;
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Imperative hook for one-off fetches (used in pot generator)
export const useUnsplashFetch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomImage = useCallback(async (
    query: string,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Promise<UnsplashImage | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-unsplash-image', {
        body: { query, orientation, action: 'random' },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch Unsplash image:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchImages = useCallback(async (
    query: string,
    options: UseUnsplashImageOptions = {}
  ): Promise<UnsplashImage[]> => {
    if (!query.trim()) return [];

    const { orientation = 'landscape', count = 9 } = options;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-unsplash-image', {
        body: { query, orientation, count, action: 'search' },
      });

      if (error) throw error;
      return data.results || [];
    } catch (error) {
      console.error('Failed to search Unsplash images:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRandomImage, searchImages, isLoading };
};
