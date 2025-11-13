import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const WeeklyDigestTrigger = () => {
  const [isSending, setIsSending] = useState(false);

  const sendDigest = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('send-weekly-digest', {
        body: { userId: session.user.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Digest sent!", {
        description: "Check your email for your weekly savings summary.",
      });
      setIsSending(false);
    },
    onError: (error: any) => {
      toast.error("Failed to send digest", {
        description: error.message || "Please try again later.",
      });
      setIsSending(false);
    },
  });

  const handleSendDigest = () => {
    setIsSending(true);
    sendDigest.mutate();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Weekly Savings Digest</h3>
        <p className="text-sm text-muted-foreground">
          Receive a weekly email summary of your savings progress, recommendations, and upcoming transfers.
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSendDigest}
          disabled={isSending}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Send Test Digest
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Test your weekly digest email
        </p>
      </div>

      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-xs text-muted-foreground">
          💡 Weekly digests are automatically sent every Monday at 9 AM. Use this button to preview what your next digest will look like.
        </p>
      </div>
    </div>
  );
};
