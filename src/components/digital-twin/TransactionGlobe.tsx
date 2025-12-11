import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2, AlertTriangle, RefreshCw, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useGlobalTransactionLocations, GlobalTransactionLocation } from '@/hooks/useGlobalTransactionLocations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface TransactionGlobeProps {
  className?: string;
}

// Category color mapping using brand colors
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f59e0b', // amber-500
  'Shopping': '#ea580c', // orange-600
  'Travel': '#d97706', // amber-600
  'Entertainment': '#f97316', // orange-500
  'Groceries': '#ca8a04', // yellow-600
  'default': '#d6c8a2', // orbital-accent
};

export function TransactionGlobe({ className }: TransactionGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GlobalTransactionLocation | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { data: token, isLoading: tokenLoading, isError: tokenError, error, refetch } = useMapboxToken();
  const { data: locations, isLoading: locationsLoading } = useGlobalTransactionLocations();

  // Initialize globe map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    try {
      setMapError(null);
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [30, 20],
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-left'
      );

      // Disable scroll zoom for smoother experience
      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(20, 20, 25)',
          'high-color': 'rgb(30, 30, 40)',
          'horizon-blend': 0.1,
          'star-intensity': 0.15,
        });
      });

      // Rotation animation settings
      const secondsPerRevolution = 180;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;

      // Spin globe function
      function spinGlobe() {
        if (!map.current) return;

        const zoom = map.current.getZoom();
        if (isSpinning && !userInteracting && zoom < maxSpinZoom && !prefersReducedMotion) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      // Event listeners for interaction
      map.current.on('mousedown', () => setUserInteracting(true));
      map.current.on('dragstart', () => setUserInteracting(true));
      map.current.on('mouseup', () => {
        setUserInteracting(false);
        spinGlobe();
      });
      map.current.on('touchend', () => {
        setUserInteracting(false);
        spinGlobe();
      });
      map.current.on('moveend', () => spinGlobe());

      // Start the globe spinning
      if (!prefersReducedMotion) {
        spinGlobe();
      }

      map.current.on('error', (e) => {
        console.error('Globe error:', e);
        setMapError('Failed to initialize globe.');
      });
    } catch (error) {
      console.error('Error initializing globe:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize globe');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token, prefersReducedMotion]);

  // Add transaction markers
  useEffect(() => {
    if (!map.current || !locations || locations.length === 0) return;

    // Wait for map to be fully loaded
    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', () => addMarkers());
    } else {
      addMarkers();
    }

    function addMarkers() {
      if (!map.current || !locations) return;

      // Remove existing markers
      const existingMarkers = document.querySelectorAll('.globe-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add markers for each location
      locations.forEach((location) => {
        const color = CATEGORY_COLORS[location.category || 'default'] || CATEGORY_COLORS.default;
        const size = Math.min(16 + (location.totalSpent / 500) * 8, 32);

        // Create marker element
        const el = document.createElement('div');
        el.className = 'globe-marker';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        el.style.boxShadow = `0 0 20px ${color}80, 0 0 40px ${color}40`;
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        // Pulsing animation
        if (!prefersReducedMotion) {
          el.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.2)', opacity: 0.7 },
            { transform: 'scale(1)', opacity: 1 },
          ], {
            duration: 2000 + Math.random() * 1000,
            iterations: Infinity,
            easing: 'ease-in-out',
          });
        }

        // Hover effects
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.3)';
          el.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}80`;
          setSelectedLocation(location);
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = `0 0 20px ${color}80, 0 0 40px ${color}40`;
          setSelectedLocation(null);
        });

        new mapboxgl.Marker(el)
          .setLngLat([location.lon, location.lat])
          .addTo(map.current!);
      });

      // Add connection arcs between frequent locations (top 5 by spend)
      const topLocations = [...locations]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      if (topLocations.length >= 2) {
        const arcFeatures: GeoJSON.Feature[] = [];
        
        for (let i = 0; i < topLocations.length - 1; i++) {
          const start = topLocations[i];
          const end = topLocations[i + 1];
          
          arcFeatures.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [start.lon, start.lat],
                [(start.lon + end.lon) / 2, (start.lat + end.lat) / 2 + 15], // Arc midpoint
                [end.lon, end.lat],
              ],
            },
            properties: {},
          });
        }

        // Remove existing arc layer
        if (map.current?.getLayer('arc-layer')) {
          map.current.removeLayer('arc-layer');
        }
        if (map.current?.getSource('arcs')) {
          map.current.removeSource('arcs');
        }

        // Add arc source and layer
        map.current?.addSource('arcs', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: arcFeatures,
          },
        });

        map.current?.addLayer({
          id: 'arc-layer',
          type: 'line',
          source: 'arcs',
          paint: {
            'line-color': '#d6c8a2',
            'line-width': 1.5,
            'line-opacity': 0.4,
            'line-blur': 1,
          },
        });
      }
    }
  }, [locations, prefersReducedMotion]);

  // Toggle spin
  const toggleSpin = () => {
    setIsSpinning(!isSpinning);
  };

  if (tokenLoading || locationsLoading) {
    return (
      <div className={cn("h-[500px] rounded-2xl bg-stone-900/50 flex items-center justify-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (tokenError || mapError) {
    return (
      <div className={cn("h-[500px] rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center gap-4", className)}>
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center max-w-md px-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load globe</h3>
          <p className="text-sm text-muted-foreground">
            {mapError || error?.message || 'There was a problem loading the globe.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setMapError(null);
            refetch();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Globe className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Global Transactions</h2>
            <p className="text-sm text-muted-foreground">
              {locations?.length || 0} locations worldwide
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSpin}
          className="gap-2 backdrop-blur-xl bg-stone-900/70 border-stone-700/50"
        >
          {isSpinning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isSpinning ? 'Pause' : 'Spin'}
        </Button>
      </div>

      {/* Globe Container */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden border border-border shadow-xl">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-stone-950/50 rounded-2xl" />

        {/* Location info tooltip */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 p-4 rounded-xl backdrop-blur-xl bg-stone-900/90 border border-amber-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedLocation.merchant}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.city}, {selectedLocation.country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-500">
                    ${selectedLocation.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLocation.transactionCount} transactions
                  </p>
                </div>
              </div>
              {selectedLocation.category && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                  {selectedLocation.category}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute top-4 right-4 p-3 rounded-xl backdrop-blur-xl bg-stone-900/80 border border-stone-700/50">
          <p className="text-xs text-muted-foreground mb-2 font-mono">SPENDING BY CATEGORY</p>
          <div className="space-y-1">
            {Object.entries(CATEGORY_COLORS).filter(([key]) => key !== 'default').slice(0, 4).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-stone-400">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
