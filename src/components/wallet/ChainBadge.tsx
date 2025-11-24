import { Badge } from "@/components/ui/badge";
import { useChainConfigs } from "@/hooks/useChainConfigs";

interface ChainBadgeProps {
  chainId: string;
}

export function ChainBadge({ chainId }: ChainBadgeProps) {
  const { chains } = useChainConfigs();
  const chain = chains.find((c) => c.chain_id === chainId);

  if (!chain) return null;

  return (
    <Badge variant="outline" className="gap-1">
      <span>{chain.icon}</span>
      <span>{chain.chain_name}</span>
    </Badge>
  );
}