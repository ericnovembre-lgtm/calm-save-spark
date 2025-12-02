import { useState, useCallback } from 'react';
import { LifeEvent } from '@/components/digital-twin/LifeEventsSidebar';

export interface InjectedEvent {
  event: LifeEvent;
  year: number;
  id: string;
}

interface UseLifeEventSimulationReturn {
  injectedEvents: InjectedEvent[];
  baselineNetWorth: number;
  simulatedNetWorth: number;
  addEvent: (event: LifeEvent, year: number) => void;
  removeEvent: (id: string) => void;
  clearEvents: () => void;
  calculateNetWorth: (age: number) => number;
  calculateRetirementImpact: (targetRetirementWorth: number) => { baselineAge: number; simulatedAge: number; delay: number };
}

export function useLifeEventSimulation(
  currentAge: number,
  initialNetWorth: number = 50000,
  annualReturn: number = 0.07,
  annualSavings: number = 20000
): UseLifeEventSimulationReturn {
  const [injectedEvents, setInjectedEvents] = useState<InjectedEvent[]>([]);

  const calculateBaselineNetWorth = useCallback((targetAge: number): number => {
    const years = targetAge - currentAge;
    let netWorth = initialNetWorth;
    
    for (let i = 0; i < years; i++) {
      netWorth = netWorth * (1 + annualReturn) + annualSavings;
    }
    
    return Math.round(netWorth);
  }, [currentAge, initialNetWorth, annualReturn, annualSavings]);

  const calculateSimulatedNetWorth = useCallback((targetAge: number): number => {
    const years = targetAge - currentAge;
    let netWorth = initialNetWorth;
    
    for (let year = 0; year < years; year++) {
      const currentYear = currentAge + year;
      
      // Apply investment return
      netWorth = netWorth * (1 + annualReturn);
      
      // Apply annual savings
      netWorth += annualSavings;
      
      // Apply life events that occur this year
      const eventsThisYear = injectedEvents.filter(
        e => e.year === currentYear
      );
      
      eventsThisYear.forEach(event => {
        netWorth += event.event.impact;
      });
    }
    
    return Math.round(netWorth);
  }, [currentAge, initialNetWorth, annualReturn, annualSavings, injectedEvents]);

  const addEvent = useCallback((event: LifeEvent, year: number) => {
    const newEvent: InjectedEvent = {
      event,
      year,
      id: `${event.id}-${year}-${Date.now()}`,
    };
    
    setInjectedEvents(prev => [...prev, newEvent]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setInjectedEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearEvents = useCallback(() => {
    setInjectedEvents([]);
  }, []);

  const calculateRetirementImpact = useCallback((targetRetirementWorth: number = 1000000) => {
    // Find retirement age for baseline
    let baselineAge = currentAge;
    while (calculateBaselineNetWorth(baselineAge) < targetRetirementWorth && baselineAge < 100) {
      baselineAge++;
    }

    // Find retirement age with events
    let simulatedAge = currentAge;
    while (calculateSimulatedNetWorth(simulatedAge) < targetRetirementWorth && simulatedAge < 100) {
      simulatedAge++;
    }

    const delay = simulatedAge - baselineAge;

    return {
      baselineAge,
      simulatedAge,
      delay
    };
  }, [currentAge, calculateBaselineNetWorth, calculateSimulatedNetWorth]);

  return {
    injectedEvents,
    baselineNetWorth: calculateBaselineNetWorth(currentAge),
    simulatedNetWorth: calculateSimulatedNetWorth(currentAge),
    addEvent,
    removeEvent,
    clearEvents,
    calculateNetWorth: calculateSimulatedNetWorth,
    calculateRetirementImpact,
  };
}
