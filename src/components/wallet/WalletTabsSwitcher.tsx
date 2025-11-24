import { motion } from "framer-motion";
import { Coins, Image, History } from "lucide-react";

type Tab = 'tokens' | 'nfts' | 'history';

interface WalletTabsSwitcherProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function WalletTabsSwitcher({ activeTab, onTabChange }: WalletTabsSwitcherProps) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'nfts', label: 'NFTs', icon: Image },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="inline-flex bg-muted/20 rounded-2xl p-1 border border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-6 py-2.5 rounded-xl transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-card border border-border rounded-xl shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className="relative flex items-center gap-2">
              <Icon className={`w-4 h-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}