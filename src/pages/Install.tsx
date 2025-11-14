import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Monitor, Download, Share, MoreVertical, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

export default function Install() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isInstalled, setIsInstalled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const variants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const renderInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Tap the Share button</p>
                <p className="text-sm text-muted-foreground">
                  Look for the <Share className="w-4 h-4 inline mx-1" /> icon at the bottom of Safari
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Select "Add to Home Screen"</p>
                <p className="text-sm text-muted-foreground">
                  Scroll down in the share menu to find this option
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Tap "Add"</p>
                <p className="text-sm text-muted-foreground">
                  Confirm to add $ave+ to your home screen
                </p>
              </div>
            </div>
          </div>
        );

      case 'android':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Tap the Menu button</p>
                <p className="text-sm text-muted-foreground">
                  Look for the <MoreVertical className="w-4 h-4 inline mx-1" /> icon at the top right of Chrome
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Select "Add to Home screen" or "Install app"</p>
                <p className="text-sm text-muted-foreground">
                  You may see either option depending on your browser
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Tap "Install" or "Add"</p>
                <p className="text-sm text-muted-foreground">
                  Confirm to install $ave+ on your device
                </p>
              </div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Look for the install icon</p>
                <p className="text-sm text-muted-foreground">
                  Check the address bar for a <Download className="w-4 h-4 inline mx-1" /> or + icon
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Click "Install"</p>
                <p className="text-sm text-muted-foreground">
                  A popup will appear asking you to install the app
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Launch from your desktop</p>
                <p className="text-sm text-muted-foreground">
                  $ave+ will be available as an app on your computer
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-8 h-8" />;
      case 'desktop':
        return <Monitor className="w-8 h-8" />;
      default:
        return <Download className="w-8 h-8" />;
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          {...variants}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Already Installed!
            </h1>
            <p className="text-muted-foreground mb-6">
              $ave+ is already installed on your device. You're all set!
            </p>
            <Button asChild className="w-full">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          {...variants}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {getPlatformIcon()}
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Install $ave+
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the best experience by installing $ave+ on your device. Works offline, loads faster, and feels just like a native app.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <motion.div
            {...variants}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Works offline - access your data anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Faster loading - instant access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Native app feel - smooth and responsive</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Home screen icon - quick access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Push notifications - stay updated</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            {...variants}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                How to Install on {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Desktop'}
              </h3>
              {renderInstructions()}
            </Card>
          </motion.div>
        </div>

        <motion.div
          {...variants}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Card className="p-6 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-4">
              Need help? If you don't see the install option, make sure you're using a supported browser (Safari on iOS, Chrome on Android, Chrome or Edge on desktop).
            </p>
            <Button variant="outline" asChild>
              <a href="/help">Visit Help Center</a>
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
