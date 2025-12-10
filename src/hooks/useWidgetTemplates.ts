import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { WidgetTemplate } from './useWidgetBuilder';

export interface SavedWidgetTemplate {
  id: string;
  user_id: string;
  template_name: string;
  widget_config: WidgetTemplate;
  preview_image_url: string | null;
  is_public: boolean;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export function useWidgetTemplates() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: myTemplates, isLoading: loadingMine } = useQuery({
    queryKey: ['widget-templates-mine', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('widget_builder_templates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SavedWidgetTemplate[];
    },
    enabled: !!session?.user?.id,
  });

  const { data: publicTemplates, isLoading: loadingPublic } = useQuery({
    queryKey: ['widget-templates-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('widget_builder_templates')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SavedWidgetTemplate[];
    },
  });

  const saveTemplate = useMutation({
    mutationFn: async ({ name, template, isPublic }: {
      name: string;
      template: WidgetTemplate;
      isPublic?: boolean;
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('widget_builder_templates')
        .insert([{
          user_id: session.user.id,
          template_name: name,
          widget_config: JSON.parse(JSON.stringify(template)),
          is_public: isPublic || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-templates-mine'] });
      toast.success('Template saved');
    },
    onError: () => {
      toast.error('Failed to save template');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, template_name, is_public }: { id: string; template_name?: string; is_public?: boolean }) => {
      const updates: Record<string, unknown> = {};
      if (template_name) updates.template_name = template_name;
      if (is_public !== undefined) updates.is_public = is_public;
      
      const { error } = await supabase
        .from('widget_builder_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-templates-mine'] });
      toast.success('Template updated');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('widget_builder_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-templates-mine'] });
      toast.success('Template deleted');
    },
  });

  const incrementDownload = useMutation({
    mutationFn: async (id: string) => {
      // Simple increment without RPC
      const template = publicTemplates?.find(t => t.id === id);
      if (template) {
        await supabase
          .from('widget_builder_templates')
          .update({ downloads: (template.downloads || 0) + 1 })
          .eq('id', id);
      }
    },
  });

  return {
    myTemplates: myTemplates || [],
    publicTemplates: publicTemplates || [],
    isLoading: loadingMine || loadingPublic,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    incrementDownload,
  };
}
