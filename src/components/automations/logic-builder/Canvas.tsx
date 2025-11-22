import { useRef } from "react";
import { DraggableBlock } from "./DraggableBlock";
import { BlockConnector } from "./BlockConnector";
import { Block, Connection } from "@/hooks/useLogicBlockBuilder";
import { cn } from "@/lib/utils";

interface CanvasProps {
  blocks: Block[];
  connections: Connection[];
  selectedBlock: string | null;
  connectingFrom: string | null;
  onBlockDragEnd: (id: string, position: { x: number; y: number }) => void;
  onBlockRemove: (id: string) => void;
  onBlockSelect: (id: string) => void;
  onStartConnect: (id: string) => void;
  onCompleteConnect: (toId: string) => void;
  onCancelConnect: () => void;
}

export function Canvas({
  blocks,
  connections,
  selectedBlock,
  connectingFrom,
  onBlockDragEnd,
  onBlockRemove,
  onBlockSelect,
  onStartConnect,
  onCompleteConnect,
  onCancelConnect,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onBlockSelect('');
      if (connectingFrom) {
        onCancelConnect();
      }
    }
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={cn(
        "relative w-full h-full bg-slate-950/50 rounded-lg border-2 border-dashed overflow-hidden",
        connectingFrom ? "border-primary cursor-crosshair" : "border-border/50"
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, idx) => {
          const fromBlock = blocks.find(b => b.id === conn.from);
          const toBlock = blocks.find(b => b.id === conn.to);
          if (!fromBlock || !toBlock) return null;

          return (
            <BlockConnector
              key={idx}
              from={{
                x: fromBlock.position.x + 90,
                y: fromBlock.position.y + 40,
              }}
              to={{
                x: toBlock.position.x + 90,
                y: toBlock.position.y + 40,
              }}
            />
          );
        })}
      </svg>

      {/* Blocks */}
      {blocks.map(block => (
        <DraggableBlock
          key={block.id}
          block={block}
          isSelected={selectedBlock === block.id}
          isConnecting={!!connectingFrom}
          onDragEnd={onBlockDragEnd}
          onRemove={onBlockRemove}
          onSelect={(id) => {
            if (connectingFrom && connectingFrom !== id) {
              onCompleteConnect(id);
            } else {
              onBlockSelect(id);
            }
          }}
          onStartConnect={onStartConnect}
        />
      ))}

      {/* Instructions */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Click a block from the palette to add it</p>
            <p className="text-sm">Drag blocks to move • Click link icon to connect</p>
          </div>
        </div>
      )}

      {connectingFrom && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Click another block to create connection
        </div>
      )}
    </div>
  );
}
