-- ====================================================================
-- CHAINSHIELD SUPABASE AUTHENTICATION & MULTI-TENANT RLS MIGRATION
-- ====================================================================

-- 1. CREATE PROFILES TABLE FOR AUTH USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  badge_number TEXT,
  department TEXT DEFAULT 'Federal Cyber Crime Division',
  security_clearance TEXT DEFAULT 'Level 5 (State-Security)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS ON PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- TRIGGER FOR AUTOMATIC PROFILE CREATION UPON SUPABASE AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, badge_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Investigator'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'badge_number', CONCAT('SH-', FLOOR(1000 + RANDOM() * 9000)::TEXT))
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. ADD user_id COLUMN & RLS POLICIES TO ALL USER DATA TABLES

-- Helper function to add user_id column if not existing
DO $$
BEGIN
    -- Case Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Case') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Case' AND column_name = 'user_id') THEN
            ALTER TABLE public."Case" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- Evidence Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Evidence') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Evidence' AND column_name = 'user_id') THEN
            ALTER TABLE public."Evidence" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- EvidenceMetadata Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'EvidenceMetadata') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'EvidenceMetadata' AND column_name = 'user_id') THEN
            ALTER TABLE public."EvidenceMetadata" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- ChainOfCustodyLog Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ChainOfCustodyLog') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ChainOfCustodyLog' AND column_name = 'user_id') THEN
            ALTER TABLE public."ChainOfCustodyLog" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- Report Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Report') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Report' AND column_name = 'user_id') THEN
            ALTER TABLE public."Report" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- Notification Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Notification') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Notification' AND column_name = 'user_id') THEN
            ALTER TABLE public."Notification" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- SystemLog Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SystemLog') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'SystemLog' AND column_name = 'user_id') THEN
            ALTER TABLE public."SystemLog" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;

    -- Block Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Block') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Block' AND column_name = 'user_id') THEN
            ALTER TABLE public."Block" ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
        END IF;
    END IF;
END $$;


-- 3. ENABLE RLS AND SET POLICIES FOR ALL TABLES

-- CASE POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Case') THEN
    ALTER TABLE public."Case" ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users view own cases" ON public."Case";
    CREATE POLICY "Users view own cases" ON public."Case" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own cases" ON public."Case";
    CREATE POLICY "Users insert own cases" ON public."Case" FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users update own cases" ON public."Case";
    CREATE POLICY "Users update own cases" ON public."Case" FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users delete own cases" ON public."Case";
    CREATE POLICY "Users delete own cases" ON public."Case" FOR DELETE USING (auth.uid() = user_id);
END IF;

-- EVIDENCE POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Evidence') THEN
    ALTER TABLE public."Evidence" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own evidence" ON public."Evidence";
    CREATE POLICY "Users view own evidence" ON public."Evidence" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own evidence" ON public."Evidence";
    CREATE POLICY "Users insert own evidence" ON public."Evidence" FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users update own evidence" ON public."Evidence";
    CREATE POLICY "Users update own evidence" ON public."Evidence" FOR UPDATE USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users delete own evidence" ON public."Evidence";
    CREATE POLICY "Users delete own evidence" ON public."Evidence" FOR DELETE USING (auth.uid() = user_id);
END IF;

-- EVIDENCE METADATA POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'EvidenceMetadata') THEN
    ALTER TABLE public."EvidenceMetadata" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own metadata" ON public."EvidenceMetadata";
    CREATE POLICY "Users view own metadata" ON public."EvidenceMetadata" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own metadata" ON public."EvidenceMetadata";
    CREATE POLICY "Users insert own metadata" ON public."EvidenceMetadata" FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;

-- CHAIN OF CUSTODY LOG POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ChainOfCustodyLog') THEN
    ALTER TABLE public."ChainOfCustodyLog" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own custody logs" ON public."ChainOfCustodyLog";
    CREATE POLICY "Users view own custody logs" ON public."ChainOfCustodyLog" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own custody logs" ON public."ChainOfCustodyLog";
    CREATE POLICY "Users insert own custody logs" ON public."ChainOfCustodyLog" FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;

-- REPORT POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Report') THEN
    ALTER TABLE public."Report" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own reports" ON public."Report";
    CREATE POLICY "Users view own reports" ON public."Report" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own reports" ON public."Report";
    CREATE POLICY "Users insert own reports" ON public."Report" FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;

-- NOTIFICATION POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Notification') THEN
    ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own notifications" ON public."Notification";
    CREATE POLICY "Users view own notifications" ON public."Notification" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own notifications" ON public."Notification";
    CREATE POLICY "Users insert own notifications" ON public."Notification" FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;

-- BLOCKCHAIN BLOCK POLICIES
IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Block') THEN
    ALTER TABLE public."Block" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users view own blocks" ON public."Block";
    CREATE POLICY "Users view own blocks" ON public."Block" FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users insert own blocks" ON public."Block";
    CREATE POLICY "Users insert own blocks" ON public."Block" FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF;
