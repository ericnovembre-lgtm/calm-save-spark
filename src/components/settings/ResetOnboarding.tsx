import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const ResetOnboarding = () => {
  const [isResetting, setIsResetting] = useState(false);
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Reset Onboarding</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Restart the onboarding process from the beginning
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Onboarding
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Onboarding?</AlertDialogTitle>
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
  );
};
