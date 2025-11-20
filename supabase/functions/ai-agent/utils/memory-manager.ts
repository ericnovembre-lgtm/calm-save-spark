import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface Memory {
  id: string;
  user_id: string;
  agent_type: string;
  memory_type: 'preference' | 'fact' | 'goal' | 'style';
  key: string;
  value: any;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export async function storeMemory(
  supabase: SupabaseClient,
  userId: string,
  agentType: string,
  memoryType: Memory['memory_type'],
  key: string,
  value: any,
  confidence: number = 1.0
): Promise<void> {
  const { error } = await supabase
    .from('agent_memory')
    .upsert({
      user_id: userId,
      agent_type: agentType,
      memory_type: memoryType,
      key,
      value,
      confidence_score: confidence,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,agent_type,key'
    });

  if (error) {
    console.error('Error storing memory:', error);
    throw error;
  }
}

export async function retrieveMemories(
  supabase: SupabaseClient,
  userId: string,
  agentType: string,
  filters?: {
    memoryType?: Memory['memory_type'];
    minConfidence?: number;
  }
): Promise<Memory[]> {
  let query = supabase
    .from('agent_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_type', agentType);

  if (filters?.memoryType) {
    query = query.eq('memory_type', filters.memoryType);
  }

  if (filters?.minConfidence) {
    query = query.gte('confidence_score', filters.minConfidence);
  }

  const { data, error } = await query.order('confidence_score', { ascending: false });

  if (error) {
    console.error('Error retrieving memories:', error);
    return [];
  }

  return data || [];
}

export async function updateMemoryConfidence(
  supabase: SupabaseClient,
  memoryId: string,
  newConfidence: number
): Promise<void> {
  const { error } = await supabase
    .from('agent_memory')
    .update({ 
      confidence_score: newConfidence,
      updated_at: new Date().toISOString()
    })
    .eq('id', memoryId);

  if (error) {
    console.error('Error updating memory confidence:', error);
    throw error;
  }
}

export async function pruneOldMemories(
  supabase: SupabaseClient,
  userId: string,
  minConfidence: number = 0.3,
  daysOld: number = 90
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error } = await supabase
    .from('agent_memory')
    .delete()
    .eq('user_id', userId)
    .lt('confidence_score', minConfidence)
    .lt('updated_at', cutoffDate.toISOString());

  if (error) {
    console.error('Error pruning memories:', error);
    throw error;
  }
}

export function formatMemoriesForContext(memories: Memory[]): string {
  if (memories.length === 0) return '';

  const sections: Record<string, string[]> = {
    preference: [],
    fact: [],
    goal: [],
    style: []
  };

  memories.forEach(memory => {
    const value = typeof memory.value === 'object' 
      ? JSON.stringify(memory.value) 
      : memory.value;
    sections[memory.memory_type].push(`- ${memory.key}: ${value} (confidence: ${(memory.confidence_score * 100).toFixed(0)}%)`);
  });

  let context = '**User Memory & Preferences:**\n\n';
  
  if (sections.style.length > 0) {
    context += '**Communication Style:**\n' + sections.style.join('\n') + '\n\n';
  }
  if (sections.preference.length > 0) {
    context += '**Preferences:**\n' + sections.preference.join('\n') + '\n\n';
  }
  if (sections.goal.length > 0) {
    context += '**Goals:**\n' + sections.goal.join('\n') + '\n\n';
  }
  if (sections.fact.length > 0) {
    context += '**Key Facts:**\n' + sections.fact.join('\n') + '\n\n';
  }

  return context;
}
