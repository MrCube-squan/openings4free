import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface LineNote {
  move_index: number;
  note: string;
}

export const useLineNotes = (courseId: string | undefined, lineIndex: number) => {
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !courseId) {
      setNotes(new Map());
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('line_notes')
        .select('move_index, note')
        .eq('user_id', user!.id)
        .eq('course_id', courseId)
        .eq('line_index', lineIndex);

      if (!error && data) {
        const map = new Map<number, string>();
        data.forEach((n: LineNote) => map.set(n.move_index, n.note));
        setNotes(map);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [isAuthenticated, user, courseId, lineIndex]);

  const saveNote = useCallback(async (moveIndex: number, note: string) => {
    if (!isAuthenticated || !courseId || !user) return;

    const trimmed = note.trim();
    if (!trimmed) {
      // Delete note
      await supabase
        .from('line_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('line_index', lineIndex)
        .eq('move_index', moveIndex);
      
      setNotes(prev => {
        const next = new Map(prev);
        next.delete(moveIndex);
        return next;
      });
      return;
    }

    const { error } = await supabase
      .from('line_notes')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        line_index: lineIndex,
        move_index: moveIndex,
        note: trimmed,
      }, { onConflict: 'user_id,course_id,line_index,move_index' });

    if (error) {
      toast.error('Failed to save note');
    } else {
      setNotes(prev => {
        const next = new Map(prev);
        next.set(moveIndex, trimmed);
        return next;
      });
    }
  }, [isAuthenticated, user, courseId, lineIndex]);

  return { notes, saveNote, loading };
};
