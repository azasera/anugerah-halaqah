-- Migration: Create local_users table for manually added users
-- This table stores users added through the admin panel that don't have Supabase Auth accounts

-- Create local_users table
CREATE TABLE IF NOT EXISTS local_users (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'ortu', 'staff')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    password TEXT, -- For local authentication (should be hashed in production)
    lembaga TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_local_users_email ON local_users(email);
CREATE INDEX IF NOT EXISTS idx_local_users_role ON local_users(role);
CREATE INDEX IF NOT EXISTS idx_local_users_status ON local_users(status);

-- Enable Row Level Security
ALTER TABLE local_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view local_users" ON local_users;
DROP POLICY IF EXISTS "Admin can manage all local_users" ON local_users;

-- RLS Policies
-- Everyone can view (for login purposes)
CREATE POLICY "Everyone can view local_users" ON local_users
    FOR SELECT USING (true);

-- Only admin can insert/update/delete
CREATE POLICY "Admin can manage all local_users" ON local_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_local_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_local_users_updated_at ON local_users;
CREATE TRIGGER update_local_users_updated_at 
    BEFORE UPDATE ON local_users
    FOR EACH ROW 
    EXECUTE FUNCTION update_local_users_updated_at();

-- Enable Realtime for local_users table
ALTER PUBLICATION supabase_realtime ADD TABLE local_users;

-- Verify table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'local_users'
ORDER BY ordinal_position;
