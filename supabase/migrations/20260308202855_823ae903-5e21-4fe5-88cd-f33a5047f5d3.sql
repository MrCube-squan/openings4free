
CREATE TABLE public.line_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  line_index INTEGER NOT NULL,
  move_index INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, line_index, move_index)
);

ALTER TABLE public.line_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.line_notes FOR SELECT
  TO authenticated
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert their own notes"
  ON public.line_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update their own notes"
  ON public.line_notes FOR UPDATE
  TO authenticated
  USING (public.is_owner(user_id));

CREATE POLICY "Users can delete their own notes"
  ON public.line_notes FOR DELETE
  TO authenticated
  USING (public.is_owner(user_id));

CREATE TRIGGER update_line_notes_updated_at
  BEFORE UPDATE ON public.line_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
