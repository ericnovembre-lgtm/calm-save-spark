import { useState, useCallback } from 'react';

export interface Block {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  category: string;
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface Connection {
  from: string;
  to: string;
}

export function useLogicBlockBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const addBlock = useCallback((blockTemplate: Omit<Block, 'id' | 'position'>, position: { x: number; y: number }) => {
    const newBlock: Block = {
      ...blockTemplate,
      id: `block-${Date.now()}-${Math.random()}`,
      position,
    };
    setBlocks(prev => [...prev, newBlock]);
    return newBlock.id;
  }, []);

  const updateBlockPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, position } : block
    ));
  }, []);

  const updateBlockConfig = useCallback((id: string, config: Record<string, any>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, config: { ...block.config, ...config } } : block
    ));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
  }, []);

  const addConnection = useCallback((from: string, to: string) => {
    // Validate connection logic
    const fromBlock = blocks.find(b => b.id === from);
    const toBlock = blocks.find(b => b.id === to);
    
    if (!fromBlock || !toBlock) return;
    
    // Logic: trigger -> condition/action, condition -> action
    if (fromBlock.type === 'trigger' && (toBlock.type === 'condition' || toBlock.type === 'action')) {
      setConnections(prev => [...prev, { from, to }]);
    } else if (fromBlock.type === 'condition' && toBlock.type === 'action') {
      setConnections(prev => [...prev, { from, to }]);
    }
    
    setConnectingFrom(null);
  }, [blocks]);

  const removeConnection = useCallback((from: string, to: string) => {
    setConnections(prev => prev.filter(conn => !(conn.from === from && conn.to === to)));
  }, []);

  const startConnecting = useCallback((blockId: string) => {
    setConnectingFrom(blockId);
  }, []);

  const cancelConnecting = useCallback(() => {
    setConnectingFrom(null);
  }, []);

  const validateRule = useCallback(() => {
    const hasTrigger = blocks.some(b => b.type === 'trigger');
    const hasAction = blocks.some(b => b.type === 'action');
    
    if (!hasTrigger) return { valid: false, error: 'At least one trigger is required' };
    if (!hasAction) return { valid: false, error: 'At least one action is required' };
    
    return { valid: true, error: null };
  }, [blocks]);

  const exportToJSON = useCallback(() => {
    const validation = validateRule();
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid rule');
    }

    const triggerBlocks = blocks.filter(b => b.type === 'trigger');
    const conditionBlocks = blocks.filter(b => b.type === 'condition');
    const actionBlocks = blocks.filter(b => b.type === 'action');

    return {
      trigger_condition: {
        type: triggerBlocks[0]?.category || 'transaction_match',
        ...triggerBlocks[0]?.config,
      },
      conditions: conditionBlocks.map(c => ({
        type: c.category,
        ...c.config,
      })),
      action_config: {
        type: actionBlocks[0]?.category || 'transfer_to_goal',
        ...actionBlocks[0]?.config,
      },
    };
  }, [blocks, validateRule]);

  const reset = useCallback(() => {
    setBlocks([]);
    setConnections([]);
    setSelectedBlock(null);
    setConnectingFrom(null);
  }, []);

  return {
    blocks,
    connections,
    selectedBlock,
    connectingFrom,
    addBlock,
    updateBlockPosition,
    updateBlockConfig,
    removeBlock,
    addConnection,
    removeConnection,
    startConnecting,
    cancelConnecting,
    setSelectedBlock,
    validateRule,
    exportToJSON,
    reset,
  };
}
