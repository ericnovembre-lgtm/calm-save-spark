import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ClickerGameProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClickerGame = ({ isOpen, onClose }: ClickerGameProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [clicks, setClicks] = useState<{ x: number; y: number; id: number }[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Load high score
    const saved = localStorage.getItem("saveplus-clicker-highscore");
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [isActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsActive(true);
  };

  const endGame = () => {
    setIsActive(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("saveplus-clicker-highscore", score.toString());
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setScore(prev => prev + 1);
    setClicks(prev => [...prev, { x, y, id: Date.now() }]);

    // Remove click animation after 1s
    setTimeout(() => {
      setClicks(prev => prev.slice(1));
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center space-y-6">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">
              💰 Speed Saver Challenge
            </h2>
            <p className="text-sm text-muted-foreground">
              How fast can you save? Click the piggy bank!
            </p>
          </div>

          {/* High Score */}
          <div className="flex items-center justify-center gap-2 text-accent">
            <Trophy className="w-5 h-5" />
            <span className="text-lg font-semibold">
              High Score: ${highScore}
            </span>
          </div>

          {/* Game Area */}
          <div className="relative">
            <motion.div
              className="relative bg-accent/10 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={handleClick}
              whileTap={isActive ? { scale: 0.98 } : {}}
            >
              {/* Click effects */}
              <AnimatePresence>
                {clicks.map((click) => (
                  <motion.div
                    key={click.id}
                    className="absolute text-2xl font-bold text-accent pointer-events-none"
                    style={{ left: click.x, top: click.y }}
                    initial={{ scale: 0, y: 0 }}
                    animate={{ scale: 1, y: -50, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    +$1
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isActive ? (
                <div className="text-center space-y-4">
                  <motion.div
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <SaveplusAnimIcon name="piggy-bank" size={80} />
                  </motion.div>
                  <Button onClick={startGame} size="lg" variant="default">
                    Start Challenge
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <motion.div
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: [1, 1.2, 1],
                          }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <SaveplusAnimIcon name="piggy-bank" size={80} />
                  </motion.div>
                  <div>
                    <p className="text-5xl font-bold tabular-nums mb-2">
                      ${score}
                    </p>
                    <p className="text-2xl text-muted-foreground tabular-nums">
                      {timeLeft}s
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Final Score */}
            <AnimatePresence>
              {!isActive && score > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    {score > highScore && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-6xl"
                      >
                        🎉
                      </motion.div>
                    )}
                    <div>
                      <p className="text-lg text-muted-foreground mb-2">
                        {score > highScore ? "New High Score!" : "Final Score"}
                      </p>
                      <p className="text-5xl font-bold text-accent">${score}</p>
                    </div>
                    <Button onClick={startGame} variant="default">
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Tip: This is how compound interest works - small actions add up fast!
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
