-- Enable realtime for geo_reward_partners table
ALTER PUBLICATION supabase_realtime ADD TABLE public.geo_reward_partners;

-- Enable realtime for user_questline_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_questline_progress;