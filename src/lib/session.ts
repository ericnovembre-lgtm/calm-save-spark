import { supabase } from "@/integrations/supabase/client";

export type AppUser = {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'user' | 'admin';
};

export const getClientUser = async (): Promise<AppUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name,
    role: user.user_metadata?.role || 'user',
  };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
