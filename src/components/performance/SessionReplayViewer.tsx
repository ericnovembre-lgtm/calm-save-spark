import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, FastForward, Clock, Activity, AlertCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface PerformanceMarker {
  timestamp: number;
  metric: string;
  value: number;
  component?: string;
  status: 'success' | 'warning' | 'error';
}

interface SessionReplayData {
  sessionId: string;
  startTime: number;
  duration: number;
  events: any[];
  performanceMarkers: PerformanceMarker[];
  route: string;
  userAgent: string;
}

interface SessionReplayViewerProps {
  sessionData?: SessionReplayData;
  onClose?: () => void;
}

/**
 * SessionReplayViewer - Visualize user sessions with performance overlays
 * Integrates session replay with performance metrics for debugging
 */
export const SessionReplayViewer = ({ sessionData, onClose }: SessionReplayViewerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedMarker, setSelectedMarker] = useState<PerformanceMarker | null>(null);

  // Mock session data for demonstration
  const mockSessionData: SessionReplayData = sessionData || {
    sessionId: 'session_' + Date.now(),
    startTime: Date.now() - 10000,
    duration: 10000,
    route: '/',
    userAgent: navigator.userAgent,
    events: [],
    performanceMarkers: [
      { timestamp: 500, metric: 'auth_check', value: 450, status: 'success' },
      { timestamp: 800, metric: 'hero_load', value: 280, status: 'success' },
      { timestamp: 1200, metric: 'features_load', value: 1100, status: 'warning' },
      { timestamp: 1800, metric: 'component_load', value: 2200, component: 'LottieHero', status: 'error' },
      { timestamp: 2500, metric: 'stats_load', value: 550, status: 'success' },
      { timestamp: 3200, metric: 'page_load', value: 3200, status: 'error' },
    ],
  };

  const session = mockSessionData;

  // Playback control
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (100 * playbackSpeed);
        if (next >= session.duration) {
          setIsPlaying(false);
          return session.duration;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, session.duration]);

  const handlePlayPause = () => {
    if (currentTime >= session.duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      case 'warning':
        return <Clock className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Session Replay with Performance Markers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <Card className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Session ID</div>
                <div className="font-mono text-xs">{session.sessionId.slice(0, 12)}...</div>
              </div>
              <div>
                <div className="text-muted-foreground">Route</div>
                <div className="font-medium">{session.route}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">{formatTime(session.duration)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Performance Issues</div>
                <div className="font-medium">
                  {session.performanceMarkers.filter(m => m.status === 'error').length} errors,{' '}
                  {session.performanceMarkers.filter(m => m.status === 'warning').length} warnings
                </div>
              </div>
            </div>
          </Card>

          {/* Replay Canvas (Placeholder) */}
          <Card className="p-8 bg-muted/50">
            <div className="aspect-video bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-2">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground" />
                <div className="text-muted-foreground">
                  Session replay visualization would appear here
                </div>
                <div className="text-sm text-muted-foreground">
                  Integration with rrweb or similar replay library
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline with Performance Markers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Timeline</span>
              <span className="text-sm text-muted-foreground">{formatTime(currentTime)} / {formatTime(session.duration)}</span>
            </div>

            {/* Timeline Slider */}
            <div className="relative">
              <Slider
                value={[currentTime]}
                onValueChange={([value]) => setCurrentTime(value)}
                max={session.duration}
                step={100}
                className="w-full"
              />

              {/* Performance Markers on Timeline */}
              <div className="relative w-full h-8 mt-2">
                {session.performanceMarkers.map((marker, index) => {
                  const position = (marker.timestamp / session.duration) * 100;
                  const isActive = Math.abs(currentTime - marker.timestamp) < 500;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`absolute -top-1 w-2 h-10 rounded-full cursor-pointer ${getMarkerColor(marker.status)}`}
                      style={{ left: `${position}%` }}
                      animate={{ scale: isActive ? 1.5 : 1 }}
                      onClick={() => {
                        setCurrentTime(marker.timestamp);
                        setSelectedMarker(marker);
                      }}
                      title={`${marker.metric}: ${marker.value}ms`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button onClick={handlePlayPause}>
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSpeedChange}>
                <FastForward className="w-4 h-4 mr-2" />
                {playbackSpeed}x
              </Button>
            </div>
          </div>

          {/* Performance Markers List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Performance Markers</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {session.performanceMarkers.map((marker, index) => (
                <Card
                  key={index}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedMarker === marker ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setCurrentTime(marker.timestamp);
                    setSelectedMarker(marker);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getMarkerColor(marker.status)} text-white`}>
                        {getMarkerIcon(marker.status)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {marker.component || marker.metric}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(marker.timestamp)} • {marker.value}ms
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        marker.status === 'error'
                          ? 'destructive'
                          : marker.status === 'warning'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {marker.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
