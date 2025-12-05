import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { notificationSounds } from "@/lib/notification-sounds";
import { Volume2, VolumeX, Bell, Music } from "lucide-react";
import { toast } from "sonner";

export const SoundSettings = () => {
  const { preferences, updatePreference, playCoinSound, playAchievementSound } = useSoundEffects();

  const handleTestNotification = () => {
    notificationSounds.message();
  };

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="sound-enabled" className="text-base font-medium">
            Sound Effects
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable audio feedback for actions and achievements
          </p>
        </div>
        <Switch
          id="sound-enabled"
          checked={preferences.enabled}
          onCheckedChange={(checked) => {
            updatePreference('enabled', checked);
            toast.success(checked ? 'Sound effects enabled' : 'Sound effects disabled');
          }}
        />
      </div>

      {preferences.enabled && (
        <>
          {/* UI Sound Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="text-base font-medium">
                UI Sound Volume
              </Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(preferences.volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="volume"
                min={0}
                max={100}
                step={5}
                value={[preferences.volume * 100]}
                onValueChange={([value]) => updatePreference('volume', value / 100)}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Individual Sound Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="savings-sound" className="text-base font-medium">
                  Savings Sounds
                </Label>
                <p className="text-sm text-muted-foreground">
                  Coin sounds when you save money
                </p>
              </div>
              <Switch
                id="savings-sound"
                checked={preferences.savingsSound}
                onCheckedChange={(checked) => updatePreference('savingsSound', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="achievement-sound" className="text-base font-medium">
                  Achievement Sounds
                </Label>
                <p className="text-sm text-muted-foreground">
                  Success chimes for unlocked achievements
                </p>
              </div>
              <Switch
                id="achievement-sound"
                checked={preferences.achievementSound}
                onCheckedChange={(checked) => updatePreference('achievementSound', checked)}
              />
            </div>

            {/* Notification Sounds */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-sound" className="text-base font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Notification Sounds
                </Label>
                <p className="text-sm text-muted-foreground">
                  Audio alerts for messages and reminders
                </p>
              </div>
              <Switch
                id="notification-sound"
                checked={preferences.notificationSound ?? true}
                onCheckedChange={(checked) => {
                  updatePreference('notificationSound', checked);
                  notificationSounds.setEnabled(checked);
                }}
              />
            </div>

            {/* Notification Volume */}
            {(preferences.notificationSound ?? true) && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-volume" className="text-sm font-medium">
                    Notification Volume
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((preferences.notificationVolume ?? 0.25) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                  <Slider
                    id="notification-volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[(preferences.notificationVolume ?? 0.25) * 100]}
                    onValueChange={([value]) => {
                      updatePreference('notificationVolume', value / 100);
                      notificationSounds.setVolume(value / 100);
                    }}
                    className="flex-1"
                  />
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Ambient Music */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ambient-music" className="text-base font-medium flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  Ambient Background
                </Label>
                <p className="text-sm text-muted-foreground">
                  Soft background ambience (optional)
                </p>
              </div>
              <Switch
                id="ambient-music"
                checked={preferences.ambientMusic}
                onCheckedChange={(checked) => {
                  updatePreference('ambientMusic', checked);
                  toast.info(
                    checked 
                      ? 'Ambient music enabled - restart page to begin' 
                      : 'Ambient music disabled'
                  );
                }}
              />
            </div>

            {/* Ambient Volume */}
            {preferences.ambientMusic && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ambient-volume" className="text-sm font-medium">
                    Ambient Volume
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((preferences.ambientVolume ?? 0.15) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                  <Slider
                    id="ambient-volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[(preferences.ambientVolume ?? 0.15) * 100]}
                    onValueChange={([value]) => updatePreference('ambientVolume', value / 100)}
                    className="flex-1"
                  />
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Test Sounds */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={playCoinSound}>
              Test Coin
            </Button>
            <Button variant="outline" size="sm" onClick={playAchievementSound}>
              Test Achievement
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestNotification}>
              Test Notification
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
