import { useState, useEffect, useCallback } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable' | 'error';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: GeolocationStatus;
  error: string | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Hook to access browser geolocation with permission handling
 * Returns user's current position and status
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    status: 'idle',
    error: null,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const getCurrentPosition = useCallback(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        status: 'unavailable',
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          status: 'granted',
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        let status: GeolocationStatus = 'error';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            status = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState(prev => ({
          ...prev,
          status,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Request location on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    refetch: getCurrentPosition,
    isLoading: state.status === 'loading',
    isGranted: state.status === 'granted',
    isDenied: state.status === 'denied',
    isUnavailable: state.status === 'unavailable',
  };
}
