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
  monteCarloTimeline: MonteCarloTimeline[];
  generateMonteCarloProjection: () => void;
}

interface MonteCarloTimeline {
  year: number;
  age: number;
  median: number;
  p10: number;
  p90: number;
}

export function useLifeEventSimulation(
  currentAge: number,
  initialNetWorth: number = 50000,
  annualReturn: number = 0.07,
  annualSavings: number = 20000
): UseLifeEventSimulationReturn {
  const [injectedEvents, setInjectedEvents] = useState<InjectedEvent[]>([]);
  const [monteCarloTimeline, setMonteCarloTimeline] = useState<MonteCarloTimeline[]>([]);

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

  const generateMonteCarloProjection = useCallback(() => {
    const numSimulations = 1000;
    const volatility = 0.03; // ±3% volatility
    const timeHorizon = 40; // Project 40 years into future
    
    const allSimulations: number[][] = [];
    
    // Run Monte Carlo simulations
    for (let sim = 0; sim < numSimulations; sim++) {
      const simulationPath: number[] = [];
      let netWorth = initialNetWorth;
      
      for (let year = 0; year < timeHorizon; year++) {
        const currentYear = currentAge + year;
        
        // Apply random return rate with volatility
        const randomReturn = annualReturn + (Math.random() - 0.5) * 2 * volatility;
        netWorth = netWorth * (1 + randomReturn);
        
        // Apply annual savings
        netWorth += annualSavings;
        
        // Apply life events
        const eventsThisYear = injectedEvents.filter(e => e.year === currentYear);
        eventsThisYear.forEach(event => {
          netWorth += event.event.impact;
        });
        
        simulationPath.push(netWorth);
      }
      
      allSimulations.push(simulationPath);
    }
    
    // Calculate percentiles for each year
    const timeline: MonteCarloTimeline[] = [];
    for (let year = 0; year < timeHorizon; year++) {
      const valuesAtYear = allSimulations.map(sim => sim[year]).sort((a, b) => a - b);
      
      const p10Index = Math.floor(numSimulations * 0.1);
      const p50Index = Math.floor(numSimulations * 0.5);
      const p90Index = Math.floor(numSimulations * 0.9);
      
      timeline.push({
        year: currentAge + year,
        age: currentAge + year,
        median: Math.round(valuesAtYear[p50Index]),
        p10: Math.round(valuesAtYear[p10Index]),
        p90: Math.round(valuesAtYear[p90Index]),
      });
    }
    
    setMonteCarloTimeline(timeline);
  }, [currentAge, initialNetWorth, annualReturn, annualSavings, injectedEvents]);

  return {
    injectedEvents,
    baselineNetWorth: calculateBaselineNetWorth(currentAge),
    simulatedNetWorth: calculateSimulatedNetWorth(currentAge),
    addEvent,
    removeEvent,
    clearEvents,
    calculateNetWorth: calculateSimulatedNetWorth,
    calculateRetirementImpact,
    monteCarloTimeline,
    generateMonteCarloProjection,
  };
}
