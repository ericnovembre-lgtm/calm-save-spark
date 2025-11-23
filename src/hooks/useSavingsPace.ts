import { useMemo } from "react";
import { addMonths } from "date-fns";

interface Pot {
  id: string;
  current_amount: number;
  target_amount: number | null;
}

// Mock implementation - returns 0 pace for now
// TODO: Implement actual transaction tracking
export const useSavingsPace = (pot: Pot) => {
  const monthlyPace = useMemo(() => {
    // Placeholder: calculate from transaction history
    return 0;
  }, [pot.id]);
  
  const projectedDate = useMemo(() => {
    if (!pot.target_amount || monthlyPace === 0 || pot.current_amount >= pot.target_amount) {
      return null;
    }
    const remaining = pot.target_amount - pot.current_amount;
    const monthsRemaining = Math.ceil(remaining / monthlyPace);
    return addMonths(new Date(), monthsRemaining);
  }, [monthlyPace, pot.target_amount, pot.current_amount]);
  
  return { monthlyPace, projectedDate };
};
