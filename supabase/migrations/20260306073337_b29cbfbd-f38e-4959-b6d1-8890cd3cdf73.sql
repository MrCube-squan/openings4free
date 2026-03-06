
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  last_active_date date NOT NULL DEFAULT CURRENT_DATE,
  current_streak integer NOT NULL DEFAULT 1,
  longest_streak integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streak"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert their own streak"
  ON public.user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update their own streak"
  ON public.user_streaks FOR UPDATE
  TO authenticated
  USING (public.is_owner(user_id));

CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_active date;
  v_current_streak int;
  v_longest_streak int;
  v_today date := CURRENT_DATE;
  v_result json;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO v_last_active, v_current_streak, v_longest_streak
  FROM public.user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, last_active_date, current_streak, longest_streak)
    VALUES (p_user_id, v_today, 1, 1);
    v_result := json_build_object('current_streak', 1, 'longest_streak', 1);
    RETURN v_result;
  END IF;

  IF v_last_active = v_today THEN
    v_result := json_build_object('current_streak', v_current_streak, 'longest_streak', v_longest_streak);
    RETURN v_result;
  ELSIF v_last_active = v_today - 1 THEN
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    v_current_streak := 1;
  END IF;

  UPDATE public.user_streaks
  SET last_active_date = v_today,
      current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      updated_at = now()
  WHERE user_id = p_user_id;

  v_result := json_build_object('current_streak', v_current_streak, 'longest_streak', v_longest_streak);
  RETURN v_result;
END;
$$;
