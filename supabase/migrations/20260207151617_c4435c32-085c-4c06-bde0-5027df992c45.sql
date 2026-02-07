-- Helper function to check if user owns the record
CREATE OR REPLACE FUNCTION public.is_owner(record_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = record_user_id
$$;

-- Table for tracking learned lines per user
CREATE TABLE public.learned_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  line_index integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  accuracy numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, line_index)
);

-- Enable RLS on learned_lines
ALTER TABLE public.learned_lines ENABLE ROW LEVEL SECURITY;

-- RLS policies for learned_lines (user can only access their own data)
CREATE POLICY "Users can view their own learned lines"
  ON public.learned_lines FOR SELECT
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert their own learned lines"
  ON public.learned_lines FOR INSERT
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update their own learned lines"
  ON public.learned_lines FOR UPDATE
  USING (public.is_owner(user_id));

CREATE POLICY "Users can delete their own learned lines"
  ON public.learned_lines FOR DELETE
  USING (public.is_owner(user_id));

-- Table for custom lines created by users
CREATE TABLE public.custom_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  name text NOT NULL,
  moves text[] NOT NULL,
  category text NOT NULL DEFAULT 'Custom',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on custom_lines
ALTER TABLE public.custom_lines ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_lines
CREATE POLICY "Users can view their own custom lines"
  ON public.custom_lines FOR SELECT
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert their own custom lines"
  ON public.custom_lines FOR INSERT
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update their own custom lines"
  ON public.custom_lines FOR UPDATE
  USING (public.is_owner(user_id));

CREATE POLICY "Users can delete their own custom lines"
  ON public.custom_lines FOR DELETE
  USING (public.is_owner(user_id));

-- Table for custom courses created by users
CREATE TABLE public.custom_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  eco text NOT NULL,
  color text NOT NULL CHECK (color IN ('white', 'black')),
  description text NOT NULL DEFAULT '',
  moves text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on custom_courses
ALTER TABLE public.custom_courses ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_courses
CREATE POLICY "Users can view their own custom courses"
  ON public.custom_courses FOR SELECT
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert their own custom courses"
  ON public.custom_courses FOR INSERT
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update their own custom courses"
  ON public.custom_courses FOR UPDATE
  USING (public.is_owner(user_id));

CREATE POLICY "Users can delete their own custom courses"
  ON public.custom_courses FOR DELETE
  USING (public.is_owner(user_id));

-- Trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_learned_lines_updated_at
  BEFORE UPDATE ON public.learned_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_lines_updated_at
  BEFORE UPDATE ON public.custom_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_courses_updated_at
  BEFORE UPDATE ON public.custom_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();