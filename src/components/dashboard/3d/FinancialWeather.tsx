import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export function FinancialWeather() {
  const [weather, setWeather] = useState<Weather>('sunny');
  const [forecast, setForecast] = useState<Weather[]>(['sunny', 'cloudy', 'sunny', 'sunny']);

  useEffect(() => {
    // Simulate weather changes based on financial health
    const interval = setInterval(() => {
      const weathers: Weather[] = ['sunny', 'cloudy', 'rainy'];
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (w: Weather, size: number = 8) => {
    switch (w) {
      case 'sunny': return <Sun className={`w-${size} h-${size} text-yellow-500`} />;
      case 'cloudy': return <Cloud className={`w-${size} h-${size} text-gray-400`} />;
      case 'rainy': return <CloudRain className={`w-${size} h-${size} text-blue-400`} />;
      case 'stormy': return <Zap className={`w-${size} h-${size} text-red-500`} />;
    }
  };

  const getWeatherText = (w: Weather) => {
    switch (w) {
      case 'sunny': return 'Excellent financial health';
      case 'cloudy': return 'Moderate financial outlook';
      case 'rainy': return 'Increased expenses detected';
      case 'stormy': return 'Financial challenges ahead';
    }
  };

  const getWeatherGradient = (w: Weather) => {
    switch (w) {
      case 'sunny': return 'from-yellow-500/20 via-orange-500/10 to-transparent';
      case 'cloudy': return 'from-gray-400/20 via-gray-300/10 to-transparent';
      case 'rainy': return 'from-blue-400/20 via-blue-300/10 to-transparent';
      case 'stormy': return 'from-red-500/20 via-red-400/10 to-transparent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg"
    >
      <div className={`relative h-[300px] bg-gradient-to-br ${getWeatherGradient(weather)} p-6 flex flex-col justify-between`}>
        {/* Current Weather */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Current Financial Weather</p>
          <motion.div
            key={weather}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            {getWeatherIcon(weather, 16)}
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground mb-2 capitalize">{weather}</h3>
          <p className="text-muted-foreground">{getWeatherText(weather)}</p>
        </div>

        {/* Weather Effects */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 100 + '%' }}
                animate={{ y: '100%' }}
                transition={{
                  duration: Math.random() * 1 + 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-0.5 h-4 bg-blue-400/30"
              />
            ))}
          </div>
        )}
      </div>

      {/* Forecast */}
      <div className="p-6 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">7-Day Financial Forecast</p>
        <div className="flex justify-between">
          {forecast.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-xs text-muted-foreground">Day {i + 1}</p>
              {getWeatherIcon(w, 6)}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
