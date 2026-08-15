-- Drop existing policies and tables (only if they exist)
DO $$ 
BEGIN
  -- Drop policies for existing tables
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schedule_checks') THEN
    DROP POLICY IF EXISTS "Users can view own schedule checks" ON schedule_checks;
    DROP POLICY IF EXISTS "Users can insert own schedule checks" ON schedule_checks;
    DROP POLICY IF EXISTS "Users can update own schedule checks" ON schedule_checks;
    DROP POLICY IF EXISTS "Users can delete own schedule checks" ON schedule_checks;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schedule_notes') THEN
    DROP POLICY IF EXISTS "Users can view own schedule notes" ON schedule_notes;
    DROP POLICY IF EXISTS "Users can insert own schedule notes" ON schedule_notes;
    DROP POLICY IF EXISTS "Users can update own schedule notes" ON schedule_notes;
    DROP POLICY IF EXISTS "Users can delete own schedule notes" ON schedule_notes;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_event_checks') THEN
    DROP POLICY IF EXISTS "Users can view own calendar event checks" ON calendar_event_checks;
    DROP POLICY IF EXISTS "Users can insert own calendar event checks" ON calendar_event_checks;
    DROP POLICY IF EXISTS "Users can update own calendar event checks" ON calendar_event_checks;
    DROP POLICY IF EXISTS "Users can delete own calendar event checks" ON calendar_event_checks;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_event_notes') THEN
    DROP POLICY IF EXISTS "Users can view own calendar event notes" ON calendar_event_notes;
    DROP POLICY IF EXISTS "Users can insert own calendar event notes" ON calendar_event_notes;
    DROP POLICY IF EXISTS "Users can update own calendar event notes" ON calendar_event_notes;
    DROP POLICY IF EXISTS "Users can delete own calendar event notes" ON calendar_event_notes;
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS calendar_event_notes CASCADE;
DROP TABLE IF EXISTS calendar_event_checks CASCADE;
DROP TABLE IF EXISTS schedule_notes CASCADE;
DROP TABLE IF EXISTS schedule_checks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Weekly schedule checks table
CREATE TABLE IF NOT EXISTS schedule_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL, -- '日', '月', '火', '水', '木', '金', '土'
  time TEXT NOT NULL, -- '午前9:45', '午後8時', etc.
  channel_name TEXT NOT NULL, -- 'ゆるコンピュータ科学ラジオ', etc.
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day_of_week, time, channel_name)
);

-- Weekly schedule notes table
CREATE TABLE IF NOT EXISTS schedule_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day_of_week, time, channel_name)
);

-- Calendar event checks table
CREATE TABLE IF NOT EXISTS calendar_event_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL, -- Google Calendar event ID
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- Calendar event notes table
CREATE TABLE IF NOT EXISTS calendar_event_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL, -- Google Calendar event ID
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS schedule_checks_user_id_idx ON schedule_checks(user_id);
CREATE INDEX IF NOT EXISTS schedule_notes_user_id_idx ON schedule_notes(user_id);
CREATE INDEX IF NOT EXISTS calendar_event_checks_user_id_idx ON calendar_event_checks(user_id);
CREATE INDEX IF NOT EXISTS calendar_event_notes_user_id_idx ON calendar_event_notes(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for schedule_checks
CREATE POLICY "Users can view own schedule checks" ON schedule_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule checks" ON schedule_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule checks" ON schedule_checks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule checks" ON schedule_checks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for schedule_notes
CREATE POLICY "Users can view own schedule notes" ON schedule_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule notes" ON schedule_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule notes" ON schedule_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule notes" ON schedule_notes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for calendar_event_checks
CREATE POLICY "Users can view own calendar event checks" ON calendar_event_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar event checks" ON calendar_event_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar event checks" ON calendar_event_checks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar event checks" ON calendar_event_checks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for calendar_event_notes
CREATE POLICY "Users can view own calendar event notes" ON calendar_event_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar event notes" ON calendar_event_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar event notes" ON calendar_event_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar event notes" ON calendar_event_notes FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_checks_updated_at BEFORE UPDATE ON schedule_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_notes_updated_at BEFORE UPDATE ON schedule_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_event_checks_updated_at BEFORE UPDATE ON calendar_event_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_event_notes_updated_at BEFORE UPDATE ON calendar_event_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
