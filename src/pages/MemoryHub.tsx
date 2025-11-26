import { useState } from 'react';
import { MemoryViewer } from '@/components/memory/MemoryViewer';
import { MemoryInsights } from '@/components/memory/MemoryInsights';
import { MemoryTimeline } from '@/components/memory/MemoryTimeline';
import { MemorySemanticSearch } from '@/components/memory/MemorySemanticSearch';
import { MemoryInputForm } from '@/components/memory/MemoryInputForm';
import { Brain } from 'lucide-react';

export default function MemoryHub() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMemoryStored = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Financial Memory
        </h1>
        <p className="text-muted-foreground">
          AI-powered semantic memory system with Pinecone vector storage
        </p>
      </div>
      
      <MemorySemanticSearch />
      
      <MemoryInputForm onMemoryStored={handleMemoryStored} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <MemoryViewer key={refreshKey} />
          <MemoryTimeline />
        </div>
        
        <div>
          <MemoryInsights />
        </div>
      </div>
    </div>
  );
}
