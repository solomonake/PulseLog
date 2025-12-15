-- Fix foreign keys to reference auth.users(id) instead of public.users(id)
-- Safe to run repeatedly: drops FK constraints by name if they exist, then re-adds

-- athlete_profiles user_id -> auth.users(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'athlete_profiles_user_id_fkey') THEN
    ALTER TABLE athlete_profiles DROP CONSTRAINT athlete_profiles_user_id_fkey;
  END IF;
END$$;

ALTER TABLE athlete_profiles
  ADD CONSTRAINT athlete_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- daily_logs user_id -> auth.users(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_logs_user_id_fkey') THEN
    ALTER TABLE daily_logs DROP CONSTRAINT daily_logs_user_id_fkey;
  END IF;
END$$;

ALTER TABLE daily_logs
  ADD CONSTRAINT daily_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- meets user_id -> auth.users(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'meets_user_id_fkey') THEN
    ALTER TABLE meets DROP CONSTRAINT meets_user_id_fkey;
  END IF;
END$$;

ALTER TABLE meets
  ADD CONSTRAINT meets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- insights user_id -> auth.users(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'insights_user_id_fkey') THEN
    ALTER TABLE insights DROP CONSTRAINT insights_user_id_fkey;
  END IF;
END$$;

ALTER TABLE insights
  ADD CONSTRAINT insights_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- subscriptions user_id -> auth.users(id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'subscriptions_user_id_fkey') THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
  END IF;
END$$;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

