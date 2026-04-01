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
        .select('current_streak, last_active_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const lastActive = new Date(data.last_active_date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        // If last active was today or yesterday, streak is valid; otherwise it's reset
        setStreak(diffDays <= 1 ? data.current_streak : 0);
      } else {
        setStreak(0);
      }
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
