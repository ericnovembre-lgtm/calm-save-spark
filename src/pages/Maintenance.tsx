import { useEffect, useState } from "react";
import { Wrench, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import NeutralBackground from "@/components/background/NeutralBackground";

const Maintenance = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set maintenance end time (you can customize this via env var or hardcode)
  const maintenanceEndTime = new Date();
  maintenanceEndTime.setHours(maintenanceEndTime.getHours() + 2); // 2 hours from now

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = maintenanceEndTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ hours, minutes, seconds });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalSeconds = 2 * 60 * 60; // 2 hours in seconds
  const elapsedSeconds =
    totalSeconds -
    (timeRemaining.hours * 3600 + timeRemaining.minutes * 60 + timeRemaining.seconds);
  const progress = (elapsedSeconds / totalSeconds) * 100;

  const statusUpdates = [
    { time: "10 mins ago", message: "Database optimization in progress" },
    { time: "25 mins ago", message: "Backend services temporarily offline" },
    { time: "1 hour ago", message: "Scheduled maintenance started" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NeutralBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
              <Wrench className="w-10 h-10 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Under Maintenance
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We're performing scheduled maintenance to improve your experience.
              We'll be back shortly!
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              Estimated Time Remaining
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Hours", value: timeRemaining.hours },
                { label: "Minutes", value: timeRemaining.minutes },
                { label: "Seconds", value: timeRemaining.seconds },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center bg-background rounded-xl p-4"
                >
                  <div className="text-4xl font-display font-bold text-foreground">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>

          {/* Status Updates */}
          <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-soft)] space-y-4">
            <h3 className="font-display font-semibold text-foreground">
              Recent Updates
            </h3>
            <div className="space-y-3">
              {statusUpdates.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-foreground mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{update.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {update.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              Check Status
            </Button>
            <a
              href="https://status.saveplus.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default" size="lg" className="gap-2 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                Status Page
              </Button>
            </a>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center pt-4">
            Follow us on social media for real-time updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
