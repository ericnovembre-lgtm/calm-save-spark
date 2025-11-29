import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, Info, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { resetWizard } from '@/components/onboarding/InteractiveWizard';
import { saveplus_audit_event } from '@/lib/analytics';
import { Separator } from '@/components/ui/separator';

export const ResetOnboarding = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingWizard, setIsResettingWizard] = useState(false);
  const [isResettingSpotlight, setIsResettingSpotlight] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: false,
          onboarding_step: 'welcome'
        })
        .eq('id', user.id);

      if (error) throw error;

      saveplus_audit_event('onboarding_reset', { reset_from: 'settings' });
      toast.success('Onboarding reset successfully!');
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      toast.error('Failed to reset onboarding. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetWizard = () => {
    setIsResettingWizard(true);
    
    try {
      resetWizard();
      saveplus_audit_event('wizard_reset', { reset_from: 'settings' });
      toast.success('Interactive tour reset! Visit your dashboard to start the tour again.');
    } catch (error) {
      console.error('Error resetting wizard:', error);
      toast.error('Failed to reset the tour. Please try again.');
    } finally {
      setIsResettingWizard(false);
    }
  };

  const handleReplaySpotlightTour = async () => {
    setIsResettingSpotlight(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile to show dashboard tutorial again
      const { error } = await supabase
        .from('profiles')
        .update({ show_dashboard_tutorial: true })
        .eq('id', user.id);

      if (error) throw error;

      // Clear related localStorage keys
      localStorage.removeItem('new-user-onboarding-completed');
      localStorage.removeItem('new-user-onboarding-step');

      saveplus_audit_event('spotlight_tour_reset', { reset_from: 'settings' });
      toast.success('Spotlight tour reset! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error resetting spotlight tour:', error);
      toast.error('Failed to reset the spotlight tour. Please try again.');
    } finally {
      setIsResettingSpotlight(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Onboarding & Tours</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Replay the onboarding process or interactive dashboard tour
        </p>
      </div>

      {/* Spotlight Tour */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Dashboard Spotlight Tour</p>
            <p>A guided spotlight tour that highlights key features on your dashboard with focused overlays and tips.</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="gap-2 w-full"
          onClick={handleReplaySpotlightTour}
          disabled={isResettingSpotlight}
        >
          <Sparkles className="w-4 h-4" />
          {isResettingSpotlight ? 'Resetting...' : 'Replay Spotlight Tour'}
        </Button>
      </div>

      <Separator />

      {/* Interactive Wizard */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Interactive Dashboard Tour</p>
            <p>A guided walkthrough that highlights key features and shows you how to use the app effectively.</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="gap-2 w-full"
          onClick={handleResetWizard}
          disabled={isResettingWizard}
        >
          <Play className="w-4 h-4" />
          Restart Dashboard Tour
        </Button>
      </div>

      <Separator />

      {/* Full Onboarding Reset */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Complete Onboarding Reset</p>
            <p>This will reset your entire onboarding progress and return you to the welcome screen. Your account data and settings will remain unchanged.</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 w-full">
              <RotateCcw className="w-4 h-4" />
              Reset Complete Onboarding
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Complete Onboarding?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your onboarding progress and take you back to the welcome screen. 
                Your account data and settings will remain unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={isResetting}
                className="gap-2"
              >
                {isResetting ? 'Resetting...' : 'Reset & Restart'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
