import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChainStore {
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
}

export const useActiveChain = create<ChainStore>()(
  persist(
    (set) => ({
      selectedChain: 'ethereum',
      setSelectedChain: (chain) => set({ selectedChain: chain }),
    }),
    {
      name: 'wallet-active-chain',
    }
  )
);