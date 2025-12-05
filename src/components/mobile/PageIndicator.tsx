import { haptics } from '@/lib/haptics';

interface Route { path: string; label: string; }

export function PageIndicator({ currentIndex, routes, onNavigate }: { currentIndex: number; routes: Route[]; onNavigate: (index: number) => void }) {
  if (currentIndex < 0) return null;
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-full px-3 py-2 border border-border/30 shadow-lg">
        {routes.map((route, index) => (
          <button key={route.path} onClick={() => { if (index !== currentIndex) { haptics.vibrate('light'); onNavigate(index); } }} className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full" aria-label={`Navigate to ${route.label}`}>
            <div className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/40'}`} />
          </button>
        ))}
      </div>
      <div className="text-center mt-1"><span className="text-[10px] text-muted-foreground font-medium">{routes[currentIndex]?.label}</span></div>
    </div>
  );
}
