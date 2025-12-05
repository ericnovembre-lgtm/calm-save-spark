import { useState, useCallback } from 'react';
import { NLQResponse } from '@/lib/ephemeral-widgets';

export type CelebrationType = 'success' | 'achievement' | 'goal' | 'milestone';

interface NLQState {
  query: string;
  isProcessing: boolean;
  showChart: boolean;
  chartData: Array<{ name: string; value: number }>;
  insight: string;
  response: NLQResponse | null;
}

interface DashboardState {
  nlq: NLQState;
  activeStoryIndex: number | null;
  showCelebration: boolean;
  celebrationType: CelebrationType;
  activeModal: string | null;
}

interface DashboardActions {
  setNlqQuery: (query: string) => void;
  setNlqProcessing: (processing: boolean) => void;
  setNlqShowChart: (show: boolean) => void;
  setNlqChartData: (data: Array<{ name: string; value: number }>) => void;
  setNlqInsight: (insight: string) => void;
  setNlqResponse: (response: NLQResponse | null) => void;
  setActiveStoryIndex: (index: number | null) => void;
  triggerCelebration: (type: CelebrationType) => void;
  hideCelebration: () => void;
  setActiveModal: (modal: string | null) => void;
  closeModal: () => void;
  resetNlq: () => void;
}

const initialNlqState: NLQState = {
  query: '',
  isProcessing: false,
  showChart: false,
  chartData: [],
  insight: '',
  response: null,
};

export function useDashboardState(): [DashboardState, DashboardActions] {
  // NLQ state
  const [nlqQuery, setNlqQuery] = useState('');
  const [isNlqProcessing, setNlqProcessing] = useState(false);
  const [showNlqChart, setNlqShowChart] = useState(false);
  const [nlqChartData, setNlqChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [nlqInsight, setNlqInsight] = useState('');
  const [nlqResponse, setNlqResponse] = useState<NLQResponse | null>(null);
  
  // Stories state
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  
  // Celebrations state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('success');
  
  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const triggerCelebration = useCallback((type: CelebrationType) => {
    setCelebrationType(type);
    setShowCelebration(true);
  }, []);

  const hideCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const resetNlq = useCallback(() => {
    setNlqQuery('');
    setNlqProcessing(false);
    setNlqShowChart(false);
    setNlqChartData([]);
    setNlqInsight('');
    setNlqResponse(null);
  }, []);

  const state: DashboardState = {
    nlq: {
      query: nlqQuery,
      isProcessing: isNlqProcessing,
      showChart: showNlqChart,
      chartData: nlqChartData,
      insight: nlqInsight,
      response: nlqResponse,
    },
    activeStoryIndex,
    showCelebration,
    celebrationType,
    activeModal,
  };

  const actions: DashboardActions = {
    setNlqQuery,
    setNlqProcessing,
    setNlqShowChart,
    setNlqChartData,
    setNlqInsight,
    setNlqResponse,
    setActiveStoryIndex,
    triggerCelebration,
    hideCelebration,
    setActiveModal,
    closeModal,
    resetNlq,
  };

  return [state, actions];
}
