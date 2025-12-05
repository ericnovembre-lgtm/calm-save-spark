import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VoiceCommandHistoryItem {
  id: string;
  command_text: string;
  command_type: string;
  result_action: string | null;
  executed_at: string;
  frequency: number;
}

export function useVoiceCommandHistory() {
  const { user } = useAuth();
  const [recentCommands, setRecentCommands] = useState<VoiceCommandHistoryItem[]>([]);
  const [frequentCommands, setFrequentCommands] = useState<VoiceCommandHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch command history
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get recent commands (last 10, ordered by executed_at)
      const { data: recent } = await supabase
        .from('voice_command_history')
        .select('*')
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(10);

      // Get frequent commands (top 5 by frequency)
      const { data: frequent } = await supabase
        .from('voice_command_history')
        .select('*')
        .eq('user_id', user.id)
        .order('frequency', { ascending: false })
        .limit(5);

      if (recent) setRecentCommands(recent as VoiceCommandHistoryItem[]);
      if (frequent) setFrequentCommands(frequent as VoiceCommandHistoryItem[]);
    } catch (error) {
      console.error('Failed to fetch voice command history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Add or update command in history
  const addCommand = useCallback(async (
    commandText: string,
    commandType: string,
    resultAction?: string
  ) => {
    if (!user?.id) return;

    try {
      // Check if similar command exists (normalize text)
      const normalizedText = commandText.toLowerCase().trim();
      
      const { data: existing } = await supabase
        .from('voice_command_history')
        .select('id, frequency')
        .eq('user_id', user.id)
        .ilike('command_text', normalizedText)
        .maybeSingle();

      if (existing) {
        // Update frequency and timestamp
        await supabase
          .from('voice_command_history')
          .update({
            frequency: existing.frequency + 1,
            executed_at: new Date().toISOString(),
            result_action: resultAction,
          })
          .eq('id', existing.id);
      } else {
        // Insert new command
        await supabase
          .from('voice_command_history')
          .insert({
            user_id: user.id,
            command_text: normalizedText,
            command_type: commandType,
            result_action: resultAction,
            frequency: 1,
          });
      }

      // Refresh history
      await fetchHistory();
    } catch (error) {
      console.error('Failed to add voice command:', error);
    }
  }, [user?.id, fetchHistory]);

  // Delete a command from history
  const deleteCommand = useCallback(async (commandId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('voice_command_history')
        .delete()
        .eq('id', commandId)
        .eq('user_id', user.id);

      // Update local state
      setRecentCommands(prev => prev.filter(c => c.id !== commandId));
      setFrequentCommands(prev => prev.filter(c => c.id !== commandId));
    } catch (error) {
      console.error('Failed to delete voice command:', error);
    }
  }, [user?.id]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('voice_command_history')
        .delete()
        .eq('user_id', user.id);

      setRecentCommands([]);
      setFrequentCommands([]);
    } catch (error) {
      console.error('Failed to clear voice command history:', error);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    recentCommands,
    frequentCommands,
    isLoading,
    addCommand,
    deleteCommand,
    clearHistory,
    refetch: fetchHistory,
  };
}
