import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { Map, Loader2, AlertTriangle, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useGlobalTransactionLocations, DEMO_GLOBAL_LOCATIONS } from '@/hooks/useGlobalTransactionLocations';
import { cn } from '@/lib/utils';

interface SpendingHeatmapMapProps {
  className?: string;
}

// Spending intensity levels for legend
const SPENDING_LEVELS = [
  { label: 'Low', color: 'hsl(45, 93%, 47%)', range: '$0 - $200' },
  { label: 'Medium', color: 'hsl(30, 92%, 50%)', range: '$200 - $500' },
  { label: 'High', color: 'hsl(20, 91%, 53%)', range: '$500 - $1000' },
  { label: 'Very High', color: 'hsl(0, 84%, 60%)', range: '$1000+' },
];

const CATEGORY_OPTIONS = [
  'All Categories',
  'Food & Dining',
  'Shopping',
  'Travel',
  'Entertainment',
  'Groceries',
];

export function SpendingHeatmapMap({ className }: SpendingHeatmapMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [heatmapIntensity, setHeatmapIntensity] = useState([50]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);

  const { data: token, isLoading: tokenLoading, isError: tokenError, error, refetch } = useMapboxToken();
  const { data: locations, isLoading: locationsLoading } = useGlobalTransactionLocations();

  // Filter locations by category
  const filteredLocations = locations?.filter(loc => 
    selectedCategory === 'All Categories' || loc.category === selectedCategory
  ) || DEMO_GLOBAL_LOCATIONS;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    try {
      setMapError(null);
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.5,
        projection: 'mercator' as any,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-left'
      );

      map.current.scrollZoom.enable();

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to initialize map.');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Update heatmap layer
  useEffect(() => {
    if (!map.current || !filteredLocations || filteredLocations.length === 0) return;

    const updateHeatmap = () => {
      if (!map.current) return;

      // Remove existing layers and sources
      if (map.current.getLayer('heatmap-layer')) {
        map.current.removeLayer('heatmap-layer');
      }
      if (map.current.getLayer('point-layer')) {
        map.current.removeLayer('point-layer');
      }
      if (map.current.getSource('spending')) {
        map.current.removeSource('spending');
      }

      // Create GeoJSON from locations
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredLocations.map(loc => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [loc.lon, loc.lat],
          },
          properties: {
            amount: loc.totalSpent,
            merchant: loc.merchant,
            city: loc.city,
            country: loc.country,
            category: loc.category,
          },
        })),
      };

      // Add source
      map.current.addSource('spending', {
        type: 'geojson',
        data: geojson,
      });

      // Add heatmap layer with brand colors (warm tones)
      map.current.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'spending',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'amount'],
            0, 0,
            500, 0.5,
            2000, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1 * (heatmapIntensity[0] / 50),
            9, 3 * (heatmapIntensity[0] / 50),
          ],
          // Brand colors: amber → orange → rose (warm palette)
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(217, 119, 6, 0)',       // transparent amber
            0.2, 'rgba(217, 119, 6, 0.4)',   // amber-600
            0.4, 'rgba(234, 88, 12, 0.6)',   // orange-600
            0.6, 'rgba(249, 115, 22, 0.75)', // orange-500
            0.8, 'rgba(239, 68, 68, 0.9)',   // red-500
            1, 'rgba(220, 38, 38, 1)',       // red-600
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 30,
            5, 50,
            10, 80,
          ],
          'heatmap-opacity': 0.85,
        },
      });

      // Add point layer for individual markers at higher zoom
      map.current.addLayer({
        id: 'point-layer',
        type: 'circle',
        source: 'spending',
        minzoom: 5,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'amount'],
            0, 6,
            1000, 12,
            5000, 20,
          ],
          'circle-color': '#f59e0b', // amber-500
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 0,
            8, 0.9,
          ],
        },
      });

      // Add popup on click
      map.current.on('click', 'point-layer', (e) => {
        if (!e.features || !e.features[0]) return;
        
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(`
            <div style="padding: 8px; font-family: system-ui;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${props?.merchant}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${props?.city}, ${props?.country}</p>
              <p style="font-weight: 700; color: #f59e0b;">$${props?.amount?.toLocaleString()}</p>
              ${props?.category ? `<span style="font-size: 10px; background: rgba(245, 158, 11, 0.2); padding: 2px 6px; border-radius: 4px;">${props.category}</span>` : ''}
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'point-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'point-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    };

    if (map.current.isStyleLoaded()) {
      updateHeatmap();
    } else {
      map.current.once('style.load', updateHeatmap);
    }
  }, [filteredLocations, heatmapIntensity]);

  if (tokenLoading || locationsLoading) {
    return (
      <div className={cn("h-[600px] rounded-2xl bg-muted/50 flex items-center justify-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (tokenError || mapError) {
    return (
      <div className={cn("h-[600px] rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center gap-4", className)}>
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center max-w-md px-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load heatmap</h3>
          <p className="text-sm text-muted-foreground">
            {mapError || error?.message || 'There was a problem loading the spending heatmap.'}
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
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Map className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Spending Heatmap</h2>
            <p className="text-sm text-muted-foreground">
              {filteredLocations.length} locations • ${filteredLocations.reduce((sum, l) => sum + l.totalSpent, 0).toLocaleString()} total
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-xl bg-card border border-border space-y-4"
        >
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedCategory === cat && "bg-amber-500 hover:bg-amber-600"
                  )}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Heatmap Intensity: {heatmapIntensity[0]}%
            </label>
            <Slider
              value={heatmapIntensity}
              onValueChange={setHeatmapIntensity}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden border border-border shadow-xl">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl backdrop-blur-xl bg-background/90 border border-border shadow-lg">
          <p className="text-xs font-medium text-foreground mb-2">SPENDING INTENSITY</p>
          <div className="flex gap-1">
            {SPENDING_LEVELS.map((level) => (
              <div key={level.label} className="text-center">
                <div
                  className="w-8 h-3 rounded-sm"
                  style={{ backgroundColor: level.color }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">{level.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-4 right-4 p-3 rounded-xl backdrop-blur-xl bg-background/90 border border-border shadow-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-500">
                {filteredLocations.length}
              </p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                ${(filteredLocations.reduce((sum, l) => sum + l.totalSpent, 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
