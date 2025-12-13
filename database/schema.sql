-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('athlete', 'coach')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete profiles
CREATE TABLE athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_sport TEXT NOT NULL DEFAULT 'track_xc',
  primary_event TEXT,
  weekly_mileage INTEGER,
  experience_level TEXT,
  race_times JSONB DEFAULT '{}',
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('easy', 'workout', 'long', 'race')),
  distance DECIMAL(5, 2),
  avg_pace TEXT,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  sleep_hours DECIMAL(3, 1),
  soreness INTEGER CHECK (soreness >= 0 AND soreness <= 10),
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meets
CREATE TABLE meets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  event TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('A', 'B', 'C')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pace', 'fatigue', 'sleep', 'pre_meet', 'load')),
  severity TEXT NOT NULL CHECK (severity IN ('green', 'yellow', 'red')),
  explanation TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}',
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'moderate', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'annual')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date DESC);
CREATE INDEX idx_meets_user_date ON meets(user_id, date);
CREATE INDEX idx_insights_user_created ON insights(user_id, created_at DESC);
CREATE INDEX idx_insights_user_severity ON insights(user_id, severity, created_at DESC);

