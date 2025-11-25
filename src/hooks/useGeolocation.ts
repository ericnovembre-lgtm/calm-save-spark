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
  watch?: boolean; // Enable continuous location tracking
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
  const [watchId, setWatchId] = useState<number | null>(null);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
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

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        status: 'unavailable',
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    if (watchId !== null) {
      console.log('Already watching location');
      return;
    }

    setState(prev => ({ ...prev, status: 'loading' }));

    const id = navigator.geolocation.watchPosition(
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

    setWatchId(id);
    console.log(`Started watching location (watchId: ${id})`);
  }, [watchId, enableHighAccuracy, timeout, maximumAge]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      console.log(`Stopped watching location (watchId: ${watchId})`);
    }
  }, [watchId]);

  // Handle watch mode
  useEffect(() => {
    if (watch) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, startWatching, stopWatching, watchId]);

  // Request location on mount (if not in watch mode)
  useEffect(() => {
    if (!watch) {
      getCurrentPosition();
    }
  }, [getCurrentPosition, watch]);

  return {
    ...state,
    refetch: getCurrentPosition,
    startWatching,
    stopWatching,
    isWatching: watchId !== null,
    isLoading: state.status === 'loading',
    isGranted: state.status === 'granted',
    isDenied: state.status === 'denied',
    isUnavailable: state.status === 'unavailable',
  };
}
