import { useCallback } from 'react';

interface AccessibleSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function AccessibleSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 20, 
  step = 1 
}: AccessibleSliderProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        onChange(Math.max(min, value - step));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        onChange(Math.min(max, value + step));
        break;
      case 'Home':
        e.preventDefault();
        onChange(min);
        break;
      case 'End':
        e.preventDefault();
        onChange(max);
        break;
    }
  }, [value, min, max, step, onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Free (${min})</span>
        <span>Max Support (${max})</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onKeyDown={handleKeyDown}
          className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer 
                     focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                     [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
                     [&::-webkit-slider-thumb]:shadow-sm
                     [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary 
                     [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 
                     [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-sm"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%, hsl(var(--secondary)) 100%)`
          }}
          aria-label="Choose your monthly support amount"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`$${value} per month`}
          role="slider"
        />
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold" aria-live="polite">
          ${value}
          <span className="text-lg font-normal text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {value === 0 ? 'Free forever' : `Unlocks ${value} feature${value === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  );
}
