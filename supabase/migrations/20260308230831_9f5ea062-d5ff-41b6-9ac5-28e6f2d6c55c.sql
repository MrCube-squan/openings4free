
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
  IF p_username !~ '^[a-zA-Z0-9_/]{3,20}$' THEN
    RETURN json_build_object('success', false, 'error', 'Username must be 3-20 characters, letters, numbers, underscores and slashes only');
  END IF;

  SELECT username_changed_at INTO v_last_changed
  FROM public.profiles WHERE id = p_user_id;

  IF v_last_changed IS NOT NULL AND v_last_changed > now() - interval '7 days' THEN
    RETURN json_build_object('success', false, 'error', 'You can only change your username once every 7 days', 'next_change', v_last_changed + interval '7 days');
  END IF;

  SELECT COUNT(*) INTO v_existing_count
  FROM public.profiles WHERE lower(username) = lower(p_username) AND id != p_user_id;

  IF v_existing_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Username is already taken');
  END IF;

  UPDATE public.profiles 
  SET username = p_username, display_name = p_username, username_changed_at = now(), updated_at = now()
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$function$;
