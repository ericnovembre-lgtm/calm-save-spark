-- Fix search_path security warning for contribute_to_goal function
CREATE OR REPLACE FUNCTION contribute_to_goal(
  p_goal_id UUID,
  p_amount NUMERIC,
  p_user_id UUID,
  p_note TEXT
) RETURNS TABLE (
  new_amount NUMERIC,
  is_completed BOOLEAN
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_amount NUMERIC;
  v_target NUMERIC;
  v_current NUMERIC;
BEGIN
  -- Lock row for update
  SELECT current_amount, target_amount
  INTO v_current, v_target
  FROM goals
  WHERE id = p_goal_id AND user_id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found or access denied';
  END IF;
  
  -- Calculate new amount
  v_new_amount := LEAST(v_current + p_amount, v_target);
  
  -- Update goal
  UPDATE goals
  SET current_amount = v_new_amount,
      updated_at = NOW()
  WHERE id = p_goal_id;
  
  -- Log transaction
  INSERT INTO goal_transactions (goal_id, user_id, amount, note, created_at)
  VALUES (p_goal_id, p_user_id, p_amount, p_note, NOW());
  
  RETURN QUERY SELECT v_new_amount, (v_new_amount >= v_target);
END;
$$;