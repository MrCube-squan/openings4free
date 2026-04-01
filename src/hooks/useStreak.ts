import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setStreak(data?.current_streak ?? 0);
    } catch {
      setStreak(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const recordActivity = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc('update_user_streak', { p_user_id: user.id });
      if (data) {
        setStreak((data as any).current_streak);
      }
    } catch (e) {
      console.error('Failed to update streak:', e);
    }
  }, [user]);

  return { streak, loading, recordActivity, refreshStreak: fetchStreak };
};
