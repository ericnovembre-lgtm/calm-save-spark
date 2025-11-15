import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function WelcomeBackBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!user) return;

    const checkFirstVisit = async () => {
      // Check if this is user's first visit today
      const lastVisit = localStorage.getItem('last_visit');
      const today = new Date().toDateString();

      if (lastVisit !== today) {
        localStorage.setItem('last_visit', today);
        
        // Get user's name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]); // First name only
        }
        
        setShow(true);

        // Auto-hide after 5 seconds
        setTimeout(() => setShow(false), 5000);
      }
    };

    checkFirstVisit();
  }, [user]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Welcome back{userName ? `, ${userName}` : ''}! 👋
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ready to continue your financial journey?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Close welcome banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
