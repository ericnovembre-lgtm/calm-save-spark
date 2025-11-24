import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useActiveChain } from "@/hooks/useActiveChain";
import { useChainConfigs } from "@/hooks/useChainConfigs";

export function ChainSwitcher() {
  const { selectedChain, setSelectedChain } = useActiveChain();
  const { chains, isLoading } = useChainConfigs();

  const activeChain = chains.find((c) => c.chain_id === selectedChain);

  if (isLoading) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">{activeChain?.icon || '⟠'}</span>
          <span className="hidden sm:inline">{activeChain?.chain_name || 'Ethereum'}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.chain_id}
            onClick={() => setSelectedChain(chain.chain_id)}
            className="gap-3 cursor-pointer"
          >
            <span className="text-lg">{chain.icon}</span>
            <span className="flex-1">{chain.chain_name}</span>
            {selectedChain === chain.chain_id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}