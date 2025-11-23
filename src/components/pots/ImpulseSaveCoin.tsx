import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDragToSave } from "@/hooks/useDragToSave";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { haptics } from "@/lib/haptics";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";

interface Pot {
  id: string;
  current_amount: number;
  target_amount: number | null;
}

interface ImpulseSaveCoinProps {
  pots: Pot[];
}

export const ImpulseSaveCoin = ({ pots }: ImpulseSaveCoinProps) => {
  const [amount, setAmount] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { isDragging, hoveredZone, getDragHandlers, registerDropZone, unregisterDropZone } = useDragToSave({
    onDrop: async (potId: string, depositAmount: number) => {
      const pot = pots.find(p => p.id === potId);
      if (!pot) return;
      
      const { error } = await supabase
        .from('pots')
        .update({
          current_amount: pot.current_amount + depositAmount
        })
        .eq('id', potId);
      
      if (error) {
        toast({
          title: "Failed to save",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Success feedback
      haptics.formSuccess();
      confetti({
        particleCount: 30, 
        spread: 60,
        colors: ['#8B5CF6', '#06B6D4', '#F59E0B']
      });
      
      toast({
        title: "💰 Saved!",
        description: `Added $${depositAmount} to your pot`
      });
      
      // Refresh pots data
      queryClient.invalidateQueries({ queryKey: ['pots'] });
    },
    defaultAmount: amount
  });
  
  return (
    <>
      {/* Draggable Coin */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
        {...getDragHandlers()}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.9 }}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-slate-950" />
          </div>
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {amount}
          </span>
        </div>
      </motion.div>
      
      {/* Amount Selector - hidden while dragging */}
      {!isDragging && (
        <motion.div 
          className="fixed bottom-24 right-6 md:bottom-28 md:right-8 flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {[5, 10, 20].map((amt) => (
            <Button
              key={amt}
              size="sm"
              variant={amt === amount ? 'default' : 'outline'}
              onClick={() => {
                setAmount(amt);
                haptics.buttonPress();
              }}
              className="w-12 h-10 text-sm font-bold"
            >
              ${amt}
            </Button>
          ))}
        </motion.div>
      )}
      
      {/* Pass drop zone registration to parent */}
      <div style={{ display: 'none' }}>
        {pots.map(pot => (
          <div key={pot.id} ref={(el) => {
            if (el) registerDropZone(pot.id, el);
          }} />
        ))}
      </div>
    </>
  );
};
