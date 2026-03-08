
-- Add username and username_changed_at to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS username_changed_at timestamp with time zone DEFAULT now();

-- Create unique index on lowercase username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username));

-- Update handle_new_user to set username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, username_changed_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    now()
  );
  RETURN NEW;
END;
$function$;

-- Create function to search users by email or username
CREATE OR REPLACE FUNCTION public.search_users_by_query(p_query text, p_current_user_id uuid)
RETURNS TABLE(id uuid, display_name text, username text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.id, p.display_name, p.username
  FROM public.profiles p
  WHERE p.id != p_current_user_id
    AND (
      p.username ILIKE '%' || p_query || '%'
      OR p.display_name ILIKE '%' || p_query || '%'
      OR EXISTS (
        SELECT 1 FROM auth.users u 
        WHERE u.id = p.id AND u.email ILIKE '%' || p_query || '%'
      )
    )
  LIMIT 10;
$function$;

-- Update get_friend_leaderboard to include username
CREATE OR REPLACE FUNCTION public.get_friend_leaderboard(p_user_id uuid, p_start_date timestamp with time zone)
RETURNS TABLE(user_id uuid, display_name text, lines_learned bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH friend_ids AS (
    SELECT friend_id FROM public.friendships WHERE friendships.user_id = p_user_id
    UNION ALL
    SELECT p_user_id
  )
  SELECT 
    fi.friend_id as user_id,
    COALESCE(p.username, p.display_name) as display_name,
    COUNT(ll.id)::bigint as lines_learned
  FROM friend_ids fi
  JOIN public.profiles p ON p.id = fi.friend_id
  LEFT JOIN public.learned_lines ll ON ll.user_id = fi.friend_id AND ll.completed_at >= p_start_date
  GROUP BY fi.friend_id, p.username, p.display_name
  ORDER BY lines_learned DESC;
$function$;

-- Function to update username with 7-day cooldown
CREATE OR REPLACE FUNCTION public.update_username(p_user_id uuid, p_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_last_changed timestamp with time zone;
  v_existing_count int;
BEGIN
  -- Validate username format (3-20 chars, alphanumeric + underscores)
  IF p_username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RETURN json_build_object('success', false, 'error', 'Username must be 3-20 characters, letters, numbers and underscores only');
  END IF;

  -- Check 7-day cooldown
  SELECT username_changed_at INTO v_last_changed
  FROM public.profiles WHERE id = p_user_id;

  IF v_last_changed IS NOT NULL AND v_last_changed > now() - interval '7 days' THEN
    RETURN json_build_object('success', false, 'error', 'You can only change your username once every 7 days', 'next_change', v_last_changed + interval '7 days');
  END IF;

  -- Check uniqueness (case-insensitive)
  SELECT COUNT(*) INTO v_existing_count
  FROM public.profiles WHERE lower(username) = lower(p_username) AND id != p_user_id;

  IF v_existing_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Username is already taken');
  END IF;

  -- Update
  UPDATE public.profiles 
  SET username = p_username, display_name = p_username, username_changed_at = now(), updated_at = now()
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$function$;
