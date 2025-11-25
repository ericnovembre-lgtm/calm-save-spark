import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { Loader2, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { useMerchantLocations } from "@/hooks/useMerchantLocations";
import { MapFilterPanel } from "./MapFilterPanel";
import { SpendingHeatmapLegend } from "./SpendingHeatmapLegend";
import { MerchantMarkerPopup } from "./MerchantMarkerPopup";
import { createRoot } from "react-dom/client";

interface MerchantMapVisualizationProps {
  cardId?: string;
}

export function MerchantMapVisualization({ cardId }: MerchantMapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)),
    end: new Date(),
  });
  const [minAmount, setMinAmount] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);

  const { data: token, isLoading: tokenLoading, isError: tokenError, error, refetch } = useMapboxToken();
  const { data: locations, isLoading: locationsLoading } = useMerchantLocations({
    cardId,
    dateRange,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    minAmount,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    try {
      setMapError(null);
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of US
        zoom: 3,
        projection: 'mercator' as any,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-left'
      );

      map.current.scrollZoom.enable();

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to initialize map. Please check your connection.');
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

  // Add markers and heatmap
  useEffect(() => {
    if (!map.current || !locations || locations.length === 0) return;

    // Remove existing layers and sources
    if (map.current.getLayer('heatmap-layer')) {
      map.current.removeLayer('heatmap-layer');
    }
    if (map.current.getSource('transactions')) {
      map.current.removeSource('transactions');
    }

    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Create GeoJSON from locations
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: locations.map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.lon, loc.lat],
        },
        properties: {
          amount: loc.totalSpent,
        },
      })),
    };

    // Add heatmap source
    map.current.addSource('transactions', {
      type: 'geojson',
      data: geojson,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'transactions',
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'amount'],
          0, 0,
          100, 1,
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3,
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(59, 130, 246, 0)',
          0.2, 'rgba(59, 130, 246, 0.3)',
          0.4, 'rgba(168, 85, 247, 0.5)',
          0.6, 'rgba(236, 72, 153, 0.7)',
          0.8, 'rgba(239, 68, 68, 0.9)',
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 20,
          9, 40,
        ],
        'heatmap-opacity': 0.8,
      },
    });

    // Add markers for each location
    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(var(--primary))';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';

      // Create popup with React component
      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);
      root.render(<MerchantMarkerPopup location={location} />);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(popupNode);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lon, location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
    });

    // Fit map to markers
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(loc => bounds.extend([loc.lon, loc.lat]));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 12 });
    }
  }, [locations]);

  if (tokenLoading) {
    return (
      <div className="h-[600px] rounded-2xl bg-muted/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tokenError || mapError) {
    return (
      <div className="h-[600px] rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center max-w-md px-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to load map
          </h3>
          <p className="text-sm text-muted-foreground">
            {mapError || error?.message || 'There was a problem loading the map. Please try again.'}
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
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Spending Map</h2>
          <p className="text-sm text-muted-foreground">
            {locations?.length || 0} transaction locations
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden border border-border shadow-xl">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {locationsLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <MapFilterPanel
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          minAmount={minAmount}
          onMinAmountChange={setMinAmount}
        />

        <SpendingHeatmapLegend />
      </div>
    </motion.div>
  );
}
