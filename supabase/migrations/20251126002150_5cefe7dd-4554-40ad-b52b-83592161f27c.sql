
-- Fix search_path for the calculate_next_billing_dates function
CREATE OR REPLACE FUNCTION calculate_next_billing_dates(billing_day integer, from_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(next_statement date, next_due date) 
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  statement_date date;
  due_date date;
BEGIN
  -- Calculate next statement date (billing_day of next month)
  IF EXTRACT(DAY FROM from_date) < billing_day THEN
    statement_date := DATE_TRUNC('month', from_date) + (billing_day - 1 || ' days')::interval;
  ELSE
    statement_date := DATE_TRUNC('month', from_date + interval '1 month') + (billing_day - 1 || ' days')::interval;
  END IF;
  
  -- Due date is 21 days after statement date
  due_date := statement_date + interval '21 days';
  
  RETURN QUERY SELECT statement_date, due_date;
END;
$$;
