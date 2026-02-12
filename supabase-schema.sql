-- Supabase Database Schema for Halaqah Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles Table with Roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'ortu')),
    halaqah_id BIGINT REFERENCES halaqahs(id),
    student_id BIGINT REFERENCES students(id),
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    halaqah TEXT NOT NULL,
    nisn TEXT,
    nik TEXT UNIQUE, -- Added NIK column for parent login
    lembaga TEXT DEFAULT 'MTA',
    kelas TEXT,
    total_points INTEGER DEFAULT 0,
    daily_ranking INTEGER DEFAULT 0,
    overall_ranking INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_activity TEXT,
    achievements TEXT DEFAULT '[]',
    setoran TEXT DEFAULT '[]',
    last_setoran_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Halaqahs Table
CREATE TABLE IF NOT EXISTS halaqahs (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    points INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    status TEXT DEFAULT 'BARU',
    members INTEGER DEFAULT 0,
    avg_points NUMERIC(10,2) DEFAULT 0,
    trend INTEGER DEFAULT 0,
    guru TEXT,
    kelas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_overall_ranking ON students(overall_ranking);
CREATE INDEX IF NOT EXISTS idx_students_halaqah ON students(halaqah);
CREATE INDEX IF NOT EXISTS idx_students_total_points ON students(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_students_nik ON students(nik); -- Added index for NIK lookup
CREATE INDEX IF NOT EXISTS idx_halaqahs_rank ON halaqahs(rank);
CREATE INDEX IF NOT EXISTS idx_halaqahs_points ON halaqahs(points DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE halaqahs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Students Policies
CREATE POLICY "Everyone can view students" ON students
    FOR SELECT USING (true);

-- Explicit DELETE policy for Admins
CREATE POLICY "Admin can delete students" ON students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage all students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Guru can manage students in their halaqah" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN halaqahs h ON p.halaqah_id = h.id
            WHERE p.id = auth.uid() 
            AND p.role = 'guru'
            AND students.halaqah = REPLACE(h.name, 'Halaqah ', '')
        )
    );

CREATE POLICY "Ortu can view their own student" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() 
            AND role = 'ortu'
            AND student_id = students.id
        )
    );

-- Halaqahs Policies
CREATE POLICY "Everyone can view halaqahs" ON halaqahs
    FOR SELECT USING (true);

-- Explicit DELETE policy for Admins
CREATE POLICY "Admin can delete halaqahs" ON halaqahs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage all halaqahs" ON halaqahs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Guru can view their halaqah" ON halaqahs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() 
            AND role = 'guru'
            AND halaqah_id = halaqahs.id
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_halaqahs_updated_at BEFORE UPDATE ON halaqahs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'ortu')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE halaqahs;

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_halaqah_id ON profiles(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Insert default admin user (change email and password after first login)
-- Password: admin123 (CHANGE THIS!)
-- You need to create this user via Supabase Dashboard or Auth API first
-- Then update the profile with admin role
